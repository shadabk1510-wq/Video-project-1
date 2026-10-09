// Clip 08 (16.7 s): "we've got a clearer brief saved with the project ... stage done, checked, complete ... plan how somebody can
// encounter the design" - POWERHOUSE card -> files window (the cursor carries the new brief in and drops it), "Saved" toast,
// then the stage pill: Stage 01 complete (check badge), label swaps, Stage 02.

// Coral check disc (optional white ring) as one shape layer: groups Check / Disc / Ring (top to bottom).
function C08_checkDisc(ctx, name, cx, cy, d, ring, checkSize, checkSw) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, name)), gi, data = N3_ICONS.check, i, s = checkSize / 24;
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Check");
    for (i = 0; i < data.length; i++) { N3.addPath(l, gi, data[i][1], data[i][2], data[i][3], data[i][0]); }
    N3.addStroke(l, gi, "#FFFFFF", checkSw / s, undefined, true);
    N3.gxf(l, gi, "ADBE Vector Scale").setValue([s * 100, s * 100]);
    gi = N3.addGroup(l, "Disc");
    N3.addEllipse(l, gi, d, d);
    N3.addFill(l, gi, N3.COL.coral);
    if (ring) {
        gi = N3.addGroup(l, "Ring");
        N3.addEllipse(l, gi, d + 2 * ring, d + 2 * ring);
        N3.addFill(l, gi, "#FFFFFF");
    }
    N3.pos(l).setValue(N3.P(ctx, cx, cy));
    return l;
}

// NOON wordmark (the clip's inline SVG, viewBox 450x112) drawn as shapes, top-left at (x, y), w px wide.
function C08_logo(ctx, x, y, w, hex) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, "NOON logo")), s = w / 450, gi;
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Holes");                      // the O counters (white, on the white tile)
    N3.addEllipse(l, gi, 24, 24, [194, 57]); N3.addEllipse(l, gi, 24, 24, [309.5, 57]);
    N3.addFill(l, gi, "#FFFFFF");
    gi = N3.addGroup(l, "Letters");
    N3.addPath(l, gi, [[0, 1], [42, 1], [75, 40], [75, 1], [109, 1], [109, 110], [70, 110], [39, 73], [39, 110], [0, 110]], null, null, true);
    N3.addEllipse(l, gi, 112, 112, [168, 56]);
    N3.addEllipse(l, gi, 112, 112, [281.5, 56]);
    N3.addPath(l, gi, [[342, 1], [385, 1], [416, 40], [416, 1], [450, 1], [450, 112], [412, 112], [381, 74], [381, 112], [342, 112]], null, null, true);
    N3.addFill(l, gi, hex);
    N3.xf(l, "ADBE Scale").setValue([s * 100, s * 100]);
    N3.pos(l).setValue(N3.P(ctx, x, y));
    return l;
}

// One file tile (thumbnail 176x222 + name + meta) as its own precomp; returns the precomp layer placed in group g.
// f = [image|null|'NEW', name as displayed (CSS ellipsis baked in), meta]
function C08_tile(S, g, i, f, left) {
    var PAD = 30, pc, ctx, l, bg, t, k, bars = [110, 128, 96, 120, 70];
    pc = app.project.items.addComp(S.id + " \u00b7 Tile " + (i + 1), 176 + 2 * PAD, 300 + 2 * PAD, 1, S.T, N3.FPS);
    if (N3.folders) { pc.parentFolder = N3.folders.precomps; }
    AEL.created("precomp", pc.name);
    ctx = { comp: pc, ox: PAD, oy: PAD, parent: null, slot: "pre", S: S };
    bg = N3.box(ctx, { name: "Thumb", x: 0, y: 0, w: 176, h: 222, r: 14, fill: f[0] === "NEW" ? "#FFFFFF" : N3.COL.blush,
        shadow: { color: "#78282D", opacity: 0.22, dist: 6, soft: 14 } });
    if (f[0] === null) {
        N3.icon(ctx, "folder", { name: "Folder icon", cx: 88, cy: 111, size: 76, color: N3.COL.coral, sw: 1.6 });
    } else if (f[0] === "NEW") {
        C08_logo(ctx, 20, 22, 60, N3.COL.navy);
        N3.text(ctx, "Creative\nbrief", { name: "Brief title", x: 20, top: 51, fs: 19, wt: 700, lh: 20.9 });
        for (k = 0; k < bars.length; k++) { N3.box(ctx, { name: "Line", x: 20, y: 102.8 + k * 17, w: bars[k], h: 7, r: 4, fill: "#F4E1E0" }); }
    } else {
        N3.image(ctx, f[0] + ".png", { name: "Thumbnail", x: 0, y: 0, w: 176, h: 222, r: 14 });
    }
    N3.text(ctx, f[1], { name: "File name", x: 88, top: 236, fs: 16, wt: 600, align: "center" });
    N3.text(ctx, f[2], { name: "File meta", x: 88, top: 260, fs: 14, color: N3.COL.soft, align: "center" });
    l = g.comp.layers.add(pc);
    l.name = "Tile " + (i + 1) + " \u00b7 " + f[1];
    N3.xf(l, "ADBE Anchor Point").setValue([PAD + 88, PAD + 150]);           // tile centre (CSS transform-origin)
    N3.pos(l).setValue(N3.P(g, left + 88, 96 + 150));
    return l;
}

