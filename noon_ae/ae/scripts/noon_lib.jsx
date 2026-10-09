// noon_lib.jsx - NOON project building blocks on top of ae_lib.jsx (ES3).
// Shapes, tiles, cards, captions and motion presets used by the build scripts.

var NL = {};

NL.COL = { navy: "#163452", verm: "#F4512B", ivory: "#F3EEE3", blue: "#A9CFE2", white: "#FFFFFF", paper: "#FBF8F2" };
NL.FONT = { cap: "Inter-SemiBold", bold: "Inter-Bold", black: "Inter-Black", med: "Inter-Medium" };

// ------------------------------------------------------------------ shapes

// Null used as a group controller; anchor at [0,0] so children at [0,0] sit exactly on it.
NL.ctrl = function (comp, name, pos) {
    var n = AEL.nullLayer(comp, name);
    AEL.xf(n, "ADBE Anchor Point").setValue([0, 0]);
    AEL.xf(n, "ADBE Position").setValue(pos || [comp.width / 2, comp.height / 2]);
    return n;
};

NL.shape = function (comp, name, pos) {
    var l = comp.layers.addShape();
    l.name = name;
    AEL.xf(l, "ADBE Anchor Point").setValue([0, 0]);
    AEL.xf(l, "ADBE Position").setValue(pos || [comp.width / 2, comp.height / 2]);
    return l;
};

NL.group = function (layer, name) {
    var g = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
    g.name = name || "Group";
    return g.propertyIndex;
};
NL.contents = function (layer, gi) { return layer.property("ADBE Root Vectors Group").property(gi).property("ADBE Vectors Group"); };
NL.gxf = function (layer, gi) { return layer.property("ADBE Root Vectors Group").property(gi).property("ADBE Vector Transform Group"); };

NL.ellipse = function (layer, gi, d, pos) {
    var e = NL.contents(layer, gi).addProperty("ADBE Vector Shape - Ellipse");
    e.property("ADBE Vector Ellipse Size").setValue([d, d]);
    if (pos) { e.property("ADBE Vector Ellipse Position").setValue(pos); }
    return e;
};
NL.rect = function (layer, gi, w, h, round, pos) {
    var r = NL.contents(layer, gi).addProperty("ADBE Vector Shape - Rect");
    r.property("ADBE Vector Rect Size").setValue([w, h]);
    if (round) { r.property("ADBE Vector Rect Roundness").setValue(round); }
    if (pos) { r.property("ADBE Vector Rect Position").setValue(pos); }
    return r;
};
// verts: [[x,y],...]; optional bezier tangents
NL.path = function (layer, gi, verts, closed, inT, outT) {
    var p = NL.contents(layer, gi).addProperty("ADBE Vector Shape - Group"), s = new Shape();
    s.vertices = verts;
    if (inT) { s.inTangents = inT; }
    if (outT) { s.outTangents = outT; }
    s.closed = !!closed;
    p.property("ADBE Vector Shape").setValue(s);
    return p;
};
NL.star = function (layer, gi, outer, inner, pos) {
    var s = NL.contents(layer, gi).addProperty("ADBE Vector Shape - Star");
    s.property("ADBE Vector Star Type").setValue(1);
    s.property("ADBE Vector Star Points").setValue(4);
    s.property("ADBE Vector Star Outer Radius").setValue(outer);
    s.property("ADBE Vector Star Inner Radius").setValue(inner);
    if (pos) { s.property("ADBE Vector Star Position").setValue(pos); }
    return s;
};
NL.fill = function (layer, gi, hex, opacity) {
    var f = NL.contents(layer, gi).addProperty("ADBE Vector Graphic - Fill");
    f.property("ADBE Vector Fill Color").setValue(AEL.rgba(hex));
    if (opacity !== undefined) { f.property("ADBE Vector Fill Opacity").setValue(opacity); }
    return f;
};
NL.stroke = function (layer, gi, hex, width, opacity) {
    var s = NL.contents(layer, gi).addProperty("ADBE Vector Graphic - Stroke");
    s.property("ADBE Vector Stroke Color").setValue(AEL.rgba(hex));
    s.property("ADBE Vector Stroke Width").setValue(width);
    if (opacity !== undefined) { s.property("ADBE Vector Stroke Opacity").setValue(opacity); }
    try { s.property("ADBE Vector Stroke Line Cap").setValue(2); s.property("ADBE Vector Stroke Line Join").setValue(2); } catch (e) {}
    return s;
};
NL.trim = function (layer, gi) { return NL.contents(layer, gi).addProperty("ADBE Vector Filter - Trim"); };

