# SFX step 3: measure each sound file: onset, peak time, 50 ms peak level (dBFS), tail, brightness.
# Usage: python3 measure.py <dir of mono 44.1k 16-bit wavs> measure.json
#   convert first: for f in *; do ffmpeg -nostdin -i "$f" -ac 1 -ar 44100 -c:a pcm_s16le "wav/${f%.*}.wav"; done
# add_sfx.jsx files entries = [name, peak time, -peak_db]; for typing loops use the onset and the p90 level instead.
import sys, os, wave, json, numpy as np
out = {}
for fn in sorted(os.listdir(sys.argv[1])):
    w = wave.open(os.path.join(sys.argv[1], fn)); sr = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    h = int(sr * 0.01); n = len(a) // h
    r = np.sqrt((a[:n*h].reshape(n, h) ** 2).mean(1)); d = 20 * np.log10(r + 1e-7)
    # 50 ms smoothed envelope for the peak
    k = 5; sm = np.convolve(r ** 2, np.ones(k) / k, 'same'); sd = 10 * np.log10(sm + 1e-12)
    pk = int(sd.argmax()); pkdb = sd[pk]
    on = int(np.argmax(d > pkdb - 30)) ; on20 = int(np.argmax(d > pkdb - 12))
    after = np.where(d[pk:] < pkdb - 30)[0]; tail = (after[0] if len(after) else n - pk) * 0.01
    spec = np.abs(np.fft.rfft(a[max(0,(pk-10)*h):(pk+10)*h] * 1.0)); fr = np.fft.rfftfreq(len(a[max(0,(pk-10)*h):(pk+10)*h]), 1/sr)
    cen = float((spec * fr).sum() / (spec.sum() + 1e-9))
    out[fn[:-4]] = dict(dur=round(len(a)/sr, 2), onset=round(on*0.01, 2), rise12=round(on20*0.01, 2), peak=round(pk*0.01, 2), peak_db=round(float(pkdb), 1), tail=round(tail, 2), centroid=int(cen), maxabs=round(float(20*np.log10(np.abs(a).max()+1e-9)),1))
    print(f"{fn[:-4][:44]:44s} dur {out[fn[:-4]]['dur']:5.2f} on {on*0.01:4.2f} rise {on20*0.01:4.2f} peak {pk*0.01:5.2f} {pkdb:6.1f}dB tail {tail:4.2f} cen {int(cen):5d}Hz")
json.dump(out, open(sys.argv[2], 'w'), indent=1)
