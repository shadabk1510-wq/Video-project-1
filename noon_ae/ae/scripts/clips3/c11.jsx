// Clip 11 (112.90 s): "here's a part of this workflow that will separate high-level professional designers from everybody else" -
// the notes and the pill blur away, the tray grows into the coral PROFESSIONAL card with a layout grid; the intro line
// reveals word by word on the VO, then gives way to HIGH-LEVEL / PROFESSIONAL / ghost rows / "designers from everybody else."

// A small precomp placed in the main comp (world or over slot) at world point [x, y]; ctx origin = (ox, oy) in the precomp.
function C11_pre(S, slot, name, w, h, x, y, ox, oy) {
    var pc = app.project.items.addComp(S.id + " · " + name, w, h, 1, S.T, N3.FPS), l;
    if (N3.folders) { pc.parentFolder = N3.folders.precomps; }
    AEL.created("precomp", pc.name);
    l = S.comp.layers.add(pc);
    l.name = N3.uname(S.comp, name);
    N3.place(slot, l);
    N3.xf(l, "ADBE Anchor Point").setValue([w / 2, h / 2]);
    N3.pos(l).setValue([x, y]);
    return { layer: l, ctx: { comp: pc, ox: ox === undefined ? w / 2 : ox, oy: oy === undefined ? h / 2 : oy, parent: null, slot: "pre", S: S, layer: l } };
}

// Note card (330 x 196, same build as clip 10), card-local coordinates.
function C11_note(S, slot, who, txt, x, y) {
    var P = C11_pre(S, slot, "Note " + who, 560, 440, x, y, 280 - 165, 220 - 98), c = P.ctx;
    N3.box(c, { name: "Note card", x: 0, y: 0, w: 330, h: 196, r: 26, fill: "#FFFFFF", shadow: { color: "#96323A", opacity: 0.34, dist: 20, soft: 40 } });
    N3.chip(c, who, { name: "Who", x: 26, top: 24, fs: 14, ls: 0.1, bg: N3.COL.coral, color: "#FFFFFF" });
    N3.text(c, txt, { name: "Note text", x: 28, top: 76, fs: 30, wt: 600, ls: -0.02, lh: 34.5 });
    return P.layer;
}

// "One clear direction" pill (same build as clip 10), top at world y = top.
function C11_sorted(S, slot, top) {
    var P = C11_pre(S, slot, "One clear direction", 700, 200, 0, top + 28), c = P.ctx, t, bg, dot, ic;
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

// Layout grid with square handles: one shape layer (lines at 55% white, 14 px handles at the crossings).
function C11_grid(ctx) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, "Layout grid")), GX = [-560, 560], GY = [-170, 150], gi, i, j;
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Lines");
    for (i = 0; i < GX.length; i++) { N3.addRect(l, gi, 1.5, 920, 0, [GX[i] + 0.75, 0]); }
    for (i = 0; i < GY.length; i++) { N3.addRect(l, gi, 1720, 1.5, 0, [0, GY[i] + 0.75]); }
    N3.addFill(l, gi, "#FFFFFF", 55);
    gi = N3.addGroup(l, "Handles");
    for (i = 0; i < GX.length; i++) { for (j = 0; j < GY.length; j++) { N3.addRect(l, gi, 14, 14, 0, [GX[i], GY[j]]); } }
    N3.addFill(l, gi, "#FFFFFF");
    N3.pos(l).setValue([ctx.ox, ctx.oy]);
    return l;
}

