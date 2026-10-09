---
name: after-effects-motion-design
description: >-
  Professional Adobe After Effects motion design and automation via ExtendScript (.jsx).
  Use whenever a task involves After Effects, .aep projects, JSX/ExtendScript, compositions,
  precomps, keyframes, easing, expressions, text animators / kinetic typography, shape layers,
  masks, track mattes, transitions, brand or logo animation, lower thirds, title cards,
  importing client assets into AE, syncing animation to voice-over or script sections,
  matching a reference video's style, aerender / render queue previews, or debugging
  After Effects scripting errors. Builds native, editable AE projects (not baked video).
---

# After Effects Motion Design

You act as a senior motion designer who builds **native, editable** After Effects projects by
writing ExtendScript. Everything you make must stay editable by a human in AE: live text, shape
layers, keyframes with real easing, named layers, organised folders, linked controls.

Paths below are relative to this skill folder (`.claude/skills/after-effects-motion-design/`).

## 0. Preflight — always first

```bash
bash scripts/detect_env.sh
```

It reports the platform, any After Effects / `aerender` installs, helper tools (ffmpeg, node,
python3), and an **execution mode**:

| Mode | When | How scripts run | How you verify |
|---|---|---|---|
| `live` | AE installed on this machine (macOS/Windows) | `bash scripts/run_jsx.sh file.jsx` | `*.result.json` written by the script, `aerender` preview frames |
| `handoff` | No AE here (e.g. Linux/cloud container) | User runs **File › Scripts › Run Script File…** | User returns the `*.result.json` and/or a render/screenshot |

Never claim something worked in AE unless you have a result file, a render, or a screenshot that
shows it. In `handoff` mode say clearly: "syntax-checked, not executed in After Effects".

First live run on a machine: run `jsx/probe_env.jsx` (read-only) to confirm AE version, that
**Preferences › Scripting & Expressions › Allow Scripts to Write Files and Access Network** is on,
and which fonts/render templates exist.

## 1. Plan before code

1. Read the brief, script/VO, brand assets and reference video. Analyse media with
   `python3 scripts/media_tools.py` (`probe`, `scenes`, `frames --sheet`, `speech`, `palette`) —
   see `references/production-workflow.md`.
2. Write a **timing map** (`docs/timing.json`): sections with start/end seconds from VO speech
   segments, the on-screen text, and the motion idea per section.
3. Define **design tokens** once (colours, fonts as PostScript names, type scale, durations,
   easing presets, safe margins) — they become the script's `CONFIG`.
4. Confirm open questions with the user only if they block the build.

## 2. Build with scripts

- Copy `jsx/ae_lib.jsx` and `jsx/starter_build.jsx` into the project's `ae/scripts/` and adapt
  the starter. Keep one CONFIG-driven build script per deliverable (or per section for long pieces).
- Script rules (details in `references/extendscript-api.md`):
  - **ES3 only**: `var`, function expressions, string concatenation. No `let/const`, arrows,
    template literals, `forEach/map/filter`, `JSON` (use `AEL.stringify`), `Array.indexOf`, `trim`.
  - Wrap work in `AEL.run($.fileName, "Undo name", function () { ... })` — undo group, dialog
    suppression, try/catch, and a `<script>.result.json` report next to the script.
  - Access properties by **matchName**, find items by name/ID, never by hard-coded index.
  - **Idempotent and non-destructive**: only touch items the script created (name prefix +
    dedicated folder); abort if they already exist unless `CONFIG.rebuild` is true.
  - No `alert()` in live runs (modal dialogs block automation).
  - Never `setValue()` a property after keyframing it (AE throws): set static values first, or key it.
  - Build each scene/section in its own try/catch and report failures as warnings, so one error
    can't silently truncate the whole edit.
  - Put `AEL.run(...)` (or the call to `main`) at the **end** of the file: it runs immediately, and
    top-level `var` values declared below it are still `undefined` (functions are hoisted, values are not).
