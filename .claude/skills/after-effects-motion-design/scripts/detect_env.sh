#!/usr/bin/env bash
# detect_env.sh - read-only check of the After Effects automation environment.
# Prints platform, After Effects / aerender installs, helper tools, and the execution mode:
#   live    = AE found here; scripts can be run with run_jsx.sh
#   handoff = no AE here; generate + check scripts, the user runs them in AE
set -u

os="$(uname -s 2>/dev/null || echo unknown)"
case "$os" in
  Darwin) plat=macos ;;
  Linux) plat=linux ;;
  MINGW*|MSYS*|CYGWIN*) plat=windows ;;
  *) plat=unknown ;;
esac
echo "platform: $plat ($os $(uname -r 2>/dev/null))"

ae_apps=(); aerenders=()
if [ "$plat" = macos ]; then
  for d in /Applications/Adobe\ After\ Effects*/; do
    [ -d "$d" ] || continue
    for a in "$d"Adobe\ After\ Effects*.app; do [ -d "$a" ] && ae_apps+=("$a"); done
    [ -x "${d}aerender" ] && aerenders+=("${d}aerender")
  done
elif [ "$plat" = windows ]; then
  for d in "/c/Program Files/Adobe/Adobe After Effects "*/"Support Files"; do
    [ -f "$d/AfterFX.exe" ] && ae_apps+=("$d/AfterFX.exe")
    [ -f "$d/aerender.exe" ] && aerenders+=("$d/aerender.exe")
  done
fi
command -v aerender >/dev/null 2>&1 && aerenders+=("$(command -v aerender)")

if [ ${#ae_apps[@]} -eq 0 ]; then
  echo "after_effects: NOT FOUND"
else
  for a in "${ae_apps[@]}"; do echo "after_effects: $a"; done
fi
if [ ${#aerenders[@]} -eq 0 ]; then
  echo "aerender: NOT FOUND"
else
  for a in "${aerenders[@]}"; do echo "aerender: $a"; done
fi

running=no
if [ "$plat" = macos ]; then
  pgrep -f "Adobe After Effects" >/dev/null 2>&1 && running=yes
elif [ "$plat" = windows ]; then
  tasklist 2>/dev/null | grep -qi "AfterFX.exe" && running=yes
fi
echo "after_effects_running: $running"

for t in ffmpeg ffprobe node npx python3 osascript; do
  if p="$(command -v "$t" 2>/dev/null)"; then
    v=""
    case "$t" in
      ffmpeg|ffprobe) v="$("$t" -version 2>/dev/null | head -1 | awk '{print $3}')" ;;
      node) v="$(node --version 2>/dev/null)" ;;
      python3) v="$(python3 --version 2>/dev/null | awk '{print $2}')" ;;
    esac
    echo "tool.$t: $p ${v}"
  else
    echo "tool.$t: missing"
  fi
done
python3 -c "import PIL" >/dev/null 2>&1 && echo "tool.pillow: yes" || echo "tool.pillow: missing (palette extraction disabled)"

if [ ${#ae_apps[@]} -gt 0 ] && { [ "$plat" = windows ] || command -v osascript >/dev/null 2>&1; }; then
  echo "mode: live"
  echo "next: run jsx/probe_env.jsx via scripts/run_jsx.sh to confirm scripting file access is enabled"
else
  echo "mode: handoff"
  echo "next: write + check scripts here; the user runs them in AE (File > Scripts > Run Script File...)"
fi
