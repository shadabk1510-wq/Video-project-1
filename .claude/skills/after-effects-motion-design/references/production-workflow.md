# Production workflow: assets, reference style, VO sync, organisation

`MT = python3 .claude/skills/after-effects-motion-design/scripts/media_tools.py`

## 1. Asset intake

1. Inventory: `find assets -type f | sort` and `$MT probe assets/**/*` → note codecs, fps, size, VFR.
2. Fix import blockers (WebM/MKV, VP9/AV1, Opus/Vorbis, variable frame rate phone/screen
   recordings): `$MT to-ae in.webm assets/_ae/in.mov` (ProRes 422, CFR) or `… vo.opus assets/_ae/vo.wav`.
   Never overwrite originals; transcodes go to `assets/_ae/`.
3. Graphics: prefer vector `.ai`/`.eps`/`.pdf` (convert `.svg` to one of these first), import into
   AE, then **Layer › Create › Create Shapes from Vector Layer** to get editable shape layers
   (scriptable: select the layer, then `app.executeCommand(app.findMenuCommandId("Create Shapes from Vector Layer"))`;
   menu names are localised, so fall back to asking the user). Otherwise use high-res PNG with alpha. Layered `.psd`/`.ai`
   import as comps: `AEL.importFile(p, F.graphics, { asComp: true })`.
4. Fonts: list required PostScript names; confirm they're installed (probe_env / `AEL.text`
   warnings). AE can't use web-only fonts. Tell the user which fonts to install — don't install them yourself.
5. Record everything in `docs/assets.json` (source path, AE-safe path, purpose, licence notes).

## 2. Reading a reference video's style

```bash
$MT probe ref.mp4                       # resolution, fps, length
$MT scenes ref.mp4 --threshold 0.3      # cut rhythm: shot lengths → editing pace
$MT frames ref.mp4 --out docs/ref_frames --every 0.5 --sheet   # contact sheet to look at
$MT frames ref.mp4 --out docs/ref_keys --at 1.2,3.4,7.0       # specific beats
$MT palette ref.mp4 --at 3.4 --colors 6                         # dominant colours
```
Open the contact sheet / frames with the Read tool and write `docs/style.md`:
- **Layout**: grid, margins, alignment (left/centre), text block sizes as % of frame.
- **Type**: serif/sans, weight, case, tracking, line count per card, emphasis method.
- **Colour**: palette hexes + roles (bg, text, accent), contrast, gradients/texture.
- **Motion**: entrance types, typical durations (count frames between stills), easing feel
  (snappy vs floaty), stagger, transitions between scenes, camera moves, loops.
- **Pacing**: average shot length (from `scenes`), text hold times, beats per section.
Translate it into CONFIG tokens. Match the *style*, never copy protected logos/artwork.
For side-by-side checks, import the reference as a 50% guide layer (`CONFIG.reference`).

## 3. Sync to voice-over and script sections

1. Get speech segments: `$MT speech assets/_ae/vo.wav --noise -35dB --min-silence 0.35`
   (lower `--noise` like `-40dB` for quiet VO; raise `--min-silence` to merge phrases).
2. Align script lines to segments in order (segment count ≈ sentence/phrase count; merge or split
   by adjusting `--min-silence`). If a transcript with timestamps exists (SRT/VTT), prefer it.
3. Write `docs/timing.json`:
   ```json
   { "fps": 25, "sections": [
     { "id": "S01", "title": "…", "body": "…", "vo": "first sentence…", "start": 0.00, "end": 4.36 } ] }
   ```
   Start visuals 2–4 frames **before** the word lands; end sections at the next segment start
   (no gaps); snap to frames.
4. Build: read the file in the script with `AEL.parseTrustedJSON(AEL.readText(path))` or paste
   values into CONFIG. Add comp markers per section (`AEL.compMarker`) and per key word
   (layer markers on the VO layer) so the designer can retime by eye.
5. Music: put beat markers (`$MT` doesn't detect beats; ask the user for BPM or tap markers) and
   cut on beats where VO allows.

## 4. Project organisation

- Comps: `PRJ_MAIN`, `PRJ_S01…`, `PRJ_LowerThird`, `PRJ_CTRL`, `TRN_…`. Layers named for content
  (`Title`, `Accent Bar`, `Logo`), never "Shape Layer 3".
- Folders: `01_Main 02_Sections 03_Precomps 04_Footage 05_Audio 06_Graphics 07_Reference 08_Controls Solids`.
- Label colours by role (e.g. text = 1, shapes = 9, footage = 4, controls = 14) via `layer.label`.
- Keep build scripts in `ae/scripts/` under version control; the `.aep` is an output.
- Saves: `AEL.saveIncremental("ae", "PRJ_main")` → `PRJ_main.aep`, `_v002`, … Never overwrite.

## 5. Portability and hand-off

- Reference assets by paths relative to the script (`AEL.rel`), keep everything inside the project folder.
- Before delivery: **File › Dependencies › Collect Files** (manual, or confirm before scripting it),
  **Reduce Project** only with consent, check `AEL.missingFootage()` is empty, list fonts used.
- Deliver: `.aep` (+ collected footage), fonts list, `docs/timing.json`, build scripts, preview render.
- `.aep` files are binary — do not edit them as text; open in AE or use scripts.
