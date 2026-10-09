// noon3_lib.jsx - NOON v3 build library (ExtendScript / ES3). Requires ae_lib.jsx, noon3_words.jsx, noon3_icons.jsx.
//
// One continuous shape per clip, rebuilt as native, editable After Effects layers:
//   WORLD   null  - the camera. Effect sliders: Cam (zoom), Cam Mul, Focus X/Y. Everything in "world" space is parented here.
//   SHAPE   shape - the morphing card. Effect controls: W, H, Radius, CX, CY, Fill, Pop, Press.
//   SHAPE MATTE   - invisible copy of SHAPE (expression-linked) used as the alpha matte for the card's contents.
//   ANCHOR C/T/L  - nulls on the card (centre, top edge, left edge) that card contents hang from.
//   <id> \u00b7 <name> - one collapsed precomp per content group, revealed with plain keyframes (opacity/scale/blur).
//
// Motion = springs. A sprung property holds HOLD keyframes at its targets plus a short expression that springs
// from key to key, so retiming a move means dragging a keyframe. Fades/rises are ordinary eased keyframes.
// Word-timed text reveals are driven by layer markers: drag a marker to retime that word.

var N3 = {};
N3.W = 1920; N3.H = 1080; N3.FPS = 24000 / 1001;
N3.PRE_W = 2400; N3.PRE_H = 1600;           // content-group precomp canvas; group origin = canvas centre
N3.COL = { canvas: "#F9DCDB", ink: "#2B1C1E", soft: "#9C7F81", line: "#EFD9D8", coral: "#EA6262", coralD: "#D24E55",
    blush: "#FCECEB", white: "#FFFFFF", navy: "#163452", verm: "#F4512B", ivory: "#F3EEE3", capRed: "#C2575D" };
N3.FONT = { 300: "Inter-Light", 400: "Inter-Regular", 500: "Inter-Medium", 600: "Inter-SemiBold", 700: "Inter-Bold", 800: "Inter-ExtraBold" };
N3.FONT_ALT = { "Inter-ExtraBold": "Inter-Black", "Inter-Light": "Inter-Regular" };
N3.SP = { MORPH: [15, 0.84], FAST: [27, 0.86], SLOW: [12.5, 0.9], SOFT: [10, 0.95], CAM: [7.5, 1], INSTANT: [1000000, 1], COLOR: [20, 1] };
N3.BLUR_K = 2.5;         // CSS blur px -> AE Blurriness
N3.ASC = 0.96875;          // Inter ascender / em
N3.LHN = 1.2109375;        // Inter "normal" line height / em
N3.ASSET_DIR = "";         // set by the build script (folder holding the client assets)
N3.folders = null;         // set by the build script (AEL.standardFolders())
N3.files = {};

N3.wt = function (i, T0) { return N3_WORDS[i][1] - T0; };
// camera drift factor (expression text); pre = "" on WORLD itself, "W." where W is the WORLD layer
N3.DRIFT = function (pre) { return "(1 + " + pre + "effect(\"Drift %\")(1) / 100 * Math.pow(Math.sin(Math.PI * time / thisComp.duration), 2))"; };
N3.r3 = function (x) { return Math.round(x * 1000) / 1000; };
N3.hex = function (h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; };
N3.rgba = function (h) { var c = N3.hex(h); c.push(1); return c; };
N3.num = function (a) { return AEL.stringify(a); };

// ---------------------------------------------------------------- properties & keys

N3.xf = function (layer, mn) { return layer.property("ADBE Transform Group").property(mn); };
N3.pos = function (layer) { return N3.xf(layer, "ADBE Position"); };
// Parent without the "jump": plain `layer.parent = p` makes AE rewrite the child's transform to keep it in place.
N3.parent = function (layer, p) {
    var keep, mns = ["ADBE Anchor Point", "ADBE Position", "ADBE Scale", "ADBE Rotate Z"], i, pr;
    if (typeof layer.setParentWithJump === "function") { layer.setParentWithJump(p); return layer; }
    keep = [];
    for (i = 0; i < mns.length; i++) { keep.push(N3.xf(layer, mns[i]).value); }
    layer.parent = p;
    for (i = 0; i < mns.length; i++) { pr = N3.xf(layer, mns[i]); if (pr.numKeys === 0) { pr.setValue(keep[i]); } }
    return layer;
};
N3.isSpatial = function (prop) {
    var t = prop.propertyValueType;
    return t === PropertyValueType.TwoD_SPATIAL || t === PropertyValueType.ThreeD_SPATIAL;
};
N3.dims = function (prop) {
    var t = prop.propertyValueType;
    if (t === PropertyValueType.TwoD) { return 2; }
    if (t === PropertyValueType.ThreeD) { return 3; }
    return 1;
};
N3.sub = function (a, b) {
    var o = [], i;
    if (typeof a === "number") { return a - b; }
    for (i = 0; i < a.length; i++) { o.push(a[i] - b[i]); }
    return o;
};
N3.len = function (v) { var s = 0, i; if (typeof v === "number") { return Math.abs(v); } for (i = 0; i < v.length; i++) { s += v[i] * v[i]; } return Math.sqrt(s); };

N3.addKey = function (prop, t, v) {
    prop.setValueAtTime(t, v);
    return prop.nearestKeyIndex(t);
};
// Straight-line spatial keys (no auto-bezier detours).
N3.straight = function (prop, k) {
    if (!N3.isSpatial(prop)) { return; }
    try {
        prop.setSpatialAutoBezierAtKey(k, false);
        prop.setSpatialContinuousAtKey(k, false);
        prop.setSpatialTangentsAtKey(k, prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL ? [0, 0, 0] : [0, 0],
            prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL ? [0, 0, 0] : [0, 0]);
    } catch (e) { AEL.warn("spatial tangents: " + e); }
};
// Set the out-ease of key k (keeping its in-ease) or the in-ease (keeping its out-ease).
N3._ease = function (prop, k, side, speeds, infl) {
    var n = speeds.length, i, mine = [], other;
    for (i = 0; i < n; i++) { mine.push(new KeyframeEase(speeds[i], infl)); }
    prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    other = side === "out" ? prop.keyInTemporalEase(k) : prop.keyOutTemporalEase(k);
    if (other.length !== n) { other = []; for (i = 0; i < n; i++) { other.push(new KeyframeEase(0, 33.333)); } }
    if (side === "out") { prop.setTemporalEaseAtKey(k, other, mine); } else { prop.setTemporalEaseAtKey(k, mine, other); }
};
N3._speeds = function (prop, v0, v1, dur, factor) {
    var d, i, o = [];
    if (N3.isSpatial(prop)) { return [factor * N3.len(N3.sub(v1, v0)) / dur]; }
    d = N3.sub(v1, v0);
    if (typeof d === "number") { return [factor * d / dur]; }
    if (N3.dims(prop) === 1) { return [0]; }              // colour etc: keep default speed
    for (i = 0; i < N3.dims(prop); i++) { o.push(factor * (d[i] || 0) / dur); }   // e.g. Scale keyed with 2 values on a 3D property
    return o;
};
N3._zero = function (prop) { var o = [], i, n = N3.isSpatial(prop) ? 1 : N3.dims(prop); for (i = 0; i < n; i++) { o.push(0); } return o; };

