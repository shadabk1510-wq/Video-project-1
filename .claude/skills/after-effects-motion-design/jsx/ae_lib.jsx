// ae_lib.jsx - ES3 helper library for After Effects build scripts.
// Usage (from a script in the same folder):
//   #include "ae_lib.jsx"
//   AEL.run($.fileName, "Build Main", function () { ... });
// Do not run this file on its own. Keep it ES3: var, function expressions, no JSON/forEach/indexOf.

var AEL = {};

AEL.VERSION = "1.0.0";
AEL.result = { ok: false, script: "", aeVersion: "", log: [], warnings: [], created: [] };

// ---------------------------------------------------------------- utilities

AEL.stringify = function (v) {
    var t = typeof v, out = [], k, i;
    if (v === null || t === "undefined" || t === "function") { return "null"; }
    if (t === "number") { return isFinite(v) ? String(v) : "null"; }
    if (t === "boolean") { return v ? "true" : "false"; }
    if (t === "string") {
        return "\"" + v.replace(/[\\"]/g, "\\$&").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t") + "\"";
    }
    if (v instanceof Array) {
        for (i = 0; i < v.length; i++) { out.push(AEL.stringify(v[i])); }
        return "[" + out.join(",") + "]";
    }
    for (k in v) {
        if (v.hasOwnProperty(k) && typeof v[k] !== "function") { out.push(AEL.stringify(String(k)) + ":" + AEL.stringify(v[k])); }
    }
    return "{" + out.join(",") + "}";
};

AEL.log = function (msg) { AEL.result.log.push(String(msg)); $.writeln("[AEL] " + msg); };
AEL.warn = function (msg) { AEL.result.warnings.push(String(msg)); $.writeln("[AEL WARN] " + msg); };
AEL.created = function (kind, name) { AEL.result.created.push(kind + ": " + name); };

AEL.contains = function (arr, v) {
    var i;
    for (i = 0; i < arr.length; i++) { if (arr[i] === v) { return true; } }
    return false;
};

AEL.writeText = function (path, text) {
    var f = new File(path);
    f.encoding = "UTF-8";
    if (!f.open("w")) {
        throw new Error("Cannot write " + path + ". Enable Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network.");
    }
    f.write(text);
    f.close();
    return f.fsName;
};

AEL.readText = function (path) {
    var f = new File(path), s;
    if (!f.exists) { return null; }
    f.encoding = "UTF-8";
    f.open("r");
    s = f.read();
    f.close();
    return s;
};

// Parse JSON you produced yourself (timing.json etc.). Never feed untrusted text to this.
AEL.parseTrustedJSON = function (text) { return eval("(" + text + ")"); };

AEL.scriptDir = function (fileName) { return (new File(fileName)).parent.fsName; };

// Resolve a path relative to the running script (keeps projects portable).
AEL.rel = function (fileName, relPath) {
    if (/^(\/|[A-Za-z]:[\\\/]|~)/.test(relPath)) { return relPath; }
    return AEL.scriptDir(fileName) + "/" + relPath;
};

// "#RRGGBB" -> [r,g,b] in 0..1 (TextDocument colours, solids)
AEL.rgb = function (hex) {
    var h = String(hex).replace("#", "");
    if (h.length === 3) { h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2); }
    return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
};
// "#RRGGBB" -> [r,g,b,1] (colour properties: shape fill/stroke, effect colours)
AEL.rgba = function (hex) { var c = AEL.rgb(hex); c.push(1); return c; };

AEL.framesToSec = function (frames, comp) { return frames * comp.frameDuration; };
// Snap a time to the comp's frame grid to avoid keys between frames.
AEL.snap = function (t, comp) { return Math.round(t / comp.frameDuration) * comp.frameDuration; };

// ---------------------------------------------------------------- runner

// Wraps a build: undo group, suppressed dialogs, error capture, result file next to the script.
AEL.run = function (fileName, undoName, fn) {
    var resultPath = String(fileName).replace(/\.jsx(bin)?$/i, "") + ".result.json";
    AEL.result.script = (new File(fileName)).fsName;
    AEL.result.aeVersion = app.version;
    AEL.result.startedAt = (new Date()).toString();
    app.beginSuppressDialogs();
    app.beginUndoGroup(undoName);
    try {
        fn();
        if (AEL.pendingExpr.length) { AEL.retryExpressions(); }   // builds that never call it still get their warnings
        AEL.result.ok = true;
    } catch (e) {
        AEL.result.ok = false;
        AEL.result.error = e.toString() + (e.line ? " (line " + e.line + ")" : "");
    } finally {
        app.endUndoGroup();
        app.endSuppressDialogs(false);
    }
    AEL.result.finishedAt = (new Date()).toString();
    try {
        AEL.writeText(resultPath, AEL.stringify(AEL.result));
    } catch (e2) {
        $.writeln("[AEL] could not write result file: " + e2.toString());
    }
    return AEL.result;
};

