# Porting a NOON v3 motion clip to native After Effects (clips3/cNN.jsx)

The approved look exists as 12 HTML "motion-broll" clips (`noon_ae/motion/clips/NN-*.html`), rendered to
`noon_ae/motion/out/NN-*.mp4`. The client wants the same thing as an **editable After Effects project** built by
ExtendScript. Each clip becomes one file `clips3/cNN.jsx` that registers `N3CLIPS["NN"] = { tin, build }`.
`clips3/c02.jsx` is the worked example - read it first.

## What to read
- `noon_ae/motion/engine/motion.js` - the web engine (M.scene, M.track springs, M.vis reveals, M.path cursor).
- `noon_ae/motion/engine/noon_theme.js` - `show()`, `wt()`, STEPS/stepsHTML/stepsIcons, colours. `noon_theme.css` - classes `.k`, `.cap`, `.chip`.
- `noon_ae/motion/engine/base.css` - `.L` (group origin), `.a` (absolute), `.row` (flex row, nowrap).
- Your clip's HTML. Every number in it is the spec.
- `noon_ae/ae/scripts/noon3_lib.jsx` - the library (API below). Do **not** edit it, `ae_lib.jsx`, `build_noon3.jsx` or another clip's file.
  If you need a helper, write it inside your clip file with a `C<NN>_` prefix. If the library is wrong or missing something
  important, say so in your report (with the fix you'd make) rather than patching it.

## Mapping web -> AE
| Web engine | AE (noon3_lib) |
|---|---|
| `M.scene({SH, start, SEQ, spring, intro, shapePress})` | `S = N3.scene({id, title, T, SH, start, SEQ, spring, intro, shapePress, cx, cy, fx, fy, camMul})` |
| `geom: g.cx = track(t)` / `g.cy` / `g.fx` / `g.fy` / `g.s *= k` | pass the same keys as `cx:[[t,v,sp]]`, `cy`, `fx`, `fy`, `camMul` (camMul is the multiplier, default 1) |
| `layers:[{el:'Lx', tin, tout, anchor, o}]` | `g = N3.group(S, "Name", {anchor:'c'|'t'|'l', tin, tout, din, lin, lout, blur})` -> a collapsed precomp clipped by the card |
| elements inside an `.L` | build them into `g` (a ctx) with coordinates exactly as in the HTML (origin = the .L origin) |
| `data-slot="world"` elements | `S.worldCtx` (world coordinates, behind the card, move with the camera) |
| `data-slot="over"` elements | `S.overCtx` (world coordinates, above the card) |
| `M.track(v0, [[t, v, spring]])` on any property | `N3.spring(prop, v0, [[t, v, spring]], defSpring)` (HOLD keys + spring expression; springs in `N3.SP`) |
| `show(el, t, tin, tout, dy, o)` | `N3.show(layer, tin, tout, dy, o)` (opacity/scale/blur/rise keyframes; `o.op` = final opacity %) |
| per-word / per-letter stagger (spans each with show) | `N3.unitReveal(textLayer, {times:[...], based:'words'|'chars', dy, blur, lin, din, stagger})` (one layer marker per unit) |
| typing (`M.setText` slice by time) | `N3.typeOn(textLayer, t0, t1)` |
| `M.eo` ramps | `N3.eo(prop, t0, t1, v0, v1)`; `M.eio` -> `N3.io`; linear -> `N3.lin(prop, times, values)`; steps -> `N3.hold` |
| cursor `{keys, clicks, drags, size}` | `N3.cursor(S, {keys, clicks, drags, size})` (call it last) |
| `wt(i, T0)` | `N3.wt(i, T0)` |

Elements: `N3.box(ctx, {name, x,y | cx,cy, w, h, r, fill, stroke, sw, opacity, shadow})`, `N3.ellipse(ctx, {cx, cy, d | w,h, fill, stroke, sw})`,
`N3.path(ctx, {verts, inT, outT, closed, stroke, sw, fill, trim})` (+ `N3.trimOf(layer)` for draw-on), `N3.icon(ctx, name, {cx, cy, size, color, sw})`
(names = keys of `N3_ICONS`, same as `M.IC`), `N3.text(ctx, str, {name, x, top | cy, fs, wt, color, ls, lh, align, caps, opacity})`,
`N3.chip(ctx, str, {x | cx, top | cy, fs, wt, color, bg, padX, padY, ls, caps})`, `N3.image(ctx, "file.png", {x,y | cx,cy, w, h, fit:'cover'|'width'|'stretch', r})`,
`N3.follow(layer, refTextLayerName, gap)` (x after a text's right edge), `N3.blur(layer)` (Gaussian Blur amount property), `N3.shadow(layer, N3.SHADOW.card|small|pen)`,
`N3.slider(layer, name, v)` / `N3.ctl(layer, name)` for your own controls, `N3.mask(layer, N3.rrShape(l, t, w, h, r))`, `N3.parent(layer, parent)` (never `layer.parent =`).
Assets live in `noon_ae/assets/_ae/` (bag.png, pod.png, social1.png, social2.png, product_page.png, doc_brief/research/notes.png, pen.png,
phone_frame.png, motion2_bag.mp4, NOON-logo.svg). The web clips' `../assets/sunrise/NNN.jpg` frames are `motion2_bag.mp4` from 0.2 s
(use the video with time remap). `N3.file(rel)` imports once.

Text conversion is done for you by `N3.text`: give the CSS `top` of the line box (or `cy` for translate(-50%,-50%) centring), font size, weight,
letter-spacing in em, and `align`. `.k` = weight 600, ls -0.025. `.cap` = 15px 600, ls .14, caps, #C2575D. `.chip` = 16px 600, pad 7/14, pill.
Flex rows (`.row`, `display:flex; gap`) have no width at build time: centre them with `align:"center"` or chain with `N3.follow`.
Inline `<span>` colour changes inside one line: a Fill Color animator with an expression selector (see c02 "Coral words").

## Rules
- ES3 only (ExtendScript): `var`, `function`, no arrow functions, no `let/const`, no template strings, no `Array.map/forEach/indexOf`, no trailing commas.
- Keep everything the viewer sees editable: keyframes and markers over hard-coded expression timing. Expressions only from the library or
  short ones using: `time, value, key(i), numKeys, effect("n")(1), thisComp.layer("n"), comp("n").layer("n"), transform.*, marker.key(i).time,
  sourceRectAtTime(), textIndex, add/sub/mul/clamp/linear/ease, Math`. (That is also what the previewer understands.)
- Layer names: short, human (`"Brief card"`, `"Stage label"`), unique per comp (the helpers add numbers when needed).
- Continuity: the clip's first frame must equal the previous clip's last frame (same SH start state, same carried-over elements).
  The web clips already guarantee this - port them faithfully, including `tin:null` groups that are visible at t=0.
- Fidelity first: same timings (VO word times via `N3.wt`), sizes, colours, springs. Where the web clip does something AE can't do
  natively (CSS conic-gradient, mix-blend multiply on HTML, per-span layout), use the closest clean AE construction and note it.

## Test loop (mandatory)
```
bash noon_ae/ae/scripts/clips3/test/sim.sh NN "t1,t2,...,t12"
```
builds `clips3/test/tNN.jsx` in the strict AE model (`ae_sim/model.mjs`, throws like AE on bad match names, setValue on keyed props,
wrong ease dims, plain `.parent =` ...) and renders the frames with `ae_sim/render.mjs`, plus the same frames from the reference MP4.
Look at both PNGs (scratchpad `sim/cNN.png` and `sim/cNN_ref.png`) and iterate until they match: layout, timing, motion.
Pick times that cover every beat (entrances, morphs, exits, first and last frame). Also run
`node .claude/skills/after-effects-motion-design/scripts/check_jsx.mjs noon_ae/ae/scripts/clips3/cNN.jsx` (ES3 parse).
`EXPRESSION ERRORS:` from render.mjs must be empty.

Report: what you built (layer/group list), remaining differences vs the reference and why, anything the library should change.
