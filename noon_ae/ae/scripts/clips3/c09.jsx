// Clip 09 (22.15 s): "in the discovery meeting notes, under the main disagreement ..." - the stage pill opens into the notes
// document; a real pen highlights the heading and each person's line (role chips appear), the camera pushes in, pans down to
// Sam's note, then pulls back.

// Highlight bar behind a text line: left at x, width = (measured line width + 12) x "Progress" (linear keys s -> e).
function C09_highlight(ctx, name, lineName, x, top, hex, opacity, s, e) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, name)), gi, r;
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Bar");
    r = N3.addRect(l, gi, 0, 32, 5);
    N3.addFill(l, gi, hex, opacity);
    N3.lin(N3.slider(l, "Progress", 0), [s, e], [0, 1]);
    AEL.expr(r.property("ADBE Vector Rect Size"), "// width = line width + 12, drawn out by Progress\nvar r = thisComp.layer(\"" + lineName + "\").sourceRectAtTime(time, false);\n" +
        "[(r.left + r.width + 12) * effect(\"Progress\")(1), 32]");
    AEL.expr(r.property("ADBE Vector Rect Position"), "// left edge stays put\nvar r = thisComp.layer(\"" + lineName + "\").sourceRectAtTime(time, false);\n" +
        "[(r.left + r.width + 12) * effect(\"Progress\")(1) / 2, 0]");
    l.blendingMode = BlendingMode.MULTIPLY;
    N3.pos(l).setValue(N3.P(ctx, x, top + 16));
    return l;
}