// ---------------------------------------------------------------- project items

AEL.items = function (type) {
    var out = [], items = app.project.items, i;
    for (i = 1; i <= items.length; i++) { if (!type || items[i] instanceof type) { out.push(items[i]); } }
    return out;
};

AEL.findItem = function (name, type, parent) {
    var items = app.project.items, i, it;
    for (i = 1; i <= items.length; i++) {
        it = items[i];
        if (it.name === name && (!type || it instanceof type) && (!parent || it.parentFolder.id === parent.id)) { return it; }
    }
    return null;
};

// Get-or-create a project-panel folder.
AEL.folder = function (name, parent) {
    var f = AEL.findItem(name, FolderItem, parent || null);
    if (!f) {
        f = app.project.items.addFolder(name);
        AEL.created("folder", name);
    }
    if (parent) { f.parentFolder = parent; }
    return f;
};

// Standard folder set used by the skill. Returns {main, sections, precomps, footage, audio, graphics, reference, controls}.
AEL.standardFolders = function () {
    return {
        main: AEL.folder("01_Main"),
        sections: AEL.folder("02_Sections"),
        precomps: AEL.folder("03_Precomps"),
        footage: AEL.folder("04_Footage"),
        audio: AEL.folder("05_Audio"),
        graphics: AEL.folder("06_Graphics"),
        reference: AEL.folder("07_Reference"),
        controls: AEL.folder("08_Controls")
    };
};

// Create a comp. If one with the same name exists: reuse when opts.reuse, else throw (safe default).
AEL.comp = function (name, o) {
    var c = AEL.findItem(name, CompItem);
    if (c) {
        if (o.reuse) { return c; }
        throw new Error("Comp '" + name + "' already exists. Set CONFIG.rebuild or rename; refusing to modify it.");
    }
    c = app.project.items.addComp(name, o.width, o.height, o.pixelAspect || 1, o.duration, o.fps);
    if (o.folder) { c.parentFolder = o.folder; }
    if (o.bg) { c.bgColor = AEL.rgb(o.bg); }
    if (o.motionBlur) { c.motionBlur = true; }
    AEL.created("comp", name);
    return c;
};

// Remove items that a previous run of THIS script created (matched by exact name inside the given folder).
AEL.removeOwned = function (names, folder) {
    var i, it, removed = [];
    for (i = 0; i < names.length; i++) {
        it = AEL.findItem(names[i], null, folder);
        if (it) { it.remove(); removed.push(names[i]); }
    }
    if (removed.length) { AEL.log("Removed previous build items: " + removed.join(", ")); }
};

// Import footage/audio/still. Reuses an existing item that points at the same file.
AEL.importFile = function (path, folder, opts) {
    var f = new File(path), all, i, io, item;
    if (!f.exists) { throw new Error("Missing file: " + path); }
    all = AEL.items(FootageItem);
    for (i = 0; i < all.length; i++) {
        if (all[i].file && all[i].file.fsName === f.fsName) { return all[i]; }
    }
    io = new ImportOptions(f);
    if (opts && opts.sequence) { io.sequence = true; }
    if (opts && opts.asComp && io.canImportAs(ImportAsType.COMP_CROPPED_LAYERS)) { io.importAs = ImportAsType.COMP_CROPPED_LAYERS; }
    if (!io.canImportAs(io.importAs || ImportAsType.FOOTAGE)) { throw new Error("After Effects cannot import: " + f.fsName); }
    item = app.project.importFile(io);
    if (folder) { item.parentFolder = folder; }
    AEL.created("import", f.displayName);
    return item;
};

AEL.missingFootage = function () {
    var out = [], all = AEL.items(FootageItem), i;
    for (i = 0; i < all.length; i++) { if (all[i].footageMissing) { out.push(all[i].name); } }
    return out;
};

// ---------------------------------------------------------------- layers

AEL.xf = function (layer, matchName) { return layer.property("ADBE Transform Group").property(matchName); };

AEL.solid = function (comp, hex, name) {
    var l = comp.layers.addSolid(AEL.rgb(hex), name, comp.width, comp.height, comp.pixelAspect, comp.duration);
    return l;
};

AEL.nullLayer = function (comp, name) {
    var l = comp.layers.addNull(comp.duration);
    l.name = name;
    return l;
};