// Solid-colour rounded rectangle layer centred on pos.
NL.box = function (comp, name, w, h, round, hex, pos, opacity) {
    var l = NL.shape(comp, name, pos), gi = NL.group(l, "Box");
    NL.rect(l, gi, w, h, round);
    NL.fill(l, gi, hex, opacity);
    return l;
};
NL.circle = function (comp, name, d, hex, pos) {
    var l = NL.shape(comp, name, pos), gi = NL.group(l, "Disc");
    NL.ellipse(l, gi, d);
    NL.fill(l, gi, hex);
    return l;
};

NL.shadow = function (layer, opacity255, distance, softness) {
    try {
        var fx = AEL.effect(layer, "ADBE Drop Shadow", "Soft Shadow");
        fx.property("ADBE Drop Shadow-0001").setValue(AEL.rgba(NL.COL.navy));
        fx.property("ADBE Drop Shadow-0002").setValue(opacity255 || 45);
        fx.property("ADBE Drop Shadow-0003").setValue(180);
        fx.property("ADBE Drop Shadow-0004").setValue(distance || 16);
        fx.property("ADBE Drop Shadow-0005").setValue(softness || 50);
    } catch (e) { AEL.warn("Drop shadow skipped on " + layer.name + ": " + e); }
};
NL.blurFx = function (layer, amount) {
    var fx = AEL.effect(layer, "ADBE Gaussian Blur 2", "Blur");
    fx.property("ADBE Gaussian Blur 2-0001").setValue(amount || 0);
    try { fx.property("ADBE Gaussian Blur 2-0003").setValue(1); } catch (e) {}
    return fx.property("ADBE Gaussian Blur 2-0001");
};

// ------------------------------------------------------------------ NOON wordmark (from NOON-logo.svg, 450x112)

NL.LOGO = {
    N1: { c: [54.5, 55.5], v: [[0, 1], [42, 1], [75, 40], [75, 1], [109, 1], [109, 110], [70, 110], [39, 73], [39, 110], [0, 110]] },
    O1: { c: [168, 56], o: 112, hole: [194, 57], h: 24 },
    O2: { c: [281.5, 56], o: 112, hole: [309.5, 57], h: 24 },
    N2: { c: [396, 56.5], v: [[342, 1], [385, 1], [416, 40], [416, 1], [450, 1], [450, 112], [412, 112], [381, 74], [381, 112], [342, 112]] }
};

// Builds the wordmark as 4 editable shape layers parented to a null. Returns {ctrl, letters[]}.
// The null's scale sets the size (100% = 450 px wide); pos is the wordmark centre.
NL.logo = function (comp, name, pos, scalePct, hex) {
    var ctrl = NL.ctrl(comp, name, pos), keys = ["N1", "O1", "O2", "N2"], letters = [], i, k, L, l, gi, v, j, rel, fillP, hole;
    AEL.xf(ctrl, "ADBE Position").setValue(pos);
    AEL.xf(ctrl, "ADBE Scale").setValue([scalePct, scalePct]);
    for (i = 0; i < keys.length; i++) {
        k = keys[i]; L = NL.LOGO[k];
        l = NL.shape(comp, name + " " + k, [0, 0]);
        gi = NL.group(l, k);
        if (L.v) {
            rel = [];
            for (j = 0; j < L.v.length; j++) { rel.push([L.v[j][0] - L.c[0], L.v[j][1] - L.c[1]]); }
            NL.path(l, gi, rel, true);
            NL.fill(l, gi, hex || NL.COL.navy);
        } else {
            NL.ellipse(l, gi, L.o, [0, 0]);
            NL.ellipse(l, gi, L.h, [L.hole[0] - L.c[0], L.hole[1] - L.c[1]]);
            fillP = NL.fill(l, gi, hex || NL.COL.navy);
            try { fillP.property("ADBE Vector Fill Rule").setValue(2); } // even-odd punches the counter
            catch (e) {
                AEL.warn("Fill rule unavailable; drawing ivory counter on " + k);
                hole = NL.group(l, "Counter");
                NL.ellipse(l, hole, L.h, [L.hole[0] - L.c[0], L.hole[1] - L.c[1]]);
                NL.fill(l, hole, NL.COL.paper);
            }
        }
        l.parent = ctrl;
        AEL.xf(l, "ADBE Position").setValue([L.c[0] - 225, L.c[1] - 56]);
        AEL.xf(l, "ADBE Scale").setValue([100, 100]);
        l.motionBlur = true;
        letters.push(l);
    }
    return { ctrl: ctrl, letters: letters };
};

