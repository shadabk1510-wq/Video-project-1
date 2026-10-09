#!/usr/bin/env python3
"""svg_to_ae.py - convert SVG <path> icons (e.g. Tabler, MIT) into After Effects shape data (ES3 JSX).

  python3 svg_to_ae.py OUT.jsx VAR_NAME name=path/to/icon.svg [name2=icon2.svg ...]

Writes `var VAR_NAME = { name: [[closed, verts, inTangents, outTangents], ...], ... }` with coordinates
centred on the viewBox centre (so a 24x24 icon spans -12..12). Supports M/L/H/V/C/S/Q/T/A/Z (abs + rel).
Feed each sub-path to a "ADBE Vector Shape - Group" (new Shape(): vertices/inTangents/outTangents/closed).
"""
import json
import math
import re
import sys

TOK = re.compile(r"[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?")


def arc_to_cubics(p0, rx, ry, phi, large, sweep, p1):
    """SVG endpoint arc -> list of cubic segments [(c1, c2, end)]."""
    if rx == 0 or ry == 0 or p0 == p1:
        return [(p0, p1, p1)]
    phi = math.radians(phi)
    cp, sp = math.cos(phi), math.sin(phi)
    dx, dy = (p0[0] - p1[0]) / 2, (p0[1] - p1[1]) / 2
    x1 = cp * dx + sp * dy
    y1 = -sp * dx + cp * dy
    rx, ry = abs(rx), abs(ry)
    lam = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)
    if lam > 1:
        rx *= math.sqrt(lam); ry *= math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1
    den = rx * rx * y1 * y1 + ry * ry * x1 * x1
    co = math.sqrt(max(0, num / den)) if den else 0
    if large == sweep:
        co = -co
    cx1 = co * rx * y1 / ry
    cy1 = -co * ry * x1 / rx
    cx = cp * cx1 - sp * cy1 + (p0[0] + p1[0]) / 2
    cy = sp * cx1 + cp * cy1 + (p0[1] + p1[1]) / 2

    def ang(ux, uy, vx, vy):
        a = math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
        return a
    t1 = ang(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry)
    dt = ang((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry)
    if not sweep and dt > 0:
        dt -= 2 * math.pi
    elif sweep and dt < 0:
        dt += 2 * math.pi
    n = max(1, int(math.ceil(abs(dt) / (math.pi / 2) - 1e-9)))
    d = dt / n
    k = 4 / 3 * math.tan(d / 4)
    out = []

    def pt(t):
        x, y = rx * math.cos(t), ry * math.sin(t)
        return (cp * x - sp * y + cx, sp * x + cp * y + cy)

    def dpt(t):
        x, y = -rx * math.sin(t), ry * math.cos(t)
        return (cp * x - sp * y, sp * x + cp * y)
    t = t1
    for _ in range(n):
        a, b = pt(t), pt(t + d)
        da, db = dpt(t), dpt(t + d)
        out.append(((a[0] + k * da[0], a[1] + k * da[1]), (b[0] - k * db[0], b[1] - k * db[1]), b))
        t += d
    out[-1] = (out[-1][0], out[-1][1], p1)
    return out


def parse_path(d):
    toks = TOK.findall(d)
    i, cmd = 0, None
    cur = start = (0.0, 0.0)
    last_c = None  # last cubic control (for S) / quad control (for T)
    subs, sub = [], None

    def num():
        nonlocal i
        v = float(toks[i]); i += 1
        return v

    def new_sub(p):
        nonlocal sub
        sub = {"v": [p], "i": [(0, 0)], "o": [(0, 0)], "closed": False}
        subs.append(sub)

    def ensure():
        if sub is None:
            new_sub(cur)

    def cubic(c1, c2, p):
        ensure()
        sub["o"][-1] = (c1[0] - sub["v"][-1][0], c1[1] - sub["v"][-1][1])
        sub["v"].append(p); sub["i"].append((c2[0] - p[0], c2[1] - p[1])); sub["o"].append((0, 0))

    def line(p):
        ensure()
        sub["v"].append(p); sub["i"].append((0, 0)); sub["o"].append((0, 0))

    while i < len(toks):
        if re.match(r"[A-Za-z]", toks[i]):
            cmd = toks[i]; i += 1
        rel = cmd.islower(); C = cmd.upper()
        ox, oy = cur if rel else (0, 0)
        if C == "M":
            p = (num() + ox, num() + oy); cur = start = p; new_sub(p)
            cmd = "l" if rel else "L"; last_c = None
        elif C == "L":
            p = (num() + ox, num() + oy); line(p); cur = p; last_c = None
        elif C == "H":
            p = (num() + (cur[0] if rel else 0), cur[1]); line(p); cur = p; last_c = None
        elif C == "V":
            p = (cur[0], num() + (cur[1] if rel else 0)); line(p); cur = p; last_c = None
        elif C == "C":
            c1 = (num() + ox, num() + oy); c2 = (num() + ox, num() + oy); p = (num() + ox, num() + oy)
            cubic(c1, c2, p); cur = p; last_c = ("c", c2)
        elif C == "S":
            c1 = (2 * cur[0] - last_c[1][0], 2 * cur[1] - last_c[1][1]) if last_c and last_c[0] == "c" else cur
            c2 = (num() + ox, num() + oy); p = (num() + ox, num() + oy)
            cubic(c1, c2, p); cur = p; last_c = ("c", c2)
        elif C == "Q":
            q = (num() + ox, num() + oy); p = (num() + ox, num() + oy)
            cubic((cur[0] + 2 / 3 * (q[0] - cur[0]), cur[1] + 2 / 3 * (q[1] - cur[1])), (p[0] + 2 / 3 * (q[0] - p[0]), p[1] + 2 / 3 * (q[1] - p[1])), p)
            cur = p; last_c = ("q", q)
        elif C == "T":
            q = (2 * cur[0] - last_c[1][0], 2 * cur[1] - last_c[1][1]) if last_c and last_c[0] == "q" else cur
            p = (num() + ox, num() + oy)
            cubic((cur[0] + 2 / 3 * (q[0] - cur[0]), cur[1] + 2 / 3 * (q[1] - cur[1])), (p[0] + 2 / 3 * (q[0] - p[0]), p[1] + 2 / 3 * (q[1] - p[1])), p)
            cur = p; last_c = ("q", q)
        elif C == "A":
            rx, ry, rot, la, sw = num(), num(), num(), int(num()), int(num())
            p = (num() + ox, num() + oy)
            for c1, c2, e in arc_to_cubics(cur, rx, ry, rot, la, sw, p):
                cubic(c1, c2, e)
            cur = p; last_c = None
        elif C == "Z":
            sub["closed"] = True
            v = sub["v"]
            if len(v) > 1 and abs(v[-1][0] - v[0][0]) < 1e-6 and abs(v[-1][1] - v[0][1]) < 1e-6:
                sub["i"][0] = sub["i"][-1]; v.pop(); sub["i"].pop(); sub["o"].pop()
            cur = start; last_c = None
            sub = None   # a drawing command after Z (without M) starts a new sub-path at `start`
    return [s for s in subs if len(s["v"]) > 1 or s["closed"]]


def convert(svg_text):
    vb = re.search(r'viewBox="([^"]+)"', svg_text)
    x0, y0, w, h = [float(v) for v in vb.group(1).split()] if vb else (0, 0, 24, 24)
    cx, cy = x0 + w / 2, y0 + h / 2
    out = []
    for d in re.findall(r'<path[^>]*\sd="([^"]+)"', svg_text):
        if re.search(r'stroke="none"', d):
            continue
        for s in parse_path(d):
            r = lambda p: [round(p[0] - cx, 3), round(p[1] - cy, 3)]
            t = lambda p: [round(p[0], 3), round(p[1], 3)]
            out.append([s["closed"], [r(p) for p in s["v"]], [t(p) for p in s["i"]], [t(p) for p in s["o"]]])
    return out


def main():
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    out, var = sys.argv[1], sys.argv[2]
    data = {}
    for arg in sys.argv[3:]:
        name, path = arg.split("=", 1)
        svg = open(path, encoding="utf-8").read()
        svg = re.sub(r'<path d="M0 0h24v24H0z" fill="none"\s*/>', "", svg)  # Tabler's invisible bounding path
        data[name] = convert(svg)
    js = "// Generated by svg_to_ae.py - icon outlines as AE shape data (centred, viewBox units).\n"
    js += "var %s = %s;\n" % (var, json.dumps(data, separators=(",", ":")))
    open(out, "w").write(js)
    print("wrote", out, {k: len(v) for k, v in data.items()})


if __name__ == "__main__":
    main()