// Cubic ease-out move (same curve as the web engine's eo()): fast start, soft landing.
N3.eo = function (prop, t0, t1, v0, v1) {
    var k0 = N3.addKey(prop, t0, v0), k1 = N3.addKey(prop, t1, v1);
    N3.straight(prop, k0); N3.straight(prop, k1);
    N3._ease(prop, k0, "out", N3._speeds(prop, v0, v1, t1 - t0, 3), 33.333);
    N3._ease(prop, k1, "in", N3._zero(prop), 33.333);
};
// Smooth in-out move (eio()).
N3.io = function (prop, t0, t1, v0, v1) {
    var k0 = N3.addKey(prop, t0, v0), k1 = N3.addKey(prop, t1, v1);
    N3.straight(prop, k0); N3.straight(prop, k1);
    N3._ease(prop, k0, "out", N3._zero(prop), 50);
    N3._ease(prop, k1, "in", N3._zero(prop), 50);
};
// Linear keys at the given times.
N3.lin = function (prop, times, values) {
    var i, k;
    for (i = 0; i < times.length; i++) {
        k = N3.addKey(prop, times[i], values[i]);
        prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        N3.straight(prop, k);
    }
};
// Hold keys (instant changes).
N3.hold = function (prop, times, values) {
    var i, k;
    for (i = 0; i < times.length; i++) {
        k = N3.addKey(prop, times[i], values[i]);
        prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
    }
};

// Spring expression: keyframes are targets, value springs from each to the next. SP = [freq, damping] per key.
N3.springExpr = function (sp) {
    return "// NOON spring - each keyframe is a target; the value springs to it from the previous one.\n" +
        "// Drag keys to retime. SP = [frequency, damping] per key (last entry is reused for extra keys).\n" +
        "var SP = " + N3.num(sp) + ";\n" +
        "function S(t, w, z) { if (t <= 0) return 0; if (w > 99999) return 1; if (z < 1) { var wd = w * Math.sqrt(1 - z * z); " +
        "return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + z * w / wd * Math.sin(wd * t)); } return 1 - Math.exp(-w * t) * (1 + w * t); }\n" +
        "var v = value;\n" +
        "if (numKeys > 1) { v = key(1).value; for (var i = 2; i <= numKeys; i++) { var p = SP[Math.min(i - 1, SP.length - 1)]; " +
        "v = add(v, mul(sub(key(i).value, key(i - 1).value), S(time - key(i).time, p[0], p[1]))); } }\n" +
        "v";
};
// keys: [[t, value, spring?], ...]; v0 = value at t=0. Keys closer than 1 ms are nudged apart.
N3.spring = function (prop, v0, keys, defSp) {
    var sp = [defSp || N3.SP.MORPH], times = [0], vals = [v0], i, t, last = 0;
    for (i = 0; i < keys.length; i++) {
        t = Math.max(keys[i][0], 1 / 1000);
        if (t <= last + 0.0005) { t = last + 0.001; }
        last = t;
        times.push(N3.r3(t)); vals.push(keys[i][1]); sp.push(keys[i][2] || defSp || N3.SP.MORPH);
    }
    N3.hold(prop, times, vals);
    if (keys.length) { AEL.expr(prop, N3.springExpr(sp)); }
    return prop;
};

// ---------------------------------------------------------------- effects

N3.fx = function (layer, mn, name) {
    var f = layer.property("ADBE Effect Parade").addProperty(mn);
    if (name) { f.name = name; }
    return layer.property("ADBE Effect Parade").property(f.propertyIndex);
};
N3.slider = function (layer, name, v) {
    var f = N3.fx(layer, "ADBE Slider Control", name);
    f.property("ADBE Slider Control-0001").setValue(v);
    return layer.property("ADBE Effect Parade").property(name).property("ADBE Slider Control-0001");
};
N3.colorCtl = function (layer, name, hex) {
    var f = N3.fx(layer, "ADBE Color Control", name);
    f.property("ADBE Color Control-0001").setValue(N3.rgba(hex));
    return layer.property("ADBE Effect Parade").property(name).property("ADBE Color Control-0001");
};
N3.isFootage = function (layer) { return !!(layer.source && layer.source instanceof FootageItem); };
N3.ctl = function (layer, name) { return layer.property("ADBE Effect Parade").property(name).property(1); };
N3.blur = function (layer) {
    var p = layer.property("ADBE Effect Parade"), f = p.property("Blur");
    if (!f) {
        f = N3.fx(layer, "ADBE Gaussian Blur 2", "Blur");
        try { f.property("ADBE Gaussian Blur 2-0003").setValue(1); } catch (e) {}   // repeat edge pixels off
        // keys are in CSS blur px (a standard deviation); AE Blurriness is ~2.5x that. Footage effects work in the
        // image's own pixels, so there the amount is also divided by the layer's scale.
        AEL.expr(layer.property("ADBE Effect Parade").property("Blur").property("ADBE Gaussian Blur 2-0001"),
            N3.isFootage(layer) ? "value * " + N3.BLUR_K + " * 100 / Math.max(0.01, Math.abs(transform.scale[0]))" : "value * " + N3.BLUR_K);
    }
    return p.property("Blur").property("ADBE Gaussian Blur 2-0001");
};
// Soft card shadow. o: {color, opacity (0..1), dist, soft}
N3.SHADOW = { card: { color: "#96323A", opacity: 0.30, dist: 22, soft: 56 }, small: { color: "#78282D", opacity: 0.32, dist: 8, soft: 18 },
    pen: { color: "#5A191E", opacity: 0.30, dist: 9, soft: 10 } };
