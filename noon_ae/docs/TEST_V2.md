# NOON — test v2 (full 2-minute VO)

## What changed from v1 (your notes)

| Note | Done |
|---|---|
| Colour theme from the two screenshots | Calm scenes: blush gradient `#FCECEB → #F7C7C7 → #F1A4A3`, white captions (soft coral shadow for legibility), thin layout grid. Emphasis scenes (2027, POWERHOUSE, PROFESSIONAL): white → coral `#EA6262` diagonal, white grid with square handles, the big word repeated above/below like the "Myself" frame. Highlight words in coral. |
| ~9 s: stock radar with alpha | Drop-in slot `assets/stock/radar_alpha.mov` (auto-looped). Until you add it, a built-in white radar (rings, crosshair, rotating sweep, blips) is used. |
| ~18 s: Flaticon icons, white | Drop-in slots `assets/icons/step01.png … step06.png`, tinted white automatically. Cards are now coral with white icon + white label. Built-in white shape icons are used until you add the files. |
| Glow = shape in a comp, blur on the comp | Every glow is now `GLOW <name>` precomp + Gaussian Blur on the precomp layer. Blurred screens (phone feed, product page, pack) are also precomps with the blur on the comp layer. Saved as a house rule in the skill. |
| 2-minute VO: show workflow, mockups and interface | New scenes 63–130 s (below). |
| Fixes | First caption serif font (font re-apply), tease screen no longer crops the square posts, captions clear the frame before each big word. |

## Run it

Same as before: new project → **File › Scripts › Run Script File…** → `noon_ae/ae/scripts/build_noon_v2.jsx`.
Saves `noon_ae/ae/NOON_Test_v2.aep`, queues `NOON_MAIN` (130 s). Send back the render + `build_noon_v2.result.json` (it now lists any scene that failed, while the rest still builds).
To add icons/radar later: drop the files in, set `rebuild: true` in CONFIG (removes only `NOON_*` / `GLOW *` comps) and run again.

### Files to download

| Slot | Suggested Flaticon search | Used for |
|---|---|---|
| `assets/icons/step01.png` | "document" / "brief" | 01 Professional direction |
| `assets/icons/step02.png` | "target" | 02 Clear purpose |
| `assets/icons/step03.png` | "ruler" / "guidelines" | 03 Design rules |
| `assets/icons/step04.png` | "devices" / "multiple screens" | 04 Across every format |
| `assets/icons/step05.png` | "checklist" / "approved" | 05 Check the goals |
| `assets/icons/step06.png` | "folder share" / "handover" | 06 Hand over a system |
| `assets/stock/radar_alpha.mov` | your stock library: "radar HUD alpha" | 7.1–10 s radar (ProRes 4444 or QuickTime Animation, **with alpha**) |

PNG, ~512 px, transparent background, any colour. One consistent icon family looks best.
(Free Flaticon icons need attribution; premium doesn't.)

## New scenes (MAIN timeline)

| Time | VO | Visual |
|---|---|---|
| 63.3–74.4 | "we've got a clearer brief saved with the project… first stage done, checked, complete…" | **Files window** (app UI) slides up with the real project files (Package Designs, Client Brief, Audience Research, Discovery Notes); the new **NOON_Creative_Brief.pdf** drops in on "clearer brief"; **"Saved to NOON › High Sun"** toast on "saved"; window leaves → stage row with a **check badge** on card 01 ("done"), bump on "checked", **STAGE 01 COMPLETE** pill on "complete". |
| 74.4–80.0 | "plan how somebody can actually encounter the design work…" | Stage row moves focus to **02 Clear purpose**; **STAGE 02** pill on "encounter". |
| 80.0–102.2 | "in the Discovery meeting notes, under the main disagreement, Maya… Alex… Jo… Sam…" | **Document window** with the real meeting-notes text; a **highlighter pen** strokes "The main disagreement", then each person's line exactly as they're named, with role chips (MAYA · FOUNDER, ALEX · MARKETING, JO · SALES, SAM · CREATIVE); the page scrolls on "just below that"; Sam's line in stronger coral. |
| 102.2–112.9 | "interesting things… all over the place and chaotic… don't worry… easily" | Four note cards (Maya / Alex / Jo / Sam positions) pop in tilted, **jitter** during "all over the place and chaotic", then **snap into a neat row** on "don't worry"; a line draws under them on "easily". |
| 112.9–119.1 | "separate high-level professional designers from everybody else" | Coral emphasis: "HIGH-LEVEL" label, **PROFESSIONAL** punch with repeated rows + handle grid. |
| 119.1–130.0 | "Before designing the assets… map three different points where somebody will encounter… NOON" | **Phone mockup** scrolling a blurred feed of the designs with a **REVEALED SOON** pill; on "map" it moves left and a **browser mockup** (product page, blurred) and the **pack** (blurred) join; numbered badges 1-2-3 + journey line + labels Social post / Product page / Packaging. |

A comp marker at ~61.4 s marks where the existing Dropbox integration goes in the final edit;
the "SFX cues (markers)" layer now covers the new scenes too.

## Not verified yet

Scripts are ES3-checked and ran end to end against a mock AE model (with and without the drop-in files,
all expressions parse). Layout of the new UI scenes is computed, not yet seen — your render is the check.
