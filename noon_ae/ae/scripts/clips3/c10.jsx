// Clip 10 (102.15 s): "it does sound a bit all over the place and chaotic ... we're gonna get through this easily" -
// the highlighted notes page shrinks to a coral dot, four note cards pop in tilted and jitter all over the place,
// then snap into a row inside a tray, and the "One clear direction" pill rises in.

// A small precomp placed in the main comp (world or over slot) at world point [x, y]. Returns {layer, ctx}; ctx coords
// are relative to (ox, oy) inside the precomp (default: its centre).
function C10_pre(S, slot, name, w, h, x, y, ox, oy) {
    var pc = app.project.items.addComp(S.id + " \u00b7 " + name, w, h, 1, S.T, N3.FPS), l;
    if (N3.folders) { pc.parentFolder = N3.folders.precomps; }
    AEL.created("precomp", pc.name);
    l = S.comp.layers.add(pc);
    l.name = N3.uname(S.comp, name);
    N3.place(slot, l);
    N3.xf(l, "ADBE Anchor Point").setValue([w / 2, h / 2]);
    N3.pos(l).setValue([x, y]);
    return { layer: l, ctx: { comp: pc, ox: ox === undefined ? w / 2 : ox, oy: oy === undefined ? h / 2 : oy, parent: null, slot: "pre", S: S, layer: l } };
}

// Highlighter box behind a left-aligned text line: fixed left edge, width = the line's width + 12 (by expression).
function C10_highlight(ctx, name, textName, left, top, hex, opacity) {
    var l = N3.box(ctx, { name: name, cx: left, cy: top + 16, w: 100, h: 32, r: 5, fill: hex, fillOpacity: opacity }),
        rect = N3.root(l).property(1).property("ADBE Vectors Group").property(1);
    AEL.expr(rect.property("ADBE Vector Rect Size"), "// line width + 12 px\nvar r = thisComp.layer(\"" + textName + "\").sourceRectAtTime(time, false);\n[r.left + r.width + 12, 32]");
    AEL.expr(rect.property("ADBE Vector Rect Position"), "var r = thisComp.layer(\"" + textName + "\").sourceRectAtTime(time, false);\n[(r.left + r.width + 12) / 2, 0]");
    l.blendingMode = BlendingMode.MULTIPLY;
    return l;
}

// The static notes page (clip 09's last frame), built into a card-content ctx whose origin is the card's top centre.
function C10_notesPage(g) {
    var LN = [["The main disagreement", 176], ["Maya wants the brand to feel quiet, premium and controlled.", 228],
        ["Alex believes the launch needs much more colour and immediate energy", 276], ["to stop people scrolling.", 310],
        ["Jo is concerned that an overly abstract campaign could make the product", 358],
        ["category unclear, especially if customers first see the work at a distance.", 392],
        ["Sam: \u201cThe answer may not be choosing calm or loud. The system could hold calm", 462],
        ["information and one unmistakable moment of energy.\u201d", 496]],
        WHO = [[1, 228, "MAYA \u00b7 FOUNDER"], [2, 276, "ALEX \u00b7 MARKETING"], [4, 358, "JO \u00b7 SALES"], [6, 462, "SAM \u00b7 CREATIVE"]],
        SK = [820, 760, 640, 800, 520], i, hl = [], tx;
    N3.text(g, "NOON Discovery Meeting Notes", { name: "Doc title", x: -430, top: 54, fs: 34, wt: 600, ls: -0.025 });
    N3.text(g, "8 September 2026 \u00b7 Brand and launch discovery \u00b7 Working notes", { name: "Doc date", x: -430, top: 104, fs: 17, color: N3.COL.soft });
    N3.box(g, { name: "Doc rule", x: -430, y: 142, w: 860, h: 1.5, fill: "#F2E2E1" });
    for (i = 0; i < LN.length; i++) {
        hl.push(C10_highlight(g, "Highlight " + (i + 1), "Notes line " + (i + 1), -436, LN[i][1] - 1, i >= 6 ? "#EA6262" : "#F7A6A4", i >= 6 ? 42 : 62));
    }
    for (i = 0; i < LN.length; i++) {
        tx = N3.text(g, LN[i][0], i === 0 ? { name: "Notes line 1", x: -430, top: LN[i][1], fs: 26, wt: 600, ls: -0.025, lh: 30, color: "#3A2A2C" } :
            { name: "Notes line " + (i + 1), x: -430, top: LN[i][1], fs: 21, lh: 30, color: "#3A2A2C" });
    }
    for (i = 0; i < SK.length; i++) { N3.box(g, { name: "Skeleton " + (i + 1), x: -430, y: 572 + i * 32, w: SK[i], h: 11, r: 6, fill: "#F5E8E7" }); }
    for (i = 0; i < WHO.length; i++) {
        N3.chip(g, WHO[i][2], { name: "Role " + (i + 1), x: 330, top: WHO[i][1] - 4, fs: 13, bg: WHO[i][0] >= 6 ? "#EA6262" : "#FCE3E2", color: WHO[i][0] >= 6 ? "#FFFFFF" : N3.COL.capRed });
    }
    return hl;
}

