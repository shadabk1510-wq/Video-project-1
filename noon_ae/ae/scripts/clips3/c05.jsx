// Clip 05 (23.7 s): "...and this is what we're going to do" - the bag card from clip 04 becomes the six-step list.
// Each step appears on its spoken line while a blush highlight springs from row to row (its tile turns coral);
// three format thumbnails pop in on "packaging, digital ... motion"; on "really, really easily" every row gets a tick.

// Shared list data (web: STEPS / STEP_TOP in noon_theme.js): [icon, title, subtitle, spoken-line time on the edit timeline].
var C05_STEPS = [
    ["brief", "Turn project files into direction", "Brief, research and meeting notes", 17.04],
    ["target", "Give every design a clear purpose", "Before we start anything", 20.24],
    ["rules", "Create design rules", "That change the whole workflow", 23.92],
    ["devices", "Carry it across every format", "Packaging · digital · motion", 27.60],
    ["checklist", "Check against the original goals", "Review the work with the brief", 32.08],
    ["handover", "Hand over a system", "So anyone can build on it", 34.64]
];
function C05_TOP(i) { return 160 + i * 94; }

// NOON wordmark (same data as clip 04, NOON-logo.svg via svg_to_ae.py, viewBox units centred on (225, 56)).
var C05_LOGO = [
    ["N", [[true, [[-225, -55], [-183, -55], [-150, -16], [-150, -55], [-116, -55], [-116, 54], [-155, 54], [-186, 17], [-186, 54], [-225, 54]], null, null]], false],
    ["O", [[true, [[-57, -56], [-1, 0], [-57, 56], [-113, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[-31, -11], [-43, 1], [-31, 13], [-19, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]], true],
    ["O", [[true, [[56.5, -56], [112.5, 0], [56.5, 56], [0.5, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[84.5, -11], [72.5, 1], [84.5, 13], [96.5, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]], true],
    ["N", [[true, [[117, -55], [160, -55], [191, -16], [191, -55], [225, -55], [225, 56], [187, 56], [156, 18], [156, 56], [117, 56]], null, null]], false]
];
function C05_logo(ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "NOON logo")), i, j, gi, L, fill, cnt = {};
    N3.place(ctx, l);
    for (i = 0; i < C05_LOGO.length; i++) {
        L = C05_LOGO[i];
        cnt[L[0]] = (cnt[L[0]] || 0) + 1;
        gi = N3.addGroup(l, L[0] + " " + cnt[L[0]]);
        for (j = 0; j < L[1].length; j++) { N3.addPath(l, gi, L[1][j][1], L[1][j][2], L[1][j][3], L[1][j][0]); }
        fill = N3.addFill(l, gi, N3.COL.navy);
        if (L[2]) { fill.property("ADBE Vector Fill Rule").setValue(2); }     // even-odd: the counter is a hole
    }
    N3.pos(l).setValue([ctx.ox + o.pos[0], ctx.oy + o.pos[1]]);
    N3.xf(l, "ADBE Scale").setValue([o.scale, o.scale]);
    return l;
}
// Process ring (as in clip 04): one text layer on a circular mask (Path Options), tracking 261 = web textLength 1870.
function C05_ring(ctx, o) {
    var str = "", i, l, m, s = new Shape(), r = o.r, k = 0.5523 * o.r;
    for (i = 0; i < 2; i++) { str += "BRIEF → PURPOSE → DIRECTION → RULES → REVIEW → HANDOVER → "; }
    str = str.replace(/\s+$/, "");
    l = N3.text(ctx, str, { name: "Process ring", x: 0, top: 0, fs: 19, wt: 700, ls: 0.261, color: "#B54A50" });
    N3.pos(l).setValue([ctx.ox + o.cx, ctx.oy + o.cy]);
    s.vertices = [[0, -r], [r, 0], [0, r], [-r, 0]];
    s.inTangents = [[-k, 0], [0, -k], [k, 0], [0, k]];
    s.outTangents = [[k, 0], [0, k], [-k, 0], [0, -k]];
    s.closed = true;
    m = N3.mask(l, s);
    m.name = "Ring path";
    m.maskMode = MaskMode.NONE;
    l.property("ADBE Text Properties").property("ADBE Text Path Options").property("ADBE Text Path").setValue(m.propertyIndex);
    return l;
}

// One list row as its own collapsed precomp ("05 · Row n"), so the row rises/scales/blurs in as one piece like the web
// row div. Returns a ctx whose origin is the row's top-left (web: left -370, top STEP_TOP(i) inside the list group).
function C05_rowComp(S, g, name, top) {
    var ox = 20, oy = 20, pc, l;
    pc = app.project.items.addComp(S.id + " · " + name, 780, 110, 1, S.T, N3.FPS);
    if (N3.folders) { pc.parentFolder = N3.folders.precomps; }
    AEL.created("precomp", pc.name);
    l = g.comp.layers.add(pc);
    l.name = N3.uname(g.comp, name);
    N3.xf(l, "ADBE Anchor Point").setValue([ox + 370, oy + 35]);     // web transform-origin: centre of the 740 x 70 row
    N3.pos(l).setValue(N3.P(g, 0, top + 35));
    try { l.collapseTransformation = true; } catch (e) { AEL.warn("collapse: " + e); }
    return { comp: pc, ox: ox, oy: oy, parent: null, slot: "pre", S: S, layer: l };
}

// Tick: coral disc + white check (web: 36 px circle at left 690, top 17, check icon 20 px / 3 px) that pops on a spring.
function C05_tick(rc, t) {
    var l = N3.shapeLayer(rc.comp, N3.uname(rc.comp, "Tick")), gi, i, data = N3_ICONS.check, pop;
    gi = N3.addGroup(l, "Check");
    for (i = 0; i < data.length; i++) { N3.addPath(l, gi, data[i][1], data[i][2], data[i][3], data[i][0]); }
    N3.addStroke(l, gi, "#FFFFFF", 3 * 24 / 20, undefined, true);
    N3.gxf(l, gi, "ADBE Vector Scale").setValue([100 * 20 / 24, 100 * 20 / 24]);
    gi = N3.addGroup(l, "Disc");
    N3.addEllipse(l, gi, 36, 36);
    N3.addFill(l, gi, N3.COL.coral);
    N3.pos(l).setValue(N3.P(rc, 708, 35));
    pop = N3.slider(l, "Pop", 0);
    N3.spring(pop, 0, [[t, 1, [16, 0.8]]]);
    AEL.expr(N3.xf(l, "ADBE Scale"), "// scale = Pop (springs 0 -> 1, slight overshoot)\nvar v = Math.max(0, effect(\"Pop\")(1)) * 100;\n[v, v]");
    AEL.expr(N3.xf(l, "ADBE Opacity"), "Math.min(100, Math.max(0, 200 * effect(\"Pop\")(1)))");
    return l;
}

N3CLIPS["05"] = { tin: 15.30, build: function () {
    var T0 = 15.30, tList = 0.15, tCheck = N3.wt(127, T0), TH = [N3.wt(96, T0), N3.wt(97, T0), N3.wt(100, T0)],
        ST = [], S, g, l, rc, i, s, sNext, keys, logo, ring, tag, fill, ic, sc, sh, tr, k, b,
        TF = ["bag.png", "social1.png", "motion2_bag.mp4"], SUN030 = 0.2 + 29 / N3.FPS;   // web thumb 3 = sunrise/030.jpg
    for (i = 0; i < C05_STEPS.length; i++) { ST.push(C05_STEPS[i][3] - T0 - 0.12); }     // row reveal = its spoken line
    S = N3.scene({ id: "05", title: "Six steps", T: 23.7, intro: null,
        SH: { bag: { w: 440, h: 440, r: 36, bg: "#C6C5C4", cam: 1.15 }, list: { w: 840, h: 760, r: 40, bg: "#FFFFFF", cam: 1.32 } },
        start: "bag", SEQ: [[tList, "list"]], cy: [[tList, 0, N3.SP.MORPH]] });
    N3.ctl(S.shape, "CY").setValueAtTime(0, 40);                                          // the bag sits at y 40 (end of clip 04)

    // world + over: the wordmark, ring and tag from clip 04 leave (0.35 s ease-out)
    ring = C05_ring(S.worldCtx, { cx: 0, cy: 40, r: 300 });
    N3.lin(N3.xf(ring, "ADBE Rotate Z"), [0, 23.7], [-5.32 * 9, -(23.7 + 5.32) * 9]);
    N3.eo(N3.xf(ring, "ADBE Opacity"), 0, 0.35, 100, 0);
    N3.eo(N3.xf(ring, "ADBE Scale"), 0, 0.35, [100, 100, 100], [115, 115, 100]);
    tag = N3.text(S.worldCtx, "The whole process · one project", { name: "Tag", x: -0.07 * 19, top: 372, fs: 19, wt: 600, ls: 0.14,
        caps: true, color: N3.COL.capRed, align: "center" });
    N3.eo(N3.xf(tag, "ADBE Opacity"), 0, 0.35, 100, 0);
    logo = C05_logo(S.overCtx, { name: "NOON logo", pos: [0, 109.6 - 470], scale: 160 * 0.38 });
    N3.eo(N3.pos(logo), 0, 0.35, [0, 109.6 - 470], [0, 109.6 - 530]);
    N3.eo(N3.xf(logo, "ADBE Opacity"), 0, 0.35, 100, 0);

    // the bag photo leaves as the card opens into the list
    g = N3.group(S, "Bag", { tin: null, tout: tList, lout: 0.14 });
    N3.image(g, "bag.png", { name: "Bag", cx: 0, cy: 0, w: 440, h: 440 });

    // the list card (hangs from the card's top edge)
    g = N3.group(S, "List", { anchor: "t", tin: tList, din: 0.05, lin: 0.3 });
    l = N3.box(g, { name: "Active row", x: -396, y: C05_TOP(0) - 8, w: 792, h: 86, r: 22, fill: N3.COL.blush });
    keys = [];
    for (i = 1; i < ST.length; i++) { keys.push([ST[i], N3.P(g, 0, C05_TOP(i) - 8 + 43), N3.SP.MORPH]); }
    N3.spring(N3.pos(l), N3.P(g, 0, C05_TOP(0) - 8 + 43), keys, N3.SP.MORPH);              // springs to each new row
    N3.lin(N3.xf(l, "ADBE Opacity"), [ST[0], ST[0] + 0.3, tCheck, tCheck + 0.4], [0, 100, 100, 0]);
    N3.text(g, "The workflow · 2027", { name: "Eyebrow", x: -370, top: 42, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "What we're going to do", { name: "Heading", x: -370, top: 70, fs: 40, wt: 600, ls: -0.025, color: N3.COL.ink });

    for (i = 0; i < C05_STEPS.length; i++) {
        s = ST[i];
        sNext = i + 1 < ST.length ? ST[i + 1] : tCheck;                                   // the row stays active until then
        rc = C05_rowComp(S, g, "Row " + (i + 1), C05_TOP(i));
        // tile: coral while active (fill opacity 15 -> 100 % over 0.35 s), back to blush when the next row takes over
        l = N3.box(rc, { name: "Tile", x: 0, y: 5, w: 60, h: 60, r: 17, fill: "#FBE3E2" });
        fill = N3.gc(l, 1).property("ADBE Vector Graphic - Fill");
        N3.hold(fill.property("ADBE Vector Fill Color"), [0, s, sNext], [N3.rgba("#FBE3E2"), N3.rgba(N3.COL.coral), N3.rgba("#FBE3E2")]);
        N3.lin(fill.property("ADBE Vector Fill Opacity"), [s, s + 0.35], [15, 100]);
        ic = N3.icon(rc, C05_STEPS[i][0], { name: "Icon", cx: 30, cy: 35, size: 32, color: N3.COL.coral, sw: 2 });
        N3.hold(N3.gc(ic, 1).property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Color"), [0, s + 0.175, sNext],
            [N3.rgba(N3.COL.coral), N3.rgba("#FFFFFF"), N3.rgba(N3.COL.coral)]);
        N3.text(rc, C05_STEPS[i][1], { name: "Title", x: 84, top: 4, fs: 28, wt: 600, ls: -0.025, color: N3.COL.ink });
        N3.text(rc, C05_STEPS[i][2], { name: "Subtitle", x: 84, top: 41, fs: 18, wt: 400, color: N3.COL.soft });
        C05_tick(rc, tCheck + i * 0.08);
        N3.show(rc.layer, s, null, 22, { din: 0, lin: 0.45, blur: 10 });
    }

    // format thumbnails beside "Carry it across every format" (web: 52 px, radius 13, at left 110 + 62 i, top STEP_TOP(3) + 9).
    // Effects work in the image's own pixels (scaled to ~4 %), so blur/shadow amounts are divided by the layer scale.
    for (i = 0; i < 3; i++) {
        l = N3.image(g, TF[i], { name: "Thumb " + (i + 1), cx: 110 + 62 * i + 26, cy: C05_TOP(3) + 9 + 26, w: 52, h: 52, r: 13 });
        if (i === 2) {                                                                     // freeze the motion clip on the sunrise frame
            l.timeRemapEnabled = true;
            tr = l.property("ADBE Time Remapping");
            N3.addKey(tr, 0, SUN030);
            for (k = tr.numKeys; k >= 1; k--) { tr.setValueAtTime(tr.keyTime(k), SUN030); }
            l.outPoint = S.T;
        }
        sc = N3.xf(l, "ADBE Scale").value[0] / 100;
        sh = N3.shadow(l, { color: "#78282D", opacity: 0.3, dist: 5 / sc, soft: Math.min(250, 12 / sc) });
        N3.show(l, TH[i] - 0.05, null, 10, { din: 0, lin: 0.35, noBlur: true });
        b = N3.blur(l);
        N3.eo(b, TH[i] - 0.05, TH[i] + 0.3, 12 / sc, 0);
    }
    return S;
} };