// Progress segment fill: left-anchored coral bar whose width = 58 x the "Fill" slider (sprung).
function C08_segFill(ctx, name, x, y, v0, keys) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, name)), gi, r;
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Bar");
    r = N3.addRect(l, gi, 58 * v0, 12, 6);
    N3.addFill(l, gi, N3.COL.coral);
    N3.spring(N3.slider(l, "Fill", v0), v0, keys, N3.SP.MORPH);
    AEL.expr(r.property("ADBE Vector Rect Size"), "// width = 58 px x Fill\n[58 * effect(\"Fill\")(1), 12]");
    AEL.expr(r.property("ADBE Vector Rect Position"), "[29 * effect(\"Fill\")(1), 0]");
    N3.pos(l).setValue(N3.P(ctx, x, y + 6));
    return l;
}

// Hold keys on a text layer's Source Text: [[t, "string"], ...]
function C08_textKeys(layer, keys) {
    var tp = layer.property("ADBE Text Properties").property("ADBE Text Document"), i, d;
    for (i = 0; i < keys.length; i++) { d = tp.value; d.text = keys[i][1]; tp.setValueAtTime(keys[i][0], d); }
}

N3CLIPS["08"] = { tin: 63.30, build: function () {
    var T0 = 63.30, S, g, t, l, i, k, tl, ctx, toast, pill, disc, txt, nul, badge, sh, x0, tiles = [],
        tFiles = 0.12, tDrop0 = N3.wt(213, T0) - 0.55, tDrop = N3.wt(214, T0) + 0.1, tSaved = N3.wt(215, T0), tStage = N3.wt(219, T0) - 0.12,
        tDone = N3.wt(223, T0), tChecked = N3.wt(224, T0), tComplete = N3.wt(225, T0), tKnow = N3.wt(226, T0), tNext = N3.wt(237, T0),
        TL = [[null, "Package Designs", "Folder \u00b7 3 items"], ["doc_brief", "NOON_Client_Brief.p\u2026", "PDF \u00b7 75 KB"],
            ["doc_research", "NOON_Audience_Re\u2026", "PDF \u00b7 77 KB"], ["doc_notes", "NOON_Discovery_N\u2026", "DOCX \u00b7 40 KB"],
            ["NEW", "NOON_Creative_Brie\u2026", "PDF \u00b7 just now"]];
    S = N3.scene({ id: "08", title: "Brief saved", T: 16.7, intro: null,
        SH: { power: { w: 1560, h: 560, r: 64, bg: "#EA6262", cam: 1.13 }, files: { w: 1100, h: 440, r: 26, bg: "#FFFFFF", cam: 1.3 },
            stage: { w: 1190, h: 156, r: 78, bg: "#FFFFFF", cam: 1.42 } },
        start: "power", SEQ: [[tFiles, "files"], [tStage, "stage"]] });

    // ---- carried over from clip 07
    g = N3.group(S, "Powerhouse", { tin: null, tout: tFiles, lout: 0.14 });
    N3.text(g, "POWERHOUSE", { name: "Ghost top", x: 0, top: -322, fs: 200, wt: 800, ls: -0.05, lh: 200, color: "#FFFFFF", align: "center", opacity: 28 });
    N3.text(g, "POWERHOUSE", { name: "Ghost bottom", x: 0, top: 122, fs: 200, wt: 800, ls: -0.05, lh: 200, color: "#FFFFFF", align: "center", opacity: 28 });
    N3.text(g, "POWERHOUSE", { name: "POWERHOUSE", x: 0, cy: 0, fs: 200, wt: 800, ls: -0.05, lh: 200, color: "#FFFFFF", align: "center" });

    // ---- files window (hangs from the card top)
    g = N3.group(S, "Files", { anchor: "t", tin: tFiles, tout: tStage, din: 0.05, lin: 0.3, lout: 0.16 });
    N3.box(g, { name: "Title bar", x: -550, y: 0, w: 1100, h: 58, fill: "#FBF1F0" });
    N3.ellipse(g, { name: "Dot red", cx: -519, cy: 29, d: 14, fill: "#F57F7A" });
    N3.ellipse(g, { name: "Dot yellow", cx: -496, cy: 29, d: 14, fill: "#F6C25B" });
    N3.ellipse(g, { name: "Dot green", cx: -473, cy: 29, d: 14, fill: "#6CCB7E" });
    N3.text(g, "NOON \u203a High Sun", { name: "Window title", x: 0, top: 18, fs: 18, wt: 600, color: N3.COL.soft, align: "center" });
    N3.box(g, { name: "Title rule", x: -550, y: 58, w: 1100, h: 1.5, fill: "#F2E2E1" });
    for (i = 0; i < TL.length; i++) { tiles.push(C08_tile(S, g, i, TL[i], -510 + i * 208)); }
    for (i = 0; i < 4; i++) { N3.show(tiles[i], tFiles + 0.1 + i * 0.07, null, 22, { din: 0, lin: 0.4 }); }
    // the new brief: carried by the cursor (Carry = 1, hold keys) from tDrop0 to tDrop, then springs into its slot
    tl = tiles[4];
    N3.hold(N3.slider(tl, "Carry", 0), [0, tDrop0, tDrop], [0, 1, 0]);
    x0 = N3.pos(tl).value;
    N3.spring(N3.pos(tl), [x0[0] + 8, x0[1]], [[tDrop, [x0[0], x0[1]], [14, 0.85]]]);
    AEL.expr(N3.pos(tl), N3.springExpr([N3.SP.MORPH, [14, 0.85]]).replace(/\nv$/, "") + "\n" +
        "// while Carry = 1 the tile hangs under the cursor (World Point + grab offset), in this precomp's space\n" +
        "var C = comp(\"" + S.comp.name + "\").layer(\"CURSOR\"), SH = comp(\"" + S.comp.name + "\").layer(\"SHAPE\"), wp = C.effect(\"World Point\")(1);\n" +
        "var c = [wp[0] - SH.effect(\"CX\")(1) + " + (N3.PRE_W / 2 - 2) + ", wp[1] - SH.effect(\"CY\")(1) + SH.effect(\"H\")(1) / 2 + " + (N3.PRE_H / 2 + 34) + "];\n" +
        "var f = effect(\"Carry\")(1);\nadd(mul(v, 1 - f), mul(c, f))");
    N3.spring(N3.xf(tl, "ADBE Rotate Z"), 4, [[tDrop, 0, [14, 0.85]]]);
    N3.spring(N3.xf(tl, "ADBE Scale"), [108, 108], [[tDrop, [100, 100], [16, 0.8]]]);
    N3.lin(N3.xf(tl, "ADBE Opacity"), [tDrop0, tDrop0 + 0.15], [0, 100]);
    sh = N3.shadow(tl, { color: "#78282D", opacity: 0.35, dist: 26, soft: 30 });
    sh.name = "Carry shadow";
    N3.hold(tl.property("ADBE Effect Parade").property("Carry shadow").property("ADBE Drop Shadow-0002"), [0, tDrop], [Math.round(0.35 * 255), 0]);

    // ---- "Saved to NOON > High Sun" toast (world, below the card)
    nul = AEL.nullLayer(S.comp, "Toast");
    N3.place(S.worldCtx, nul);
    N3.xf(nul, "ADBE Anchor Point").setValue([0, 0]);
    N3.eo(N3.pos(nul), tSaved, tSaved + 0.35, [0, 331 + 24], [0, 331]);
    N3.eo(N3.xf(nul, "ADBE Scale"), tSaved, tSaved + 0.35, [94, 94], [100, 100]);
    N3.eo(N3.xf(nul, "ADBE Scale"), tStage - 0.1, tStage + 0.1, [100, 100], [97, 97]);
    ctx = { comp: S.comp, ox: 0, oy: 0, parent: nul, slot: "world", S: S };
    pill = N3.box(ctx, { name: "Toast pill", cx: 0, cy: 0, w: 373, h: 62, r: 31, fill: "#FFFFFF", shadow: { color: "#96323A", opacity: 0.32, dist: 16, soft: 36 } });
    disc = C08_checkDisc(ctx, "Toast check", -169.5, 0, 34, 0, 20, 3);
    txt = N3.text(ctx, "Saved to NOON \u203a High Sun", { name: "Toast text", x: -122.5, cy: 0, fs: 22, wt: 600 });
    AEL.expr(N3.pos(txt), "// centred in the pill: 16 pad + 34 check + 14 gap | text | 26 pad\nvar r = sourceRectAtTime(time, false);\n[-(r.width + 90) / 2 + 64 - r.left, value[1]]");
    AEL.expr(N3.root(pill).property(1).property("ADBE Vectors Group").property(1).property("ADBE Vector Rect Size"),
        "var r = thisComp.layer(\"Toast text\").sourceRectAtTime(time, false);\n[r.width + 90, 62]");
    AEL.expr(N3.pos(disc), "var L = thisComp.layer(\"Toast text\"), r = L.sourceRectAtTime(time, false);\n[L.transform.position[0] + r.left - 31, value[1]]");
    l = [pill, disc, txt];
    for (i = 0; i < l.length; i++) {
        N3.eo(N3.xf(l[i], "ADBE Opacity"), tSaved, tSaved + 0.35, 0, 100);
        N3.eo(N3.xf(l[i], "ADBE Opacity"), tStage - 0.1, tStage + 0.1, 100, 0);
    }

    // ---- stage pill
    g = N3.group(S, "Stage", { tin: tStage, din: 0.06, lin: 0.3 });
    N3.text(g, "Stage", { name: "Stage cap", x: -540, top: -34, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    t = N3.text(g, "01", { name: "Stage number", x: -540, top: -34 + 15 * N3.LHN, fs: 44, wt: 600, ls: -0.025, lh: 46.2, color: N3.COL.coral });
    C08_textKeys(t, [[0, "01"], [tNext, "02"]]);
    nul = AEL.nullLayer(g.comp, "Badge pop");
    N3.xf(nul, "ADBE Anchor Point").setValue([0, 0]);
    N3.pos(nul).setValue(N3.P(g, -477, -41));
    N3.spring(N3.xf(nul, "ADBE Scale"), [0, 0], [[tChecked, [100, 100], [15, 0.75]]]);
    badge = C08_checkDisc({ comp: g.comp, ox: 0, oy: 0, parent: nul, slot: "pre", S: S }, "Badge", 0, 0, 34, 4, 20, 3.2);
    N3.lin(N3.xf(badge, "ADBE Scale"), [tNext, tNext + 0.3], [[100, 100], [0, 0]]);
    N3.lin(N3.xf(badge, "ADBE Opacity"), [tChecked, tChecked + 0.05, tNext + 0.15, tNext + 0.3], [0, 100, 100, 0]);
    N3.box(g, { name: "Divider", x: -436, y: -36, w: 1.5, h: 72, fill: "#F2E2E1" });
    t = N3.text(g, "Bring the project together", { name: "Stage label", x: -404, top: -20, fs: 31, wt: 600, ls: -0.025 });
    C08_textKeys(t, [[0, "Bring the project together"], [tComplete, "Stage 01 complete"], [tKnow, "We know what it must communicate"],
        [tNext + 0.05, "Plan how people encounter it"]]);
    for (i = 0; i < 6; i++) { N3.box(g, { name: "Segment " + (i + 1), x: 180 + i * 68, y: -6, w: 58, h: 12, r: 6, fill: "#F4E1E0" }); }
    C08_segFill(g, "Segment 1 fill", 180, -6, 0.42, [[tDone - 0.25, 1, N3.SP.SOFT]]);
    C08_segFill(g, "Segment 2 fill", 248, -6, 0, [[tNext + 0.2, 0.35, N3.SP.SOFT]]);

    // ---- cursor: waits, grabs the new brief at the right edge, carries it into the folder, moves away; fades with the window
    l = N3.cursor(S, { size: 44, drags: [[tDrop0 + 0.05, tDrop]], keys: [[0, 820, 300], [tDrop0 - 0.45, 820, 300], [tDrop0, 650, -8], [tDrop0 + 0.02, 650, -8],
        [tDrop, 420, -8], [tDrop + 0.7, 600, 180], [16.7, 600, 180]] });
    N3.lin(N3.xf(l, "ADBE Opacity"), [0.25, 0.55, tStage - 0.25, tStage], [0, 100, 100, 0]);
    return S;
} };