N3.shadow = function (layer, o) {
    var f = N3.fx(layer, "ADBE Drop Shadow", "Shadow");
    o = o || N3.SHADOW.card;
    f.property("ADBE Drop Shadow-0001").setValue(N3.rgba(o.color));
    f.property("ADBE Drop Shadow-0002").setValue(Math.round(o.opacity * 255));
    f.property("ADBE Drop Shadow-0003").setValue(180);
    f.property("ADBE Drop Shadow-0004").setValue(o.dist);
    f.property("ADBE Drop Shadow-0005").setValue(o.soft);
    if (N3.isFootage(layer)) {   // footage effects are in image pixels: keep the shadow's on-screen size
        AEL.expr(layer.property("ADBE Effect Parade").property(f.name).property("ADBE Drop Shadow-0004"), "value * 100 / Math.max(0.01, Math.abs(transform.scale[0]))");
        AEL.expr(layer.property("ADBE Effect Parade").property(f.name).property("ADBE Drop Shadow-0005"), "Math.min(250, value * 100 / Math.max(0.01, Math.abs(transform.scale[0])))");
    }
    return layer.property("ADBE Effect Parade").property(f.name);
};

// ---------------------------------------------------------------- shape layers

N3.shapeLayer = function (comp, name) {
    var l = comp.layers.addShape();
    l.name = name;
    N3.xf(l, "ADBE Anchor Point").setValue([0, 0]);
    return l;
};
N3.root = function (layer) { return layer.property("ADBE Root Vectors Group"); };
N3.addGroup = function (layer, name) {
    var g = N3.root(layer).addProperty("ADBE Vector Group");
    g.name = name;
    return g.propertyIndex;
};
N3.gc = function (layer, gi) { return N3.root(layer).property(gi).property("ADBE Vectors Group"); };
// A reference to item idx of group gi that re-fetches itself on use: adding a sibling (Fill after Rect...) makes AE
// invalidate references the script already holds ("Object is invalid").
N3.live = function (layer, gi, idx) {
    return { property: function (k) { return N3.gc(layer, gi).property(idx).property(k); }, ref: function () { return N3.gc(layer, gi).property(idx); } };
};
N3.gxf = function (layer, gi, mn) { return N3.root(layer).property(gi).property("ADBE Vector Transform Group").property(mn); };
N3.addRect = function (layer, gi, w, h, r, pos) {
    var p = N3.gc(layer, gi).addProperty("ADBE Vector Shape - Rect"), i = p.propertyIndex, c = N3.gc(layer, gi).property(i);
    c.property("ADBE Vector Rect Size").setValue([w, h]);
    c.property("ADBE Vector Rect Roundness").setValue(r || 0);
    if (pos) { c.property("ADBE Vector Rect Position").setValue(pos); }
    return N3.live(layer, gi, i);
};
N3.addEllipse = function (layer, gi, w, h, pos) {
    var p = N3.gc(layer, gi).addProperty("ADBE Vector Shape - Ellipse"), c = N3.gc(layer, gi).property(p.propertyIndex);
    c.property("ADBE Vector Ellipse Size").setValue([w, h]);
    if (pos) { c.property("ADBE Vector Ellipse Position").setValue(pos); }
    return N3.live(layer, gi, p.propertyIndex);
};
N3.addPath = function (layer, gi, verts, inT, outT, closed) {
    var p = N3.gc(layer, gi).addProperty("ADBE Vector Shape - Group"), s = new Shape(), i, z = [];
    for (i = 0; i < verts.length; i++) { z.push([0, 0]); }
    s.vertices = verts; s.inTangents = inT || z; s.outTangents = outT || z; s.closed = !!closed;
    N3.gc(layer, gi).property(p.propertyIndex).property("ADBE Vector Shape").setValue(s);
    return N3.live(layer, gi, p.propertyIndex);
};
N3.addFill = function (layer, gi, hex, opacity) {
    var p = N3.gc(layer, gi).addProperty("ADBE Vector Graphic - Fill"), c = N3.gc(layer, gi).property(p.propertyIndex);
    c.property("ADBE Vector Fill Color").setValue(N3.rgba(hex));
    if (opacity !== undefined) { c.property("ADBE Vector Fill Opacity").setValue(opacity); }
    return N3.live(layer, gi, p.propertyIndex);
};
N3.addStroke = function (layer, gi, hex, width, opacity, round) {
    var p = N3.gc(layer, gi).addProperty("ADBE Vector Graphic - Stroke"), c = N3.gc(layer, gi).property(p.propertyIndex);
    c.property("ADBE Vector Stroke Color").setValue(N3.rgba(hex));
    c.property("ADBE Vector Stroke Width").setValue(width);
    if (opacity !== undefined) { c.property("ADBE Vector Stroke Opacity").setValue(opacity); }
    if (round) {
        c.property("ADBE Vector Stroke Line Cap").setValue(2);    // round
        c.property("ADBE Vector Stroke Line Join").setValue(2);   // round
    }
    return N3.live(layer, gi, p.propertyIndex);
};
N3.addTrim = function (layer, gi) {
    var p = N3.gc(layer, gi).addProperty("ADBE Vector Filter - Trim");
    return N3.live(layer, gi, p.propertyIndex);
};
// Rounded-rect outline as a Shape (for masks).
N3.rrShape = function (l, t, w, h, r) {
    var s = new Shape(), k = 0.5523 * r, R = l + w, B = t + h;
    r = Math.min(r, w / 2, h / 2); k = 0.5523 * r;
    if (r <= 0) { s.vertices = [[l, t], [R, t], [R, B], [l, B]]; s.closed = true; return s; }
    s.vertices = [[l + r, t], [R - r, t], [R, t + r], [R, B - r], [R - r, B], [l + r, B], [l, B - r], [l, t + r]];
    s.inTangents = [[-k, 0], [0, 0], [0, -k], [0, 0], [k, 0], [0, 0], [0, k], [0, 0]];
    s.outTangents = [[0, 0], [k, 0], [0, 0], [0, k], [0, 0], [-k, 0], [0, 0], [0, -k]];
    s.closed = true;
    return s;
};
N3.mask = function (layer, shape, feather) {
    var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    m.property("ADBE Mask Shape").setValue(shape);
    if (feather) { m.property("ADBE Mask Feather").setValue([feather, feather]); }
    return m;
};

// ---------------------------------------------------------------- footage

N3.file = function (rel) {
    var it;
    if (N3.files[rel]) { return N3.files[rel]; }
    it = AEL.importFile(N3.ASSET_DIR + "/" + rel, N3.folders ? N3.folders.footage : null);
    N3.files[rel] = it;
    return it;
};

// ---------------------------------------------------------------- contexts & stacking
// ctx = {comp, ox, oy, parent, slot:'world'|'over'|'pre', S}. Element coordinates are the web layout's (px, relative
// to the group origin or to the world origin); ox/oy convert them into the target comp.

