**Chunk 4 update (final):** runs to 11:00 with `vo_chunk4.m4a` (NOON3_MAIN is 660.5 s). Clips 26-31 add the communication goals, Stage 06 (1 week … 10 years), a ChatGPT window playing `chat_clip.mp4` (excerpts from refrence_2) with three chips, the PDF pages with ticks, a Dropbox window playing `dropbox_clip.mp4` with the file and use chips, and the recap list, Follow / Explain / Build on, and the end card (NOON + "Design your future today." + two end-screen slots). The full refrence_2 segment still goes at the 61.4 s comp marker; place it yourself.

# NOON v3: the After Effects build

**Chunk 3 update:** runs to 8:22 with `vo_chunk3.m4a`; clips 19-25 add rule 1-3 boards, rules beside the designs + saved rule examples, the motion rule demo, stage 05 and the review board with the "Follows the rules" stamps.

**Chunk 2 update:** the build now runs to 5:31 with `vo_chunk2.m4a` (same recording as the 2-min test, plus the continuation). Clip 12 runs on into the working document; new clips 13-18 cover the three jobs, PURPOSE, the content plan, the stage pill, the main-pack build-up and DESIGN RULES. Every clip has a slow camera drift (WORLD layer, Effect Controls > Drift %, set 0 to turn it off).

`noon_ae/ae/scripts/build_noon3.jsx` rebuilds the whole v3 video as **native, editable After Effects layers**, using the
same JSX workflow as v1 and v2. Nothing in it is pre-rendered video, except your own footage (the sunrise clip) and the
optional reference guide.

## Run it
1. Use After Effects 2023 or newer (track mattes use the 2023 scripting API; older versions fall back to duplicated mattes).
   Turn on Preferences › Scripting & Expressions › **Allow Scripts to Write Files and Access Network**.
2. The **Inter** font must be installed with the Light, Regular, Medium, SemiBold, Bold and ExtraBold styles.
3. Keep the folder layout: `noon_ae/ae/scripts/…` next to `noon_ae/assets/_ae/` (the client assets, `vo_chunk4.m4a`, `chat_clip.mp4`, `dropbox_clip.mp4`).
4. In a new project, choose **File › Scripts › Run Script File…** › `noon_ae/ae/scripts/build_noon3.jsx`.
5. The script saves `noon_ae/ae/NOON3.aep` (then `NOON3_v002.aep`, and so on; it never overwrites) and writes
   `build_noon3.result.json`. Please send that file back after the first run: it lists any font substitution or clip that failed.

## What you get
- **NOON3_MAIN** (1920×1080, 23.976 fps, 130 s): background (blush gradient, soft light, 5% grain), the 12 clip comps at
  their cut times, the VO at 2.0 s, a comp marker at **61.4 s for the Dropbox × ChatGPT insert**, and the reference render
  as a disabled guide layer, so you can compare frame by frame.
- **NOON3 01 Hook … NOON3 12 Three touchpoints**: one comp per clip. Each is built the same way:
  - `WORLD (camera)`: Effect Controls **Cam** (zoom), **Cam Mul**, **Focus X/Y**. Everything behind or above the card hangs from it.
  - `SHAPE`: the one continuous card. Effect Controls **W, H, Radius, CX, CY, Fill, Pop, Press**. The card morphs because
    these are keyframed.
  - `SHAPE MATTE`: an invisible copy that clips the card's contents. Leave it alone.
  - `ANCHOR C / T / L`: nulls on the card's centre, top and left edges.
  - Content groups, e.g. `Brief`, `Stage`: precomps (Collapse Transformations on), revealed with ordinary opacity, scale and
    Gaussian Blur keyframes.
- `03_Precomps` holds every content group, `04_Footage` the assets, `07_Reference` the guide render.

## How to edit
- **Springy moves** (the card morphs, camera, pops, snaps): the property has **hold keyframes at its targets** and a short
  spring expression. Drag a keyframe to retime the move, or change its value to change the target. The expression's
  `SP = [[frequency, damping], …]` line sets the feel per key: lower frequency means slower, damping 1 means no overshoot.
- **Word-timed text** (lines that appear with the VO): each text layer has **one layer marker per word or letter**.
  Drag a marker to retime that word. The reveal style (rise, blur, fade) lives in the layer's `Reveal (markers)` animator.
- **Fades, rises, blurs**: ordinary eased keyframes (cubic ease-out, like the preview).
- **Typing**: a `Type on` animator; its Range Selector Start goes 0 → 100.
- **Colours and copy**: normal text layers and shape fills. Text widths that drive chips and highlight bars follow
  automatically through `sourceRectAtTime`.
- Motion blur is on for every clip comp and layer (180° shutter).

## Checked here and not checked here
- Every clip was built in a strict model of the After Effects scripting DOM. It throws on wrong match names, `setValue` on
  keyed properties, wrong ease dimensions, parenting that would make layers jump, and so on. Every clip was then rendered
  frame by frame from that model and compared with the approved preview at every beat. The full build: 77 comps,
  602 expressions, no errors.
- **Not yet confirmed in real After Effects**, because it isn't installed here:
  - exact font metrics;
  - the ring text in clip 04 (text on a circular mask path);
  - time remapping of the sunrise clip (01) and the frozen thumbnail (05, 06);
  - Gaussian Blur and Drop Shadow strengths (CSS blur px are converted with a factor of 2.5);
  - render speed with motion blur.

  Your first render plus `build_noon3.result.json` is the real check.
- Still open from the brief:
  - the laptop mockup (you said you'd add it);
  - the reference videos you mentioned were never received;
  - music (yours).
