#!/usr/bin/env python3
"""media_tools.py - ffmpeg helpers for After Effects prep. Inputs are only read; outputs go to paths you name.

  probe FILE...                                  streams, fps, VFR, duration + AE import warnings (JSON)
  scenes VIDEO [--threshold 0.3]                 cut times of a reference video (JSON)
  frames VIDEO --out DIR [--every S | --at T,T] [--sheet]   stills (+ contact_sheet.png)
  speech AUDIO [--noise=-35dB] [--min-silence 0.35]          speech segments for VO sync (JSON)
  palette IMAGE_OR_VIDEO [--colors 6] [--at T]    dominant colours as hex (JSON, needs Pillow)
  to-ae IN OUT [--force]                         AE-safe transcode: video -> ProRes 422 .mov CFR, audio -> 48k WAV
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

AE_BAD_VIDEO = {"vp8", "vp9", "av1", "theora"}
AE_BAD_AUDIO = {"opus", "vorbis"}
AE_BAD_CONTAINERS = {"webm", "matroska", "ogg"}


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def ffprobe(path):
    r = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path])
    if r.returncode != 0:
        raise SystemExit(f"ffprobe failed on {path}: {r.stderr.strip()}")
    return json.loads(r.stdout)


def ratio(s):
    try:
        n, d = s.split("/")
        return round(float(n) / float(d), 3) if float(d) else None
    except (ValueError, AttributeError):
        return None


def duration_of(path):
    return float(ffprobe(path)["format"].get("duration", 0) or 0)


def cmd_probe(a):
    out = []
    for path in a.files:
        info = ffprobe(path)
        fmt = info["format"]
        entry = {"file": path, "container": fmt.get("format_name"), "duration": float(fmt.get("duration", 0) or 0),
                 "streams": [], "ae_warnings": []}
        if set(fmt.get("format_name", "").split(",")) & AE_BAD_CONTAINERS:
            entry["ae_warnings"].append("container not importable by AE: transcode with to-ae")
        for s in info["streams"]:
            kind = s.get("codec_type")
            if kind == "video" and s.get("disposition", {}).get("attached_pic"):
                continue
            st = {"type": kind, "codec": s.get("codec_name")}
            if kind == "video":
                r_fps, avg_fps = ratio(s.get("r_frame_rate")), ratio(s.get("avg_frame_rate"))
                st.update(width=s.get("width"), height=s.get("height"), fps=avg_fps or r_fps,
                          pix_fmt=s.get("pix_fmt"), vfr=bool(r_fps and avg_fps and abs(r_fps - avg_fps) > 0.01))
                if st["codec"] in AE_BAD_VIDEO:
                    entry["ae_warnings"].append(f"video codec {st['codec']} not importable by AE: transcode with to-ae")
                if st["vfr"]:
                    entry["ae_warnings"].append("variable frame rate: transcode to CFR (to-ae) to avoid AV drift")
            elif kind == "audio":
                st.update(sample_rate=int(s.get("sample_rate", 0)), channels=s.get("channels"))
                if st["codec"] in AE_BAD_AUDIO:
                    entry["ae_warnings"].append(f"audio codec {st['codec']} not importable by AE: convert to WAV with to-ae")
            entry["streams"].append(st)
        out.append(entry)
    print(json.dumps(out, indent=2))


def cmd_scenes(a):
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", a.video, "-filter:v",
             f"select='gt(scene,{a.threshold})',showinfo", "-an", "-f", "null", "-"])
    times = [round(float(t), 3) for t in re.findall(r"pts_time:([0-9.]+)", r.stderr)]
    dur = duration_of(a.video)
    bounds = [0.0] + times + [round(dur, 3)]
    shots = [{"shot": i + 1, "start": bounds[i], "end": bounds[i + 1], "length": round(bounds[i + 1] - bounds[i], 3)}
             for i in range(len(bounds) - 1)]
    print(json.dumps({"video": a.video, "duration": dur, "cuts": times, "shots": shots}, indent=2))


def cmd_frames(a):
    os.makedirs(a.out, exist_ok=True)
    pattern = os.path.join(a.out, "frame_%04d.png")
    if a.at:
        times = [float(t) for t in a.at.split(",")]
        for i, t in enumerate(times, 1):
            r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(t), "-i", a.video,
                     "-frames:v", "1", os.path.join(a.out, f"frame_{i:04d}.png")])
            if r.returncode:
                raise SystemExit(r.stderr)
    else:
        r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a.video, "-vf", f"fps=1/{a.every}", pattern])
        if r.returncode:
            raise SystemExit(r.stderr)
        n = len([f for f in os.listdir(a.out) if re.match(r"frame_\d{4}\.png$", f)])
        times = [round(i * a.every, 3) for i in range(n)]
    result = {"out": a.out, "frames": [{"file": f"frame_{i:04d}.png", "time": t} for i, t in enumerate(times, 1)]}
    if a.sheet and times:
        cols = min(6, len(times))
        rows = (len(times) + cols - 1) // cols
        sheet = os.path.join(a.out, "contact_sheet.png")
        r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", pattern, "-vf",
                 f"scale=320:-2,tile={cols}x{rows}:padding=4:margin=4", "-frames:v", "1", sheet])
        if r.returncode:
            raise SystemExit(r.stderr)
        result["contact_sheet"] = sheet
    print(json.dumps(result, indent=2))


def cmd_speech(a):
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", a.audio, "-af",
             f"silencedetect=noise={a.noise}:d={a.min_silence}", "-f", "null", "-"])
    dur = duration_of(a.audio)
    starts = [float(x) for x in re.findall(r"silence_start: (-?[0-9.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", r.stderr)]
    silences = list(zip(starts, ends + [dur] * (len(starts) - len(ends))))
    segs, cur = [], 0.0
    for s, e in silences:
        if s > cur + 0.05:
            segs.append({"start": round(max(cur, 0), 3), "end": round(s, 3)})
        cur = e
    if dur > cur + 0.05:
        segs.append({"start": round(cur, 3), "end": round(dur, 3)})
    for i, s in enumerate(segs, 1):
        s["id"] = i
        s["length"] = round(s["end"] - s["start"], 3)
    print(json.dumps({"audio": a.audio, "duration": dur, "noise": a.noise, "min_silence": a.min_silence,
                      "segments": segs}, indent=2))


def cmd_palette(a):
    try:
        from PIL import Image
    except ImportError:
        raise SystemExit("Pillow is required for palette (pip install pillow)")
    src = a.file
    tmp = None
    if not re.search(r"\.(png|jpe?g|webp|bmp|tiff?)$", src, re.I):
        tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False).name
        t = a.at if a.at is not None else duration_of(src) / 2
        r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(t), "-i", src, "-frames:v", "1", tmp])
        if r.returncode:
            raise SystemExit(r.stderr)
        src = tmp
    img = Image.open(src).convert("RGB")
    img.thumbnail((256, 256))
    q = img.quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()
    counts = sorted(q.getcolors(), reverse=True)
    total = sum(c for c, _ in counts)
    colours = [{"hex": "#%02X%02X%02X" % tuple(pal[i * 3:i * 3 + 3]), "share": round(c / total, 3)} for c, i in counts]
    if tmp:
        os.unlink(tmp)
    print(json.dumps({"file": a.file, "colours": colours}, indent=2))


def cmd_to_ae(a):
    if os.path.exists(a.out) and not a.force:
        raise SystemExit(f"{a.out} exists; pass --force to overwrite")
    info = ffprobe(a.input)
    video = [s for s in info["streams"] if s.get("codec_type") == "video" and not s.get("disposition", {}).get("attached_pic")]
    if video:
        fps = ratio(video[0].get("avg_frame_rate")) or ratio(video[0].get("r_frame_rate")) or 25
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a.input, "-map", "0:v:0", "-map", "0:a?",
               "-c:v", "prores_ks", "-profile:v", "2", "-pix_fmt", "yuv422p10le", "-fps_mode", "cfr", "-r", str(fps),
               "-c:a", "pcm_s16le", "-ar", "48000", a.out]
    else:
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a.input, "-vn",
               "-c:a", "pcm_s16le", "-ar", "48000", a.out]
    r = run(cmd)
    if r.returncode:
        raise SystemExit(r.stderr)
    print(json.dumps({"input": a.input, "output": a.out, "kind": "video" if video else "audio"}, indent=2))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("probe"); s.add_argument("files", nargs="+"); s.set_defaults(fn=cmd_probe)
    s = sub.add_parser("scenes"); s.add_argument("video"); s.add_argument("--threshold", type=float, default=0.3); s.set_defaults(fn=cmd_scenes)
    s = sub.add_parser("frames"); s.add_argument("video"); s.add_argument("--out", required=True)
    s.add_argument("--every", type=float, default=1.0); s.add_argument("--at"); s.add_argument("--sheet", action="store_true"); s.set_defaults(fn=cmd_frames)
    s = sub.add_parser("speech"); s.add_argument("audio"); s.add_argument("--noise", default="-35dB", help="silence threshold; pass as --noise=-40dB (the = is required for negative values)")
    s.add_argument("--min-silence", type=float, default=0.35); s.set_defaults(fn=cmd_speech)
    s = sub.add_parser("palette"); s.add_argument("file"); s.add_argument("--colors", type=int, default=6)
    s.add_argument("--at", type=float); s.set_defaults(fn=cmd_palette)
    s = sub.add_parser("to-ae"); s.add_argument("input"); s.add_argument("out"); s.add_argument("--force", action="store_true"); s.set_defaults(fn=cmd_to_ae)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