// ------------------------------------------------------------------ media tiles

// Image/footage fitted to a width; returns the layer.
NL.media = function (comp, item, name, pos, width) {
    var l = comp.layers.add(item), s = width / item.width * 100;
    l.name = name;
    AEL.xf(l, "ADBE Scale").setValue([s, s]);
    AEL.xf(l, "ADBE Position").setValue(pos);
    l.motionBlur = true;
    return l;
};

// Rounded tile: shadow card + media (matted to rounded rect). All parented to a null at pos.
// o: {w, h, round, mediaWidth, mediaOffset:[x,y]}
NL.tile = function (comp, item, name, pos, o) {
    var ctrl = NL.ctrl(comp, name, pos), back, med, matte;
    AEL.xf(ctrl, "ADBE Position").setValue(pos);
    back = NL.box(comp, name + " Card", o.w, o.h, o.round || 28, NL.COL.white, [0, 0]);
    NL.shadow(back, 50, 18, 60);
    med = NL.media(comp, item, name + " Media", [0, 0], o.mediaWidth || o.w);
    matte = NL.box(comp, name + " Matte", o.w, o.h, o.round || 28, NL.COL.white, [0, 0]);
    back.parent = ctrl; med.parent = ctrl; matte.parent = ctrl;
    AEL.xf(back, "ADBE Position").setValue([0, 0]);
    AEL.xf(med, "ADBE Position").setValue(o.mediaOffset || [0, 0]);
    AEL.xf(matte, "ADBE Position").setValue([0, 0]);
    matte.moveBefore(med);
    AEL.trackMatte(med, matte, TrackMatteType.ALPHA);
    return { ctrl: ctrl, media: med, card: back, matte: matte };
};

// Pill label (rounded, text inside). Returns null controlling it.
NL.pill = function (comp, name, text, pos, o) {
    o = o || {};
    var ctrl = NL.ctrl(comp, name, pos), size = o.size || 22, t, r, w, bg;
    AEL.xf(ctrl, "ADBE Position").setValue(pos);
    t = AEL.text(comp, text, { font: o.font || NL.FONT.bold, size: size, color: o.color || NL.COL.white, tracking: o.tracking === undefined ? 80 : o.tracking, name: name + " Text" });
    r = t.sourceRectAtTime(0, false);
    w = r.width + size * 1.8;
    bg = NL.box(comp, name + " BG", w, size * 2.1, size * 1.05, o.bg || NL.COL.navy, [0, 0]);
    bg.moveAfter(t);
    t.parent = ctrl; bg.parent = ctrl;
    AEL.xf(t, "ADBE Position").setValue([0, 0]);
    AEL.xf(bg, "ADBE Position").setValue([0, 0]);
    return ctrl;
};

// ------------------------------------------------------------------ step cards + icons