N3.place = function (ctx, layer) {
    var S = ctx.S;
    if (ctx.slot === "world") { layer.moveAfter(S.shape); }
    else if (ctx.slot === "over") { layer.moveAfter(S.divTop); }
    if (ctx.parent) { N3.parent(layer, ctx.parent); }
    return layer;
};
N3.P = function (ctx, x, y) { return [ctx.ox + x, ctx.oy + y]; };
N3.uname = function (comp, base) {
    var n = base, i = 2, j, taken = function (nm) { for (j = 1; j <= comp.numLayers; j++) { if (comp.layer(j).name === nm) { return true; } } return false; };
    while (taken(n)) { n = base + " " + i; i++; }
    return n;
};

// ---------------------------------------------------------------- elements

// Box. o: {name, x, y (top-left) | cx, cy, w, h, r, fill, stroke, sw, opacity, shadow (true|{...}), fillOpacity}
N3.box = function (ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "Box")), gi, cx, cy;
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Box");
    N3.addRect(l, gi, o.w, o.h, o.r || 0);
    if (o.stroke) { N3.addStroke(l, gi, o.stroke, o.sw || 1.5); }
    if (o.fill) { N3.addFill(l, gi, o.fill, o.fillOpacity); }
    cx = o.cx !== undefined ? o.cx : o.x + o.w / 2;
    cy = o.cy !== undefined ? o.cy : o.y + o.h / 2;
    N3.pos(l).setValue(N3.P(ctx, cx, cy));
    if (o.opacity !== undefined) { N3.xf(l, "ADBE Opacity").setValue(o.opacity); }
    if (o.shadow) { N3.shadow(l, o.shadow === true ? N3.SHADOW.card : o.shadow); }
    return l;
};
// Ellipse/circle. o: {name, cx, cy, d | w,h, fill, stroke, sw, opacity}
N3.ellipse = function (ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "Circle")), gi, w = o.w || o.d, h = o.h || o.d;
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Ellipse");
    N3.addEllipse(l, gi, w, h);
    if (o.stroke) { N3.addStroke(l, gi, o.stroke, o.sw || 1.5); }
    if (o.fill) { N3.addFill(l, gi, o.fill); }
    N3.pos(l).setValue(N3.P(ctx, o.cx, o.cy));
    if (o.opacity !== undefined) { N3.xf(l, "ADBE Opacity").setValue(o.opacity); }
    return l;
};
// Polyline / bezier path. o: {name, verts:[[x,y]...] (ctx coords), inT, outT, closed, stroke, sw, fill, round, trim:true}
N3.path = function (ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "Path")), gi;
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Path");
    N3.addPath(l, gi, o.verts, o.inT, o.outT, o.closed);
    if (o.trim) { N3.addTrim(l, gi); }
    if (o.stroke) { N3.addStroke(l, gi, o.stroke, o.sw || 2, undefined, o.round !== false); }
    if (o.fill) { N3.addFill(l, gi, o.fill); }
    N3.pos(l).setValue([ctx.ox, ctx.oy]);
    if (o.opacity !== undefined) { N3.xf(l, "ADBE Opacity").setValue(o.opacity); }
    return l;
};
N3.trimOf = function (layer) { return N3.gc(layer, 1).property("ADBE Vector Filter - Trim"); };

// Tabler icon. o: {name, cx, cy, size, color, sw (rendered stroke px)}
N3.icon = function (ctx, icon, o) {
    var data = N3_ICONS[icon], l, gi, i, s = o.size / 24, p;
    if (!data) { throw new Error("Unknown icon: " + icon); }
    l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || ("Icon " + icon)));
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Icon");
    for (i = 0; i < data.length; i++) { N3.addPath(l, gi, data[i][1], data[i][2], data[i][3], data[i][0]); }
    N3.addStroke(l, gi, o.color || "#FFFFFF", (o.sw || 2) / s, undefined, true);
    N3.gxf(l, gi, "ADBE Vector Scale").setValue([s * 100, s * 100]);
    N3.pos(l).setValue(N3.P(ctx, o.cx, o.cy));
    return l;
};

// Text. Positions follow the web layout: x = left edge (align left), centre (align center) or right edge;
// top = top of the CSS line box, or cy = its vertical centre. o: {name, x, top|cy, fs, wt, color, ls (em), lh (px), align, caps, opacity}
N3.text = function (ctx, str, o) {
    var comp = ctx.comp, s = o.caps ? String(str).toUpperCase() : String(str), l = comp.layers.addText(s.replace(/\n/g, "\r")), tp, doc, font, got, lh, base;
    l.name = N3.uname(comp, o.name || s.substr(0, 28));
    N3.place(ctx, l);
    font = N3.FONT[o.wt || 400];
    tp = l.property("ADBE Text Properties").property("ADBE Text Document");
    doc = tp.value;
    doc.font = font; doc.fontSize = o.fs; doc.applyFill = true; doc.fillColor = N3.hex(o.color || N3.COL.ink); doc.applyStroke = false;
    doc.tracking = Math.round((o.ls || 0) * 1000);
    lh = o.lh || o.fs * N3.LHN;
    if (s.indexOf("\n") >= 0) { doc.autoLeading = false; doc.leading = lh; }
    doc.justification = o.align === "center" ? ParagraphJustification.CENTER_JUSTIFY :
        (o.align === "right" ? ParagraphJustification.RIGHT_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY);
    tp.setValue(doc);
    got = tp.value.font;
    if (got !== font) {
        doc = tp.value; doc.font = font; tp.setValue(doc); got = tp.value.font;
        if (got !== font && N3.FONT_ALT[font]) { doc = tp.value; doc.font = N3.FONT_ALT[font]; tp.setValue(doc); got = tp.value.font; }
        if (got !== font) { AEL.warn("Font " + font + " not found; AE used " + got + " on '" + l.name + "'"); }
    }
    base = (o.cy !== undefined ? o.cy - lh / 2 : o.top) + (lh - N3.LHN * o.fs) / 2 + N3.ASC * o.fs;
    N3.pos(l).setValue(N3.P(ctx, o.x, base));
    if (o.opacity !== undefined) { N3.xf(l, "ADBE Opacity").setValue(o.opacity); }
    return l;
};
// Vertical centre of a text layer's line box relative to its baseline (use as anchor for centred scaling).
N3.textMid = function (o) { var lh = o.lh || o.fs * N3.LHN; return -((lh - N3.LHN * o.fs) / 2 + N3.ASC * o.fs) + lh / 2; };

