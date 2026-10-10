// export_template.jsx: writes a JSON description of an After Effects template so its style and motion can be studied
// and rebuilt: comps, layers, effects, layer styles, text styles, shape contents, keyframes with their easing,
// expressions, cameras and lights. Read-only: it changes nothing in the project.
//
// How to use: open the template project, open the main comp in the timeline (click into it), then
// File > Scripts > Run Script File... > export_template.jsx. It exports that comp and every precomp inside it
// (with no comp open, it exports all comps). The JSON is saved next to the .aep (or on the Desktop if the
// project was never saved), and a message shows where. Needs Preferences > Scripting & Expressions >
// "Allow Scripts to Write Files and Access Network".

(function () {
    var MAX_KEYS = 600, out, comps = [], seen = {}, i, f, text, file, root;

    function r(x) { return Math.round(x * 10000) / 10000; }
    function esc(s) {
        var o = "", c, k, h;
        s = String(s);
        for (k = 0; k < s.length; k++) {
            c = s.charCodeAt(k);
            if (c === 34) { o += "\\\""; } else if (c === 92) { o += "\\\\"; }
            else if (c === 10) { o += "\\n"; } else if (c === 13) { o += "\\r"; } else if (c === 9) { o += "\\t"; }
            else if (c < 32 || c > 126) { h = c.toString(16); while (h.length < 4) { h = "0" + h; } o += "\\u" + h; }
            else { o += s.charAt(k); }
        }
        return "\"" + o + "\"";
    }
    function json(v) {
        var a = [], k;
        if (v === null || v === undefined) { return "null"; }
        if (typeof v === "number") { return isFinite(v) ? String(r(v)) : "null"; }
        if (typeof v === "boolean") { return v ? "true" : "false"; }
        if (typeof v === "string") { return esc(v); }
        if (isList(v)) { for (k = 0; k < v.length; k++) { a.push(json(v[k])); } return "[" + a.join(",") + "]"; }
        for (k in v) { if (v.hasOwnProperty(k) && v[k] !== undefined) { a.push(esc(k) + ":" + json(v[k])); } }
        return "{" + a.join(",") + "}";
    }
    function attempt(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
    function isList(v) { return v instanceof Array || (typeof v === "object" && typeof v.length === "number" && v.vertices === undefined); }

    function value(v) {
        var o, k;
        if (v === null || v === undefined) { return null; }
        if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") { return v; }
        if (isList(v)) { o = []; for (k = 0; k < v.length; k++) { o.push(value(v[k])); } return o; }
        if (v.vertices !== undefined) {   // Shape
            return { shape: { v: v.vertices, i: v.inTangents, o: v.outTangents, closed: v.closed } };
        }
        if (v.fontSize !== undefined) {   // TextDocument
            o = { text: v.text };
            o.font = attempt(function () { return v.font; }); o.fontSize = attempt(function () { return v.fontSize; });
            o.fill = attempt(function () { return v.applyFill ? v.fillColor : null; });
            o.stroke = attempt(function () { return v.applyStroke ? v.strokeColor : null; });
            o.strokeWidth = attempt(function () { return v.applyStroke ? v.strokeWidth : null; });
            o.tracking = attempt(function () { return v.tracking; }); o.leading = attempt(function () { return v.autoLeading ? "auto" : v.leading; });
            o.justification = attempt(function () { return v.justification; }); o.allCaps = attempt(function () { return v.allCaps; });
            o.boxText = attempt(function () { return v.boxText ? v.boxTextSize : null; });
            return { textDocument: o };
        }
        if (v.comment !== undefined) { return { marker: { comment: v.comment, duration: v.duration } }; }   // MarkerValue
        return null;
    }

    function ease(arr) {
        var o = [], k;
        for (k = 0; k < arr.length; k++) { o.push([arr[k].speed, arr[k].influence]); }
        return o;
    }

    function leaf(p) {
        var o = { n: p.name, m: p.matchName }, k, keys = [], kk, n;
        if (attempt(function () { return p.propertyValueType === PropertyValueType.NO_VALUE; }, false)) { return null; }
        n = attempt(function () { return p.numKeys; }, 0);
        if (n > 0) {
            for (k = 1; k <= Math.min(n, MAX_KEYS); k++) {
                kk = { t: p.keyTime(k), v: value(attempt(function () { return p.keyValue(k); })) };
                kk.ii = attempt(function () { return p.keyInInterpolationType(k); });
                kk.oi = attempt(function () { return p.keyOutInterpolationType(k); });
                kk.ie = attempt(function () { return ease(p.keyInTemporalEase(k)); });
                kk.oe = attempt(function () { return ease(p.keyOutTemporalEase(k)); });
                if (attempt(function () { return p.isSpatial; }, false)) {
                    kk.st = [attempt(function () { return p.keyInSpatialTangent(k); }), attempt(function () { return p.keyOutSpatialTangent(k); })];
                    kk.rov = attempt(function () { return p.keyRoving(k); });
                }
                keys.push(kk);
            }
            o.keys = keys;
            if (n > MAX_KEYS) { o.keysTruncated = n; }
        }
        if (attempt(function () { return p.expressionEnabled && p.expression !== ""; }, false)) { o.expr = p.expression; }
        if (!o.keys) {
            if (!o.expr && attempt(function () { return p.isModified === false; }, false)) { return null; }   // still at its default
            o.v = value(attempt(function () { return p.value; }));
        }
        return o;
    }

    function group(g) {
        var o = { n: g.name, m: g.matchName, kids: [] }, k, c, d;
        if (attempt(function () { return g.canSetEnabled && !g.enabled; }, false)) { o.off = true; }
        for (k = 1; k <= g.numProperties; k++) {
            c = g.property(k);
            d = attempt(function () { return c.propertyType === PropertyType.PROPERTY ? leaf(c) : group(c); });
            if (d && (d.kids === undefined || d.kids.length)) { o.kids.push(d); }
        }
        return o;
    }

    function layerType(L) {
        var m = attempt(function () { return L.matchName; }, "");
        if (m) { return m.replace("ADBE ", "").replace(" Layer", "").toLowerCase(); }
        if (attempt(function () { return L.nullLayer; }, false)) { return "null"; }
        return "layer";
    }

    function layer(L, comp) {
        var o = { i: L.index, name: L.name, type: layerType(L) }, s = L.source, k;
        if (s) {
            o.src = { name: s.name, kind: (s instanceof CompItem) ? "comp" : "footage", w: attempt(function () { return s.width; }), h: attempt(function () { return s.height; }) };
            if (s instanceof CompItem) { collect(s); }
            else { o.src.still = attempt(function () { return s.mainSource.isStill; }); o.src.solid = attempt(function () { return s.mainSource.color ? s.mainSource.color : undefined; }); }
        }
        o.start = L.startTime; o.in = L.inPoint; o.out = L.outPoint; o.stretch = attempt(function () { return L.stretch; });
        o.parent = attempt(function () { return L.parent ? L.parent.index : null; });
        o.threeD = attempt(function () { return L.threeDLayer; }); o.blend = attempt(function () { return L.blendingMode; });
        o.matte = attempt(function () { return L.trackMatteType; });
        o.matteLayer = attempt(function () { return L.trackMatteLayer ? L.trackMatteLayer.index : undefined; });
        o.isMatte = attempt(function () { return L.isTrackMatte; });
        o.collapse = attempt(function () { return L.collapseTransformation; }); o.mb = attempt(function () { return L.motionBlur; });
        o.adj = attempt(function () { return L.adjustmentLayer; }); o.enabled = L.enabled; o.guide = attempt(function () { return L.guideLayer; });
        o.label = attempt(function () { return L.label; }); o.autoOrient = attempt(function () { return L.autoOrient; });
        o.props = [];
        for (k = 1; k <= L.numProperties; k++) {
            (function (p) {
                var d = attempt(function () { return p.propertyType === PropertyType.PROPERTY ? leaf(p) : group(p); });
                if (d && (d.kids === undefined || d.kids.length)) { o.props.push(d); }
            })(L.property(k));
        }
        return o;
    }

    function collect(c) {
        if (seen[c.id]) { return; }
        seen[c.id] = true;
        var o = { name: c.name, w: c.width, h: c.height, dur: c.duration, fps: c.frameRate, par: c.pixelAspect, bg: c.bgColor,
            mb: c.motionBlur, shutter: attempt(function () { return [c.shutterAngle, c.shutterPhase]; }),
            renderer: attempt(function () { return c.renderer; }), layers: [] }, k, m = c.markerProperty;
        o.markers = [];
        for (k = 1; k <= m.numKeys; k++) { o.markers.push({ t: m.keyTime(k), v: value(m.keyValue(k)) }); }
        comps.push(o);
        for (k = 1; k <= c.numLayers; k++) {
            (function (L) { o.layers.push(attempt(function () { return layer(L, c); }, { i: L.index, name: L.name, error: "could not read" })); })(c.layer(k));
        }
    }

    root = app.project.activeItem;
    if (root instanceof CompItem) { collect(root); }
    else { for (i = 1; i <= app.project.numItems; i++) { if (app.project.item(i) instanceof CompItem) { collect(app.project.item(i)); } } }
    if (!comps.length) { alert("No comps found. Open the template's main comp and run the script again."); return; }

    out = { exporter: "export_template.jsx v1", ae: app.version, project: app.project.file ? app.project.file.name : "(unsaved)",
        root: (root instanceof CompItem) ? root.name : null, exportedAt: (new Date()).toString(), comps: comps };
    text = json(out);
    f = app.project.file ? app.project.file.parent.fsName : Folder.desktop.fsName;
    file = new File(f + "/" + ((root instanceof CompItem) ? root.name : "all_comps").replace(/[\\\/:*?"<>|]/g, "_") + "_template.json");
    file.encoding = "UTF-8";
    if (!file.open("w")) { alert("Could not write " + file.fsName + ". Turn on Preferences > Scripting & Expressions > Allow Scripts to Write Files."); return; }
    file.write(text); file.close();
    alert("Template exported: " + comps.length + " comps.\n" + file.fsName + "\n(" + Math.round(text.length / 1024) + " KB) - upload this file.");
})();
