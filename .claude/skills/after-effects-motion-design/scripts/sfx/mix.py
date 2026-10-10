# SFX step 4: mix the VO with the SFX comp's layers as AE would play them, report SFX-vs-VO levels per sound
# and write a wav preview for the user to listen to before running anything in AE.
# Usage: python3 mix.py model.json <dir with NAME.st.wav (48k stereo) per source file> vo.wav out.wav [SFX_COMP] [VO_START]
# Targets that worked (calm explainer): whoosh/pop ~-9 dB under the VO p90, ticks ~-12, dings ~-6, end hit ~0.
import sys, json, wave, os, numpy as np
d = json.load(open(sys.argv[1])); wavdir = sys.argv[2]; vo = sys.argv[3]; out = sys.argv[4]
SR = 48000; T = 660.5
def load(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a.reshape(-1, 2)
mix = np.zeros((int(T * SR) + SR, 2), np.float32); sfx = np.zeros_like(mix)
v = load(vo); i0 = int((float(sys.argv[6]) if len(sys.argv) > 6 else 2.0) * SR); mix[i0:i0 + len(v)] += v[:len(mix) - i0]
foot = d['footage']; comp = [c for c in d['comps'] if c['name'] == (sys.argv[5] if len(sys.argv) > 5 else 'NOON3 SFX')][0]
cache = {}
for L in comp['layers']:
    src = foot[str(L['source']['footage'])]['path']; b = os.path.basename(src)
    if b not in cache: cache[b] = load(os.path.join(wavdir, b + '.st.wav'))
    a = cache[b]
    lv = [p for p in L['props'] if p['mn'] == 'ADBE Audio Group'][0]['kids'][0]
    st, tin, tout = L['start'], max(L['in'], 0), L['out']
    s0, s1 = int(tin * SR), int(min(tout, T) * SR)
    t = np.arange(s0, s1) / SR
    if lv.get('keys'):
        kt = [k['t'] for k in lv['keys']]; kv = [k['v'][0] for k in lv['keys']]
        g = np.interp(t, kt, kv)
    else: g = np.full(len(t), lv['value'][0])
    srcidx = ((t - st) * SR).astype(int); ok = (srcidx >= 0) & (srcidx < len(a))
    seg = np.zeros((len(t), 2), np.float32); seg[ok] = a[srcidx[ok]]
    sfx[s0:s1] += seg * (10 ** (g / 20))[:, None]
mix += sfx
pk = np.abs(mix).max(); print('mix peak dBFS %.1f, layers %d' % (20 * np.log10(pk), len(comp['layers'])))
# SFX vs VO, per cue: SFX 50 ms peak relative to VO 50 ms level around it (+-1.5 s, voiced p90)
def env(x):
    h = SR // 100; n = len(x) // h; r = (x[:n*h].mean(1).reshape(n, h) ** 2).mean(1); return 10 * np.log10(np.convolve(r, np.ones(5) / 5, 'same') + 1e-12)
es = env(sfx); ev = env(mix - sfx)
rel = []
for L in comp['layers']:
    c = int(max(L['in'], 0) * 100); w = es[c:c + 150]; pkv = w.max()
    vw = ev[max(0, c - 150):c + 150]; vv = np.percentile(vw[vw > ev.max() - 35], 90) if (vw > ev.max() - 35).any() else None
    rel.append((L['name'].split()[0], round(pkv, 1), None if vv is None else round(pkv - vv, 1)))
import collections
by = collections.defaultdict(list)
for k, p, r in rel:
    if r is not None: by[k].append(r)
for k, v in by.items(): print('%-7s n=%3d  SFX peak vs VO p90: median %+.1f dB  max %+.1f' % (k, len(v), np.median(v), max(v)))
m16 = np.clip(mix / max(1.0, pk), -1, 1)
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m16 * 32767).astype(np.int16).tobytes()); w.close()
