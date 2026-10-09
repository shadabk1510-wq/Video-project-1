#!/usr/bin/env bash
# assemble.sh - join the rendered clips in order and lay the VO in at +2.0 s.
#   bash assemble.sh            -> out/NOON_v3_preview.mp4 (full quality) + out/NOON_v3_preview_small.mp4 (< ~30 MB)
set -euo pipefail
cd "$(dirname "$0")"
ls out/[0-9][0-9]-*.mp4 | sort | sed "s/^/file '/; s/$/'/; s#file 'out/#file '#" > out/concat.txt
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i out/concat.txt -c copy out/_video.mp4
ffmpeg -hide_banner -loglevel error -y -i out/_video.mp4 -i ../assets/_ae/vo2_full.wav \
  -filter_complex "[1:a]adelay=2000|2000,apad[a]" -map 0:v -map "[a]" -shortest \
  -c:v copy -c:a aac -b:a 192k -movflags +faststart out/NOON_v3_preview.mp4
ffmpeg -hide_banner -loglevel error -y -i out/NOON_v3_preview.mp4 -c:v libx264 -preset slow -crf 24 -maxrate 1700k -bufsize 3400k \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out/NOON_v3_preview_small.mp4
rm -f out/_video.mp4
ls -la out/NOON_v3_preview*.mp4