// Text layer with style. o: {font (PostScript), size, color, tracking, leading, justify:"left|center|right", name, pos:[x,y]}
AEL.text = function (comp, str, o) {
    var layer = comp.layers.addText(str), prop, doc, got;
    o = o || {};
    prop = layer.property("ADBE Text Properties").property("ADBE Text Document");
    doc = prop.value;
    if (o.font) { doc.font = o.font; }
    doc.fontSize = o.size || 72;
    doc.applyFill = true;
    doc.fillColor = AEL.rgb(o.color || "#FFFFFF");
    doc.applyStroke = false;
    if (o.tracking !== undefined) { doc.tracking = o.tracking; }
    if (o.leading) { doc.autoLeading = false; doc.leading = o.leading; }
    doc.justification = o.justify === "left" ? ParagraphJustification.LEFT_JUSTIFY :
        (o.justify === "right" ? ParagraphJustification.RIGHT_JUSTIFY : ParagraphJustification.CENTER_JUSTIFY);
    prop.setValue(doc);
    got = prop.value.font;
    if (o.font && got !== o.font) {
        // AE sometimes ignores the first font assignment of a session: re-apply once before warning.
        doc = prop.value;
        doc.font = o.font;
        prop.setValue(doc);
        got = prop.value.font;
        if (got !== o.font) { AEL.warn("Font '" + o.font + "' not available; AE substituted '" + got + "'."); }
    }
    layer.name = o.name || str.substr(0, 24);
    AEL.anchorCenter(layer);
    AEL.xf(layer, "ADBE Position").setValue(o.pos || [comp.width / 2, comp.height / 2]);
    return layer;
};

// Put the anchor at the visual centre of the layer's content (text or shapes).
AEL.anchorCenter = function (layer, t) {
    var r = layer.sourceRectAtTime(t || 0, false);
    AEL.xf(layer, "ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
};

// Shape layer with one rectangle group. o: {w, h, color, round, stroke:{color,width}, name, pos}
AEL.rect = function (comp, o) {
    var layer = comp.layers.addShape(), grp, contents, rect;
    layer.name = o.name || "Rect";
    grp = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    grp.name = "Rect";
    contents = grp.property("ADBE Vectors Group");
    rect = contents.addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([o.w, o.h]);
    if (o.round) { rect.property("ADBE Vector Rect Roundness").setValue(o.round); }
    // Re-fetch the contents group after each addProperty; earlier references can become invalid.
    if (o.color) {
        layer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group")
            .addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(AEL.rgba(o.color));
    }
    if (o.stroke) {
        AEL.addStroke(layer.property("ADBE Root Vectors Group").property(1), o.stroke.color, o.stroke.width);
    }
    if (o.pos) { AEL.xf(layer, "ADBE Position").setValue(o.pos); }
    return layer;
};

AEL.addStroke = function (vectorGroup, hex, width) {
    var s = vectorGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    s.property("ADBE Vector Stroke Color").setValue(AEL.rgba(hex));
    s.property("ADBE Vector Stroke Width").setValue(width || 4);
    return s;
};

// Open path (line) from p1 to p2 in layer space, stroked. Pair with AEL.trim for draw-on lines.
AEL.line = function (comp, p1, p2, hex, width, name) {
    var layer = comp.layers.addShape(), grp, pathProp, shp;
    layer.name = name || "Line";
    grp = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    pathProp = grp.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Group");
    shp = new Shape();
    shp.vertices = [p1, p2];
    shp.closed = false;
    pathProp.property("ADBE Vector Shape").setValue(shp);
    AEL.addStroke(layer.property("ADBE Root Vectors Group").property(1), hex, width);
    AEL.xf(layer, "ADBE Position").setValue([0, 0]);
    AEL.xf(layer, "ADBE Anchor Point").setValue([0, 0]);
    return layer;
};

// Add Trim Paths to the first group of a shape layer; returns the Trim Paths property group.
AEL.trim = function (shapeLayer) {
    return shapeLayer.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group")
        .addProperty("ADBE Vector Filter - Trim");
};

// Rectangular mask in layer space. Returns the mask. mode: MaskMode.ADD (default), SUBTRACT, INTERSECT...
AEL.maskRect = function (layer, l, t, r, b, feather, mode) {
    var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), s = new Shape();
    s.vertices = [[l, t], [r, t], [r, b], [l, b]];
    s.closed = true;
    m.property("ADBE Mask Shape").setValue(s);
    if (feather) { m.property("ADBE Mask Feather").setValue([feather, feather]); }
    m.maskMode = mode || MaskMode.ADD;
    return m;
};

