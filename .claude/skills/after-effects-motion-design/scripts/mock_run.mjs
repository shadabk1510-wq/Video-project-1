// mock_run.mjs - smoke-test an ExtendScript build against a minimal mock of the AE DOM (no After Effects needed).
//   node mock_run.mjs path/to/build.jsx   -> runs it, prints <build>.result.json, writes expressions.json
// Catches JS errors, undefined names, hoisting mistakes and setValue() on keyed properties.
// It does NOT render or validate real AE behaviour: only a run in After Effects proves the build.
// Minimal mock of the AE DOM to smoke-test build scripts for JS runtime errors (not AE behaviour).
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const [, , scriptPath] = process.argv;
const dir = path.dirname(path.resolve(scriptPath));
const inline = (file) => fs.readFileSync(file, "utf8").replace(/^#include\s+"([^"]+)"/gm, (_, f) => inline(path.join(path.dirname(file), f)));
const code = inline(path.resolve(scriptPath)).replace("AEL.result.error = e.toString()", "AEL.result.error = (e.stack || e.toString())");

const calls = []; const EXPRS = [];
const PVT = { NO_VALUE: 0, ThreeD_SPATIAL: 1, ThreeD: 2, TwoD_SPATIAL: 3, TwoD: 4, OneD: 5, COLOR: 6, SHAPE: 7, TEXT_DOCUMENT: 8, MARKER: 9 };
class Prop {
  constructor(matchName, parent) { this.matchName = matchName; this.name = matchName; this.parentProperty = parent; this.children = []; this.keys = []; this._value = 0; this.expressionError = ""; }
  get numProperties() { return this.children.length; }
  get propertyIndex() { return this.parentProperty.children.indexOf(this) + 1; }
  property(k) {
    if (typeof k === "number") { const c = this.children[k - 1]; if (!c) throw new Error(`no property index ${k} in ${this.matchName}`); return c; }
    let c = this.children.find((p) => p.matchName === k || p.name === k);
    if (!c) { c = new Prop(k, this); this.children.push(c); }
    return c;
  }
  addProperty(mn) { const c = new Prop(mn, this); this.children.push(c); calls.push("add " + mn); return c; }
  get propertyValueType() { const v = this._value; if (/Position|Anchor/.test(this.matchName)) return PVT.TwoD_SPATIAL; if (/Color/.test(this.matchName)) return PVT.COLOR; return Array.isArray(v) ? (v.length === 3 ? PVT.ThreeD : PVT.TwoD) : PVT.OneD; }
  get isSpatial() { return /Position|Anchor/.test(this.matchName); }
  valueAtTime(t) { if (!this.keys.length) return this._value; let v = this.keys[0].v; for (const k of this.keys) if (k.t <= t) v = k.v; return v; }
  set expression(e) { this._expr = e; if (e) EXPRS.push([this.matchName, e]); }
  get expression() { return this._expr || ""; }
  get value() { if (this.matchName === "ADBE Text Document") return this._value || (this._value = new TextDocument("")); return this._value; }
  setValue(v) { if (this.keys.length) throw new Error("After Effects: can't setValue() on \"" + this.matchName + "\" because it has keyframes"); this._value = v; }
  setValueAtTime(t, v) { if (typeof t !== "number" || isNaN(t)) throw new Error("bad time " + t); this.keys.push({ t, v }); this.keys.sort((a, b) => a.t - b.t); this._value = v; }
  get numKeys() { return this.keys.length; }
  nearestKeyIndex(t) { let best = 1, d = Infinity; this.keys.forEach((k, i) => { if (Math.abs(k.t - t) < d) { d = Math.abs(k.t - t); best = i + 1; } }); return best; }
  setInterpolationTypeAtKey(i) { if (i < 1 || i > this.keys.length) throw new Error("bad key " + i); }
  setTemporalEaseAtKey(i, a, b) {
    const t = this.propertyValueType, need = (t === PVT.TwoD ? 2 : t === PVT.ThreeD ? 3 : 1);
    if (a.length !== need || b.length !== need) throw new Error(`Value array does not have ${need} elements`);
  }
}
class TextDocument { constructor(t) { this.text = t; this.font = "ArialMT"; } }
class Item { constructor(name) { this.name = name; this.id = ++Item.n; this.parentFolder = root; } remove() { const i = items.indexOf(this); if (i >= 0) items.splice(i, 1); } }
Item.n = 0;
class FolderItem extends Item {}
class FootageItem extends Item { constructor(name, file) { super(name); this.file = file; this.footageMissing = false; this.hasAudio = true;
  this.width = 1920; this.height = 1080;
  if (/\.png$/i.test(file.fsName)) { const b = fs.readFileSync(file.fsName); this.width = b.readUInt32BE(16); this.height = b.readUInt32BE(20); } } }
let root = { id: 0 };
root = new FolderItem("root"); root.parentFolder = null;
const items = [];
class Layer {
  constructor(comp, name, kind) { this.comp = comp; this.name = name; this.kind = kind; this.root = new Prop("root", null); this.root.layer = this; this.motionBlur = false; this.enabled = true; this.nullLayer = kind === "null"; this.startTime = 0; this.inPoint = 0; this.outPoint = comp.duration; this.parent = null; }
  moveAfter(l) { this._move(l.index); }
  get index() { return this.comp._layers.indexOf(this) + 1; }
  property(k) { return this.root.property(k); }
  sourceRectAtTime() { return { left: 0, top: -50, width: 400, height: 60 }; }
  moveToBeginning() { this._move(0); } moveToEnd() { this._move(this.comp._layers.length - 1); }
  moveBefore(l) { this._move(l.index - 1); }
  _move(i) { const a = this.comp._layers; a.splice(a.indexOf(this), 1); a.splice(i, 0, this); }
  setTrackMatte(m, t) { this.matte = [m.name, t]; }
}
class CompItem extends Item {
  constructor(name, w, h, pa, d, fps) {
    super(name); Object.assign(this, { width: w, height: h, pixelAspect: pa, duration: d, frameRate: fps, frameDuration: 1 / fps });
    if (!(d > 0)) throw new Error("comp duration must be > 0: " + d);
    this._layers = []; this.markerProperty = new Prop("ADBE Marker", null);
    const self = this, mk = (n, k) => { const l = new Layer(self, n, k); self._layers.unshift(l); return l; };
    this.layers = {
      addText: (t) => { const l = mk(t, "text"); l.property("ADBE Text Properties").property("ADBE Text Document").setValue(new TextDocument(t)); return l; },
      addShape: () => mk("Shape Layer", "shape"), addNull: () => mk("Null", "null"),
      addSolid: (c, n) => mk(n, "solid"), add: (it) => { if (!it || (it.width === undefined && !(it instanceof FootageItem))) throw new Error("layers.add needs an item"); return mk(it.name, "av"); },
      precompose: (idx, n) => { const c = new CompItem(n, w, h, 1, d, fps); items.push(c); return c; },
    };
  }
  layer(i) { return this._layers[i - 1]; }
  get numLayers() { return this._layers.length; }
  openInViewer() {}
}
class FileMock {
  constructor(p) { this.fsName = path.resolve(String(p).replace(/^~/, process.env.HOME)); this.displayName = path.basename(this.fsName); }
  get exists() { return fs.existsSync(this.fsName); }
  get parent() { return new FolderMock(path.dirname(this.fsName)); }
  open() { this._buf = ""; return true; } write(s) { this._buf += s; } close() { if (this._buf !== undefined) fs.writeFileSync(this.fsName, this._buf); }
  read() { return fs.readFileSync(this.fsName, "utf8"); }
}
class FolderMock { constructor(p) { this.fsName = path.resolve(p); } get exists() { return fs.existsSync(this.fsName); } create() { fs.mkdirSync(this.fsName, { recursive: true }); } }
class MarkerValue { constructor(c) { this.comment = c; } }
class Shape {}
class KeyframeEase { constructor(s, i) { this.speed = s; this.influence = i; } }
class ImportOptions { constructor(f) { this.file = f; } canImportAs() { return true; } }
const saved = [];
const app = {
  version: "25.0x1", isoLanguage: "en_US",
  beginUndoGroup() {}, endUndoGroup() {}, beginSuppressDialogs() {}, endSuppressDialogs() {},
  preferences: { getPrefAsLong: () => 1 },
  project: {
    file: null, get numItems() { return items.length; }, activeItem: null,
    items: Object.assign(new Proxy([], { get: (t, k) => (/^\d+$/.test(k) ? items[k - 1] : k === "length" ? items.length : t[k]) }), {}),
    importFile: (io) => { const f = new FootageItem(io.file.displayName, io.file); items.push(f); return f; },
    save: (f) => { saved.push(f.fsName); fs.writeFileSync(f.fsName, "mock aep"); },
    renderQueue: { items: { add: () => ({ outputModule: () => ({ applyTemplate() {}, templates: ["A"] }), templates: ["B"], remove() {} }) } },
  },
};
app.project.items.addFolder = (n) => { const f = new FolderItem(n); items.push(f); return f; };
app.project.items.addComp = (n, w, h, pa, d, fps) => { const c = new CompItem(n, w, h, pa, d, fps); items.push(c); return c; };

const ctx = {
  app, File: FileMock, Folder: FolderMock, CompItem, FolderItem, FootageItem, MarkerValue, Shape, KeyframeEase, ImportOptions, TextDocument,
  ImportAsType: { FOOTAGE: 1, COMP_CROPPED_LAYERS: 2 }, PropertyValueType: PVT,
  KeyframeInterpolationType: { LINEAR: 1, BEZIER: 2, HOLD: 3 }, ParagraphJustification: { LEFT_JUSTIFY: 1, CENTER_JUSTIFY: 2, RIGHT_JUSTIFY: 3 },
  MaskMode: { ADD: 1, NONE: 0, SUBTRACT: 2 }, TrackMatteType: { ALPHA: 1, LUMA: 3 },
  $: { fileName: path.resolve(scriptPath), os: "mock", version: "4.5", writeln: (s) => console.log(s) },
};
ctx.Folder.temp = new FolderMock(dir);
vm.createContext(ctx);
vm.runInContext(code, ctx, { filename: scriptPath });
const res = JSON.parse(fs.readFileSync(path.resolve(scriptPath).replace(/\.jsx$/, ".result.json"), "utf8"));
console.log(JSON.stringify(res, null, 1));
console.log("items:", items.map((i) => `${i.constructor.name}:${i.name}`).join(", "));
console.log("saved:", saved);
fs.writeFileSync(path.join(dir, "expressions.json"), JSON.stringify(EXPRS));
console.log("expressions captured:", EXPRS.length);
process.exit(res.ok ? 0 : 1);