// One note card (330 x 196) as a precomp in the over slot. Card-local coordinates: top-left = (0, 0).
function C10_note(S, slot, who, txt, x, y) {
    var P = C10_pre(S, slot, "Note " + who, 560, 440, x, y, 280 - 165, 220 - 98), c = P.ctx;
    N3.box(c, { name: "Note card", x: 0, y: 0, w: 330, h: 196, r: 26, fill: "#FFFFFF", shadow: { color: "#96323A", opacity: 0.34, dist: 20, soft: 40 } });
    N3.chip(c, who, { name: "Who", x: 26, top: 24, fs: 14, ls: 0.1, bg: N3.COL.coral, color: "#FFFFFF" });
    N3.text(c, txt, { name: "Note text", x: 28, top: 76, fs: 30, wt: 600, ls: -0.02, lh: 34.5 });
    return P.layer;
}

// "One clear direction" pill (white, coral check dot) as a precomp; centred on world x = 0, top at y = top.
function C10_sorted(S, slot, top) {
    var P = C10_pre(S, slot, "One clear direction", 700, 200, 0, top + 28), c = P.ctx, t, bg, dot, ic;
    t = N3.text(c, "One clear direction", { name: "Pill text", x: 17, cy: 0, fs: 22, wt: 600, align: "center" });
    bg = N3.box(c, { name: "Pill", cx: 0, cy: 0, w: 290, h: 56, r: 28, fill: "#FFFFFF", shadow: { color: "#96323A", opacity: 0.36, dist: 14, soft: 30 } });
    AEL.expr(N3.root(bg).property(1).property("ADBE Vectors Group").property(1).property("ADBE Vector Rect Size"),
        "// padding 14 + dot 32 + gap 12 | text | padding 24\nvar r = thisComp.layer(\"Pill text\").sourceRectAtTime(time, false);\n[r.width + 82, 56]");
    AEL.expr(N3.pos(bg), "var L = thisComp.layer(\"Pill text\"), r = L.sourceRectAtTime(time, false);\n[L.transform.position[0] + r.left + r.width / 2 - 17, value[1]]");
    bg.moveAfter(t);
    dot = N3.ellipse(c, { name: "Check dot", cx: -100, cy: 0, d: 32, fill: N3.COL.coral });
    ic = N3.icon(c, "check", { name: "Check", cx: -100, cy: 0, size: 18, color: "#FFFFFF", sw: 3 });
    AEL.expr(N3.pos(dot), "var L = thisComp.layer(\"Pill text\"), r = L.sourceRectAtTime(time, false);\n[L.transform.position[0] + r.left - 28, value[1]]");
    AEL.expr(N3.pos(ic), "thisComp.layer(\"Check dot\").transform.position");
    return P.layer;
}