// Track matte that works on AE 2023+ (any layer) and older (matte moved directly above).
// type: TrackMatteType.ALPHA | ALPHA_INVERTED | LUMA | LUMA_INVERTED
AEL.trackMatte = function (layer, matteLayer, type) {
    type = type || TrackMatteType.ALPHA;
    if (typeof layer.setTrackMatte === "function") {
        layer.setTrackMatte(matteLayer, type);
        matteLayer.enabled = false;
    } else {
        matteLayer.moveBefore(layer);
        layer.trackMatteType = type;
    }
};

AEL.effect = function (layer, matchName, name) {
    var fx = layer.property("ADBE Effect Parade").addProperty(matchName);
    if (name) { fx.name = name; }
    return fx;
};

AEL.compMarker = function (comp, t, comment, duration) {
    var m = new MarkerValue(comment);
    if (duration) { m.duration = duration; }
    comp.markerProperty.setValueAtTime(t, m);
};

AEL.layerMarker = function (layer, t, comment, duration) {
    var m = new MarkerValue(comment);
    if (duration) { m.duration = duration; }
    layer.property("ADBE Marker").setValueAtTime(t, m);
};

// Precompose layers (array of Layer objects). Returns the new CompItem.
AEL.precompose = function (comp, layers, name, folder) {
    var idx = [], i, pc;
    for (i = 0; i < layers.length; i++) { idx.push(layers[i].index); }
    pc = comp.layers.precompose(idx, name, true);
    if (folder) { pc.parentFolder = folder; }
    AEL.created("precomp", name);
    return pc;
};

// Place an item (comp/footage) as a layer, trimmed to [start, end] in seconds.
AEL.place = function (comp, item, start, end, name) {
    var l = comp.layers.add(item);
    l.startTime = start;
    if (end !== undefined && end > start) { l.outPoint = end; }
    if (name) { l.name = name; }
    return l;
};

// ---------------------------------------------------------------- keyframes

// Number of KeyframeEase objects setTemporalEaseAtKey expects for a property.
AEL.easeDims = function (prop) {
    var t = prop.propertyValueType;
    if (t === PropertyValueType.TwoD) { return 2; }
    if (t === PropertyValueType.ThreeD) { return 3; }
    return 1; // OneD, COLOR, TwoD_SPATIAL, ThreeD_SPATIAL, ...
};

AEL.EASE = {
    linear: null,
    easy: [33.33, 33.33],       // AE default Easy Ease
    smooth: [60, 60],
    // [inInfluence, outInfluence] applied to every key. In a 2-key move the first key's OUT and
    // the last key's IN shape the curve: low out + high in = fast start, long settle.
    expoOut: [85, 12],          // fast start, long settle (UI entrances)
    expoIn: [12, 85],           // slow build, fast finish (exits)
    snappy: [90, 90]
};

// Set keys and easing. times/values arrays; ease = AEL.EASE.* or [inInfluence, outInfluence]; hold = stepped keys.
AEL.key = function (prop, times, values, ease, hold) {
    var i, k, d, inE, outE, tries, ok, j, keyIdx = [];
    for (i = 0; i < times.length; i++) {
        prop.setValueAtTime(times[i], values[i]);
        keyIdx.push(prop.nearestKeyIndex(times[i]));
    }
    for (i = 0; i < keyIdx.length; i++) {
        k = keyIdx[i];
        if (hold) {
            prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
        } else if (ease) {
            prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            tries = [AEL.easeDims(prop), 1, 2, 3];
            ok = false;
            for (j = 0; j < tries.length && !ok; j++) {
                inE = []; outE = [];
                for (d = 0; d < tries[j]; d++) { inE.push(new KeyframeEase(0, ease[0])); outE.push(new KeyframeEase(0, ease[1])); }
                try { prop.setTemporalEaseAtKey(k, inE, outE); ok = true; } catch (e) { ok = false; }
            }
            if (!ok) { AEL.warn("Could not set ease on " + prop.name + " key " + k); }
        }
    }
    return prop;
};

