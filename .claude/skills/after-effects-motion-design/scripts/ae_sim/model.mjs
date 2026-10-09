// ae_sim/model.mjs - run an ExtendScript build against a strict model of the After Effects DOM and dump the result.
//   node model.mjs build.jsx out/model.json        (writes model.json + prints the build's result)
// The model knows the property tree (match names, display names, value types, defaults) of the layers, effects,
// shape contents and text animators the NOON builds use, and throws like AE does on: unknown match names,
// setValue() on keyed properties, wrong ease dimensions, spatial calls on non-spatial props, and a plain
// `layer.parent = x` (which in AE rewrites the child's transform - use setParentWithJump).
// render.mjs draws frames from the dump. Neither replaces a real After Effects run.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

const [, , scriptPath, outPath] = process.argv;
if (!scriptPath || !outPath) { console.error("usage: node model.mjs build.jsx out/model.json"); process.exit(2); }
const inline = (file) => fs.readFileSync(file, "utf8").replace(/^#include\s+"([^"]+)"/gm, (_, f) => inline(path.join(path.dirname(file), f)));
const code = inline(path.resolve(scriptPath)).replace("AEL.result.error = e.toString()", "AEL.result.error = (e.stack || e.toString())");

// ------------------------------------------------------------------ value types & schema
const PVT = { NO_VALUE: 6412, ThreeD_SPATIAL: 6413, ThreeD: 6414, TwoD_SPATIAL: 6415, TwoD: 6416, OneD: 6417, COLOR: 6418, CUSTOM_VALUE: 6419, MARKER: 6420, LAYER_INDEX: 6421, MASK_INDEX: 6422, SHAPE: 6423, TEXT_DOCUMENT: 6424 };
const KIT = { LINEAR: 6612, BEZIER: 6613, HOLD: 6614 };
const T = PVT;
// leaf: [matchName, displayName, type, default]; group: [matchName, displayName, children[] | "indexed:<kind>"]
const L = (mn, name, type, def) => ({ mn, name, type, def });
const G = (mn, name, kids, extra = {}) => ({ mn, name, kids, ...extra });
const TRANSFORM = G("ADBE Transform Group", "Transform", [
  L("ADBE Anchor Point", "Anchor Point", T.ThreeD_SPATIAL, [0, 0, 0]), L("ADBE Position", "Position", T.ThreeD_SPATIAL, [960, 540, 0]),
  L("ADBE Scale", "Scale", T.ThreeD, [100, 100, 100]), L("ADBE Rotate Z", "Rotation", T.OneD, 0), L("ADBE Opacity", "Opacity", T.OneD, 100)]);
const VXF = G("ADBE Vector Transform Group", "Transform", [
  L("ADBE Vector Anchor", "Anchor Point", T.TwoD_SPATIAL, [0, 0]), L("ADBE Vector Position", "Position", T.TwoD_SPATIAL, [0, 0]),
  L("ADBE Vector Scale", "Scale", T.TwoD, [100, 100]), L("ADBE Vector Rotation", "Rotation", T.OneD, 0), L("ADBE Vector Group Opacity", "Opacity", T.OneD, 100)]);
const VECTOR_ITEMS = {
  "ADBE Vector Group": () => G("ADBE Vector Group", "Group 1", [G("ADBE Vectors Group", "Contents", "indexed:vector"), VXF]),
  "ADBE Vector Shape - Rect": () => G("ADBE Vector Shape - Rect", "Rectangle Path 1", [L("ADBE Vector Shape Direction", "Shape Direction", T.OneD, 1),
    L("ADBE Vector Rect Size", "Size", T.TwoD, [100, 100]), L("ADBE Vector Rect Position", "Position", T.TwoD_SPATIAL, [0, 0]), L("ADBE Vector Rect Roundness", "Roundness", T.OneD, 0)]),
  "ADBE Vector Shape - Ellipse": () => G("ADBE Vector Shape - Ellipse", "Ellipse Path 1", [L("ADBE Vector Shape Direction", "Shape Direction", T.OneD, 1),
    L("ADBE Vector Ellipse Size", "Size", T.TwoD, [100, 100]), L("ADBE Vector Ellipse Position", "Position", T.TwoD_SPATIAL, [0, 0])]),
  "ADBE Vector Shape - Group": () => G("ADBE Vector Shape - Group", "Path 1", [L("ADBE Vector Shape Direction", "Shape Direction", T.OneD, 1), L("ADBE Vector Shape", "Path", T.SHAPE, null)]),
  "ADBE Vector Graphic - Fill": () => G("ADBE Vector Graphic - Fill", "Fill 1", [L("ADBE Vector Blend Mode", "Blend Mode", T.OneD, 1), L("ADBE Vector Composite Order", "Composite", T.OneD, 1),
    L("ADBE Vector Fill Rule", "Fill Rule", T.OneD, 1), L("ADBE Vector Fill Color", "Color", T.COLOR, [1, 0, 0, 1]), L("ADBE Vector Fill Opacity", "Opacity", T.OneD, 100)]),
  "ADBE Vector Graphic - Stroke": () => G("ADBE Vector Graphic - Stroke", "Stroke 1", [L("ADBE Vector Blend Mode", "Blend Mode", T.OneD, 1), L("ADBE Vector Composite Order", "Composite", T.OneD, 1),
    L("ADBE Vector Stroke Color", "Color", T.COLOR, [1, 1, 1, 1]), L("ADBE Vector Stroke Opacity", "Opacity", T.OneD, 100), L("ADBE Vector Stroke Width", "Stroke Width", T.OneD, 2),
    L("ADBE Vector Stroke Line Cap", "Line Cap", T.OneD, 1), L("ADBE Vector Stroke Line Join", "Line Join", T.OneD, 1), L("ADBE Vector Stroke Miter Limit", "Miter Limit", T.OneD, 4)]),
  "ADBE Vector Filter - Trim": () => G("ADBE Vector Filter - Trim", "Trim Paths 1", [L("ADBE Vector Trim Start", "Start", T.OneD, 0), L("ADBE Vector Trim End", "End", T.OneD, 100),
    L("ADBE Vector Trim Offset", "Offset", T.OneD, 0), L("ADBE Vector Trim Type", "Trim Multiple Shapes", T.OneD, 1)]),
};
const EFFECTS = {
  "ADBE Slider Control": ["Slider Control", [L("ADBE Slider Control-0001", "Slider", T.OneD, 0)]],
  "ADBE Color Control": ["Color Control", [L("ADBE Color Control-0001", "Color", T.COLOR, [1, 0, 0, 1])]],
  "ADBE Point Control": ["Point Control", [L("ADBE Point Control-0001", "Point", T.TwoD_SPATIAL, [0, 0])]],
  "ADBE Checkbox Control": ["Checkbox Control", [L("ADBE Checkbox Control-0001", "Checkbox", T.OneD, 0)]],
  "ADBE Gaussian Blur 2": ["Gaussian Blur", [L("ADBE Gaussian Blur 2-0001", "Blurriness", T.OneD, 0), L("ADBE Gaussian Blur 2-0002", "Blur Dimensions", T.OneD, 1), L("ADBE Gaussian Blur 2-0003", "Repeat Edge Pixels", T.OneD, 0)]],
  "ADBE Drop Shadow": ["Drop Shadow", [L("ADBE Drop Shadow-0001", "Shadow Color", T.COLOR, [0, 0, 0, 1]), L("ADBE Drop Shadow-0002", "Opacity", T.OneD, 127.5),
    L("ADBE Drop Shadow-0003", "Direction", T.OneD, 135), L("ADBE Drop Shadow-0004", "Distance", T.OneD, 5), L("ADBE Drop Shadow-0005", "Softness", T.OneD, 0), L("ADBE Drop Shadow-0006", "Shadow Only", T.OneD, 0)]],
  "ADBE Ramp": ["Gradient Ramp", [L("ADBE Ramp-0001", "Start of Ramp", T.TwoD_SPATIAL, [0, 0]), L("ADBE Ramp-0002", "Start Color", T.COLOR, [1, 1, 1, 1]),
    L("ADBE Ramp-0003", "End of Ramp", T.TwoD_SPATIAL, [0, 100]), L("ADBE Ramp-0004", "End Color", T.COLOR, [0, 0, 0, 1]), L("ADBE Ramp-0005", "Ramp Shape", T.OneD, 1),
    L("ADBE Ramp-0006", "Ramp Scatter", T.OneD, 0), L("ADBE Ramp-0007", "Blend With Original", T.OneD, 0)]],
  "ADBE Fractal Noise": ["Fractal Noise", [L("ADBE Fractal Noise-0001", "Fractal Type", T.OneD, 1), L("ADBE Fractal Noise-0002", "Noise Type", T.OneD, 1),
    L("ADBE Fractal Noise-0004", "Contrast", T.OneD, 100), L("ADBE Fractal Noise-0005", "Brightness", T.OneD, 0), L("ADBE Fractal Noise-0023", "Evolution", T.OneD, 0)]],
  "ADBE Tint": ["Tint", [L("ADBE Tint-0001", "Map Black To", T.COLOR, [0, 0, 0, 1]), L("ADBE Tint-0002", "Map White To", T.COLOR, [1, 1, 1, 1]), L("ADBE Tint-0003", "Amount to Tint", T.OneD, 100)]],
  "ADBE Fill": ["Fill", [L("ADBE Fill-0001", "Fill Mask", T.OneD, 0), L("ADBE Fill-0007", "All Masks", T.OneD, 0), L("ADBE Fill-0002", "Color", T.COLOR, [1, 0, 0, 1]),
    L("ADBE Fill-0006", "Invert", T.OneD, 0), L("ADBE Fill-0003", "Horizontal Feather", T.OneD, 0), L("ADBE Fill-0004", "Vertical Feather", T.OneD, 0), L("ADBE Fill-0005", "Opacity", T.OneD, 1)]],
};
const ANIM_PROPS = {
  "ADBE Text Opacity": L("ADBE Text Opacity", "Opacity", T.OneD, 100), "ADBE Text Position 3D": L("ADBE Text Position 3D", "Position", T.ThreeD_SPATIAL, [0, 0, 0]),
  "ADBE Text Blur": L("ADBE Text Blur", "Blur", T.TwoD, [0, 0]), "ADBE Text Scale 3D": L("ADBE Text Scale 3D", "Scale", T.ThreeD, [100, 100, 100]),
  "ADBE Text Fill Color": L("ADBE Text Fill Color", "Fill Color", T.COLOR, [1, 0, 0, 1]), "ADBE Text Tracking Amount": L("ADBE Text Tracking Amount", "Tracking Amount", T.OneD, 0),
  "ADBE Text Rotation": L("ADBE Text Rotation", "Rotation", T.OneD, 0),
};
const SELECTORS = {
  "ADBE Text Selector": () => G("ADBE Text Selector", "Range Selector 1", [L("ADBE Text Percent Start", "Start", T.OneD, 0), L("ADBE Text Percent End", "End", T.OneD, 100),
    L("ADBE Text Percent Offset", "Offset", T.OneD, 0), G("ADBE Text Range Advanced", "Advanced", [L("ADBE Text Range Units", "Units", T.OneD, 1), L("ADBE Text Range Type2", "Based On", T.OneD, 1),
      L("ADBE Text Selector Mode", "Mode", T.OneD, 1), L("ADBE Text Selector Max Amount", "Amount", T.OneD, 100), L("ADBE Text Range Shape", "Shape", T.OneD, 1),
      L("ADBE Text Selector Smoothness", "Smoothness", T.OneD, 100), L("ADBE Text Levels Max Ease", "Ease High", T.OneD, 0), L("ADBE Text Levels Min Ease", "Ease Low", T.OneD, 0)])]),
  "ADBE Text Expressible Selector": () => G("ADBE Text Expressible Selector", "Expression Selector 1", [L("ADBE Text Range Type2", "Based On", T.OneD, 1),
    L("ADBE Text Expressible Amount", "Amount", T.ThreeD, [100, 100, 100])]),
};
const ANIMATOR = () => G("ADBE Text Animator", "Animator 1", [G("ADBE Text Selectors", "Selectors", "indexed:selector"), G("ADBE Text Animator Properties", "Properties", "indexed:animprop")]);
const MASK = () => G("ADBE Mask Atom", "Mask 1", [L("ADBE Mask Shape", "Mask Path", T.SHAPE, null), L("ADBE Mask Feather", "Mask Feather", T.TwoD, [0, 0]),
  L("ADBE Mask Opacity", "Mask Opacity", T.OneD, 100), L("ADBE Mask Offset", "Mask Expansion", T.OneD, 0)], { mask: true });
const ADDABLE = { vector: (mn) => VECTOR_ITEMS[mn] && VECTOR_ITEMS[mn](), effect: (mn) => EFFECTS[mn] && G(mn, EFFECTS[mn][0], EFFECTS[mn][1], { effect: true }),
  animator: (mn) => mn === "ADBE Text Animator" && ANIMATOR(), selector: (mn) => SELECTORS[mn] && SELECTORS[mn](), animprop: (mn) => ANIM_PROPS[mn],
  mask: (mn) => mn === "ADBE Mask Atom" && MASK() };
const layerSchema = (kind) => {
  const k = [G("ADBE Marker", "Marker", null, { marker: true }), TRANSFORM, G("ADBE Effect Parade", "Effects", "indexed:effect"), G("ADBE Mask Parade", "Masks", "indexed:mask")];
  if (kind === "shape") k.push(G("ADBE Root Vectors Group", "Contents", "indexed:vector"));
  if (kind === "text") k.push(G("ADBE Text Properties", "Text", [L("ADBE Text Document", "Source Text", T.TEXT_DOCUMENT, null), G("ADBE Text Animators", "Animators", "indexed:animator")]));
  if (kind === "footage" || kind === "precomp") k.push(L("ADBE Time Remapping", "Time Remap", T.OneD, 0));
  return G("root", "root", k);
};

// ------------------------------------------------------------------ property objects
let UID = 0;
const ALL_EXPR = [];
class Prop {
  constructor(spec, parent, layer) {
    this.uid = ++UID; this.spec = spec; this.matchName = spec.mn; this._name = spec.name; this.parentProperty = parent; this.layer = layer;
    this.isGroup = !!spec.kids; this.children = []; this.keys = []; this._expr = ""; this.expressionEnabled = true;
    this.propertyValueType = spec.type === undefined ? (spec.marker ? PVT.MARKER : PVT.NO_VALUE) : spec.type;
    this._value = spec.def === undefined ? null : JSON.parse(JSON.stringify(spec.def));
    if (spec.type === PVT.TEXT_DOCUMENT) this._value = new TextDocument("");
    if (Array.isArray(spec.kids)) for (const c of spec.kids) this.children.push(new Prop(c, this, layer));
    this.indexed = typeof spec.kids === "string" ? spec.kids.split(":")[1] : null;
    this.isEffect = !!spec.effect; this.isMask = !!spec.mask; this.maskMode = 6812; this.inverted = false;
  }
  get name() { return this._name; }
  set name(v) { this._name = String(v); }
  get numProperties() { return this.children.length; }
  get propertyIndex() { return this.parentProperty ? this.parentProperty.children.indexOf(this) + 1 : 0; }
  get propertyDepth() { let d = 0, p = this.parentProperty; while (p) { d++; p = p.parentProperty; } return d; }
  get canSetExpression() { return !this.isGroup; }
  get isSpatial() { return this.propertyValueType === PVT.TwoD_SPATIAL || this.propertyValueType === PVT.ThreeD_SPATIAL; }
  get isTimeVarying() { return this.keys.length > 0 || !!this._expr; }
  get numKeys() { if (this.isGroup && !this.spec.marker) throw new Error(`${this.matchName} is a group`); return this.keys.length; }
  property(k) {
    if (!this.isGroup) throw new Error(`property(${k}) on non-group ${this.matchName}`);
    if (typeof k === "number") { const c = this.children[k - 1]; return c || null; }
    return this.children.find((p) => p.matchName === k || p.name === k) || null;
  }
  addProperty(mn) {
    if (!this.indexed) throw new Error(`addProperty("${mn}") not allowed on ${this.matchName}`);
    const spec = ADDABLE[this.indexed](mn);
    if (!spec) throw new Error(`After Effects: "${mn}" can't be added to ${this.matchName}`);
    const c = new Prop(spec, this, this.layer); this.children.push(c);
    if (spec.kids) { // numbered display names like AE
      const same = this.children.filter((x) => x.spec.mn === mn).length; c._name = spec.name.replace(/ 1$/, " " + same);
    }
    return c;
  }
  canAddProperty(mn) { return !!(this.indexed && ADDABLE[this.indexed](mn)); }
  remove() { const a = this.parentProperty.children; a.splice(a.indexOf(this), 1); }
  // values
  _check(v) {
    const t = this.propertyValueType;
    const need = { [PVT.ThreeD_SPATIAL]: [2, 3], [PVT.ThreeD]: [2, 3], [PVT.TwoD_SPATIAL]: [2], [PVT.TwoD]: [2], [PVT.COLOR]: [3, 4], [PVT.OneD]: [0] }[t];
    if (this.isGroup) throw new Error(`setValue on group ${this.matchName}`);
    if (need) {
      if (need[0] === 0) { if (typeof v !== "number" || isNaN(v)) throw new Error(`${this.matchName}: value must be a number, got ${JSON.stringify(v)}`); }
      else if (!Array.isArray(v) || !need.includes(v.length) || v.some((x) => typeof x !== "number" || isNaN(x))) throw new Error(`${this.matchName}: bad value ${JSON.stringify(v)}`);
    }
    if (t === PVT.SHAPE && !(v instanceof Shape)) throw new Error(`${this.matchName}: needs a Shape`);
    if (t === PVT.TEXT_DOCUMENT && !(v instanceof TextDocument)) throw new Error(`${this.matchName}: needs a TextDocument`);
    if (Array.isArray(v) && (t === PVT.ThreeD_SPATIAL || t === PVT.ThreeD) && v.length === 2) v = [v[0], v[1], this._value ? this._value[2] || 0 : 0];
    if (t === PVT.COLOR && v.length === 3) v = [v[0], v[1], v[2], 1];
    return v instanceof Shape ? v.clone() : v instanceof TextDocument ? v.clone() : Array.isArray(v) ? v.slice() : v;
  }
  get value() { return this._value instanceof TextDocument ? this._value.clone() : Array.isArray(this._value) ? this._value.slice() : this._value; }
  valueAtTime(t) { if (!this.keys.length) return this.value; let v = this.keys[0].v; for (const k of this.keys) if (k.t <= t + 1e-9) v = k.v; return v; }
  setValue(v) { if (this.keys.length) throw new Error(`After Effects: can't setValue() on "${this._name}" (${this.matchName}) - it has keyframes`); this._value = this._check(v); }
  setValueAtTime(t, v) {
    if (typeof t !== "number" || isNaN(t)) throw new Error("bad time " + t);
    if (this.spec.marker) { this.keys.push({ t, v, comment: v.comment, dur: v.duration || 0 }); this.keys.sort((a, b) => a.t - b.t); return; }
    v = this._check(v);
    const ex = this.keys.find((k) => Math.abs(k.t - t) < 1e-7);
    if (ex) ex.v = v; else { this.keys.push({ t, v, inI: KIT.LINEAR, outI: KIT.LINEAR, inE: null, outE: null, inT: null, outT: null }); this.keys.sort((a, b) => a.t - b.t); }
    this._value = v;
  }
  setValuesAtTimes(ts, vs) { ts.forEach((t, i) => this.setValueAtTime(t, vs[i])); }
  keyTime(i) { return this._k(i).t; }
  keyValue(i) { return this._k(i).v; }
  _k(i) { const k = this.keys[i - 1]; if (!k) throw new Error(`${this.matchName}: no key ${i} (has ${this.keys.length})`); return k; }
  nearestKeyIndex(t) { if (!this.keys.length) throw new Error("no keys"); let best = 1, d = Infinity; this.keys.forEach((k, i) => { if (Math.abs(k.t - t) < d) { d = Math.abs(k.t - t); best = i + 1; } }); return best; }
  removeKey(i) { this._k(i); this.keys.splice(i - 1, 1); }
  setInterpolationTypeAtKey(i, inT, outT) { const k = this._k(i); if (![KIT.LINEAR, KIT.BEZIER, KIT.HOLD].includes(inT)) throw new Error("bad interpolation " + inT); k.inI = inT; k.outI = outT === undefined ? inT : outT; }
  keyInInterpolationType(i) { return this._k(i).inI; }
  keyOutInterpolationType(i) { return this._k(i).outI; }
  _easeDims() { if (this.isSpatial) return 1; const t = this.propertyValueType; return t === PVT.TwoD ? 2 : t === PVT.ThreeD ? 3 : 1; }
  setTemporalEaseAtKey(i, a, b) {
    const k = this._k(i), n = this._easeDims();
    if (!Array.isArray(a) || a.length !== n || (b && b.length !== n)) throw new Error(`After Effects: ${this.matchName} needs ${n} KeyframeEase objects per side`);
    for (const e of [...a, ...(b || a)]) { if (!(e instanceof KeyframeEase)) throw new Error("ease must be KeyframeEase"); if (e.influence < 0.1 || e.influence > 100) throw new Error("influence out of range " + e.influence); }
    k.inE = a.map((e) => ({ s: e.speed, i: e.influence })); k.outE = (b || a).map((e) => ({ s: e.speed, i: e.influence }));
  }
  keyInTemporalEase(i) { const k = this._k(i); return (k.inE || Array(this._easeDims()).fill({ s: 0, i: 16.67 })).map((e) => new KeyframeEase(e.s, e.i)); }
  keyOutTemporalEase(i) { const k = this._k(i); return (k.outE || Array(this._easeDims()).fill({ s: 0, i: 16.67 })).map((e) => new KeyframeEase(e.s, e.i)); }
  _spatial() { if (!this.isSpatial) throw new Error(`After Effects: ${this.matchName} is not spatial`); }
  setSpatialTangentsAtKey(i, a, b) { this._spatial(); const k = this._k(i); k.inT = a; k.outT = b || a; }
  setSpatialAutoBezierAtKey(i) { this._spatial(); this._k(i); }
  setSpatialContinuousAtKey(i) { this._spatial(); this._k(i); }
  setRovingAtKey(i) { this._spatial(); this._k(i); }
  get expression() { return this._expr; }
  set expression(e) { if (this.isGroup) throw new Error("expression on group " + this.matchName); this._expr = String(e || ""); if (e) ALL_EXPR.push([this.layer ? this.layer.name : "?", this.matchName, e]); }
  get expressionError() { return ""; }
  get selected() { return false; }
  dump() {
    const o = { mn: this.matchName, name: this._name };
    if (this.isGroup && !this.spec.marker) { o.kids = this.children.map((c) => c.dump()); if (this.isMask) { o.maskMode = this.maskMode; o.inverted = this.inverted; } if (this.isEffect) o.effect = true; return o; }
    o.type = this.propertyValueType;
    const ser = (v) => (v instanceof Shape ? v.json() : v instanceof TextDocument ? v.json() : v);
    o.value = ser(this._value);
    if (this.keys.length) o.keys = this.keys.map((k) => this.spec.marker ? { t: k.t, comment: k.comment, dur: k.dur } : { t: k.t, v: ser(k.v), inI: k.inI, outI: k.outI, inE: k.inE, outE: k.outE });
    if (this._expr && this.expressionEnabled) o.expr = this._expr;
    return o;
  }
}
class TextDocument {
  constructor(t) { this.text = String(t); this.font = "ArialMT"; this.fontSize = 36; this.fillColor = [1, 1, 1]; this.strokeColor = [0, 0, 0]; this.applyFill = true; this.applyStroke = false;
    this.tracking = 0; this.leading = 0; this.autoLeading = true; this.justification = 7413; this.allCaps = false; this.strokeWidth = 0; }
  clone() { const d = new TextDocument(this.text); Object.assign(d, JSON.parse(JSON.stringify(this))); return d; }
  resetCharStyle() {} resetParagraphStyle() {}
  json() { return { text: this.text, font: this.font, fontSize: this.fontSize, fillColor: this.fillColor, applyFill: this.applyFill, tracking: this.tracking, leading: this.leading, autoLeading: this.autoLeading, justification: this.justification, allCaps: this.allCaps }; }
}
class Shape {
  constructor() { this.vertices = []; this.inTangents = []; this.outTangents = []; this.closed = true; }
  clone() { const s = new Shape(); s.vertices = this.vertices.map((v) => v.slice()); s.inTangents = (this.inTangents || []).map((v) => v.slice()); s.outTangents = (this.outTangents || []).map((v) => v.slice()); s.closed = this.closed; return s; }
  json() { const n = this.vertices.length, z = (a) => (a && a.length === n ? a : Array(n).fill([0, 0])); return { v: this.vertices, i: z(this.inTangents), o: z(this.outTangents), c: !!this.closed }; }
}
class KeyframeEase { constructor(s, i) { this.speed = s; this.influence = i; } }
class MarkerValue { constructor(c) { this.comment = String(c || ""); this.duration = 0; } }

// ------------------------------------------------------------------ project items
let ITEM_ID = 0;
const items = [];
class Item { constructor(name) { this.name = name; this.id = ++ITEM_ID; this.parentFolder = ROOT_FOLDER; this.comment = ""; this.label = 0; } remove() { const i = items.indexOf(this); if (i >= 0) items.splice(i, 1); } }
let ROOT_FOLDER = null;
class FolderItem extends Item { get numItems() { return items.filter((i) => i.parentFolder === this).length; } }
ROOT_FOLDER = new FolderItem("Root"); ROOT_FOLDER.parentFolder = null;
const probe = (f) => {
  const ext = path.extname(f).toLowerCase();
  if (ext === ".png") { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), still: true }; }
  try {
    const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", f]).toString());
    const v = j.streams.find((s) => s.codec_type === "video"), a = j.streams.find((s) => s.codec_type === "audio");
    const still = /\.(jpe?g|gif|bmp|tiff?|psd|svg)$/.test(ext);
    if (!v) return { w: 0, h: 0, dur: +j.format.duration, audioOnly: true, hasAudio: !!a };
    const [n, d] = (v.r_frame_rate || "24/1").split("/").map(Number);
    return { w: v.width, h: v.height, dur: still ? 0 : +(v.duration || j.format.duration), fps: n / d, still, hasAudio: !!a };
  } catch (e) { return { w: 1000, h: 1000, still: true, probeError: String(e) }; }
};
class FootageItem extends Item {
  constructor(file) { super(path.basename(file)); this.file = new FileMock(file); const p = probe(file); this._p = p;
    this.width = p.w; this.height = p.h; this.duration = p.dur || 0; this.frameRate = p.fps || 0; this.hasVideo = !p.audioOnly; this.hasAudio = !!p.hasAudio; this.footageMissing = false;
    this.mainSource = { isStill: !!p.still, conformFrameRate: 0 }; this.pixelAspect = 1; }
}
class CompItem extends Item {
  constructor(name, w, h, pa, d, fps) {
    super(name);
    if (!(w >= 4 && h >= 4 && d > 0 && fps > 0)) throw new Error(`After Effects: bad comp settings ${w}x${h} ${d}s ${fps}fps`);
    Object.assign(this, { width: w, height: h, pixelAspect: pa, duration: d, frameRate: fps, frameDuration: 1 / fps, bgColor: [0, 0, 0], motionBlur: false, workAreaStart: 0, workAreaDuration: d });
    this._layers = []; this.markerProperty = new Prop(G("ADBE Marker", "Marker", null, { marker: true }), null, null);
    const self = this;
    this.layers = {
      addText: (t) => { const l = new Layer(self, String(t === undefined ? "" : t).substr(0, 30) || "Text", "text"); const d0 = new TextDocument(t === undefined ? "" : t); l.property("ADBE Text Properties").property("ADBE Text Document")._value = d0; return l._ins(); },
      addShape: () => new Layer(self, "Shape Layer " + (self._layers.filter((x) => x.kind === "shape").length + 1), "shape")._ins(),
      addNull: (dur) => { const l = new Layer(self, "Null " + (self._layers.length + 1), "null"); l.nullLayer = true; l._src = { w: 100, h: 100 }; l._setAnchorDefault(); if (dur) l.outPoint = dur; return l._ins(); },
      addSolid: (c, n, w, h) => { const l = new Layer(self, n, "solid"); l._solid = { color: c.slice(0, 3), w: w || self.width, h: h || self.height }; l._src = { w: w || self.width, h: h || self.height }; l._setAnchorDefault(); return l._ins(); },
      add: (it) => {
        if (it instanceof CompItem) { if (it === self) throw new Error("can't nest a comp in itself"); const l = new Layer(self, it.name, "precomp"); l.source = it; l._src = { w: it.width, h: it.height }; l._setAnchorDefault(); return l._ins(); }
        if (it instanceof FootageItem) { const l = new Layer(self, it.name, it.hasVideo ? "footage" : "audio"); l.source = it; l._src = { w: it.width, h: it.height }; l._setAnchorDefault();
          if (it.duration && !it.mainSource.isStill) l.outPoint = Math.min(self.duration, it.duration); return l._ins(); }
        throw new Error("layers.add needs a CompItem or FootageItem");
      },
      precompose: () => { throw new Error("precompose not modelled"); },
      byName: (n) => self._layers.find((l) => l.name === n) || null,
    };
  }
  layer(i) { if (typeof i === "string") return this._layers.find((l) => l.name === i) || null; return this._layers[i - 1] || null; }
  get numLayers() { return this._layers.length; }
  openInViewer() {}
  dump() { return { name: this.name, id: this.id, w: this.width, h: this.height, dur: this.duration, fps: this.frameRate, bg: this.bgColor, markers: this.markerProperty.dump().keys || [], layers: this._layers.map((l) => l.dump()) }; }
}
const BLEND = { NORMAL: 5212, MULTIPLY: 5216, SCREEN: 5220, ADD: 5228, OVERLAY: 5232 };
let LAYER_UID = 0;
class Layer {
  constructor(comp, name, kind) {
    this.uid = ++LAYER_UID; this.containingComp = comp; this.name = name; this.kind = kind; this.enabled = true; this.audioEnabled = true; this.guideLayer = false; this.shy = false; this.locked = false;
    this.startTime = 0; this.inPoint = 0; this.outPoint = comp.duration; this.stretch = 100; this.label = 0; this.motionBlur = false; this.threeDLayer = false;
    this.collapseTransformation = false; this.blendingMode = BLEND.NORMAL; this.trackMatteType = 5012; this._matte = null; this._parent = null; this.nullLayer = false; this.source = null;
    this.root = new Prop(layerSchema(kind), null, this);
    if (kind === "text" || kind === "shape") { this.property("ADBE Transform Group").property("ADBE Position")._value = [comp.width / 2, comp.height / 2, 0]; }
    this.timeRemapEnabled = false;
  }
  _setAnchorDefault() { this.property("ADBE Transform Group").property("ADBE Anchor Point")._value = [this._src.w / 2, this._src.h / 2, 0]; this.property("ADBE Transform Group").property("ADBE Position")._value = [this.containingComp.width / 2, this.containingComp.height / 2, 0]; }
  _ins() { this.containingComp._layers.unshift(this); return this; }
  get index() { return this.containingComp._layers.indexOf(this) + 1; }
  get hasVideo() { return this.kind !== "audio"; }
  property(k) { return this.root.property(k); }
  get transform() { return this.property("ADBE Transform Group"); }
  get Effects() { return this.property("ADBE Effect Parade"); }
  get parent() { return this._parent; }
  set parent(p) { if (p) throw new Error(`model: "${this.name}".parent = "${p.name}" would make AE rewrite this layer's transform - use setParentWithJump()`); this._parent = null; }
  setParentWithJump(p) { if (p && p.containingComp !== this.containingComp) throw new Error("parent must be in the same comp"); let q = p; while (q) { if (q === this) throw new Error("parent loop"); q = q._parent; } this._parent = p || null; }
  moveAfter(l) { this._chk(l); const a = this.containingComp._layers; a.splice(a.indexOf(this), 1); a.splice(a.indexOf(l) + 1, 0, this); }
  moveBefore(l) { this._chk(l); const a = this.containingComp._layers; a.splice(a.indexOf(this), 1); a.splice(a.indexOf(l), 0, this); }
  moveToBeginning() { this._move(0); } moveToEnd() { this._move(this.containingComp._layers.length - 1); }
  _chk(l) { if (!l || l.containingComp !== this.containingComp) throw new Error("move target must be a layer in the same comp"); }
  _move(i) { const a = this.containingComp._layers; a.splice(a.indexOf(this), 1); a.splice(Math.max(0, Math.min(a.length, i)), 0, this); }
  setTrackMatte(m, type) { if (!m || m.containingComp !== this.containingComp) throw new Error("matte layer must be in the same comp"); if (m === this) throw new Error("matte can't be self"); this._matte = m; this.trackMatteType = type; }
  get trackMatteLayer() { return this._matte; }
  sourceRectAtTime() { throw new Error("model: sourceRectAtTime() can't be measured here - use an expression so AE measures it"); }
  duplicate() { throw new Error("model: duplicate() not modelled"); }
  remove() { const a = this.containingComp._layers; a.splice(a.indexOf(this), 1); }
  dump() {
    return { uid: this.uid, name: this.name, kind: this.kind, enabled: this.enabled, guide: this.guideLayer, start: this.startTime, in: this.inPoint, out: this.outPoint,
      collapse: this.collapseTransformation, blend: this.blendingMode, parent: this._parent ? this._parent.uid : null, matte: this._matte ? { uid: this._matte.uid, type: this.trackMatteType } : null,
      source: this.source ? (this.source instanceof CompItem ? { comp: this.source.name } : { footage: this.source.id }) : null, solid: this._solid || null, src: this._src || null,
      timeRemap: this.timeRemapEnabled, props: this.root.dump().kids };
  }
}
// ------------------------------------------------------------------ files
class FileMock {
  constructor(p) { this.fsName = path.resolve(String(p).replace(/^~/, process.env.HOME)); this.displayName = path.basename(this.fsName); this.name = this.displayName; this.encoding = "UTF-8"; }
  get exists() { return fs.existsSync(this.fsName); }
  get parent() { return new FolderMock(path.dirname(this.fsName)); }
  get absoluteURI() { return this.fsName; }
  open(mode) { this._mode = mode; this._buf = mode === "r" ? fs.readFileSync(this.fsName, "utf8") : ""; return true; }
  write(s) { this._buf += s; } writeln(s) { this._buf += s + "\n"; }
  read() { return this._buf !== undefined && this._mode === "r" ? this._buf : fs.readFileSync(this.fsName, "utf8"); }
  close() { if (this._mode === "w") fs.writeFileSync(this.fsName, this._buf); this._buf = undefined; }
  remove() { fs.rmSync(this.fsName, { force: true }); return true; }
}
class FolderMock { constructor(p) { this.fsName = path.resolve(String(p)); } get exists() { return fs.existsSync(this.fsName); } create() { fs.mkdirSync(this.fsName, { recursive: true }); return true; }
  getFiles(mask) { if (!this.exists) return []; return fs.readdirSync(this.fsName).filter((n) => !mask || new RegExp("^" + String(mask).replace(/\./g, "\\.").replace(/\*/g, ".*") + "$", "i").test(n)).map((n) => new FileMock(path.join(this.fsName, n))); } }
