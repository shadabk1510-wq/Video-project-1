# NOON — style test (first 61 s of voice-over)

Native, editable After Effects build of the opening. Captions are synced to the voice-over word by word
(NVIDIA Parakeet TDT 0.6B v2 word timings, matching your Premiere transcript within ±0.2 s).

## Run it (about 1–3 minutes)

1. Install **Inter** as static fonts (Google Fonts download → `static/` folder: Inter-Medium, -SemiBold,
   -Bold, -Black). Restart After Effects after installing.
2. After Effects → Settings › Scripting & Expressions → tick **Allow Scripts to Write Files and Access Network**.
3. **File › New › New Project**, then **File › Scripts › Run Script File…** →
   `noon_ae/ae/scripts/build_style_test.jsx`. Keep the folder structure as it is: the script finds the assets
   relative to itself.
4. It builds everything, saves `noon_ae/ae/NOON_StyleTest.aep` (never overwrites — adds `_v002`…), and
   queues `NOON_ST_MAIN` in the Render Queue (not started). Press **Render**, or use your own preset.
5. Send me: the render (or a screen recording) **and** `ae/scripts/build_style_test.result.json`.
   The result file lists anything that needed a fallback (fonts, effects) so I can fix it precisely.

To rebuild after changes: set `rebuild: true` in `CONFIG` (it only removes comps named `NOON_ST_*`).

## Project structure

`01_Main/NOON_ST_MAIN` (63 s, 1920×1080, 23.976 fps) holds the background, the eight scene comps,
the VO (starts at 2.0 s), and an **"SFX cues (markers)"** layer with a marker at every hit/whoosh/pop,
ready for your music and sound design. Scenes live in `02_Sections`, reusable parts in `03_Precomps`.
Every caption's timings live in its text-animator expression (`var T=[…]`) — or edit
`ae/scripts/noon_data.jsx` and rebuild.

## Shot list (times on the MAIN timeline)

| Time | VO | Visual | Technique source |
|---|---|---|---|
| 0.00–2.40 | — (cold open) | Brief, research and meeting-notes pages fly in; highlighter swipes the notes; pages collapse into the pack front, the vermilion sun pops, the real bag photo resolves | Script hook direction; ref 1 asset fly-ins |
| 2.40–4.24 | "Today, I'm going to walk you through" | Rounded "screen" with rapid tease cuts: social post → product page scroll → sun-rise motion → social post 2 | Ref 1 monitor + caption |
| 4.24–7.10 | "a new way to work as a designer in 2027" | Word-by-word caption; **2027** punches in (blur/scale) inside an artboard selection box with guides | Ref 1 "Myself" frame + blur-in words |
| 7.10–9.98 | "…should be on everybody's radar." | Sun disc appears; on "radar" three rings ping outward | Ref 1 radial grid |
| 9.98–15.30 | "So we're going to use this coffee brand **NOON** … whole process on one project" | NOON wordmark drops in letter by letter (vector, from the SVG); the sun **rises from behind a horizon and settles** (motion rule, never crosses the info); bag tile with a rotating process ring: BRIEF → PURPOSE → DIRECTION → RULES → REVIEW → HANDOVER | Ref 2 rotating circular text |
| 15.30–39.00 | the six "We're going to…" lines | One white icon card per stage pops in on its line; on "packaging / digital / motion" the three formats pop above; on "really, really easily" a vermilion line connects all six | Ref 1 icon cards + connecting lines |
| 39.00–52.30 | "client brief / audience research / discovery notes … designing towards" | The three real documents fly in as tilted pages with pill tags; on "bring that together" they stack; on "work out" a panel slides in: *Designing towards — Energy without the noise / Creative focus, not hustle / Calm info + one moment of energy* (all from the brief, research and meeting notes) with a drawn arrow | Ref 2 "Info" pills + "Material Used" panel + arrow |
| 52.30–63.00 | "first stage … neat way … tag team of software … powerhouse" | Steps row returns with **Stage 01/06** highlighted; sparkles on "neat"; the line literally slides in on "slide"; a "? × ?" tag-team card (tools revealed in the Dropbox segment); a navy wipe and **POWERHOUSE** punch — handing over to the navy-toned Dropbox × ChatGPT segment | Ref 1 sparkles + big words; ref 2 colour hand-off |

## Style decisions

- Palette from the dieline SVG: ivory `#F3EEE3`, navy `#163452`, vermilion `#F4512B`, powder blue `#A9CFE2`.
  Background: soft ivory radial gradient, faint concentric rings and slow drifting vermilion/blue glows
  (the reference's pink gradient translated into the NOON palette).
- Type: Inter SemiBold captions with per-letter blur-rise reveal; key words turn vermilion; Inter Black for
  emphasis words. The NOON wordmark is rebuilt as vector shape layers from the supplied SVG.
- Motion: fast-in/slow-settle easing, small overshoots on pops, motion blur on; cuts land on spoken words.
- VO kept continuous: its pauses are already natural breaths (0.3–0.8 s), so nothing was trimmed.

## Known approximations to review

- The sparkle position beside "neat" is estimated from the caption layout (layer `Sparkle 1–3` in SC08).
- The meeting-notes page was rendered from the .docx with LibreOffice; layout may differ slightly from Word.
- The cold-open morph lines up with the bag photo's front panel and sun to within a few pixels.
- Not yet executed in After Effects: the scripts are ES3-checked and were run end to end against a mock
  AE object model (all 57 expressions parse); the real run is the first true test.