N3CLIPS["11"] = { tin: 112.90, build: function () {
    var T0 = 112.90, tPro = 0.12, tHL = N3.wt(353, T0), tWord = N3.wt(354, T0) - 0.04, tRest = N3.wt(355, T0),
        S, g, i, n, t, gh, grid, sepT = [], NOTES = [["MAYA", "Quiet &\npremium"], ["ALEX", "More colour\n& energy"], ["JO", "Clearly\ncoffee"], ["SAM", "Calm info, one\nmoment of energy"]];
    S = N3.scene({ id: "11", title: "Professional", T: 6.15, intro: null,
        SH: { tray: { w: 1660, h: 300, r: 48, bg: "#FFF4F3", cam: 1.0 }, pro: { w: 1760, h: 940, r: 56, bg: "#EA6262", cam: 1.06 } },
        start: "tray", SEQ: [[tPro, "pro"]] });

    // carried over from clip 10: the pill (world) and the four cards in their row (over) blur away in the first 0.3 s
    n = C11_sorted(S, S.worldCtx, 220);
    N3.eo(N3.xf(n, "ADBE Opacity"), 0, 0.3, 100, 0);
    for (i = 0; i < NOTES.length; i++) {
        n = C11_note(S, S.overCtx, NOTES[i][0], NOTES[i][1], -600 + i * 400, 0);
        N3.eo(N3.xf(n, "ADBE Opacity"), 0, 0.3, 100, 0);
        N3.eo(N3.blur(n), 0, 0.3, 0, 10);
    }

    g = N3.group(S, "Professional", { tin: tPro, din: 0.1, lin: 0.3 });
    grid = C11_grid(g);
    N3.eo(N3.xf(grid, "ADBE Opacity"), tPro + 0.2, tPro + 1.0, 0, 100);

    // ghost rows slide in from above / below
    for (i = 0; i < 2; i++) {
        gh = N3.text(g, "PROFESSIONAL", { name: "Ghost " + (i + 1), x: 4.5, top: i ? 190 : -370, fs: 180, wt: 800, ls: -0.05, lh: 180, color: "#FFFFFF", align: "center", opacity: 26 });
        N3.eo(N3.xf(gh, "ADBE Opacity"), tWord + 0.25, tWord + 1.15, 0, 26);
        t = N3.pos(gh).value;
        N3.eo(N3.pos(gh), tWord + 0.25, tWord + 1.15, [t[0], t[1] + (i ? 70 : -70), t[2]], t);
    }

    // intro line, word by word on the VO (markers), out before PROFESSIONAL lands
    t = N3.text(g, "Here’s a part of this workflow that will separate", { name: "Intro line", x: 0, top: -36, fs: 54, wt: 700, ls: -0.03, color: "#FFFFFF", align: "center" });
    for (i = 344; i <= 352; i++) { sepT.push(N3.wt(i, T0) - 0.06); }
    N3.unitReveal(t, { times: sepT, based: "words", dy: 26, blur: 8, lin: 0.35 });
    N3.show(t, null, tWord - 0.28, 0, { lout: 0.25, blur: 8 });
    // the web row re-centres as each word appears (hidden words take no space): shift by half the still-hidden width
    N3.slider(t, "Recentre", 1);
    AEL.expr(N3.pos(t), "// Keeps the revealed words centred, like the web row. F = share of the line width up to the end of word i\n" +
        "// (Inter Bold 54, measured). After rewording the line, set Recentre to 0 (or update F).\n" +
        "var F = [0, 0.1363, 0.1717, 0.2697, 0.3237, 0.4128, 0.6246, 0.7191, 0.8008, 1], n = 0;\n" +
        "for (var i = 1; i <= marker.numKeys; i++) { if (time >= marker.key(i).time) { n = i; } }\n" +
        "var r = sourceRectAtTime(time, false), k = effect(\"Recentre\")(1);\n" +
        "[value[0] + k * r.width * (1 - F[Math.min(n, F.length - 1)]) / 2, value[1]]");

    t = N3.text(g, "High-level", { name: "High-level", x: -6, top: -150, fs: 30, wt: 600, ls: 0.4, caps: true, color: "#FFFFFF", align: "center" });
    N3.show(t, tHL - 0.05, null, 12, { din: 0, lin: 0.35 });

    t = N3.text(g, "PROFESSIONAL", { name: "PROFESSIONAL", x: 4.5, cy: 0, fs: 180, wt: 800, ls: -0.05, lh: 180, color: "#FFFFFF", align: "center" });
    N3.unitReveal(t, { times: [tWord], stagger: 0.025, based: "chars", dy: 60, blur: 16, lin: 0.45 });
    N3.slider(t, "Recentre", 1);
    AEL.expr(N3.pos(t), "// Keeps the revealed letters centred, like the web row. F = share of the word width up to letter i\n" +
        "// (Inter ExtraBold 180, measured); letters follow marker 1 every 0.025 s. After editing the word, set Recentre to 0.\n" +
        "var F = [0, 0.0904, 0.1753, 0.2755, 0.3498, 0.4274, 0.512, 0.5966, 0.6293, 0.7295, 0.8288, 0.9285, 1], n = 0;\n" +
        "if (marker.numKeys > 0 && time >= marker.key(1).time) { n = Math.floor((time - marker.key(1).time) / 0.025) + 1; }\n" +
        "var r = sourceRectAtTime(time, false), k = effect(\"Recentre\")(1);\n" +
        "[value[0] + k * r.width * (1 - F[Math.min(n, F.length - 1)]) / 2, value[1]]");

    t = N3.text(g, "designers from everybody else.", { name: "Rest", x: 0, top: 395, fs: 40, wt: 600, color: "#FFFFFF", align: "center" });
    N3.show(t, tRest, null, 14, { din: 0, lin: 0.4 });
    return S;
} };
