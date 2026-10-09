#!/bin/bash
# sim.sh NN "t1,t2,..." [out.png]  - build clip NN in ae_sim and render a contact sheet next to the HTML reference.
# Writes $OUT (AE build) and ${OUT%.png}_ref.png (reference render frames at the same times).
set -e
N=$1; TIMES=$2; OUT=${3:-/tmp/claude-0/-home-user-Video-project-1/b9778e6e-6edf-5470-ba70-0950e9ae2548/scratchpad/sim/c$N.png}
HERE=$(cd "$(dirname "$0")" && pwd); SIM=/home/user/Video-project-1/.claude/skills/after-effects-motion-design/scripts/ae_sim
export NODE_PATH=/opt/node22/lib/node_modules
mkdir -p "$(dirname "$OUT")"; M="$(dirname "$OUT")/model_$N.json"
node $SIM/model.mjs "$HERE/t$N.jsx" "$M" | tail -25
COMP=$(node -e "const m=require('$M');console.log(m.comps.find(c=>c.name.startsWith('NOON3 $N')).name)")
node $SIM/render.mjs "$M" --comp "$COMP" --times "$TIMES" --out "$OUT" --bg
REF=$(ls /home/user/Video-project-1/noon_ae/motion/out/$N-*.mp4 | head -1)
SEL=$(node -e "const f=24000/1001;console.log('$TIMES'.split(',').map(t=>'eq(n\\\\,'+Math.round(+t*f)+')').join('+'))")
COUNT=$(echo "$TIMES" | tr ',' '\n' | wc -l); COLS=$(( COUNT < 4 ? COUNT : 4 )); ROWS=$(( (COUNT + COLS - 1) / COLS ))
ffmpeg -v error -y -i "$REF" -vf "select='$SEL',scale=480:-2,tile=${COLS}x${ROWS}:padding=4:color=0x222222" -frames:v 1 -vsync vfr "${OUT%.png}_ref.png"
echo "wrote $OUT and ${OUT%.png}_ref.png"