// Pill/chip: rounded box sized to its text by expression. o: {name, x (left) | cx, top|cy, fs, wt, color, bg, padX, padY, ls, caps}
N3.chip = function (ctx, str, o) {
    var padX = o.padX === undefined ? 14 : o.padX, padY = o.padY === undefined ? 7 : o.padY, lh = o.fs * N3.LHN, h = lh + 2 * padY,
        top = o.top !== undefined ? o.top : o.cy - h / 2, name = N3.uname(ctx.comp, o.name || "Chip"), bg, tx, tname;
    tname = N3.uname(ctx.comp, name + " text");
    bg = N3.box(ctx, { name: name, x: 0, y: top, w: 60, h: h, r: h / 2, fill: o.bg || N3.COL.coral });
    tx = N3.text(ctx, str, { name: tname, x: o.cx !== undefined ? o.cx : o.x + padX, top: top + padY, fs: o.fs, wt: o.wt || 600,
        color: o.color || "#FFFFFF", ls: o.ls, caps: o.caps, align: o.cx !== undefined ? "center" : "left" });
    AEL.expr(N3.root(bg).property(1).property("ADBE Vectors Group").property(1).property("ADBE Vector Rect Size"),
        "var r = thisComp.layer(\"" + tname + "\").sourceRectAtTime(time, false); [r.width + " + (2 * padX) + ", " + N3.r3(h) + "]");
    AEL.expr(N3.pos(bg), "var L = thisComp.layer(\"" + tname + "\"), r = L.sourceRectAtTime(time, false);\n" +
        "[L.transform.position[0] + r.left + r.width / 2, value[1]]");
    bg.moveAfter(tx);
    return { bg: bg, text: tx, h: h };
};
// Put `layer` right of text layer `refName` (+gap). Keeps own y.
N3.follow = function (layer, refName, gap) {
    AEL.expr(N3.pos(layer), "var L = thisComp.layer(\"" + refName + "\"), r = L.sourceRectAtTime(time, false);\n" +
        "[L.transform.position[0] + r.left + r.width + " + gap + " + (value[0] - " + N3.r3(N3.pos(layer).value[0]) + "), value[1]]");
};

// Image. o: {name, x, y | cx, cy, w, h, fit:'cover'|'width'|'stretch', r, opacity}
N3.image = function (ctx, rel, o) {
    var it = N3.file(rel), l = ctx.comp.layers.add(it), iw = it.width, ih = it.height, s, w = o.w, h = o.h, cx, cy, sx, sy;
    l.name = N3.uname(ctx.comp, o.name || rel);
    N3.place(ctx, l);
    if (o.fit === "width") { s = w / iw; h = ih * s; sx = sy = s; }
    else if (o.fit === "stretch") { sx = w / iw; sy = h / ih; s = sx; }
    else { s = Math.max(w / iw, h / ih); sx = sy = s; }
    cx = o.cx !== undefined ? o.cx : o.x + w / 2;
    cy = o.cy !== undefined ? o.cy : o.y + h / 2;
    N3.pos(l).setValue(N3.P(ctx, cx, cy));
    N3.xf(l, "ADBE Scale").setValue([sx * 100, sy * 100]);
    if (o.r || (o.fit !== "width" && o.fit !== "stretch" && (Math.abs(iw * s - w) > 1 || Math.abs(ih * s - h) > 1))) {
        N3.mask(l, N3.rrShape(iw / 2 - w / sx / 2, ih / 2 - h / sy / 2, w / sx, h / sy, (o.r || 0) / sx));
    }
    if (o.opacity !== undefined) { N3.xf(l, "ADBE Opacity").setValue(o.opacity); }
    return l;
};

// ---------------------------------------------------------------- reveals

// Web show(): fade + rise dy + blur in at tin (after din, over lin); blur out at tout over lout. Scale 0.94 -> 1 -> 0.97.
// o: {din, lin, lout, blur, noScale, noBlur, op (final opacity %, default 100)}
N3.show = function (layer, tin, tout, dy, o) {
    o = o || {};
    var din = o.din === undefined ? 0.07 : o.din, lin = o.lin === undefined ? 0.26 : o.lin, lout = o.lout === undefined ? 0.12 : o.lout,
        bl = o.blur === undefined ? 12 : o.blur, op = o.op === undefined ? 100 : o.op, pp = N3.pos(layer), base, useAnchor, ap, a0;
    var sc = N3.xf(layer, "ADBE Scale"), s0 = sc.value, opa = N3.xf(layer, "ADBE Opacity"), b;
    if (tin !== null && tin !== undefined) {
        N3.eo(opa, tin + din, tin + din + lin, 0, op);
        if (!o.noScale) { N3.eo(sc, tin + din, tin + din + lin, [s0[0] * 0.94, s0[1] * 0.94, s0[2]], s0); }
        if (bl && !o.noBlur) { b = N3.blur(layer); N3.eo(b, tin + din, tin + din + lin, bl, 0); }
        if (dy) {
            useAnchor = pp.numKeys > 0 || pp.expression !== "";
            if (useAnchor) {
                ap = N3.xf(layer, "ADBE Anchor Point"); a0 = ap.value;
                N3.eo(ap, tin + din, tin + din + lin, [a0[0], a0[1] - dy * 100 / s0[1], a0[2]], a0);
            } else {
                base = pp.value;
                N3.eo(pp, tin + din, tin + din + lin, [base[0], base[1] + dy, base[2]], base);
            }
        }
    }
    if (tout !== null && tout !== undefined) {
        N3.eo(opa, tout, tout + lout, op, 0);
        if (!o.noScale) { N3.eo(sc, tout, tout + lout, s0, [s0[0] * 0.97, s0[1] * 0.97, s0[2]]); }
        if (bl && !o.noBlur) { b = N3.blur(layer); N3.eo(b, tout, tout + lout, 0, bl * 0.8); }
    }
    return layer;
};