NL.icon = function (comp, kind, name) {
    var l = NL.shape(comp, name, [0, 0]), g, n = NL.COL.navy, v = NL.COL.verm;
    if (kind === "doc") {
        g = NL.group(l, "Page"); NL.rect(l, g, 32, 40, 5); NL.stroke(l, g, n, 3);
        g = NL.group(l, "Lines"); NL.path(l, g, [[-8, -6], [8, -6]]); NL.path(l, g, [[-8, 2], [8, 2]]); NL.path(l, g, [[-8, 10], [3, 10]]); NL.stroke(l, g, n, 3);
        g = NL.group(l, "Accent"); NL.path(l, g, [[-8, -13], [8, -13]]); NL.stroke(l, g, v, 3);
    } else if (kind === "target") {
        g = NL.group(l, "Rings"); NL.ellipse(l, g, 40); NL.ellipse(l, g, 22); NL.stroke(l, g, n, 3);
        g = NL.group(l, "Dot"); NL.ellipse(l, g, 9); NL.fill(l, g, v);
    } else if (kind === "rules") {
        g = NL.group(l, "Bars"); NL.rect(l, g, 26, 6, 3, [-5, 0]); NL.rect(l, g, 16, 6, 3, [-10, 12]); NL.fill(l, g, n);
        g = NL.group(l, "Top"); NL.rect(l, g, 36, 6, 3, [0, -12]); NL.fill(l, g, v);
    } else if (kind === "formats") {
        g = NL.group(l, "Back"); NL.rect(l, g, 24, 24, 5, [-8, -8]); NL.rect(l, g, 24, 24, 5, [0, 0]); NL.stroke(l, g, n, 3);
        g = NL.group(l, "Front"); NL.rect(l, g, 24, 24, 5, [8, 8]); NL.fill(l, g, v);
    } else if (kind === "check") {
        g = NL.group(l, "Ring"); NL.ellipse(l, g, 40); NL.stroke(l, g, n, 3);
        g = NL.group(l, "Tick"); NL.path(l, g, [[-9, 0], [-3, 7], [10, -7]]); NL.stroke(l, g, v, 4);
    } else { // folder
        g = NL.group(l, "Folder"); NL.path(l, g, [[-20, -13], [-7, -13], [-2, -8], [20, -8], [20, 14], [-20, 14]], true); NL.stroke(l, g, n, 3);
        g = NL.group(l, "Accent"); NL.path(l, g, [[-8, 4], [9, 4]]); NL.stroke(l, g, v, 3);
    }
    return l;
};

// White step card: icon + number + 2-line label. Returns the controlling null.
NL.card = function (comp, num, label, kind, pos) {
    var name = "Card " + num, ctrl = NL.ctrl(comp, name, pos), bg, ic, nt, lt, r;
    AEL.xf(ctrl, "ADBE Position").setValue(pos);
    bg = NL.box(comp, name + " BG", 270, 112, 24, NL.COL.white, [0, 0]);
    NL.shadow(bg, 40, 14, 46);
    ic = NL.icon(comp, kind, name + " Icon");
    nt = AEL.text(comp, num, { font: NL.FONT.bold, size: 17, color: NL.COL.verm, tracking: 60, justify: "left", name: name + " No." });
    lt = AEL.text(comp, label, { font: NL.FONT.cap, size: 23, color: NL.COL.navy, justify: "left", leading: 27, name: name + " Label" });
    bg.parent = ctrl; ic.parent = ctrl; nt.parent = ctrl; lt.parent = ctrl;
    AEL.xf(bg, "ADBE Position").setValue([0, 0]);
    AEL.xf(ic, "ADBE Position").setValue([-92, 0]);
    r = lt.sourceRectAtTime(0, false);
    AEL.xf(lt, "ADBE Anchor Point").setValue([r.left, r.top + r.height / 2]);
    AEL.xf(lt, "ADBE Position").setValue([-50, 6]);
    r = nt.sourceRectAtTime(0, false);
    AEL.xf(nt, "ADBE Anchor Point").setValue([r.left + r.width, r.top]);
    AEL.xf(nt, "ADBE Position").setValue([118, -42]);
    return ctrl;
};

// ------------------------------------------------------------------ motion presets

