# ExtendScript for After Effects — working reference

Official docs: <https://ae-scripting.docsforadobe.dev/> (scripting guide) and
<https://ae-expressions.docsforadobe.dev/> (expressions). Check them when unsure of a method or
enum; this file covers what builds need daily. `jsx/ae_lib.jsx` wraps most of it.

## Language: ES3

| Don't | Do |
|---|---|
| `let` / `const` | `var` |
| `() => x` | `function () { return x; }` |
| `` `a ${b}` `` | `"a " + b` |
| `arr.forEach/map/filter`, `arr.indexOf` | `for (i = 0; i < arr.length; i++)`, `AEL.contains` |
| `JSON.stringify/parse` | `AEL.stringify`, `AEL.parseTrustedJSON` (own files only) |
| `str.trim()` | `str.replace(/^\s+|\s+$/g, "")` |
| `Object.keys` | `for (k in o) if (o.hasOwnProperty(k))` |

- Function *declarations* are hoisted; helper functions may sit below the main call.
- `$.writeln()` prints to the ExtendScript/VS Code debug console; `$.fileName` is the running file.
- Collections are **1-based**: `app.project.item(i)`, `comp.layer(i)`, `prop.property(i)`, keys.
- Preprocessor: `#include "ae_lib.jsx"` (relative to the script), `#target aftereffects` (optional).
- Edit/debug with the VS Code **ExtendScript Debugger** extension (Adobe) if the user has it.

## Project & items

```js
app.project                         // always exists; app.project.file == null if unsaved
app.project.items.addFolder("04_Footage")
app.project.items.addComp(name, w, h, pixelAspect, durationSec, fps)
app.project.importFile(new ImportOptions(new File(path)))   // check io.canImportAs(ImportAsType.FOOTAGE)
item.parentFolder = folder;  item.remove();  item.id  // stable within a session
item instanceof CompItem / FolderItem / FootageItem
footage.footageMissing; footage.replace(new File(p)); footage.mainSource.conformFrameRate = 25
app.project.save(new File(path))    // use AEL.saveIncremental — never overwrite silently
app.project.activeItem              // may be null or not a CompItem — check
```

## Layers

```js
comp.layers.addSolid([r,g,b], name, w, h, pixelAspect, dur)
comp.layers.addText("Hello")        // TextLayer
comp.layers.addShape()              // ShapeLayer
comp.layers.addNull(dur)
comp.layers.add(itemOrComp)         // footage / precomp layer
comp.layers.precompose([idx...], name, true)  // returns the new CompItem
layer.startTime / inPoint / outPoint (seconds); layer.parent = other; layer.threeDLayer = true
layer.moveToBeginning() / moveToEnd() / moveBefore(l) / moveAfter(l)
layer.motionBlur, layer.guideLayer, layer.shy, layer.locked, layer.label (0-16), layer.enabled
layer.blendingMode = BlendingMode.SCREEN
layer.sourceRectAtTime(t, false)    // {left, top, width, height} in layer space — use for layout
```

## Property matchNames (locale-safe — never use display names)

| Area | matchName |
|---|---|
| Transform group | `ADBE Transform Group` → `ADBE Anchor Point`, `ADBE Position`, `ADBE Scale`, `ADBE Rotate Z`, `ADBE Opacity` |
| Separated position | `ADBE Position_0`, `ADBE Position_1` after `pos.dimensionsSeparated = true` |
| Text | `ADBE Text Properties` → `ADBE Text Document` (value is `TextDocument`), `ADBE Text Animators`, `ADBE Text Path Options` |
| Text animator | `ADBE Text Animator` → `ADBE Text Animator Properties` (`ADBE Text Opacity`, `ADBE Text Position 3D`, `ADBE Text Scale 3D`, `ADBE Text Rotation`, `ADBE Text Blur`, `ADBE Text Tracking Amount`, `ADBE Text Fill Color`) and `ADBE Text Selectors` → `ADBE Text Selector` |
| Range selector | `ADBE Text Percent Start/End/Offset`; `ADBE Text Range Advanced` → `ADBE Text Range Type2` (Based On 1 chars, 2 chars excl. spaces, 3 words, 4 lines), `ADBE Text Range Shape` (1 square, 2 ramp up, 3 ramp down, 4 triangle, 5 round, 6 smooth), `ADBE Text Levels Max Ease`/`Min Ease`, `ADBE Text Randomize Order` |
| Shapes | `ADBE Root Vectors Group` → `ADBE Vector Group` → `ADBE Vectors Group` → `ADBE Vector Shape - Rect` / `- Ellipse` / `- Star` / `- Group` (path), `ADBE Vector Graphic - Fill` (`ADBE Vector Fill Color`), `ADBE Vector Graphic - Stroke` (`ADBE Vector Stroke Color`, `ADBE Vector Stroke Width`), `ADBE Vector Filter - Trim` (`ADBE Vector Trim Start/End/Offset`), `ADBE Vector Filter - Offset`, `ADBE Vector Filter - Repeater` |
| Rect | `ADBE Vector Rect Size`, `ADBE Vector Rect Position`, `ADBE Vector Rect Roundness` |
| Group transform | `ADBE Vector Transform Group` → `ADBE Vector Anchor`, `ADBE Vector Position`, `ADBE Vector Scale`, `ADBE Vector Rotation`, `ADBE Vector Group Opacity` |
| Masks | `ADBE Mask Parade` → `ADBE Mask Atom` → `ADBE Mask Shape`, `ADBE Mask Feather`, `ADBE Mask Opacity`, `ADBE Mask Offset` (expansion); `mask.maskMode = MaskMode.ADD` |
| Effects | `ADBE Effect Parade` → e.g. `ADBE Gaussian Blur 2`, `ADBE Drop Shadow`, `ADBE Fill`, `ADBE Linear Wipe`, `ADBE Radial Wipe`, `ADBE Venetian Blinds`, `ADBE Glo2` (Glow), `ADBE Tint`, `ADBE Slider Control`, `ADBE Color Control`, `ADBE Checkbox Control`, `ADBE Point Control`, `ADBE Layer Control` |
| Effect params | `<effect matchName>-0001`, `-0002`… (e.g. `ADBE Slider Control-0001`, `ADBE Color Control-0001`, `ADBE Linear Wipe-0001` = Transition Completion). Unsure? List them: loop `fx.property(i).matchName` and write to the result file |
| Markers | `ADBE Marker` (layer); `comp.markerProperty` (comp markers) |
| Time remap | `layer.timeRemapEnabled = true` → `ADBE Time Remapping` |
| Audio | `ADBE Audio Group` → `ADBE Audio Levels` |

