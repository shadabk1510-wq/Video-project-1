#!/usr/bin/env bash
# run_jsx.sh - run a .jsx in a locally installed After Effects and print its result JSON.
#   bash run_jsx.sh path/to/script.jsx [--timeout SECONDS]
# Env: AE_APP="/Applications/Adobe After Effects 2025/Adobe After Effects 2025.app" (macOS)
#      AE_EXE="/c/Program Files/Adobe/Adobe After Effects 2025/Support Files/AfterFX.exe" (Windows)
# The script must write <script>.result.json (AEL.run does). Requires AE preference
# "Allow Scripts to Write Files and Access Network". macOS asks once to let the terminal control AE.
# Exit: 0 ok, 1 script reported an error, 2 AE not available, 3 syntax check failed, 4 timeout.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
[ $# -ge 1 ] || { echo "usage: run_jsx.sh script.jsx [--timeout s]" >&2; exit 2; }
script="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
timeout=600
[ "${2:-}" = "--timeout" ] && timeout="${3:-600}"

node "$here/check_jsx.mjs" "$script" || { echo "syntax check failed; not running" >&2; exit 3; }

result="${script%.*}.result.json"
rm -f "$result"

case "$(uname -s)" in
  Darwin)
    app="${AE_APP:-$(ls -d /Applications/Adobe\ After\ Effects*/Adobe\ After\ Effects*.app 2>/dev/null | sort | tail -1)}"
    [ -n "$app" ] || { echo "After Effects not found in /Applications (set AE_APP)" >&2; exit 2; }
    name="$(basename "$app" .app)"
    year="$(echo "$name" | grep -oE '20[0-9]{2}' | head -1 || true)"
    # Exactly one method, never both (a timed-out call may still be running the script in AE).
    # AE 2024+ (and Beta builds without a year): JXA. Older: AppleScript DoScriptFile.
    # Apple-event timeouts are ignored on purpose; completion is detected via the result file below.
    if [ -z "$year" ] || [ "$year" -ge 2024 ]; then
      err="$(osascript -l JavaScript -e "Application('$name').doscriptfile('$script')" 2>&1 >/dev/null || true)"
    else
      err="$(osascript -e "with timeout of $timeout seconds" -e "tell application \"$name\" to DoScriptFile \"$script\"" -e "end timeout" 2>&1 >/dev/null || true)"
    fi
    # -1743 not authorised (System Settings > Privacy & Security > Automation), -600 app not running.
    if echo "$err" | grep -qE -- '-1743|-600|-10810|Application can.t be found'; then
      echo "osascript could not drive $name: $err" >&2; exit 2
    fi
    ;;
  MINGW*|MSYS*|CYGWIN*)
    exe="${AE_EXE:-$(ls -d "/c/Program Files/Adobe/Adobe After Effects "*/"Support Files/AfterFX.exe" 2>/dev/null | sort | tail -1)}"
    [ -n "$exe" ] || { echo "AfterFX.exe not found (set AE_EXE)" >&2; exit 2; }
    "$exe" -r "$(cygpath -w "$script")" &
    ;;
  *)
    echo "After Effects cannot run on $(uname -s). Hand the script to the user: File > Scripts > Run Script File..." >&2
    exit 2
    ;;
esac

waited=0
until [ -f "$result" ]; do
  if [ "$waited" -ge "$timeout" ]; then
    echo "no result after ${timeout}s: check that AE is open, no dialog is waiting, and" >&2
    echo "Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network is on" >&2
    exit 4
  fi
  sleep 1; waited=$((waited + 1))
done
sleep 1   # let AE finish writing
cat "$result"; echo
grep -q '"ok":true' "$result" && exit 0 || exit 1
