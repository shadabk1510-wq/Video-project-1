# Motion recipes (editable, script-built)

All snippets assume `#include "ae_lib.jsx"` and run inside `AEL.run(...)`. Keep results editable:
named layers, keys the designer can retime, controls instead of magic numbers.

## Craft rules

- **Ease everything** that starts or stops. Entrances `AEL.EASE.expoOut`, exits `expoIn`, loops `smooth`.
  Linear only for mechanical motion (tickers, typewriter steps, countdowns).
- **Hierarchy through timing**: headline → accent → body → CTA, 3–6 frames apart (`motion.stagger`).
- **Entrances 0.5–0.9 s, exits 0.3–0.5 s** (exits faster than entrances). Hold readable text ≥ ~1 s
  per 3 words of on-screen copy.
- Animate few properties at once (position + opacity, or scale + opacity) — not all of them.
- Turn on motion blur for fast moves (`comp.motionBlur` + `layer.motionBlur`).
- Keep titles inside the title-safe area (~10% inset); use `brand.margin` consistently.
- Reuse one rig (controls null) for colour/type tokens so brand changes are one edit.

## Kinetic typography

**Per-character / per-word reveal** (text animator — fully editable):
```js
AEL.textReveal(title, { start: 0.2, duration: 0.8, basedOn: "characters", y: 60, wave: true, waveWidth: 35 });
AEL.textReveal(body,  { start: 0.4, duration: 0.6, basedOn: "words", y: 24 });
AEL.textReveal(tag,   { start: 0.0, duration: 0.5, basedOn: "lines", blur: 12 });
```
`wave:true` slides a Ramp-Up window via Offset for overlapping letters; default is a square
Start 0→100 sweep (typewriter-like when `y` is 0 and `opacity` 0).

**Scale-pop words**: `{ basedOn: "words", scale: 0, y: 0 }` and ease `AEL.EASE.snappy`; add overshoot
with an expression on the layer scale if needed (below).

**Tracking breathe**: add `ADBE Text Tracking Amount` to an animator (selector 0–100%) and key it
from 40 → 0 across the title's in-time.

**Word-by-word replacement** (one layer, many words timed to VO): key `ADBE Text Document` with
HOLD keys — `AEL.key(textProp, [t1, t2, t3], [doc1, doc2, doc3], null, true)` where each `docN` is a
`TextDocument` copy with different `.text`.

**Typing-on with caret**: Source Text expression
`var n = Math.max(0, Math.floor((time - inPoint - 0.2) / 0.05)); value.substr(0, n);`
and a blinking caret layer: opacity expression `Math.floor(time * 2) % 2 ? 0 : 100`.

**Layout from content**: set anchor to `[0,0]` (baseline-left) for left-aligned blocks and place
by `sourceRectAtTime`; centre layouts use `AEL.anchorCenter`. A background plate that hugs text:
rect size expression
`var r = thisComp.layer("Title").sourceRectAtTime(time, false); [r.width + 60, r.height + 30]`.

## Shapes, lines, reveals

**Accent bar growing from the left** (anchor at left edge):
```js
var bar = AEL.rect(comp, { w: 240, h: 12, color: B.primary, name: "Accent Bar" });
AEL.xf(bar, "ADBE Anchor Point").setValue([-120, 0]);
AEL.key(AEL.xf(bar, "ADBE Scale"), [0.2, 0.9], [[0, 100], [100, 100]], AEL.EASE.expoOut);
```

**Draw-on line** (Trim Paths):
```js
var ln = AEL.line(comp, [200, 800], [1720, 800], "#FFFFFF", 4, "Rule");
var tr = AEL.trim(ln);
AEL.key(tr.property("ADBE Vector Trim End"), [0.3, 1.1], [0, 100], AEL.EASE.expoOut);
```
For outline logos: stroke paths + Trim End 0→100 staggered per group, then fade the fill in.

**Circle burst / ripple**: ellipse group (`ADBE Vector Shape - Ellipse`, size `ADBE Vector Ellipse Size`)
with stroke; key group scale 0→100 and stroke width 20→0 together; add a Repeater for rings.

## Masks and mattes

