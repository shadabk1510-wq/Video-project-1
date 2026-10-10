# SFX pass: from the build's own timings to an editable SFX comp

Worked first on NOON3 (11 min explainer, 190 cues). The user approved it as it came out. Tools: `scripts/sfx/`, `jsx/add_sfx.jsx`.

## 1. Never rebuild the user's project for sound
After the user has tweaked the AE project, re-running the build would lose their edits. Ship a separate script
(`add_sfx.jsx`) that runs on the open project, finds the main comp by name, and adds one comp ("<NAME> SFX") holding
every sound as its own layer. That comp goes into the main comp as a single layer with video off; its Audio Levels is
the master volume. Re-running asks before rebuilding that comp and never touches anything else.

## 2. Read the reference's SFX style (when the user sends one)
References usually arrive with music + VO + SFX mixed. What worked:
- ASR the reference (Parakeet) to see where the VO runs; it usually runs non-stop, so gaps say little.
- The side channel (L-R) cancels a centred VO. It mostly leaves the music beat, though, so don't read hits off it.
- Grab frames at the swell and transient times and see what moves: element entrances, panels sliding, a click on
  "one click", a riser into the end logo. Note density (a calm B2B explainer: a sound only when something moves,
  roughly one every 3-6 s) and level (well under the VO). Punchy app ads (a hit per item, on the beat) are the
  wrong model for a long explainer.

## 3. Cues from the build, not by ear
The build already knows every motion. Run the build in ae_sim, then:
```
python3 scripts/sfx/events.py model.json events.json MAIN_COMP "CLIP_PREFIX "   # 700+ raw events
python3 scripts/sfx/classify.py events.json cues.jsx VAR_NAME                   # thinned cue list as JSX
```
- Sound per event: card morph / camera move above a size threshold = whoosh; card or design entering = swish;
  chips, tags, badges = pop; list rows, steps, the recap highlight = tick; cursor press = click; Type on = typing
  (trimmed to the line, with a fade; back-to-back lines share one); ticks, stamps, saved toast = ding; pages = paper;
  app windows = window; end card = riser + hit + sub (stacked); logo reveal = reverse-boom accent.
- Beats driven by layer markers (word reveals) have no keyframes, so add them in `MANUAL`.
- A window carried across a cut is not a new window (drop it in the next clip).
- Check the "gaps > 10 s" list: a gap is fine only when nothing moves on screen. Otherwise a name rule is missing.

## 4. Getting the user's SFX files without a 200 MB upload
1. Have them list the library. On Windows PowerShell (not cmd's `dir /s /b`):
   `Get-ChildItem -Recurse -File | ForEach-Object { $_.FullName.Substring((Get-Location).Path.Length + 1) + "`t" + [math]::Round($_.Length / 1KB) + " KB" } | Out-File -Encoding utf8 sfx_list.txt`
2. Pick about 30 files by name: soft or short whooshes, UI pops, digital clicks, keyboard loops, notification and
   bell dings, a riser, a hit, a sub drop. Skip meme, gun and horror packs. Check every picked path exists in the list.
3. Give one PowerShell block that copies exactly those files (a single-quoted here-string of relative paths,
   `Copy-Item -LiteralPath`) into a `NOON_SFX`-style folder and zips it (`Compress-Archive`); about 13 MB.
   The folder stays on their disk, because the JSX loads from it.
4. A cloud session can't open the user's local paths. Say so and use the list-and-zip route.

## 5. Measure, then set timing and levels
`scripts/sfx/measure.py`: onset, peak time, 50 ms peak level, tail, spectral centroid per file.
- Put each file's peak on the motion: `layer.startTime = cue + at - peakTime` (whoosh `at` ~0.15 s after the move starts).
- Normalise per file (`-peak_db`), then a level per sound type relative to the VO (VO 50 ms p90 was about -15 dBFS):
  whoosh -27, swish -29, pop -28, tick -31, typing -31 (on the loop's p90), ding -26, window -26, accent -23, end -22 dBFS.
- Drop exact duplicates (md5) and whooshes that take more than ~1 s to build (they start long before the motion).
- Rotate 2-5 files per type and add a deterministic +/-1 dB per cue, so repeats don't sound stamped.

## 6. Verify and preview
Run `add_sfx.jsx` in ae_sim twice: once with silent stand-ins named like the real files (logic, missing-file path)
and once with the real files. Then `scripts/sfx/mix.py` mixes the VO + every SFX layer exactly as placed (start, in/out,
Audio Levels keys). It prints the SFX-vs-VO level per type and writes a preview the user can listen to before
touching AE. Targets that sounded right: whoosh/pop ~9 dB under the VO, ticks ~12 under, dings ~6 under, mix peak
below -1 dBFS.