Discover unknown matchNames by walking a hand-built example: `for (i = 1; i <= g.numProperties; i++) AEL.log(g.property(i).matchName)`.

**Invalidated references:** `addProperty()` can invalidate earlier references to sibling/parent
properties ("Object is invalid"). Re-fetch from the layer through accessor functions after each add
(see `AEL.textReveal`).

## Text

```js
var p = layer.property("ADBE Text Properties").property("ADBE Text Document"), d = p.value;
d.font = "Inter-Bold";  // PostScript name. Missing fonts are substituted silently: read back p.value.font
d.fontSize = 96; d.applyFill = true; d.fillColor = [1,1,1]; d.applyStroke = false;
d.tracking = 20; d.autoLeading = false; d.leading = 110;
d.justification = ParagraphJustification.LEFT_JUSTIFY;
p.setValue(d);
// Box (paragraph) text: comp.layers.addBoxText([w, h], "text")
// Per-character styling (AE 24.0+): d.characterRange(start, end) — check app.version first.
```
AE uses only fonts **installed on the OS**. AE 24+: `app.fonts.getFontsByPostScriptName(name)` to verify.

## Keyframes & easing

```js
prop.setValueAtTime(t, v);  prop.setValuesAtTimes([t1,t2], [v1,v2]);
var k = prop.nearestKeyIndex(t);
prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
prop.setTemporalEaseAtKey(k, [new KeyframeEase(0, 75)], [new KeyframeEase(0, 75)]);
prop.setSpatialTangentsAtKey(k, inTangent, outTangent);  // motion-path curves
prop.setRovingAtKey(k, true);                            // even speed through middle keys
```
Ease array length: 1 for 1D, colour and **spatial** props (Position, Anchor), 2 for TwoD, 3 for
ThreeD (`prop.propertyValueType`). `AEL.key` handles this and retries other lengths.
Snap times to frames (`AEL.snap`) so keys land on frames.

## Expressions

```js
prop.expression = 'comp("PRJ_CTRL").layer("Brand").effect("Primary")(1)';
prop.expressionEnabled = true; prop.expressionError   // read after setting
```
- Build expression strings by concatenation; inject CONFIG values at build time.
- Reference controls by **your own effect names** (`effect("Primary")(1)`) — not by localised UI names.
- Expression engine is modern JavaScript (AE 16.0+ default) even though scripts are ES3.
- Prefer expressions for derived motion (overshoot, loops, linking); keyframes for authored beats
  the designer will retime by hand.

## Version-sensitive APIs

| API | Since | Fallback |
|---|---|---|
| `layer.setTrackMatte(matte, type)` / `removeTrackMatte()` | AE 2023 (23.0) | matte directly above + `layer.trackMatteType` (`AEL.trackMatte` handles both) |
| `app.fonts.*` | AE 2024 (24.0) | read back `TextDocument.font` |
| `TextDocument.characterRange()` / per-character styles | AE 2024 (24.x) | separate layers per style |
| JXA `doscriptfile` from macOS | reliable on 24.x+ | AppleScript `DoScriptFile` for ≤ 23.x |
| H.264 output-module template | AE 2023+ native H.264 | QuickTime/ProRes, then ffmpeg |

Always record `app.version` in the result file and branch on `parseFloat(app.version)`.