// Unit reveal driven by layer markers (one marker per word/character = its start time; extra units follow at `stagger`).
// o: {times:[clip-local s] | t0+stagger, based:'words'|'chars', dy, blur, lin, din, scale (true), name}
N3.unitReveal = function (layer, o) {
    var BASED = { chars: 2, words: 3, lines: 4 }, ai, anim, props, sel, i, times = o.times || [o.t0], stag = o.stagger || 0.05,
        din = o.din || 0, lin = o.lin || 0.32, an = function () { return layer.property("ADBE Text Properties").property("ADBE Text Animators").property(ai); };
    for (i = 0; i < times.length; i++) { AEL.layerMarker(layer, N3.r3(times[i]), o.label ? o.label[i] || "" : ""); }
    ai = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator").propertyIndex;
    an().name = o.name || "Reveal (markers)";
    props = function () { return an().property("ADBE Text Animator Properties"); };
    props().addProperty("ADBE Text Opacity"); props().property("ADBE Text Opacity").setValue(0);
    if (o.dy) { props().addProperty("ADBE Text Position 3D"); props().property("ADBE Text Position 3D").setValue([0, o.dy, 0]); }
    if (o.blur) { props().addProperty("ADBE Text Blur"); props().property("ADBE Text Blur").setValue([o.blur * N3.BLUR_K, o.blur * N3.BLUR_K]); }
    if (o.scale !== false) { props().addProperty("ADBE Text Scale 3D"); props().property("ADBE Text Scale 3D").setValue([94, 94, 100]); }
    an().property("ADBE Text Selectors").addProperty("ADBE Text Expressible Selector");
    sel = an().property("ADBE Text Selectors").property(1);
    sel.property("ADBE Text Range Type2").setValue(BASED[o.based || "words"]);
    AEL.expr(sel.property("ADBE Text Expressible Amount"),
        "// Unit i appears at layer marker i (drag markers to retime). Units past the last marker follow every " + stag + " s.\n" +
        "var n = marker.numKeys, i = textIndex, t0 = 0;\n" +
        "if (n > 0) { t0 = i <= n ? marker.key(i).time : marker.key(n).time + (i - n) * " + stag + "; }\n" +
        "var u = Math.min(1, Math.max(0, (time - t0 - " + din + ") / " + lin + "));\n" +
        "var v = 100 * Math.pow(1 - u, 3);\n[v, v, v]");
    return layer;
};
// Typewriter: characters appear left to right between t0 and t1.
N3.typeOn = function (layer, t0, t1) {
    var A = layer.property("ADBE Text Properties").property("ADBE Text Animators"), ai = A.addProperty("ADBE Text Animator").propertyIndex, an, sel;
    an = function () { return layer.property("ADBE Text Properties").property("ADBE Text Animators").property(ai); };
    an().name = "Type on";
    an().property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
    an().property("ADBE Text Animator Properties").property("ADBE Text Opacity").setValue(0);
    an().property("ADBE Text Selectors").addProperty("ADBE Text Selector");
    sel = an().property("ADBE Text Selectors").property(1);
    N3.lin(sel.property("ADBE Text Percent Start"), [t0, t1], [0, 100]);
    return layer;
};

// ---------------------------------------------------------------- the scene (one clip)