NL.scaleOf = function (layer) { var v = AEL.xf(layer, "ADBE Scale").value; return [v[0], v[1]]; };
NL.posOf = function (layer) { var v = AEL.xf(layer, "ADBE Position").value; return [v[0], v[1]]; };

// Scale pop with overshoot + fade. from = start factor (0..1).
NL.pop = function (layer, t, dur, from) {
    var s = NL.scaleOf(layer), d = dur || 0.45, f = from === undefined ? 0.6 : from;
    AEL.key(AEL.xf(layer, "ADBE Scale"), [t, t + d * 0.65, t + d], [[s[0] * f, s[1] * f], [s[0] * 1.05, s[1] * 1.05], s], AEL.EASE.smooth);
    AEL.key(AEL.xf(layer, "ADBE Opacity"), [t, t + d * 0.4], [0, 100], AEL.EASE.expoOut);
};
// Slide in from an offset with fade.
NL.slideIn = function (layer, t, dur, dx, dy) {
    var p = NL.posOf(layer);
    AEL.key(AEL.xf(layer, "ADBE Position"), [t, t + dur], [[p[0] + dx, p[1] + dy], p], AEL.EASE.expoOut);
    AEL.key(AEL.xf(layer, "ADBE Opacity"), [t, t + dur * 0.5], [0, 100], AEL.EASE.expoOut);
};
// Move from current/explicit position to target.
NL.move = function (layer, t1, t2, from, to, ease) {
    AEL.key(AEL.xf(layer, "ADBE Position"), [t1, t2], [from || NL.posOf(layer), to], ease || AEL.EASE.expoOut);
};
NL.fadeOut = function (layer, t, dur) {
    AEL.key(AEL.xf(layer, "ADBE Opacity"), [t, t + (dur || 0.25)], [100, 0], AEL.EASE.expoIn);
};
// Big emphasis word: blur + scale punch, then slow push.
NL.bigWord = function (comp, text, t, o) {
    var l = AEL.text(comp, text, { font: o.font || NL.FONT.black, size: o.size || 220, color: o.color || NL.COL.navy, tracking: o.tracking || -20, name: o.name || ("Big " + text) });
    var b = NL.blurFx(l, 0), end = o.end || comp.duration;
    AEL.xf(l, "ADBE Position").setValue(o.pos || [comp.width / 2, comp.height / 2]);
    AEL.key(AEL.xf(l, "ADBE Scale"), [t, t + 0.3, end], [[135, 135], [100, 100], [104, 104]], AEL.EASE.expoOut);
    AEL.key(AEL.xf(l, "ADBE Opacity"), [t, t + 0.15], [0, 100], AEL.EASE.expoOut);
    AEL.key(b, [t, t + 0.3], [60, 0], AEL.EASE.expoOut);
    l.motionBlur = true;
    return l;
};

// ------------------------------------------------------------------ kinetic captions

