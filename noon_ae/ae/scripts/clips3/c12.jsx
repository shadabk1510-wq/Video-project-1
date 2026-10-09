// Clip 12 (119.05 s, runs to 145.40 with chunk 2): "before designing the assets ... I'm going to map three different points where somebody will encounter
// the coffee brand noon" - the PROFESSIONAL card becomes a phone screen (real frame on top) with a blurred scrolling feed and
// a "REVEALED SOON" chip; then the phone moves left and the product-page window and the pack join, with numbered badges,
// labels and a dotted journey line drawn through the three touchpoints.

// A small precomp placed into ctx (S.worldCtx / S.overCtx / a card group) at ctx point [x, y]; its anchor is its centre.
// Returns {layer, ctx}; the inner ctx origin is (ox, oy) in the precomp (default: its centre).
function C12_pre(ctx, name, w, h, x, y, ox, oy) {
    var S = ctx.S, pc = app.project.items.addComp(S.id + " \u00b7 " + name, w, h, 1, S.T, N3.FPS), l;
    if (N3.folders) { pc.parentFolder = N3.folders.precomps; }
    AEL.created("precomp", pc.name);
    l = ctx.comp.layers.add(pc);
    l.name = N3.uname(ctx.comp, name);
    N3.place(ctx, l);
    N3.xf(l, "ADBE Anchor Point").setValue([w / 2, h / 2]);
    N3.pos(l).setValue(N3.P(ctx, x, y));
    return { layer: l, ctx: { comp: pc, ox: ox === undefined ? w / 2 : ox, oy: oy === undefined ? h / 2 : oy, parent: null, slot: "pre", S: S, layer: l } };
}