// cfg: {id, title, T, SH:{name:{w,h,r,bg,cam}}, start, SEQ:[[t,name]], spring, camSpring, intro, shapePress:[t],
//       cx/cy/fx/fy/camMul:[[t,v,sp]] extra tracks, shadow (default true)}
N3.scene = function (cfg) {
    var S = { cfg: cfg, id: cfg.id, T: cfg.T }, comp, P0 = cfg.SH[cfg.start], i, keysOf, w, sh, m, ex, pr, gi, an;
    comp = AEL.comp("NOON3 " + cfg.id + " " + cfg.title, { width: N3.W, height: N3.H, duration: cfg.T, fps: N3.FPS, folder: N3.folders ? N3.folders.sections : null });
    S.comp = comp;
    keysOf = function (k, sp) { var o = [], j; for (j = 0; j < cfg.SEQ.length; j++) { o.push([cfg.SEQ[j][0], k(cfg.SH[cfg.SEQ[j][1]]), sp]); } return o; };

    // camera
    w = AEL.nullLayer(comp, "WORLD (camera)");
    N3.xf(w, "ADBE Anchor Point").setValue([0, 0]);
    N3.spring(N3.slider(w, "Cam", P0.cam), P0.cam, keysOf(function (s) { return s.cam; }), cfg.camSpring || N3.SP.CAM);
    N3.spring(N3.slider(w, "Cam Mul", 1), 1, cfg.camMul || [], N3.SP.CAM);
    N3.slider(w, "Drift %", cfg.drift || 0);   // slow breathing push-in: 0 at the clip's first and last frame, peak mid-clip
    N3.spring(N3.slider(w, "Focus X", 0), 0, cfg.fx || [], N3.SP.CAM);
    N3.spring(N3.slider(w, "Focus Y", 0), 0, cfg.fy || [], N3.SP.CAM);
    AEL.expr(N3.pos(w), "// camera: zoom Cam x Cam Mul x drift around Focus X/Y\nvar s = effect(\"Cam\")(1) * effect(\"Cam Mul\")(1) * " + N3.DRIFT("") + ";\n" +
        "[" + N3.W / 2 + " - s * effect(\"Focus X\")(1), " + N3.H / 2 + " - s * effect(\"Focus Y\")(1)]");
    AEL.expr(N3.xf(w, "ADBE Scale"), "var s = effect(\"Cam\")(1) * effect(\"Cam Mul\")(1) * " + N3.DRIFT("") + " * 100;\n[s, s]");
    S.world = w;

    // the card
    sh = N3.shapeLayer(comp, "SHAPE");
    N3.parent(sh, w);
    N3.spring(N3.slider(sh, "W", P0.w), P0.w, keysOf(function (s) { return s.w; }), cfg.spring);
    N3.spring(N3.slider(sh, "H", P0.h), P0.h, keysOf(function (s) { return s.h; }), cfg.spring);
    N3.spring(N3.slider(sh, "Radius", P0.r), P0.r, keysOf(function (s) { return s.r; }), cfg.spring);
    N3.spring(N3.slider(sh, "CX", 0), 0, cfg.cx || [], N3.SP.MORPH);
    N3.spring(N3.slider(sh, "CY", 0), 0, cfg.cy || [], N3.SP.MORPH);
    N3.spring(N3.colorCtl(sh, "Fill", P0.bg), N3.rgba(P0.bg), keysOf(function (s) { return N3.rgba(s.bg); }), N3.SP.COLOR);
    pr = [];
    for (i = 0; i < (cfg.shapePress || []).length; i++) { pr.push([cfg.shapePress[i] - 0.07, 1, [45, 1]], [cfg.shapePress[i] + 0.035, 0, [22, 0.72]]); }
    N3.spring(N3.slider(sh, "Press", 0), 0, pr, N3.SP.FAST);
    N3.slider(sh, "Pop", 1);
    if (cfg.intro !== null && cfg.intro !== undefined) {
        N3.spring(N3.ctl(sh, "Pop"), 0.55, [[cfg.intro, 1, [13, 0.78]]]);
        N3.lin(N3.xf(sh, "ADBE Opacity"), [cfg.intro, cfg.intro + 0.12], [0, 100]);
    }
    gi = N3.addGroup(sh, "Card");
    N3.addRect(sh, gi, P0.w, P0.h, P0.r);
    N3.addFill(sh, gi, P0.bg);
    S.rectExpr = function (L) {
        return { size: "var L = " + L + ";\n[L.effect(\"W\")(1), L.effect(\"H\")(1)]",
            round: "var L = " + L + ";\nMath.min(L.effect(\"Radius\")(1), L.effect(\"W\")(1) / 2, L.effect(\"H\")(1) / 2)",
            pos: "var L = " + L + ";\n[L.effect(\"CX\")(1), L.effect(\"CY\")(1)]",
            scale: "var L = " + L + ", s = L.effect(\"Pop\")(1) * (1 - 0.035 * L.effect(\"Press\")(1)) * 100;\n[s, s]" };
    };
    ex = S.rectExpr("thisLayer");
    AEL.expr(N3.gc(sh, gi).property(1).property("ADBE Vector Rect Size"), ex.size);
    AEL.expr(N3.gc(sh, gi).property(1).property("ADBE Vector Rect Roundness"), ex.round);
    AEL.expr(N3.gc(sh, gi).property(2).property("ADBE Vector Fill Color"), "effect(\"Fill\")(1)");
    AEL.expr(N3.pos(sh), ex.pos);
    AEL.expr(N3.xf(sh, "ADBE Scale"), ex.scale);
    if (cfg.shadow !== false) { N3.shadow(sh, N3.SHADOW.card); }
    S.shape = sh;

    // matte copy (no shadow), follows SHAPE
    m = N3.shapeLayer(comp, "SHAPE MATTE");
    N3.parent(m, w);
    gi = N3.addGroup(m, "Card");
    N3.addRect(m, gi, P0.w, P0.h, P0.r);
    N3.addFill(m, gi, "#FFFFFF");
    ex = S.rectExpr("thisComp.layer(\"SHAPE\")");
    AEL.expr(N3.gc(m, gi).property(1).property("ADBE Vector Rect Size"), ex.size);
    AEL.expr(N3.gc(m, gi).property(1).property("ADBE Vector Rect Roundness"), ex.round);
    AEL.expr(N3.pos(m), ex.pos);
    AEL.expr(N3.xf(m, "ADBE Scale"), ex.scale);
    AEL.expr(N3.xf(m, "ADBE Opacity"), "thisComp.layer(\"SHAPE\").transform.opacity");
    m.enabled = false;
    m.moveAfter(w);
    S.matte = m;

    // anchors on the card
    S.anchor = {};
    an = [["c", "ANCHOR C (card centre)", "[0, 0]"], ["t", "ANCHOR T (card top)", "[0, -thisComp.layer(\"SHAPE\").effect(\"H\")(1) / 2]"],
        ["l", "ANCHOR L (card left)", "[-thisComp.layer(\"SHAPE\").effect(\"W\")(1) / 2, 0]"]];
    for (i = 0; i < an.length; i++) {
        S.anchor[an[i][0]] = AEL.nullLayer(comp, an[i][1]);
        N3.parent(S.anchor[an[i][0]], sh);
        N3.xf(S.anchor[an[i][0]], "ADBE Anchor Point").setValue([0, 0]);
        AEL.expr(N3.pos(S.anchor[an[i][0]]), an[i][2]);
        S.anchor[an[i][0]].moveAfter(m);
    }
    // stacking (top to bottom): CURSOR, over-the-card items, TOP divider, card-content groups, OVER divider, SHAPE, world items, rig nulls
    S.divTop = AEL.nullLayer(comp, "--- over the card ---");
    S.divOver = AEL.nullLayer(comp, "--- card contents ---");
    S.divOver.moveBefore(sh);
    S.divTop.moveBefore(S.divOver);
    S.world.moveToEnd(); S.matte.moveToEnd();
    for (i = 0; i < an.length; i++) { S.anchor[an[i][0]].moveToEnd(); }
    S.worldCtx = { comp: comp, ox: 0, oy: 0, parent: w, slot: "world", S: S };
    S.overCtx = { comp: comp, ox: 0, oy: 0, parent: w, slot: "over", S: S };
    S.groups = {};
    return S;
};

// Card content group (a collapsed precomp hanging from an anchor, clipped by the card).
// o: {anchor:'c'|'t'|'l', tin, tout, din, lin, lout, blur}
N3.group = function (S, name, o) {
    var pc, l, ctx, din, lin, lout, bl, sc, op, b;
    o = o || {};
    pc = app.project.items.addComp(S.id + " \u00b7 " + name, N3.PRE_W, N3.PRE_H, 1, S.T, N3.FPS);
    if (N3.folders) { pc.parentFolder = N3.folders.precomps; }
    AEL.created("precomp", pc.name);
    l = S.comp.layers.add(pc);
    l.name = name;
    l.moveAfter(S.divOver);
    N3.parent(l, S.anchor[o.anchor || "c"]);
    N3.xf(l, "ADBE Anchor Point").setValue([N3.PRE_W / 2, N3.PRE_H / 2]);
    N3.pos(l).setValue([0, 0]);
    try { l.collapseTransformation = true; } catch (e) { AEL.warn("collapse: " + e); }
    N3.matte(S, l);
    din = o.din === undefined ? 0.07 : o.din; lin = o.lin === undefined ? 0.26 : o.lin; lout = o.lout === undefined ? 0.12 : o.lout;
    bl = o.blur === undefined ? 12 : o.blur;
    sc = N3.xf(l, "ADBE Scale"); op = N3.xf(l, "ADBE Opacity");
    if (o.tin !== null && o.tin !== undefined) {
        N3.eo(op, o.tin + din, o.tin + din + lin, 0, 100);
        N3.eo(sc, o.tin + din, o.tin + din + lin, [94, 94], [100, 100]);
        if (bl) { b = N3.blur(l); N3.eo(b, o.tin + din, o.tin + din + lin, bl, 0); }
    }
    if (o.tout !== null && o.tout !== undefined) {
        N3.eo(op, o.tout, o.tout + lout, 100, 0);
        N3.eo(sc, o.tout, o.tout + lout, [100, 100], [97, 97]);
        if (bl) { b = N3.blur(l); N3.eo(b, o.tout, o.tout + lout, 0, bl * 0.8); }
    }
    ctx = { comp: pc, ox: N3.PRE_W / 2, oy: N3.PRE_H / 2, parent: null, slot: "pre", S: S, layer: l };
    S.groups[name] = ctx;
    return ctx;
};
// Expression reference to this clip's SHAPE from inside one of its precomps.
N3.shapeRef = function (S) { return "comp(\"" + S.comp.name + "\").layer(\"SHAPE\")"; };