class ImportOptions { constructor(f) { this.file = f; this.sequence = false; this.importAs = 1; } canImportAs() { return true; } }
const saved = [];
const app = {
  version: "25.0x1 (ae_sim)", isoLanguage: "en_US", buildName: "ae_sim",
  beginUndoGroup() {}, endUndoGroup() {}, beginSuppressDialogs() {}, endSuppressDialogs() {}, purge() {},
  preferences: { getPrefAsLong: () => 1 }, settings: { haveSetting: () => false },
  project: {
    file: null, get numItems() { return items.length; }, activeItem: null, bitsPerChannel: 8, get rootFolder() { return ROOT_FOLDER; },
    importFile: (io) => { if (!io.file.exists) throw new Error("After Effects: file not found " + io.file.fsName); const f = new FootageItem(io.file.fsName); items.push(f); return f; },
    save: (f) => { saved.push(f.fsName); },
    renderQueue: { items: { add: (c) => ({ comp: c, outputModule: () => ({ applyTemplate() {}, templates: [], file: null }), remove() {} }), get length() { return 0; } } },
    item: (i) => items[i - 1],
  },
};
app.project.items = new Proxy({ addFolder: (n) => { const f = new FolderItem(n); items.push(f); return f; }, addComp: (n, w, h, pa, d, fps) => { const c = new CompItem(n, w, h, pa, d, fps); items.push(c); return c; } },
  { get: (t, k) => (k === "length" ? items.length : /^\d+$/.test(String(k)) ? items[Number(k) - 1] : t[k]) });

