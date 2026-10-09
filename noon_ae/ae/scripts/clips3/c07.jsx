// Clip 07 (11.0 s): "for this first stage ... a really neat way ... slide into a new tag team of software ... act as a powerhouse".
// The Creative brief (clip 06's end state) -> Stage 01 pill with progress segments -> dark "A really neat way" pill
// (sparkles twirl) -> the card slides out left and the tag-team card ("? x ?") springs in from the right -> POWERHOUSE.

// NOON wordmark (same shape data as clip 06; clip-private copy so this file builds on its own).
var C07_LOGO = [
    ["N", [[true, [[-225, -55], [-183, -55], [-150, -16], [-150, -55], [-116, -55], [-116, 54], [-155, 54], [-186, 17], [-186, 54], [-225, 54]]]]],
    ["O 1", [[true, [[-57, -56], [-1, 0], [-57, 56], [-113, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[-31, -11], [-43, 1], [-31, 13], [-19, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]]],
    ["O 2", [[true, [[56.5, -56], [112.5, 0], [56.5, 56], [0.5, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[84.5, -11], [72.5, 1], [84.5, 13], [96.5, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]]],
    ["N 2", [[true, [[117, -55], [160, -55], [191, -16], [191, -55], [225, -55], [225, 56], [187, 56], [156, 18], [156, 56], [117, 56]]]]]
];
// The wordmark in an SVG box (x, y = top-left, w, h; preserveAspectRatio meet). o: {name, x, y, w, h, color}
function C07_logo(ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "NOON wordmark")), gi, i, j, part, sub, si, pr, sh, fl, s = Math.min(o.w / 450, o.h / 112),
        vg = function () { return N3.gc(l, gi).property(si).property("ADBE Vectors Group"); };
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Wordmark");
    for (i = 0; i < C07_LOGO.length; i++) {
        part = C07_LOGO[i];
        sub = N3.gc(l, gi).addProperty("ADBE Vector Group");
        sub.name = part[0];
        si = sub.propertyIndex;
        for (j = 0; j < part[1].length; j++) {
            pr = vg().addProperty("ADBE Vector Shape - Group");
            sh = new Shape();
            sh.vertices = part[1][j][1];
            sh.inTangents = part[1][j][2] || C07_zeros(part[1][j][1].length);
            sh.outTangents = part[1][j][3] || C07_zeros(part[1][j][1].length);
            sh.closed = true;
            vg().property(pr.propertyIndex).property("ADBE Vector Shape").setValue(sh);
        }
        fl = vg().addProperty("ADBE Vector Graphic - Fill");
        fl = vg().property(fl.propertyIndex);
        fl.property("ADBE Vector Fill Rule").setValue(2);                       // even-odd: the O counters are holes
        fl.property("ADBE Vector Fill Color").setValue(N3.rgba(o.color || N3.COL.navy));
    }
    N3.gxf(l, gi, "ADBE Vector Scale").setValue([s * 100, s * 100]);
    N3.pos(l).setValue(N3.P(ctx, o.x + o.w / 2, o.y + o.h / 2));
    return l;
}
function C07_zeros(n) { var z = [], i; for (i = 0; i < n; i++) { z.push([0, 0]); } return z; }

// Creative brief card exactly as clip 06 leaves it (static).
function C07_brief(g) {
    var i, top, BUL = ["Energy without the noise", "Creative focus, not hustle", "Calm information, one moment of energy"], SK = [430, 500, 380, 470, 300];
    C07_logo(g, { x: -270, y: 44, w: 118, h: 30 });
    N3.text(g, "Creative brief", { name: "Brief title", x: -270, top: 96, fs: 46, wt: 600, ls: -0.025 });
    N3.text(g, "Built from the client brief, audience research and meeting notes", { name: "Built from", x: -270, top: 162, fs: 18, color: N3.COL.soft });
    N3.box(g, { name: "Rule", x: -270, y: 206, w: 540, h: 1.5, fill: "#F2E2E1" });
    N3.text(g, "Designing towards", { name: "Designing towards", x: -270, top: 236, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    for (i = 0; i < BUL.length; i++) {
        top = 276 + i * 62;
        N3.ellipse(g, { name: "Bullet " + (i + 1) + " dot", cx: -263, cy: top + 20, d: 14, fill: N3.COL.coral });
        N3.text(g, BUL[i], { name: "Bullet " + (i + 1), x: -236, top: top, fs: 28, wt: 600, ls: -0.025 });
    }
    for (i = 0; i < SK.length; i++) { N3.box(g, { name: "Skeleton " + (i + 1), x: -270, y: 500 + i * 30, w: SK[i], h: 12, r: 6, fill: "#F4E4E3" }); }
}

// Tag-team slot: a null (scale 0.6 -> 1 on its "Pop" spring) carrying the tile and its "?" (opacity = Pop x 1.5).
function C07_slot(g, name, cx, t) {
    var nl = AEL.nullLayer(g.comp, name), ctx = { comp: g.comp, ox: 0, oy: 0, parent: nl, slot: "pre", S: g.S }, l, op;
    N3.xf(nl, "ADBE Anchor Point").setValue([0, 0]);
    N3.pos(nl).setValue(N3.P(g, cx, 0));
    N3.spring(N3.slider(nl, "Pop", 0), 0, [[t, 1]], [13, 0.8]);
    AEL.expr(N3.xf(nl, "ADBE Scale"), "var s = 60 + 40 * Math.max(0, effect(\"Pop\")(1));\n[s, s]");
    op = "clamp(thisComp.layer(\"" + name + "\").effect(\"Pop\")(1) * 150, 0, 100)";
    // 160 x 160 tile, r40, with a 2 px inset ring
    l = N3.box(ctx, { name: name + " tile", cx: 0, cy: 0, w: 158, h: 158, r: 39, fill: "#FCECEB", stroke: "#F6C9C8", sw: 2 });
    AEL.expr(N3.xf(l, "ADBE Opacity"), op);
    l = N3.text(ctx, "?", { name: name + " ?", x: 0, cy: 0, fs: 76, wt: 700, color: "#F2A3A3", align: "center" });
    AEL.expr(N3.xf(l, "ADBE Opacity"), op);
    return nl;
}

N3CLIPS["07"] = { tin: 52.30, build: function () {
    var T0 = 52.30, S, g, l, t, i, k, r0, gh, adv,
        tStage = 0.12, tNeat = N3.wt(178, T0) - 0.08, tSlide = N3.wt(192, T0), tTeam = tSlide + 0.42, tPower = N3.wt(207, T0) - 0.06;
    S = N3.scene({ id: "07", title: "Powerhouse", T: 11.0, intro: null,
        SH: { brief: { w: 720, h: 720, r: 30, bg: "#FFFFFF", cam: 1.36 }, stage: { w: 1190, h: 156, r: 78, bg: "#FFFFFF", cam: 1.42 },
            neat: { w: 720, h: 156, r: 78, bg: "#2B1C1E", cam: 1.42 }, team: { w: 760, h: 300, r: 56, bg: "#FFFFFF", cam: 1.4 },
            power: { w: 1560, h: 560, r: 64, bg: "#EA6262", cam: 1.13 } },
        start: "brief", SEQ: [[tStage, "stage"], [tNeat, "neat"], [tTeam, "team"], [tPower, "power"]],
        // the slide: out to the left, an instant jump to the right edge, then spring back to centre
        cx: [[tSlide, -1250, [11, 0.95]], [tTeam - 0.02, 1250, N3.SP.INSTANT], [tTeam, 0, [9.5, 0.9]]] });

    // 1. the brief from clip 06 (visible at t=0)
    g = N3.group(S, "Brief", { anchor: "t", tin: null, tout: tStage, lout: 0.14 });
    C07_brief(g);

    // 2. Stage 01 pill: label, divider, title, six progress segments (the first fills to 42%)
    g = N3.group(S, "Stage", { tin: tStage, tout: tNeat, din: 0.06, lin: 0.3 });
    N3.text(g, "Stage", { name: "Stage cap", x: -540, top: -34, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "01", { name: "Stage number", x: -540, top: -34 + 15 * N3.LHN, fs: 44, wt: 600, ls: -0.025, lh: 44 * 1.05, color: N3.COL.coral });
    N3.box(g, { name: "Divider", x: -436, y: -36, w: 1.5, h: 72, fill: "#F2E2E1" });
    N3.text(g, "Bring the project together", { name: "Stage title", x: -404, top: -20, fs: 31, wt: 600, ls: -0.025 });
    for (i = 0; i < 6; i++) { N3.box(g, { name: "Segment " + (i + 1), x: 180 + i * 68, y: -6, w: 58, h: 12, r: 6, fill: "#F4E1E0" }); }
    l = N3.box(g, { name: "Segment 1 fill", cx: 180, cy: 0, w: 1, h: 12, r: 6, fill: N3.COL.coral });
    N3.spring(N3.slider(l, "Fill", 0), 0, [[tStage + 0.5, 0.42]], N3.SP.SOFT);
    r0 = N3.root(l).property(1).property("ADBE Vectors Group").property(1);
    AEL.expr(r0.property("ADBE Vector Rect Size"), "// width = Fill x 58 (segment), grows from the left edge\n[58 * effect(\"Fill\")(1), 12]");
    r0 = N3.root(l).property(1).property("ADBE Vectors Group").property(1);
    AEL.expr(r0.property("ADBE Vector Rect Position"), "[29 * effect(\"Fill\")(1), 0]");

    // 3. the dark pill: sparkles + "A really neat way", centred as one row (icon 44 + gap 20 + text)
    g = N3.group(S, "Neat", { tin: tNeat, tout: tTeam - 0.05 });
    t = N3.text(g, "A really neat way", { name: "Neat text", x: 32, cy: 0, fs: 46, wt: 600, ls: -0.025, color: "#FFFFFF", align: "center" });
    l = N3.icon(g, "sparkles", { name: "Sparkles", cx: -200, cy: 0, size: 44, color: N3.COL.coral, sw: 2 });
    AEL.expr(N3.pos(l), "// 20 px left of the text\nvar L = thisComp.layer(\"Neat text\"), r = L.sourceRectAtTime(time, false);\n[L.transform.position[0] + r.left - 20 - 22, value[1]]");
    N3.spring(N3.slider(l, "Spark", 0), 0, [[N3.wt(182, T0), 1, [14, 0.6]]], [14, 0.6]);
    AEL.expr(N3.xf(l, "ADBE Rotate Z"), "effect(\"Spark\")(1) * 90");
    AEL.expr(N3.xf(l, "ADBE Scale"), "var s = 100 * (1 + 0.25 * Math.sin(Math.PI * clamp(effect(\"Spark\")(1), 0, 1)));\n[s, s]");

    // 4. tag team: two slots pop in on "tag" / "team", the x between, then the subline (starts at the centre line,
    //    as in the approved render: the web show() replaced its translateX(-50%))
    g = N3.group(S, "Tag team", { tin: tTeam, tout: tPower });
    C07_slot(g, "Slot 1", -180, N3.wt(196, T0));
    N3.text(g, "\u00d7", { name: "Times", x: -24, top: -36, fs: 62, wt: 300, color: "#C9A9AA" });
    C07_slot(g, "Slot 2", 180, N3.wt(197, T0));
    t = N3.text(g, "Two tools, one powerhouse", { name: "Two tools", x: 0, top: 104, fs: 24, wt: 600, color: N3.COL.soft });
    N3.show(t, N3.wt(200, T0), null, 10, { din: 0, lin: 0.4 });

    // 5. POWERHOUSE on coral: letters rise in one by one (layer marker = first letter, 0.03 s apart), ghost rows drift in
    g = N3.group(S, "Powerhouse", { tin: tPower, din: 0.04, lin: 0.15 });
    for (i = 0; i < 2; i++) {
        gh = N3.text(g, "POWERHOUSE", { name: "Ghost " + (i + 1), x: 5, top: i ? 122 : -322, fs: 200, wt: 800, ls: -0.05, lh: 200, color: "#FFFFFF" , align: "center" });
        r0 = N3.pos(gh).value;
        N3.eo(N3.xf(gh, "ADBE Opacity"), tPower + 0.25, tPower + 1.15, 0, 28);
        N3.eo(N3.pos(gh), tPower + 0.25, tPower + 1.15, [r0[0], r0[1] + (i ? 70 : -70)], [r0[0], r0[1]]);
    }
    t = N3.text(g, "POWERHOUSE", { name: "POWERHOUSE", x: 5, cy: 0, fs: 200, wt: 800, ls: -0.05, lh: 200, color: "#FFFFFF", align: "center" });
    N3.unitReveal(t, { times: [tPower + 0.05], stagger: 0.03, based: "chars", dy: 60, blur: 16, lin: 0.45 });
    // In the approved render the word grows from the centre: letters not yet revealed take no space, so the shown ones stay
    // centred. Hold keys on Position x (one per letter, Inter ExtraBold 200 px advances incl. -0.05 em tracking).
    r0 = N3.pos(t).value; gh = [];
    for (i = 0; i < 10; i++) { gh.push(0); }
    adv = [120.4, 144.6, 201.7, 112.0, 122.4, 139.7, 144.6, 135.4, 122.0, 112.0];
    for (i = 0; i < 10; i++) { gh[i] = 0; for (k = i + 1; k < 10; k++) { gh[i] += adv[k] / 2; } }
    for (i = 0; i < 10; i++) { gh[i] = [r0[0] + N3.r3(gh[i]), r0[1]]; adv[i] = tPower + 0.05 + 0.03 * i; }
    adv[0] = 0;
    N3.hold(N3.pos(t), adv, gh);
    return S;
} };