N3CLIPS["10"] = { tin: 102.15, build: function () {
    var T0 = 102.15, tDot = 0.15, tIn = 0.25, tChaos = N3.wt(319, T0), tSnap = N3.wt(333, T0) - 0.1, tEasy = N3.wt(339, T0),
        S, g, i, n, rig, CH = [[-560, -250, -12], [430, -290, 10], [-330, 250, 8], [560, 220, -9]],
        NOTES = [["MAYA", "Quiet &\npremium"], ["ALEX", "More colour\n& energy"], ["JO", "Clearly\ncoffee"], ["SAM", "Calm info, one\nmoment of energy"]], pill;
    S = N3.scene({ id: "10", title: "All over the place", T: 10.75, intro: null,
        SH: { doc: { w: 1000, h: 840, r: 22, bg: "#FFFFFF", cam: 1.18 }, dot: { w: 130, h: 130, r: 65, bg: "#EA6262", cam: 1.0 },
            tray: { w: 1660, h: 300, r: 48, bg: "#FFF4F3", cam: 1.0 } },
        start: "doc", SEQ: [[tDot, "dot"], [tSnap, "tray"]] });

    // the notes page, as clip 09 ended (fully highlighted)
    g = N3.group(S, "Notes page", { anchor: "t", tin: null, tout: tDot, lout: 0.14 });
    C10_notesPage(g);

    // world: "One clear direction" rises in under the tray
    pill = C10_sorted(S, S.worldCtx, 220);
    N3.show(pill, tEasy - 0.05, null, 20, { din: 0, lin: 0.4, noScale: true, noBlur: true });

    // rig: one Amp slider scales every card's jitter (0.25 -> 1 on "and", -> 0 when they snap)
    rig = AEL.nullLayer(S.comp, "NOTES RIG (chaos amp)");
    N3.spring(N3.slider(rig, "Amp", 0.25), 0.25, [[tChaos, 1, N3.SP.SOFT], [tSnap, 0, N3.SP.FAST]]);

    // over: four note cards. Position/Rotation values = the "all over the place" pose; Row Position = where they snap.
    for (i = 0; i < NOTES.length; i++) {
        n = C10_note(S, S.overCtx, NOTES[i][0], NOTES[i][1], CH[i][0], CH[i][1]);
        N3.xf(n, "ADBE Rotate Z").setValue(CH[i][2]);
        N3.spring(N3.slider(n, "Pop", 0), 0, [[tIn + i * 0.18, 1, [10, 0.85]]]);
        N3.spring(N3.slider(n, "Snap", 0), 0, [[tSnap + i * 0.05, 1, [9.5, 0.82]]]);
        N3.fx(n, "ADBE Point Control", "Row Position");
        N3.ctl(n, "Row Position").setValue([-600 + i * 400, 0]);
        AEL.expr(N3.pos(n), "// jitter (sin/cos, scaled by the rig's Amp) around this pose, then spring to Row Position by Snap\n" +
            "var A = thisComp.layer(\"NOTES RIG (chaos amp)\").effect(\"Amp\")(1), k = effect(\"Snap\")(1), r = effect(\"Row Position\")(1), i = " + i + ";\n" +
            "var x = value[0] + Math.sin(time * 9.5 + i * 1.7) * 18 * A, y = value[1] + Math.cos(time * 8.3 + i * 2.3) * 14 * A;\n" +
            "[x + (r[0] - x) * k, y + (r[1] - y) * k]");
        AEL.expr(N3.xf(n, "ADBE Rotate Z"), "var A = thisComp.layer(\"NOTES RIG (chaos amp)\").effect(\"Amp\")(1), k = effect(\"Snap\")(1), i = " + i + ";\n" +
            "(value + Math.sin(time * 7.1 + i) * 5 * A) * (1 - k)");
        AEL.expr(N3.xf(n, "ADBE Opacity"), "// pops in with the Pop spring\nMath.min(1, Math.max(0, effect(\"Pop\")(1) * 1.4)) * 100");
        AEL.expr(N3.xf(n, "ADBE Scale"), "var s = (0.85 + 0.15 * Math.max(0, effect(\"Pop\")(1))) * 100;\n[s, s]");
    }
    return S;
} };