N3CLIPS["09"] = { tin: 80.00, build: function () {
    var T0 = 80.00, tDoc = 0.2, DOC_TOP = -420, S, g, i, k, t, c, l, pen, tip, lift, sh, fxp, ln, s, e, y, d, n, A = 0.08,
        // [text, top, highlight start, end (absolute s), chip, measured line width + 12 (web, Inter) for the pen's stroke end]
        LN = [[null, 176, 83.04, 83.90, "", 295],
            ["Maya wants the brand to feel quiet, premium and controlled.", 228, 84.64, 87.90, "MAYA · FOUNDER", 605],
            ["Alex believes the launch needs much more colour and immediate energy", 276, 88.32, 90.20, "ALEX · MARKETING", 729],
            ["to stop people scrolling.", 310, 90.22, 90.90, "", 249],
            ["Jo is concerned that an overly abstract campaign could make the product", 358, 91.36, 93.40, "JO · SALES", 741],
            ["category unclear, especially if customers first see the work at a distance.", 392, 93.42, 94.90, "", 734],
            ["Sam: “The answer may not be choosing calm or loud. The system could hold calm", 462, 97.44, 99.60, "SAM · CREATIVE", 821],
            ["information and one unmistakable moment of energy.”", 496, 99.62, 101.60, "", 550]],
        K = [], travel = [], liftK = [];
    S = N3.scene({ id: "09", title: "Discovery notes", T: 22.15, intro: null,
        SH: { stage: { w: 1190, h: 156, r: 78, bg: "#FFFFFF", cam: 1.42 }, doc: { w: 1000, h: 840, r: 22, bg: "#FFFFFF", cam: 1.18 } },
        start: "stage", SEQ: [[tDoc, "doc"]],
        // push in on the paragraph (1.18 -> 1.36), pan down to Sam's note on "just below that", pull back at the end
        camMul: [[LN[1][2] - T0 - 0.6, 1.36 / 1.18, N3.SP.CAM], [101.15 - T0, 1, N3.SP.CAM]],
        fy: [[LN[1][2] - T0 - 0.6, -60, N3.SP.CAM], [96.3 - T0, 60, N3.SP.CAM], [101.15 - T0, 0, N3.SP.CAM]] });

    // ---- carried over from clip 08: Stage 02 pill
    g = N3.group(S, "Stage", { tin: null, tout: tDoc, lout: 0.14 });
    N3.text(g, "Stage", { name: "Stage cap", x: -540, top: -34, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "02", { name: "Stage number", x: -540, top: -34 + 15 * N3.LHN, fs: 44, wt: 600, ls: -0.025, lh: 46.2, color: N3.COL.coral });
    N3.box(g, { name: "Divider", x: -436, y: -36, w: 1.5, h: 72, fill: "#F2E2E1" });
    N3.text(g, "Plan how people encounter it", { name: "Stage label", x: -404, top: -20, fs: 31, wt: 600, ls: -0.025 });
    for (i = 0; i < 6; i++) { N3.box(g, { name: "Segment " + (i + 1), x: 180 + i * 68, y: -6, w: 58, h: 12, r: 6, fill: "#F4E1E0" }); }
    N3.box(g, { name: "Segment 1 fill", x: 180, y: -6, w: 58, h: 12, r: 6, fill: N3.COL.coral });
    N3.box(g, { name: "Segment 2 fill", x: 248, y: -6, w: 20, h: 12, r: 6, fill: N3.COL.coral });

    // ---- the notes document (hangs from the card top)
    g = N3.group(S, "Notes", { anchor: "t", tin: tDoc, din: 0.06, lin: 0.35 });
    N3.text(g, "NOON Discovery Meeting Notes", { name: "Title", x: -430, top: 54, fs: 34, wt: 600, ls: -0.025 });
    N3.text(g, "8 September 2026 · Brand and launch discovery · Working notes", { name: "Subtitle", x: -430, top: 104, fs: 17, color: N3.COL.soft });
    N3.box(g, { name: "Rule", x: -430, y: 142, w: 860, h: 1.5, fill: "#F2E2E1" });
    for (i = 0; i < LN.length; i++) {         // highlight bars first (under the text), multiply like the web clip
        C09_highlight(g, "Highlight " + i, i ? "Line " + i : "Heading", -436, LN[i][1] - 1, i >= 6 ? "#EA6262" : "#F7A6A4", i >= 6 ? 42 : 62,
            LN[i][2] - T0, LN[i][3] - T0);
    }
    N3.text(g, "The main disagreement", { name: "Heading", x: -430, top: 176, fs: 26, wt: 600, ls: -0.025, lh: 30, color: "#3A2A2C" });
    for (i = 1; i < LN.length; i++) { N3.text(g, LN[i][0], { name: "Line " + i, x: -430, top: LN[i][1], fs: 21, lh: 30, color: "#3A2A2C" }); }
    for (i = 1; i < LN.length; i++) {
        if (!LN[i][4]) { continue; }
        c = N3.chip(g, LN[i][4], { name: "Chip " + LN[i][4].split(" ")[0], x: 330, top: LN[i][1] - 4, fs: 13, wt: 600,
            bg: i >= 6 ? N3.COL.coral : "#FCE3E2", color: i >= 6 ? "#FFFFFF" : N3.COL.capRed });
        N3.show(c.bg, LN[i][2] - T0, null, 10, { din: 0, lin: 0.35 });
        N3.show(c.text, LN[i][2] - T0, null, 10, { din: 0, lin: 0.35 });
    }
    k = [820, 760, 640, 800, 520];
    for (i = 0; i < k.length; i++) { N3.box(g, { name: "Placeholder line", x: -430, y: 572 + i * 32, w: k[i], h: 11, r: 6, fill: "#F5E8E7" }); }

    // ---- the pen (over the card, world space). Tip = nib path (keys; strokes linear so the nib rides the bar's edge,
    // travels eased and arced); Lift = 0 on paper / 1 lifted (sprung) -> raise, tilt, grow, longer softer shadow.
    K.push([0, 640, 330], [LN[0][2] - T0 - 0.55, 640, 330]); travel.push(true);
    for (i = 0; i < LN.length; i++) {
        s = LN[i][2] - T0; e = LN[i][3] - T0; y = DOC_TOP + LN[i][1] + 26;
        K.push([s, -436, y], [e, -436 + LN[i][5], y]); travel.push(true, false);
        if (i === 0 || s - (LN[i - 1][3] - T0) > 0.3) { liftK.push([s - 0.12, 0, N3.SP.FAST]); }
        if (i === LN.length - 1 || (LN[i + 1][2] - LN[i][3]) > 0.3) { liftK.push([e + 0.02, 1, N3.SP.FAST]); }
    }
    K.push([101.95 - T0, 640, 330]); travel.push(true);
    pen = N3.image(S.overCtx, "pen.png", { name: "Pen", cx: 640, cy: 330, w: 270, h: 270, fit: "width" });
    N3.xf(pen, "ADBE Anchor Point").setValue([2000 * 25 / 270, 2000 * 250 / 270]);       // the nib
    N3.fx(pen, "ADBE Point Control", "Tip");
    tip = N3.ctl(pen, "Tip");
    for (i = 0; i < K.length; i++) { N3.addKey(tip, K[i][0], [K[i][1], K[i][2]]); }
    for (i = 1; i <= tip.numKeys; i++) {
        tip.setInterpolationTypeAtKey(i, travel[i - 2] === false ? KeyframeInterpolationType.LINEAR : KeyframeInterpolationType.BEZIER,
            travel[i - 1] === false ? KeyframeInterpolationType.LINEAR : KeyframeInterpolationType.BEZIER);
        tip.setTemporalEaseAtKey(i, [new KeyframeEase(0, 60)], [new KeyframeEase(0, 60)]);
        tip.setSpatialAutoBezierAtKey(i, false); tip.setSpatialContinuousAtKey(i, false);
    }
    // spatial tangents: strokes straight, travel moves bow sideways by 6% of their length (the web path's "human arc")
    for (i = 1; i <= tip.numKeys; i++) {
        t = [[0, 0], [0, 0]];
        if (i > 1 && travel[i - 2]) { d = [K[i - 1][1] - K[i - 2][1], K[i - 1][2] - K[i - 2][2]]; n = [-d[1], d[0]]; t[0] = [-d[0] / 3 + A * n[0], -d[1] / 3 + A * n[1]]; }
        if (i < tip.numKeys && travel[i - 1]) { d = [K[i][1] - K[i - 1][1], K[i][2] - K[i - 1][2]]; n = [-d[1], d[0]]; t[1] = [d[0] / 3 + A * n[0], d[1] / 3 + A * n[1]]; }
        tip.setSpatialTangentsAtKey(i, t[0], t[1]);
    }
    lift = N3.spring(N3.slider(pen, "Lift", 1), 1, liftK, N3.SP.FAST);
    AEL.expr(N3.pos(pen), "// nib at Tip, raised 18 px by Lift, tiny hand wobble while drawing\nvar up = effect(\"Lift\")(1), p = effect(\"Tip\")(1);\n" +
        "[p[0], p[1] - 18 * up + Math.sin(time * 17) * 0.8 * (1 - up)]");
    AEL.expr(N3.xf(pen, "ADBE Rotate Z"), "4 * effect(\"Lift\")(1)");
    AEL.expr(N3.xf(pen, "ADBE Scale"), "mul(value, 1 + 0.05 * effect(\"Lift\")(1))");
    N3.lin(N3.xf(pen, "ADBE Opacity"), [LN[0][2] - T0 - 0.7, LN[0][2] - T0 - 0.3, 21.8, 22.1], [0, 100, 100, 0]);
    sh = N3.shadow(pen, N3.SHADOW.pen);
    fxp = function (mn) { return pen.property("ADBE Effect Parade").property("Shadow").property(mn); };
    // web: drop-shadow(-6-14u, 8+22u, blur 6+12u, alpha .30-.10u) in world px; effect values are in layer px (/ layer scale)
    l = "var up = effect(\"Lift\")(1), dx = -6 - 14 * up, dy = 8 + 22 * up, k = transform.scale[0] / 100;\n";
    AEL.expr(fxp("ADBE Drop Shadow-0002"), "var up = effect(\"Lift\")(1);\n255 * (0.30 - 0.10 * up)");
    AEL.expr(fxp("ADBE Drop Shadow-0003"), l + "Math.atan2(dx, -dy) * 180 / Math.PI");
    AEL.expr(fxp("ADBE Drop Shadow-0004"), l + "Math.sqrt(dx * dx + dy * dy) / k");
    AEL.expr(fxp("ADBE Drop Shadow-0005"), l + "(6 + 12 * up) * 1.5 / k");
    return S;
} };