const ctx = {
  app, File: FileMock, Folder: FolderMock, CompItem, FolderItem, FootageItem, MarkerValue, Shape, KeyframeEase, ImportOptions, TextDocument,
  ImportAsType: { FOOTAGE: 3812, COMP: 3813, COMP_CROPPED_LAYERS: 3814, PROJECT: 3815 }, PropertyValueType: PVT, KeyframeInterpolationType: KIT,
  ParagraphJustification: { LEFT_JUSTIFY: 7413, RIGHT_JUSTIFY: 7414, CENTER_JUSTIFY: 7415, FULL_JUSTIFY_LASTLINE_LEFT: 7416 },
  MaskMode: { NONE: 6812, ADD: 6813, SUBTRACT: 6814, INTERSECT: 6815 }, TrackMatteType: { NO_TRACK_MATTE: 5012, ALPHA: 5013, ALPHA_INVERTED: 5014, LUMA: 5015, LUMA_INVERTED: 5016 },
  BlendingMode: BLEND, PropertyType: { PROPERTY: 6212, INDEXED_GROUP: 6213, NAMED_GROUP: 6214 },
  $: { fileName: path.resolve(scriptPath), os: "ae_sim", version: "4.5", writeln: (s) => console.log(String(s)), sleep() {}, gc() {} },
  alert: (s) => console.log("[alert]", s), confirm: () => true,
};
ctx.Folder.temp = new FolderMock(path.dirname(path.resolve(outPath)));
ctx.Folder.current = new FolderMock(path.dirname(path.resolve(scriptPath)));
vm.createContext(ctx);
let crashed = null;
try { vm.runInContext(code, ctx, { filename: scriptPath }); } catch (e) { crashed = e; }

const resPath = path.resolve(scriptPath).replace(/\.jsx$/, ".result.json");
let res = { ok: false, error: crashed ? String(crashed.stack || crashed) : "no result file" };
if (fs.existsSync(resPath)) { res = JSON.parse(fs.readFileSync(resPath, "utf8")); fs.renameSync(resPath, path.resolve(outPath).replace(/\.json$/, ".result.json")); }
const footage = {}; for (const it of items) if (it instanceof FootageItem) footage[it.id] = { name: it.name, path: it.file.fsName, w: it.width, h: it.height, dur: it.duration, fps: it.frameRate, still: it.mainSource.isStill, video: it.hasVideo };
const model = { version: 1, script: path.resolve(scriptPath), result: res, saved, comps: items.filter((i) => i instanceof CompItem).map((c) => c.dump()), footage, expressions: ALL_EXPR.length };
fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(model));
console.log(JSON.stringify({ ok: res.ok, error: res.error, warnings: res.warnings, comps: model.comps.map((c) => `${c.name} (${c.layers.length} layers)`), expressions: ALL_EXPR.length, saved }, null, 1));
process.exit(res.ok ? 0 : 1);