// Layout grid with square handles (same as clip 11).
function C12_grid(ctx) {
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

// "In" spring (0 -> 1) on a precomp layer: rises 120 px, scales 0.92 -> 1, fades in at 1.3x (the web windows' entrance).
function C12_join(l, t, tOut) {
    N3.spring(N3.slider(l, "In", 0), 0, [[t, 1, N3.SP.MORPH]]);
    N3.eo(N3.slider(l, "Out", 1), tOut, tOut + 0.3, 1, 0);
    AEL.expr(N3.pos(l), "// rises into place with the In spring\nvar w = effect(\"In\")(1);\n[value[0], value[1] + (1 - w) * 120]");
    AEL.expr(N3.xf(l, "ADBE Scale"), "var s = (0.92 + 0.08 * effect(\"In\")(1)) * (0.97 + 0.03 * effect(\"Out\")(1)) * 100;\n[s, s]");
    AEL.expr(N3.xf(l, "ADBE Opacity"), "Math.min(1, Math.max(0, effect(\"In\")(1) * 1.3)) * effect(\"Out\")(1) * 100");
}

N3CLIPS["12"] = { tin: 119.05, build: function () {
    var T0 = 119.05, tPhone = 0.15, tSoon = N3.wt(367, T0), tMap = N3.wt(371, T0) - 0.45,
        tB = [N3.wt(371, T0), N3.wt(372, T0) + 0.25, N3.wt(374, T0)], tPath = N3.wt(374, T0) + 0.15,
        WEB = [80, -10], PACK = [700, -10], BP, LP, S, g, i, t, P, c, l, feed, fp, frame, path, st, dash, ICONS = ["mobile", "browser", "package"],
        LABELS = ["Social post", "Product page", "Packaging"], tBoard = 140.28 - T0, tOut = tBoard - 0.1, tN = [129.48 - T0, 131.24 - T0, 133.64 - T0], SHX = "thisComp.layer(\"SHAPE\").effect(\"CX\")(1)", shadowWin = { color: "#96323A", opacity: 0.36, dist: 22, soft: 46 };
    // chunk 2: the clip runs on to 145.40 - each touchpoint pulses as it is named, then everything settles into the
    // working document (the phone morphs into the board) on "place them beside each other in the working document".
    S = N3.scene({ id: "12", title: "Three touchpoints", T: 26.35, intro: null, drift: 3,
        SH: { pro: { w: 1760, h: 940, r: 56, bg: "#EA6262", cam: 1.06 }, screen: { w: 420, h: 858, r: 54, bg: "#FFFFFF", cam: 1.0 },
            screen2: { w: 420, h: 858, r: 54, bg: "#FFFFFF", cam: 0.84 }, board: { w: 1720, h: 900, r: 40, bg: "#FFFFFF", cam: 1.0 } },
        start: "pro", SEQ: [[tPhone, "screen"], [tMap, "screen2"], [tBoard, "board"]], cx: [[tMap, -600, N3.SP.MORPH], [tBoard, 0, N3.SP.MORPH]] });
    // badge / label anchor points once mapped (badge 1 and label 1 follow the phone: x from SHAPE CX)
    BP = [[-600 - 210, -430], [WEB[0] - 360, -250], [PACK[0] - 190, -250]];
    LP = [[-600, 480], [WEB[0], 290], [PACK[0], 290]];

    // ---- card: the PROFESSIONAL page as clip 11 ended
    g = N3.group(S, "Professional", { tin: null, tout: tPhone, lout: 0.14 });
    C12_grid(g);
    for (i = 0; i < 2; i++) {
        N3.text(g, "PROFESSIONAL", { name: "Ghost " + (i + 1), x: 4.5, top: i ? 190 : -370, fs: 180, wt: 800, ls: -0.05, lh: 180, color: "#FFFFFF", align: "center", opacity: 26 });
    }
    N3.text(g, "High-level", { name: "High-level", x: -6, top: -150, fs: 30, wt: 600, ls: 0.4, caps: true, color: "#FFFFFF", align: "center" });
    N3.text(g, "PROFESSIONAL", { name: "PROFESSIONAL", x: 4.5, cy: 0, fs: 180, wt: 800, ls: -0.05, lh: 180, color: "#FFFFFF", align: "center" });
    N3.text(g, "designers from everybody else.", { name: "Rest", x: 0, top: 395, fs: 40, wt: 600, color: "#FFFFFF", align: "center" });

    // ---- card: the phone screen - blurred feed of the real designs scrolling up, "REVEALED SOON" chip
    g = N3.group(S, "Phone screen", { tin: tPhone, din: 0.05, lin: 0.35, tout: tBoard - 0.05, lout: 0.2 });
    P = C12_pre(g, "Feed", 420, 2033, 0, -429 + 2033 / 2);
    c = P.ctx; c.ox = 0; c.oy = 0;
    t = 0;
    l = N3.image(c, "social1.png", { name: "Feed social1", x: 0, y: t, w: 420, fit: "width" }); t += 420;
    l = N3.image(c, "product_page.png", { name: "Feed product page", x: 0, y: t, w: 420, fit: "width" }); t += 420 * 1701 / 924;
    l = N3.image(c, "bag.png", { name: "Feed bag", x: 0, y: t, w: 420, fit: "width" }); t += 420;
    l = N3.image(c, "social2.png", { name: "Feed social2", x: 0, y: t, w: 420, fit: "width" });
    feed = P.layer;
    N3.blur(feed).setValue(10);
    fp = N3.pos(feed).value;
    N3.spring(N3.pos(feed), fp, [[tPhone + 0.6, [fp[0], fp[1] - 900, fp[2]], [0.9, 1]]]);
    P = C12_pre(g, "Revealed soon", 400, 100, 0, -340 + 45.4 / 2);
    N3.chip(P.ctx, "Revealed soon", { name: "Soon chip", cx: 0, cy: 0, fs: 21, ls: 0.14, caps: true, padX: 20, padY: 10, bg: N3.COL.coral, color: "#FFFFFF" });
    N3.eo(N3.xf(P.layer, "ADBE Opacity"), tSoon, tSoon + 0.35, 0, 100);
    N3.eo(N3.xf(P.layer, "ADBE Scale"), tSoon, tSoon + 0.35, [90, 90], [100, 100]);

    // ---- over: the real phone frame, pinned to the screen (anchor = screen centre in the PNG, 80 %)
    frame = N3.image(S.overCtx, "phone_frame.png", { name: "Phone frame", cx: 0, cy: 0, w: 960, h: 960, fit: "stretch" });
    N3.xf(frame, "ADBE Anchor Point").setValue([600 + 12.8 / 0.8, 600 - 2.8 / 0.8]);
    AEL.expr(N3.pos(frame), "// sits exactly over the screen (SHAPE), follows the camera through WORLD\nthisComp.layer(\"SHAPE\").transform.position");
    AEL.expr(N3.xf(frame, "ADBE Scale"), "var s = thisComp.layer(\"SHAPE\").transform.scale[0] * 0.8;\n[s, s]");
    N3.lin(N3.xf(frame, "ADBE Opacity"), [tPhone + 0.1, tPhone + 0.45, tOut - 0.25, tOut], [0, 100, 100, 0]);   // fades just before the screen morphs into the board
    N3.shadow(frame, { color: "#6E1E26", opacity: 0.35, dist: 40, soft: 50 });

    // ---- world: dotted journey line through the three badges (solid while it draws on, dotted once done)
    path = N3.path(S.worldCtx, { name: "Journey line", verts: [BP[0], BP[1], BP[2]], inT: [[0, 0], [-200, -140], [-200, -150]],
        outT: [[200, -120], [200, 140], [0, 0]], closed: false, stroke: "#FFFFFF", sw: 5, trim: true });
    N3.io(N3.trimOf(path).property("ADBE Vector Trim End"), tPath, tPath + 0.9, 0, 100);
    AEL.expr(N3.trimOf(path).property("ADBE Vector Trim End"), "// the web draws an 1800 px dash along this ~1420 px path over the keys, so the line arrives early\nMath.min(100, value * 1800 / 1420)");
    st = N3.gc(path, 1).property("ADBE Vector Graphic - Stroke");
    dash = st.property("ADBE Vector Stroke Dashes");
    dash.addProperty("ADBE Vector Stroke Dash 1");
    dash.addProperty("ADBE Vector Stroke Gap 1");
    N3.hold(st.property("ADBE Vector Stroke Dashes").property("ADBE Vector Stroke Dash 1"), [0, tPath + 0.9], [1800, 2]);
    st.property("ADBE Vector Stroke Dashes").property("ADBE Vector Stroke Gap 1").setValue(16);
    N3.hold(N3.xf(path, "ADBE Opacity"), [0, tPath], [0, 100]);
    N3.eo(N3.xf(path, "ADBE Opacity"), tOut, tOut + 0.25, 100, 0);

    // ---- world: product page window (blurred page scrolling slowly under a browser bar)
    P = C12_pre(S.worldCtx, "Product page window", 720, 480, WEB[0], WEB[1], 0, 0);
    c = P.ctx;
    N3.box(c, { name: "Window", x: 0, y: 0, w: 720, h: 480, fill: "#FFFFFF" });
    l = N3.image(c, "product_page.png", { name: "Page", x: 0, y: 44, w: 720, fit: "width" });
    N3.blur(l).setValue(9);   // CSS px; N3.blur converts footage blur to screen size
    t = N3.pos(l).value;
    N3.lin(N3.pos(l), [tB[1], tB[1] + 6], [t, [t[0], t[1] - 260, t[2]]]);
    N3.box(c, { name: "Bar", x: 0, y: 0, w: 720, h: 44, fill: "#FBF1F0" });
    N3.box(c, { name: "Bar rule", x: 0, y: 42.5, w: 720, h: 1.5, fill: "#F2E2E1" });
    N3.ellipse(c, { name: "Dot red", cx: 23.5, cy: 21.5, d: 11, fill: "#F57F7A" });
    N3.ellipse(c, { name: "Dot amber", cx: 41.5, cy: 21.5, d: 11, fill: "#F6C25B" });
    N3.ellipse(c, { name: "Dot green", cx: 59.5, cy: 21.5, d: 11, fill: "#6CCB7E" });
    N3.box(c, { name: "URL pill", cx: 360, cy: 22, w: 331.2, h: 26, r: 13, fill: "#F3E2E1" });
    N3.text(c, "noon \u203a high-sun", { name: "URL", x: 360, cy: 22, fs: 13, color: N3.COL.soft, align: "center" });
    N3.mask(P.layer, N3.rrShape(0, 0, 720, 480, 22));
    N3.shadow(P.layer, shadowWin);
    C12_join(P.layer, tB[1] - 0.25, tOut);

    // ---- world: the pack (blurred bag)
    P = C12_pre(S.worldCtx, "Pack window", 380, 480, PACK[0], PACK[1], 0, 0);
    c = P.ctx;
    N3.box(c, { name: "Window", x: 0, y: 0, w: 380, h: 480, fill: "#FFFFFF" });
    l = N3.image(c, "bag.png", { name: "Bag", x: -60, y: -10, w: 500, h: 500 });
    N3.blur(l).setValue(8);   // CSS px; N3.blur converts footage blur to screen size
    N3.mask(P.layer, N3.rrShape(0, 0, 380, 480, 22));
    N3.shadow(P.layer, shadowWin);
    C12_join(P.layer, tB[2] - 0.25, tOut);

    // ---- world: numbered badges 1-2-3 (spring pop) and labels with icons
    for (i = 0; i < 3; i++) {
        P = C12_pre(S.worldCtx, "Badge " + (i + 1), 140, 140, BP[i][0], BP[i][1]);
        l = N3.ellipse(P.ctx, { name: "Ring", cx: 0, cy: 0, d: 74, fill: "#FFFFFF", opacity: 90 });
        N3.shadow(l, { color: "#96323A", opacity: 0.4, dist: 10, soft: 24 });
        N3.ellipse(P.ctx, { name: "Badge", cx: 0, cy: 0, d: 62, fill: N3.COL.coral });
        N3.text(P.ctx, String(i + 1), { name: "Number", x: 0, cy: 0, fs: 28, wt: 800, color: "#FFFFFF", align: "center" });
        N3.spring(N3.slider(P.layer, "Pop", 0), 0, [[tB[i], 1, [13, 0.75]]].concat(K.bump(tN[i])));   // pulses again when it is named
        N3.eo(N3.xf(P.layer, "ADBE Opacity"), tOut, tOut + 0.25, 100, 0);
        AEL.expr(N3.xf(P.layer, "ADBE Scale"), "// springs in (13, 0.75) at the Pop key\nvar s = Math.max(0, effect(\"Pop\")(1)) * 100;\n[s, s]");
        if (i === 0) { AEL.expr(N3.pos(P.layer), "// top-left corner of the phone screen\n[" + SHX + " - 210, value[1]]"); }
    }
    for (i = 0; i < 3; i++) {
        P = C12_pre(S.worldCtx, "Label " + LABELS[i], 700, 120, LP[i][0], LP[i][1] + 23);
        t = N3.text(P.ctx, LABELS[i], { name: "Label", x: 27, cy: 0, fs: 38, wt: 600, align: "center" });
        l = N3.icon(P.ctx, ICONS[i], { name: "Icon", cx: -100, cy: 0, size: 42, color: N3.COL.coral, sw: 2 });
        AEL.expr(N3.pos(l), "// icon 42 px + gap 12 left of the label\nvar L = thisComp.layer(\"Label\"), r = L.sourceRectAtTime(time, false);\n[L.transform.position[0] + r.left - 33, value[1]]");
        if (i === 0) { AEL.expr(N3.pos(P.layer), "// centred under the phone\n[" + SHX + ", value[1]]"); }
        N3.show(P.layer, tB[i] + 0.1, tOut, 16, { din: 0, lin: 0.4 });
    }

    // ---- card: the working document - the three touchpoints side by side, each with an empty job area
    g = N3.group(S, "Working doc", { tin: tBoard + 0.1, din: 0.05, lin: 0.35 });
    K.board(g, { tin: tBoard + 0.1 });
    return S;
} };