- **House rules (from the user):**
  - Glows: never blur a shape layer directly. Put the shape in its own precomp and apply the Gaussian
    Blur to the precomp layer (any blur used as a glow or soft light). Blurred screens/images likewise
    go in a precomp first, blur on the precomp layer.
  - Icons come from the user's licensed source (e.g. Flaticon PNG/SVG) as drop-in files; tint with a
    Fill effect. Shape icons are only a fallback. Stock footage (e.g. radar) is supplied by the user —
    build a drop-in slot with a native fallback, never download stock yourself.
- Motion craft and copy-paste recipes (kinetic type, shape reveals, masks, mattes, transitions,
  precomps, brand controls): `references/motion-recipes.md`.

## 3. Check → run → verify

```bash
node scripts/check_jsx.mjs ae/scripts/build_main.jsx ae/scripts/ae_lib.jsx   # ES3 parse + lint
node scripts/mock_run.mjs ae/scripts/build_main.jsx                           # dry run vs mock AE DOM
bash scripts/run_jsx.sh ae/scripts/build_main.jsx                             # live mode only
```

- Read the result JSON: `ok`, `error`, `warnings` (missing fonts, missing footage, failed
  optional properties), created items.
- Save with `AEL.saveIncremental()` (never overwrites; writes `_v002`, `_v003`, …).
- Render a preview (`aerender`, see `references/render-and-troubleshoot.md`), then check it with
  `media_tools.py probe` and `frames --sheet` and look at the contact sheet before reporting.

## 3b. When AE isn't on this machine: render here, verify, then hand over

Blind JSX can't be judged until the user renders it. For motion-heavy pieces, prefer building the
visuals with the browser motion engine (MIT, from Barty-Bart/motion-graphics `motion-broll`; vendored in a
project as `motion/engine/`): one continuous morphing shape, closed-form springs, cursor-driven UI, frames
rendered in headless Chromium with 4-subframe motion blur (`render.js`), stills via `beats.js`.
- Look at contact sheets of every clip (key words + mid-morphs) and fix before rendering in full.
- Make each clip's last state identical to the next clip's first state, so joined clips play as one shot.
- Deliver the rendered preview **and** an AE import script that places the clips, VO and SFX cue markers.
- Banned in this style: bouncy easing, slideshow cuts, template look, invented data.

## 4. Safety

- Don't close, overwrite, or clean up the user's open project, delete items you didn't create,
  purge caches, or start long renders without asking first.
- Never download and run third-party `.jsx`/extensions without showing the source and getting approval.
- Don't change AE preferences or OS permissions for the user — tell them exactly what to toggle.
- Keep client assets in place; reference them, or copy into `assets/` — never modify originals.
- Run `check_jsx.mjs` before every execution; `run_jsx.sh` refuses to run a file that fails it.

## 5. Project layout (portable)

```
<project>/
  ae/            <name>_v###.aep, scripts/ (build scripts + ae_lib.jsx)
  assets/        footage/ audio/ graphics/ fonts/ reference/   (originals, read-only)
  assets/_ae/    AE-safe transcodes (ProRes/WAV) made by media_tools.py to-ae
  docs/          brief, timing.json, style notes
  renders/       previews/ finals/
```

Inside AE the starter creates: `01_Main`, `02_Sections`, `03_Precomps`, `04_Footage`,
`05_Audio`, `06_Graphics`, `07_Reference`, `08_Controls`, `Solids`. Before delivery use
**File › Dependencies › Collect Files** (or ask the user to) so the `.aep` travels with its assets.

## Reference files (load only what the task needs)

| Need | File |
|---|---|
| ES3 rules, matchNames, project/comp/layer/keyframe/expression API, version differences | `references/extendscript-api.md` |
| Kinetic type, shape/mask/matte reveals, transitions, precomps, brand control rigs | `references/motion-recipes.md` |
| Asset intake, reference-video style analysis, VO/script sync, organisation, portability | `references/production-workflow.md` |
| Running scripts per OS, aerender/render queue, validation, error table, live MCP bridges | `references/render-and-troubleshoot.md` |
