#!/usr/bin/env node
// check_jsx.mjs - static check for After Effects ExtendScript (.jsx) files.
//   node check_jsx.mjs file.jsx [more.jsx ...]
// 1. Blanks ExtendScript preprocessor lines (#include, #target, ...) keeping line numbers.
// 2. Parses as ECMAScript 3 with acorn (local install if present, else `npx acorn@8.15.0`).
// 3. Lints for ES5+ library calls ExtendScript lacks and for automation hazards.
// Exit 0 = all files parse (warnings allowed), 1 = parse error or missing file, 2 = no parser.
// This does NOT validate After Effects DOM calls; only running in AE does.
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { createRequire } from "node:module";

const ACORN = "acorn@8.15.0";
const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node check_jsx.mjs file.jsx [...]");
  process.exit(1);
}

let localAcorn = null;
try { localAcorn = createRequire(import.meta.url)("acorn"); } catch { /* fall back to npx */ }

const LINT = [
  [/\.(forEach|map|filter|reduce|some|every)\s*\(/, "Array.$1 is not in ES3; use a for loop"],
  [/\bObject\.(keys|create|defineProperty|assign|freeze)\b/, "Object.$1 is not in ES3"],
  [/\bArray\.isArray\b/, "Array.isArray is not in ES3; use (x instanceof Array)"],
  [/\.trim\s*\(\s*\)/, "String.trim is not in ES3; use .replace(/^\\s+|\\s+$/g, \"\")"],
  [/\bDate\.now\b/, "Date.now is not in ES3; use (new Date()).getTime()"],
  [/\.bind\s*\(/, "Function.bind is not in ES3"],
  [/\bJSON\.(parse|stringify)\b/, "JSON is not built into ExtendScript; use AEL.stringify / AEL.parseTrustedJSON or include json2"],
  [/\balert\s*\(/, "alert() opens a modal dialog that blocks automated runs"],
  [/\bapp\.newProject\s*\(|\.close\s*\(\s*CloseOptions/, "closes/replaces the open project - confirm with the user first"],
  [/\bapp\.purge\s*\(|\.renderQueue\.render\s*\(/, "purge/render can be destructive or very long - confirm with the user first"],
];

function stripForLint(src) {
  // Remove comments and string contents so lint rules don't fire on prose.
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, (m) => m[0] + " ".repeat(m.length - 2) + m[0])
    .replace(/\/\/[^\n]*/g, "");
}

function parse(code, name) {
  if (localAcorn) {
    try { localAcorn.parse(code, { ecmaVersion: 3, sourceType: "script" }); return null; }
    catch (e) { return `${e.message}`; }
  }
  const dir = mkdtempSync(join(tmpdir(), "checkjsx-"));
  const tmp = join(dir, basename(name).replace(/\.jsx(bin)?$/i, "") + ".js");
  writeFileSync(tmp, code);
  const r = spawnSync("npx", ["--yes", ACORN, "--ecma3", "--silent", tmp], { encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  if (r.error) { console.error(`cannot run npx (${r.error.message}); install acorn: npm i -g ${ACORN}`); process.exit(2); }
  return r.status === 0 ? null : (r.stderr || r.stdout).trim().replace(tmp, name);
}

let failed = false;
for (const file of files) {
  if (!existsSync(file)) { console.log(`FAIL ${file}: not found`); failed = true; continue; }
  const src = readFileSync(file, "utf8");
  const code = src.replace(/^[ \t]*#(include|includepath|target|targetengine|strict|script|engine)\b[^\n]*/gm, (m) => " ".repeat(m.length));
  const err = parse(code, file);
  const warnings = [];
  stripForLint(code).split("\n").forEach((line, i) => {
    for (const [re, msg] of LINT) {
      const m = line.match(re);
      if (m) warnings.push(`  line ${i + 1}: ${msg.replace("$1", m[1] || "")}`);
    }
  });
  // #include lines were blanked above; lint them from the raw source.
  src.split("\n").forEach((line, i) => {
    if (/^[ \t]*#include\s+["'](\/|[A-Za-z]:)/.test(line)) warnings.push(`  line ${i + 1}: absolute #include path breaks portability`);
  });
  if (err) { console.log(`FAIL ${file}: ES3 parse error: ${err}`); failed = true; }
  else console.log(`OK   ${file}: parses as ES3`);
  if (warnings.length) console.log(`WARN ${file}:\n${warnings.join("\n")}`);
}
process.exit(failed ? 1 : 0);
