# Running, rendering, validating, troubleshooting

## Ways to run a script

| Method | Where | Notes |
|---|---|---|
| **File › Scripts › Run Script File…** | any OS | Handoff default. Works without any setup. |
| `bash scripts/run_jsx.sh x.jsx` | macOS | JXA `doscriptfile` (AE 2024+) or AppleScript `DoScriptFile` (≤2023). First run triggers macOS *Automation* permission for the terminal. |
| `bash scripts/run_jsx.sh x.jsx` | Windows (Git Bash) | `AfterFX.exe -r <script>`; sends to the running AE or launches it. |
| ScriptUI panel | any OS | Copy to `Scripts/ScriptUI Panels/`, restart AE, open from Window menu. |
| VS Code + Adobe **ExtendScript Debugger** | any OS | Breakpoints and `$.writeln` output while developing. |
| MCP bridge (optional, live) | user machine | See below. Needs user approval to install. |

All automated methods need **Preferences › Scripting & Expressions › Allow Scripts to Write Files and
Access Network** (the result file depends on it). Close modal dialogs in AE before running.

### Optional live bridges (inspected, not installed)

Install only on the user's own AE machine, only with their approval, after re-reading the source:

- **justajazz/ae-mcp-bridge** (MIT, zero npm dependencies, Windows + macOS): stdio MCP server +
  ScriptUI panel exchanging files; tools for building, frame/storyboard capture, `ae_run_jsx`.
  `claude mcp add --scope project after-effects -- node <path>/src/mcp-server.mjs`.
- **aedev-tools/adobe-agent-skills** `after-effects` skill (Apache-2.0, macOS only, osascript runner,
  many ready-made utility scripts: audit, relink, font replace, SRT import, batch render).
- **ishu86/after-effects-mcp** (MIT, CEP extension + Node MCP server, 70+ tools).

They complement this skill; keep this skill's safety rules when using them.

## Rendering

**aerender** (command-line renderer shipped with AE; renders the *saved* project):
```bash
# macOS
"/Applications/Adobe After Effects 2025/aerender" -project "/abs/ae/PRJ_main_v002.aep" \
  -comp "PRJ_MAIN" -output "/abs/renders/previews/PRJ_main.mov" \
  -RStemplate "Best Settings" -OMtemplate "High Quality" -v ERRORS_AND_PROGRESS
# Windows
"C:\Program Files\Adobe\Adobe After Effects 2025\Support Files\aerender.exe" -project ... (same flags)
```
- Partial preview: `-s <startFrame> -e <endFrame>`; half-res draft: create a Render Settings template
  in AE or render full and scale with ffmpeg.
- Output-module template names differ by version/locale; list them with `probe_env.jsx`
  (`LIST_RENDER_TEMPLATES = true`). H.264 MP4 is native in AE 2023+
  (`"H.264 - Match Render Settings - 15 Mbps"`); otherwise render ProRes/QuickTime and encode:
  `ffmpeg -i in.mov -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac out.mp4`.
- Queue from a script with `AEL.queueRender(comp, path, template)`; only call
  `app.project.renderQueue.render()` after the user agrees (it blocks AE until done).
- Renders can take minutes to hours: tell the user the expected length and run in the background.

## Validation checklist (run before reporting "done")

1. `*.result.json`: `ok: true`, empty `error`, review every `warnings` entry, saved path present.
2. Missing footage none (`AEL.missingFootage()`), fonts resolved (no substitution warnings).
3. Expression errors: walk layers and log `prop.expressionError` for every `prop.canSetExpression && prop.expression`.
4. Render exists: `$MT probe render.mov` → duration ≈ comp duration, correct fps/size, audio stream present if VO.
5. Look at it: `$MT frames render.mov --out renders/check --every 0.5 --sheet` and read the contact
   sheet; also grab frames at every section boundary (`--at`). Check safe margins, overlaps,
   text legibility, colour, timing against VO segments.
6. Report what was verified and how (result file / render / screenshot) and what was not.

## Troubleshooting

| Symptom | Cause → fix |
|---|---|
| `SyntaxError` / "Expected: ;" on run | ES5+ syntax → `node scripts/check_jsx.mjs` and rewrite as ES3 |
| "Unable to execute script at line N. X is undefined/not a function" | API missing in this AE version, or a typo'd matchName → check `app.version`, the docs, and branch |
| "Object is invalid" | stale reference after `addProperty`/`remove` → re-fetch from the layer |
| "Value array does not have N elements" on `setTemporalEaseAtKey` | wrong ease length → `AEL.key` (1 for spatial/colour/1D, 2 TwoD, 3 ThreeD) |
| "property or method named 'X' is missing or does not exist" | display name used instead of matchName, or wrong group level |
| No `.result.json` appears | file-access preference off, script crashed before `AEL.run`, a modal dialog is open, or AE is busy rendering |
| Font looks like Arial | PostScript name wrong or font not installed → probe fonts, ask user to install |
| Footage red/missing | moved files → relink by path (`item.replace(new File(p))`), keep assets inside the project |
| Can't import file | unsupported codec/container/VFR → `$MT to-ae` |
| Expression error banner | read `prop.expressionError`; references by localised names or missing layers/effects |
| Track matte ignored | AE < 2023: matte must be directly above target (`AEL.trackMatte` handles it) |
| Script runs twice / duplicates | comps existed → script must refuse or use `CONFIG.rebuild` on its own items only |
| macOS: "Not authorized to send Apple events" (-1743) | System Settings › Privacy & Security › Automation → allow the terminal to control After Effects |
| Windows: nothing happens with `-r` | path must be absolute Windows path; AE may show a security dialog on first script run |
| Unsupported feature (e.g. some 3rd-party effect params, Roto Brush, Content-Aware Fill, Essential Graphics layout) | not scriptable or only partly → build what's scriptable, document the manual step precisely |
