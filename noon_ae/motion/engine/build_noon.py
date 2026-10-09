"""build_noon.py <out_dir> clips/*.html  - like build.py, plus the NOON theme (css+js) injected into every clip."""
import sys, pathlib, re
E = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(E))
import build as B
def build(src, dst):
    B.build(src, dst)
    h = open(dst, encoding='utf-8').read()
    css = open(E/'noon_theme.css').read(); js = open(E/'noon_theme.js').read()
    h = h.replace('</style></head>', css + '</style></head>', 1)
    i = h.index('</script><script>') + len('</script>')   # after motion.js, before the clip script
    h = h[:i] + '<script>' + js + '</script>' + h[i:]
    open(dst, 'w', encoding='utf-8').write(h)
if __name__ == '__main__':
    out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    for s in sys.argv[2:]:
        d = out/(pathlib.Path(s).stem + '.html'); build(s, d); print('built', d)
