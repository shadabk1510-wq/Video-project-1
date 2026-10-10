# SFX step 1: list every animation event of the main comp from an ae_sim model (model.mjs output).
# Usage: python3 events.py model.json events.json [MAIN_COMP=NOON3_MAIN] [CLIP_PREFIX='NOON3 ']
# Clip comps are the main comp's precomp layers whose name starts with CLIP_PREFIX + a 2-digit id.
# Events: appear/disappear (opacity), pop (scale from ~0), morph/cardpop/press (SHAPE or CURSOR sliders),
# camera (WORLD Cam/Focus), type (Type on animator), window (time remap / *window* precomps), move (Active row).
# Each: [time in main, kind, clip id, layer name, property path, size of change, start value].
import json, sys, re
d = json.load(open(sys.argv[1]))
comps = {c['name']: c for c in d['comps']}
MAIN = sys.argv[3] if len(sys.argv) > 3 else 'NOON3_MAIN'
PREFIX = sys.argv[4] if len(sys.argv) > 4 else 'NOON3 '
main = comps[MAIN]
ev = []

def keyed(props, path=()):
    for p in props:
        q = path + (p['name'],)
        if p.get('keys'): yield q, p
        if p.get('kids'): yield from keyed(p['kids'], q)

def num(v): return 0 if v is None or isinstance(v, (str, dict)) else v if isinstance(v, (int, float)) else (v[0] if v else 0)

def scan(comp, off, lo, hi, clip, depth=0):
    for L in comp['layers']:
        if not L.get('enabled', True) or L.get('guide'): continue
        a0 = off + L['start']
        lin, lout = off + L['in'], off + L['out']
        name = L['name']
        srcn = (L.get('source') or {}).get('comp') or ''
        for path, p in keyed(L['props']):
            ks = p['keys']; pn = '/'.join(path)
            def emit(kind, t, extra='', dv=None):
                if lo - 0.05 <= t <= hi and lin - 0.05 <= t <= lout:
                    ev.append((round(t, 2), kind, clip, name, pn + extra, round(abs(v1 - v0), 3), v0))
            for i in range(1, len(ks)):
                v0, v1 = num(ks[i-1].get('v', 0)), num(ks[i].get('v', 0))
                if pn.endswith('Position') and isinstance(ks[i].get('v'), list) and isinstance(ks[i-1].get('v'), list):
                    v0, v1 = 0, sum((x - y) ** 2 for x, y in zip(ks[i]['v'], ks[i-1]['v'])) ** 0.5
                if v0 == v1: continue
                t = a0 + ks[i-1]['t'] if ks[i-1].get('outI') != 6614 else a0 + ks[i]['t']
                if 'window' in srcn.lower() and 'Transform' in pn:
                    emit('window', t)
                elif pn.endswith('Opacity') and 'Transform' in pn:
                    if v0 <= 1 < v1: emit('appear', t)
                    elif v1 <= 1 < v0: emit('disappear', t)
                elif pn.endswith('Position') and 'Transform' in pn:
                    if name == 'Active row': emit('move', t)
                elif pn.endswith('Scale') and 'Transform' in pn:
                    if v0 < 10 < v1: emit('pop', t)
                elif name == 'SHAPE' and re.search(r'/(W|H|CX|CY|Radius)/', pn + '/'):
                    emit('morph', t, '')
                elif '/Press/' in pn + '/':
                    if v1 > v0: emit('press', t)
                elif name == 'SHAPE' and '/Pop/' in pn + '/':
                    if v1 > v0: emit('cardpop', t)
                elif name.startswith('WORLD') and re.search(r'/(Cam|Focus X|Focus Y)/', pn + '/'):
                    emit('camera', t)
                elif 'Type on' in pn and v0 < v1:
                    emit('type', t, ' dur=%.2f' % (ks[i]['t'] - ks[i-1]['t']))
                elif pn.endswith('Time Remap') and i == 1:
                    emit('window', a0 + ks[0]['t'])
        src = (L.get('source') or {}).get('comp')
        if src and src in comps and depth < 6:
            scan(comps[src], a0, max(lo, lin), min(hi, lout), clip, depth + 1)

for L in main['layers']:
    src = (L.get('source') or {}).get('comp')
    if src and src.startswith(PREFIX):
        scan(comps[src], L['start'], L['in'] + L['start'] if False else L['start'], L['start'] + comps[src]['dur'], src[len(PREFIX):len(PREFIX) + 2])
ev.sort()
json.dump(ev, open(sys.argv[2], 'w'))
from collections import Counter
print(len(ev), Counter(e[1] for e in ev))