**Mask wipe reveal** (keys on the mask path — editable in the timeline):
```js
var m = AEL.maskRect(layer, 0, 0, 0, comp.height, 0);          // closed, zero width
var s2 = new Shape(); s2.vertices = [[0,0],[comp.width,0],[comp.width,comp.height],[0,comp.height]]; s2.closed = true;
var mp = m.property("ADBE Mask Shape");
mp.setValueAtTime(0.2, mp.value); mp.setValueAtTime(1.0, s2);
```
(For layers whose layer space ≠ comp space, compute vertices from `sourceRectAtTime`.)

**Text revealed from behind a line** (track matte):
```js
var matte = AEL.rect(comp, { w: 1600, h: 200, color: "#FFFFFF", name: "Title Matte", pos: [960, 480] });
AEL.trackMatte(title, matte, TrackMatteType.ALPHA);
AEL.key(AEL.xf(title, "ADBE Position"), [0.2, 0.9], [[x0, y0 + 160], [x0, y0]], AEL.EASE.expoOut);
```
Luma mattes for gradients/textures: `TrackMatteType.LUMA`. Name mattes `"<target> Matte"`.

## Transitions between sections

Build transitions in MAIN on the section layers (or in a `TRN_*` precomp above them) so sections
stay self-contained.

| Transition | Build |
|---|---|
| Fade through | section opacity 100→0 (`expoIn`, 0.3 s) overlapped with next section's entrance |
| Push / slide | outgoing position x → −width, incoming from +width, same ease, same duration |
| Wipe | `ADBE Linear Wipe` on the outgoing layer, key `ADBE Linear Wipe-0001` 0→100, feather ~50 |
| Shape wipe | full-frame brand-colour rect scaling X 0→100 (anchor left) then 100→0 (anchor right) on top while sections cut underneath at midpoint |
| Zoom through | outgoing scale 100→140 + opacity, incoming 80→100; motion blur on |
| Match cut | carry one element (bar, logo) across the cut by placing it in MAIN, not in either section |

Snap cut points to frames and to VO segment boundaries (see production-workflow.md).

## Precomps and structure

- One comp per section (`PRJ_S01` …), placed in `PRJ_MAIN` at the section's start time.
- Precompose reusable units (lower third, logo sting, CTA) into `03_Precomps` and instance them;
  drive differences with layer-level Essential Properties / expression controls, not duplicates.
- `AEL.precompose(comp, [l1, l2], "PRJ_LowerThird", F.precomps)` moves attributes into the precomp.
- Use nulls as parents for groups that move together; name them `CTRL …` or `NULL …`.

## Brand / design-system rig

- `PRJ_CTRL` comp with a `Brand` null holding named Color Controls (Primary, Secondary, Text,
  BG) and Slider Controls (e.g. `Motion Scale`, `Corner Radius`).
- Link fills: `comp("PRJ_CTRL").layer("Brand").effect("Primary")(1)`. Text colour: `ADBE Fill` effect
  on the text layer with its colour linked (keeps TextDocument editable).
- Type scale tokens in CONFIG (`titleSize`, `bodySize`, `captionSize`), spacing on a grid (8 px).
- For client-editable templates, expose properties via Essential Graphics:
  `prop.addToMotionGraphicsTemplateAs(comp, "Headline")` (check the method exists in this AE version).

## Glows (house rule)

Glow = precomp containing the shape + Gaussian Blur on the precomp layer (never on the shape layer):
```js
var gc = app.project.items.addComp("GLOW Soft Light", 1900, 1900, 1, dur, fps);   // shape centred inside
// ...circle shape layer in gc...
var gl = comp.layers.add(gc);
gl.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2").property("ADBE Gaussian Blur 2-0001").setValue(200);
```
Same for blurred screens: precomp the image/feed, blur the precomp layer.
Use `add()/sub()/mul()` for array maths in expressions (safe in both expression engines).

## Useful expressions (inject as strings)

```js
// Overshoot after the last key (inertial bounce) — on Scale/Position with 2+ keys
"var amp=.06,freq=3,decay=6,n=0;if(numKeys>0){n=nearestKey(time).index;if(key(n).time>time)n--;}" +
"if(n>0&&n==numKeys){var t=time-key(n).time,v=velocityAtTime(key(n).time-thisComp.frameDuration/10);" +
"value+v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);}else value;"
// Loop authored keys
"loopOut('cycle')"
// Gentle float (justify any wiggle: small amplitude, low frequency)
"value + [0, Math.sin(time * 1.2) * 6]"
```