// Set an expression and report errors AE detects immediately.
// AE validates an expression the moment it is set: if it names a layer that doesn't exist yet, AE disables it.
// Such expressions are remembered (layer + property index path) and re-enabled by AEL.retryExpressions() once the
// whole comp is built; only the ones that still fail are reported.
AEL.pendingExpr = [];
AEL.expr = function (prop, code) {
    var path = [], p, layer;
    prop.expression = code;
    try {
        if (prop.expressionError) {
            layer = prop.propertyGroup(prop.propertyDepth);
            for (p = prop; p.propertyDepth > 0; p = p.parentProperty) { path.unshift(p.propertyIndex); }
            AEL.pendingExpr.push({ layer: layer, path: path, name: prop.name, first: prop.expressionError });
        }
    } catch (e) { AEL.warn("Expression on " + prop.name + ": " + e); }
    return prop;
};
AEL.retryExpressions = function () {
    var i, j, it, p;
    for (i = 0; i < AEL.pendingExpr.length; i++) {
        it = AEL.pendingExpr[i];
        try {
            p = it.layer;
            for (j = 0; j < it.path.length; j++) { p = p.property(it.path[j]); }
            p.expressionEnabled = true;
            if (p.expressionError) { AEL.warn("Expression error on " + it.layer.name + " / " + it.name + ": " + p.expressionError); }
        } catch (e) { AEL.warn("Expression retry failed on " + it.name + ": " + e + " (first error: " + it.first + ")"); }
    }
    AEL.pendingExpr = [];
};

// ---------------------------------------------------------------- text animation

// Per-unit reveal using a text animator (editable in the timeline).
// o: {start, duration, basedOn:"characters|words|lines", y (px offset), opacity (0), blur, scale, ease, wave:true}
AEL.textReveal = function (layer, o) {
    var BASED = { characters: 1, charactersExcludingSpaces: 2, words: 3, lines: 4 };
    var animators = function () { return layer.property("ADBE Text Properties").property("ADBE Text Animators"); };
    var ai = animators().addProperty("ADBE Text Animator").propertyIndex;
    var anim = function () { return animators().property(ai); };
    var props = function () { return anim().property("ADBE Text Animator Properties"); };
    var sel, adv, startT = o.start || 0, dur = o.duration || 0.8, ease = o.ease || AEL.EASE.expoOut;

    anim().name = o.name || "Reveal";
    props().addProperty("ADBE Text Opacity");
    props().property("ADBE Text Opacity").setValue(o.opacity === undefined ? 0 : o.opacity);
    if (o.y) {
        props().addProperty("ADBE Text Position 3D");
        props().property("ADBE Text Position 3D").setValue([0, o.y, 0]);
    }
    if (o.scale) {
        props().addProperty("ADBE Text Scale 3D");
        props().property("ADBE Text Scale 3D").setValue([o.scale, o.scale, 100]);
    }
    if (o.blur) {
        props().addProperty("ADBE Text Blur");
        props().property("ADBE Text Blur").setValue([o.blur, o.blur]);
    }
    anim().property("ADBE Text Selectors").addProperty("ADBE Text Selector");
    sel = function () { return anim().property("ADBE Text Selectors").property(1); };
    adv = function () { return sel().property("ADBE Text Range Advanced"); };
    try { adv().property("ADBE Text Range Type2").setValue(BASED[o.basedOn || "characters"]); } catch (e1) { AEL.warn("Based On not set: " + e1); }

    if (o.wave) {
        // Soft overlapping wave: Ramp Up window slides across via Offset.
        try { adv().property("ADBE Text Range Shape").setValue(2); } catch (e2) { AEL.warn("Range shape not set: " + e2); }
        sel().property("ADBE Text Percent End").setValue(o.waveWidth || 40);
        AEL.key(sel().property("ADBE Text Percent Offset"), [startT, startT + dur], [-(o.waveWidth || 40), 100], ease);
    } else {
        AEL.key(sel().property("ADBE Text Percent Start"), [startT, startT + dur], [0, 100], ease);
    }
    return anim();
};

// ---------------------------------------------------------------- save / render

// Save without overwriting: name.aep, then name_v002.aep, name_v003.aep ...
AEL.saveIncremental = function (dirPath, baseName) {
    var dir = new Folder(dirPath), n = 1, f, pad;
    if (!dir.exists) { dir.create(); }
    f = new File(dir.fsName + "/" + baseName + ".aep");
    while (f.exists) {
        n++;
        pad = ("00" + n).slice(-3);
        f = new File(dir.fsName + "/" + baseName + "_v" + pad + ".aep");
    }
    app.project.save(f);
    AEL.result.savedProject = f.fsName;
    AEL.log("Saved " + f.fsName);
    return f.fsName;
};

// Queue a comp for rendering (does NOT start the render). template is an Output Module template name.
AEL.queueRender = function (comp, outPath, template) {
    var rq = app.project.renderQueue.items.add(comp), om = rq.outputModule(1);
    if (template) {
        try { om.applyTemplate(template); } catch (e) { AEL.warn("Output module template not found: " + template); }
    }
    om.file = new File(outPath);
    AEL.created("render-queue", comp.name + " -> " + outPath);
    return rq;
};