// Word-timed caption. words: [[text, absTime],...] (whole list), cap: {from,to,out,hi,y,size,color}, t0 = comp's absolute start.
// Each character fades/blur-rises in at its word's time (+ small per-letter stagger); highlight words turn vermilion;
// the whole line blurs out at cap.out. Timings live in the expressions, so retiming = editing the T array.
NL.caption = function (comp, words, cap, t0, maxChars) {
    var i, k, w, s, txt = "", T = [], H = [], isHi, lineLen = 0, brk, first, layer, anim, sel, ok = true;
    var max = maxChars || Math.floor(1400 / ((cap.size || 64) * 0.56)), outT = cap.out - t0, color = cap.color === "white" ? NL.COL.white : NL.COL.navy;
    // Build the string with greedy line breaks and per-character start times
    // (spaces/line breaks take the next word's time; letters stagger 22 ms).
    for (i = cap.from; i <= cap.to; i++) {
        w = words[i][0]; s = Math.round((words[i][1] - t0) * 1000) / 1000;
        isHi = AEL.contains(cap.hi, i) ? 1 : 0;
        if (i > cap.from) {
            brk = (lineLen + 1 + w.length) > max;
            txt += brk ? "\r" : " ";
            lineLen = brk ? 0 : lineLen + 1;
            T.push(s); H.push(0);
        }
        for (k = 0; k < w.length; k++) { T.push(Math.round((s + k * 0.022) * 1000) / 1000); H.push(isHi); }
        txt += w;
        lineLen += w.length;
    }
    layer = AEL.text(comp, txt, { font: NL.FONT.cap, size: cap.size || 64, color: color, tracking: -10, leading: Math.round((cap.size || 64) * 1.18), name: "CAP " + cap.id });
    AEL.xf(layer, "ADBE Position").setValue([comp.width / 2, cap.y]);
    layer.motionBlur = true;
    first = T[0];
    layer.inPoint = Math.max(0, first - 0.15);
    layer.outPoint = Math.min(comp.duration, outT + 0.4);

    anim = NL._animator(layer, "Reveal");
    try {
        NL._animProp(layer, anim, "ADBE Text Opacity", 0);
        NL._animProp(layer, anim, "ADBE Text Position 3D", [0, Math.round((cap.size || 64) * 0.45), 0]);
        NL._animProp(layer, anim, "ADBE Text Blur", [14, 14]);
        sel = NL._exprSelector(layer, anim);
        sel.property("ADBE Text Expressible Amount").expression =
            "var T=[" + T.join(",") + "];var i=Math.min(textIndex,T.length)-1;var v=ease(time,T[i],T[i]+0.32,100,0);[v,v,v]";
    } catch (e) {
        ok = false;
        AEL.warn("Expression selector unavailable (" + e + "); using keyed range reveal on " + layer.name);
        NL._fallbackReveal(layer, anim, first, T[T.length - 1] + 0.3);
    }
    if (ok) {
        if (NL._sum(H) > 0) {
            anim = NL._animator(layer, "Highlight");
            NL._animProp(layer, anim, "ADBE Text Fill Color", AEL.rgba(NL.COL.verm));
            sel = NL._exprSelector(layer, anim);
            sel.property("ADBE Text Expressible Amount").expression =
                "var H=[" + H.join(",") + "];var v=H[Math.min(textIndex,H.length)-1]*100;[v,v,v]";
        }
        anim = NL._animator(layer, "Exit");
        NL._animProp(layer, anim, "ADBE Text Opacity", 0);
        NL._animProp(layer, anim, "ADBE Text Position 3D", [0, -Math.round((cap.size || 64) * 0.35), 0]);
        NL._animProp(layer, anim, "ADBE Text Blur", [16, 16]);
        sel = NL._exprSelector(layer, anim);
        sel.property("ADBE Text Expressible Amount").expression =
            "var o=" + (Math.round(outT * 1000) / 1000) + "+textIndex*0.004;var v=ease(time,o,o+0.22,0,100);[v,v,v]";
    } else {
        NL.fadeOut(layer, outT, 0.22);
    }
    return layer;
};

NL._sum = function (a) { var s = 0, i; for (i = 0; i < a.length; i++) { s += a[i]; } return s; };
NL._animator = function (layer, name) {
    var a = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
    a.name = name;
    return a.propertyIndex;
};
NL._anim = function (layer, ai) { return layer.property("ADBE Text Properties").property("ADBE Text Animators").property(ai); };
NL._animProp = function (layer, ai, matchName, value) {
    NL._anim(layer, ai).property("ADBE Text Animator Properties").addProperty(matchName);
    NL._anim(layer, ai).property("ADBE Text Animator Properties").property(matchName).setValue(value);
};
NL._exprSelector = function (layer, ai) {
    NL._anim(layer, ai).property("ADBE Text Selectors").addProperty("ADBE Text Expressible Selector");
    return NL._anim(layer, ai).property("ADBE Text Selectors").property(1);
};
NL._fallbackReveal = function (layer, ai, t1, t2) {
    var sel;
    NL._anim(layer, ai).property("ADBE Text Selectors").addProperty("ADBE Text Selector");
    sel = NL._anim(layer, ai).property("ADBE Text Selectors").property(1);
    AEL.key(sel.property("ADBE Text Percent Start"), [t1, t2], [0, 100], null);
};
