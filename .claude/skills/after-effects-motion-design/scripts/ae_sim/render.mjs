// ae_sim/render.mjs - draw frames of a model.json dump (from model.mjs) with Chromium.
//   node render.mjs model.json --comp "NAME" --times 0.5,1,2.25 --out sheet.png [--cols 4] [--width 480] [--bg] [--guides]
//   node render.mjs model.json --comp "NAME" --video out.mp4 [--from 0] [--to 10] [--fps 23.976] [--width 960] [--bg]
//   node render.mjs model.json --comp "NAME" --frame 2.5 --out frame.png
// Prints expression errors the frames hit. Needs Playwright (NODE_PATH=/opt/node22/lib/node_modules) and ffmpeg.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("@playwright/test")); }

const argv = process.argv.slice(2), modelPath = argv[0];
const arg = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : argv[i + 1]; };
const flag = (k) => argv.includes("--" + k);
if (!modelPath) { console.error("usage: see header"); process.exit(2); }
const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
const compName = arg("comp", model.comps[0].name);
const comp = model.comps.find((c) => c.name === compName);
if (!comp) { console.error("no comp " + compName + ". Comps: " + model.comps.map((c) => c.name).join(" | ")); process.exit(2); }
const cache = path.join(path.dirname(path.resolve(modelPath)), "sim_cache");
fs.mkdirSync(cache, { recursive: true });

// footage: stills as file URLs; videos used by enabled layers -> extracted frames
const used = new Set();
const walk = (c, seen = new Set()) => { if (seen.has(c.name)) return; seen.add(c.name); for (const L of c.layers) { if (!L.source) continue; if (L.source.comp) walk(model.comps.find((x) => x.name === L.source.comp), seen); else if (L.enabled || flag("guides")) used.add(String(L.source.footage)); } };
walk(comp);
const FOOT = {};
for (const [id, F] of Object.entries(model.footage)) {
  if (!used.has(id) || !F.video) continue;
  if (F.still || /\.(png|jpe?g)$/i.test(F.path)) { FOOT[id] = { kind: "still", url: "file://" + F.path }; continue; }
  const dir = path.join(cache, "f_" + path.basename(F.path).replace(/\W+/g, "_"));
  if (!fs.existsSync(path.join(dir, "00001.jpg"))) {
    fs.mkdirSync(dir, { recursive: true });
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", F.path, "-vf", "scale='min(960,iw)':-2", "-q:v", "3", path.join(dir, "%05d.jpg")]);
  }
  FOOT[id] = { kind: "frames", dir: "file://" + dir, n: fs.readdirSync(dir).filter((n) => n.endsWith(".jpg")).length, fps: F.fps || 24 };
}
const html = path.join(cache, "sim.html");
fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#222}canvas{display:block}</style><canvas id="view"></canvas>
<script>${fs.readFileSync(new URL("./sim.js", import.meta.url), "utf8")}</script>`);

const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: comp.w, height: comp.h } });
page.on("pageerror", (e) => console.error("[page]", e.message));
await page.goto("file://" + html);
await page.evaluate(async () => { for (const w of [300, 400, 500, 600, 700, 800, 900]) await document.fonts.load(`${w} 40px Inter`); });
await page.evaluate(([m, f, o]) => window.simLoad(m, f, o), [model, FOOT, { bg: flag("bg"), guides: flag("guides") }]);
const view = await page.$("#view");
const shot = async (t, label) => {
  await page.evaluate(async ([n, tt, lab]) => {
    await window.simRender(n, tt);
    if (lab) { const x = document.getElementById("view").getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.font = "600 34px Inter"; x.fillStyle = "rgba(0,0,0,.55)"; x.fillRect(0, 0, 150, 52); x.fillStyle = "#fff"; x.fillText(lab, 14, 37); }
  }, [compName, t, label]);
  return view.screenshot({ type: "png" });
};

const out = arg("out"), video = arg("video"), width = +arg("width", video ? 960 : 480);
if (arg("frame")) {
  fs.writeFileSync(out, await shot(+arg("frame")));
} else if (video) {
  const fps = +arg("fps", comp.fps), t0 = +arg("from", 0), t1 = +arg("to", comp.dur), n = Math.floor((t1 - t0) * fps + 1e-6);
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-vf", `scale=${width}:-2,format=yuv420p`, "-c:v", "libx264", "-crf", "20", video], { stdio: ["pipe", "inherit", "inherit"] });
  for (let k = 0; k < n; k++) { const b = await shot(t0 + k / fps); if (!ff.stdin.write(b)) await new Promise((r) => ff.stdin.once("drain", r)); if (k % 48 === 0) process.stdout.write(`\r${k}/${n}`); }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r)); console.log(`\rwrote ${video} (${n} frames)`);
} else {
  const times = arg("times", "0").split(",").map(Number), cols = +arg("cols", Math.min(4, times.length));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aesim-"));
  for (let k = 0; k < times.length; k++) fs.writeFileSync(path.join(tmp, String(k).padStart(3, "0") + ".png"), await shot(times[k], times[k].toFixed(2) + "s"));
  const rows = Math.ceil(times.length / cols);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", "1", "-i", path.join(tmp, "%03d.png"), "-vf", `scale=${width}:-2,tile=${cols}x${rows}:padding=4:color=0x222222`, "-frames:v", "1", out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("wrote " + out);
}
const errs = await page.evaluate(() => window.simErrors());
if (errs.length) { console.log("EXPRESSION ERRORS:"); for (const e of errs.slice(0, 40)) console.log("  " + e); }
await browser.close();
process.exit(errs.length ? 3 : 0);