N3.matte = function (S, layer) {
    var d;
    if (typeof layer.setTrackMatte === "function") {
        layer.setTrackMatte(S.matte, TrackMatteType.ALPHA);
    } else {
        d = S.matte.duplicate();
        d.enabled = true;
        d.moveBefore(layer);
        layer.trackMatteType = TrackMatteType.ALPHA;
    }
};

// Cursor (screen space; follows world points through the camera). o: {keys:[[t,x,y]], clicks:[t], drags:[[a,b]], size}
N3.cursor = function (S, o) {
    var l = N3.shapeLayer(S.comp, "CURSOR"), gi, pt, i, pr = [], keys = o.keys, s = (o.size || 46) / 40, k;
    gi = N3.addGroup(l, "Arrow");
    N3.addPath(l, gi, [[3, 3], [3, 41], [12.5, 32], [19, 47], [25.5, 44.2], [19.2, 29.8], [32, 29.8]], null, null, true);
    N3.addStroke(l, gi, "#FFFFFF", 2.6, undefined, true);
    N3.addFill(l, gi, "#0B0B0B");
    N3.gxf(l, gi, "ADBE Vector Anchor").setValue([3, 3]);
    N3.gxf(l, gi, "ADBE Vector Scale").setValue([s * 100, s * 100]);
    N3.fx(l, "ADBE Point Control", "World Point");
    pt = N3.ctl(l, "World Point");
    for (i = 0; i < keys.length; i++) {
        k = N3.addKey(pt, Math.max(0, keys[i][0]), [keys[i][1], keys[i][2]]);
    }
    for (i = 1; i <= pt.numKeys; i++) {
        pt.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
        N3.straight(pt, i);
        pt.setTemporalEaseAtKey(i, [new KeyframeEase(0, 50)], [new KeyframeEase(0, 50)]);
    }
    for (i = 0; i < (o.clicks || []).length; i++) { pr.push([o.clicks[i] - 0.07, 1, [45, 1]], [o.clicks[i] + 0.035, 0, [22, 0.72]]); }
    for (i = 0; i < (o.drags || []).length; i++) { pr.push([o.drags[i][0] - 0.04, 1, [45, 1]], [o.drags[i][1], 0, [22, 0.72]]); }
    pr.sort(function (a, b) { return a[0] - b[0]; });
    N3.spring(N3.slider(l, "Press", 0), 0, pr, N3.SP.FAST);
    AEL.expr(N3.pos(l), "// screen position of World Point through the camera\nvar W = thisComp.layer(\"WORLD (camera)\"), s = W.effect(\"Cam\")(1) * W.effect(\"Cam Mul\")(1) * " + N3.DRIFT("W.") + ", p = effect(\"World Point\")(1);\n" +
        "[" + N3.W / 2 + " + s * (p[0] - W.effect(\"Focus X\")(1)), " + N3.H / 2 + " + s * (p[1] - W.effect(\"Focus Y\")(1))]");
    AEL.expr(N3.xf(l, "ADBE Scale"), "var s = (1 - 0.13 * effect(\"Press\")(1)) * 100;\n[s, s]");
    l.moveToBeginning();
    S.cursor = l;
    return l;
};

// ---------------------------------------------------------------- background (main comp)
N3.background = function (comp) {
    var bg = AEL.solid(comp, "#F7CFCE", "BG blush gradient"), r, light, grain, f;
    r = N3.fx(bg, "ADBE Ramp", "Ramp");
    r.property("ADBE Ramp-0001").setValue([N3.W / 2, 0]);
    r.property("ADBE Ramp-0002").setValue(N3.rgba("#FCEAE9"));
    r.property("ADBE Ramp-0003").setValue([N3.W / 2, N3.H]);
    r.property("ADBE Ramp-0004").setValue(N3.rgba("#F1AEAD"));
    light = AEL.solid(comp, "#FFF6F5", "BG soft light");
    N3.mask(light, (function () { var s = new Shape(), cx = 0.22 * N3.W, cy = 0.08 * N3.H, rx = 900, ry = 600, k = 0.5523;
        s.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
        s.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
        s.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
        s.closed = true; return s; })(), 700);
    N3.xf(light, "ADBE Opacity").setValue(90);
    grain = AEL.solid(comp, "#808080", "BG grain (5% multiply)");
    try {
        f = N3.fx(grain, "ADBE Fractal Noise", "Grain");
        AEL.expr(f.property("Evolution"), "time * 400");    // animated grain
    } catch (e) { AEL.warn("grain: " + e); }
    grain.blendingMode = BlendingMode.MULTIPLY;
    N3.xf(grain, "ADBE Opacity").setValue(5);
    grain.moveToBeginning(); light.moveAfter(grain); bg.moveAfter(light);
    return [grain, light, bg];
};

// Motion blur on (180\u00b0 default shutter) for a clip comp, every precomp nested in it, and every visible layer -
// the reference renders were made with motion blur. Turn a layer's switch off in the timeline to opt out.
N3.motionBlur = function (comp, seen) {
    var j, l;
    seen = seen || {};
    if (seen[comp.id]) { return; }
    seen[comp.id] = true;
    comp.motionBlur = true;
    for (j = 1; j <= comp.numLayers; j++) {
        l = comp.layer(j);
        if (l.nullLayer || !l.hasVideo) { continue; }
        try { l.motionBlur = true; } catch (e) {}
        if (l.source && l.source instanceof CompItem) { N3.motionBlur(l.source, seen); }
    }
};

// AE often ignores the font on the first text layer a script creates in a session (v1 and v3 both showed a serif first
// caption). Touch every Inter weight on a throwaway layer before building, then remove it.
N3.warmFonts = function () {
    var c = app.project.items.addComp("_font warm-up", 100, 100, 1, 1, N3.FPS), l = c.layers.addText("Aa"), tp, d, k, i;
    tp = l.property("ADBE Text Properties").property("ADBE Text Document");
    for (k in N3.FONT) {
        for (i = 0; i < 2; i++) { d = tp.value; d.font = N3.FONT[k]; d.fontSize = 20; tp.setValue(d); }
        if (tp.value.font !== N3.FONT[k]) { AEL.warn("Font " + N3.FONT[k] + " is not installed (AE used " + tp.value.font + ")"); }
    }
    c.remove();
};

