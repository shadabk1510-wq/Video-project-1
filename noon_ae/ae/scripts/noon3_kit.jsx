// noon3_kit.jsx - shared scene pieces for the NOON v3 chunk-2 clips (12 extension, 13-18). Requires noon3_lib.jsx.
// Everything here builds into a ctx (a card group, S.worldCtx or S.overCtx) with web-style coordinates.

var K = {};
K.X = [-560, 0, 560];                                   // the three touchpoint columns on the 1720 x 900 board
K.TP = ["Social post", "Product page", "Packaging"];
K.TP_ICON = ["mobile", "browser", "package"];
K.TP_IMG = ["social1.png", "product_page.png", "bag.png"];
K.JOB = ["Attract", "Persuade", "Identify"];
K.JOB_LINE = ["Grab attention and\nintroduce NOON", "Explain what they're buying\nand help them decide", "Name the product and deliver\nthe brand experience"];

// NOON wordmark (NOON-logo.svg via svg_to_ae.py, centred on the viewBox centre), one group per letter.
K.LOGO = [
    [[[true, [[-225, -55], [-183, -55], [-150, -16], [-150, -55], [-116, -55], [-116, 54], [-155, 54], [-186, 17], [-186, 54], [-225, 54]], null, null]], false],
    [[[true, [[-57, -56], [-1, 0], [-57, 56], [-113, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[-31, -11], [-43, 1], [-31, 13], [-19, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]], true],
    [[[true, [[56.5, -56], [112.5, 0], [56.5, 56], [0.5, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[84.5, -11], [72.5, 1], [84.5, 13], [96.5, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]], true],
    [[[true, [[117, -55], [160, -55], [191, -16], [191, -55], [225, -55], [225, 56], [187, 56], [156, 18], [156, 56], [117, 56]], null, null]], false]
];
// o: {name, cx, cy, w (rendered width, default 450), color}
K.logo = function (ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "NOON logo")), i, j, gi, f, s = (o.w || 450) / 450;
    N3.place(ctx, l);
    for (i = 0; i < K.LOGO.length; i++) {
        gi = N3.addGroup(l, "NOON".charAt(i) + " " + (i + 1));
        for (j = 0; j < K.LOGO[i][0].length; j++) { N3.addPath(l, gi, K.LOGO[i][0][j][1], K.LOGO[i][0][j][2], K.LOGO[i][0][j][3], true); }
        f = N3.addFill(l, gi, o.color || N3.COL.navy);
        if (K.LOGO[i][1]) { f.property("ADBE Vector Fill Rule").setValue(2); }   // even-odd: the O counters are holes
    }
    N3.pos(l).setValue(N3.P(ctx, o.cx, o.cy));
    N3.xf(l, "ADBE Scale").setValue([s * 100, s * 100]);
    return l;
};

// A precomp placed into ctx at [x, y] (anchor = its centre); returns {layer, ctx} with the inner origin at the centre.
K.pre = function (ctx, name, w, h, x, y) {
    var S = ctx.S, pc = app.project.items.addComp(S.id + " \u00b7 " + name, Math.round(w), Math.round(h), 1, S.T, N3.FPS), l;
    if (N3.folders) { pc.parentFolder = N3.folders.precomps; }
    AEL.created("precomp", pc.name);
    l = ctx.comp.layers.add(pc);
    l.name = N3.uname(ctx.comp, name);
    N3.place(ctx, l);
    N3.xf(l, "ADBE Anchor Point").setValue([Math.round(w) / 2, Math.round(h) / 2]);
    N3.pos(l).setValue(N3.P(ctx, x, y));
    try { l.collapseTransformation = true; } catch (e) {}
    return { layer: l, ctx: { comp: pc, ox: Math.round(w) / 2, oy: Math.round(h) / 2, parent: null, slot: "pre", S: S, layer: l } };
};

// Spring pop (0 -> 1 with a little overshoot) on a layer's scale at t; extra keys [[t, v, sp]] can follow (bumps).
K.pop = function (layer, t, more) {
    var keys = [[t, 1, [13, 0.75]]], i;
    for (i = 0; more && i < more.length; i++) { keys.push(more[i]); }
    N3.spring(N3.slider(layer, "Pop", 0), 0, keys);
    AEL.expr(N3.xf(layer, "ADBE Scale"), "// springs in at the Pop keys\nvar s = Math.max(0, effect(\"Pop\")(1)) * 100;\n[s, s]");
    AEL.expr(N3.xf(layer, "ADBE Opacity"), "Math.min(1, Math.max(0, effect(\"Pop\")(1) * 1.5)) * 100");
};
// A small bump (1 -> 1.12 -> 1) to add to K.pop's keys when something is named again.
K.bump = function (t) { return [[t, 1.12, [24, 0.8]], [t + 0.22, 1, [11, 0.9]]]; };

// Coral (or tinted) caps chip. o: {name, x | cx, top | cy, fs (16), bg, color}
K.tag = function (ctx, str, o) {
    return N3.chip(ctx, str, { name: o.name || str, x: o.x, cx: o.cx, top: o.top, cy: o.cy, fs: o.fs || 16, wt: 600, ls: 0.12, caps: true,
        bg: o.bg || N3.COL.coral, color: o.color || "#FFFFFF", padX: o.padX, padY: o.padY });
};
// Reveal a chip (bg + text) with show(); both layers share timing.
K.showChip = function (c, tin, tout, dy) {
    N3.show(c.bg, tin, tout, dy || 12, { din: 0, lin: 0.35 });
    N3.show(c.text, tin, tout, dy || 12, { din: 0, lin: 0.35 });
};

// The working-document board: header + three touchpoint columns (image, name, job area). o: {tin (null = already there), tout}
K.board = function (g, o) {
    var i, X, l, t0, items, j, tin = o.tin, tout = o.tout;
    items = [];
    items.push(N3.text(g, "Working document", { name: "Doc eyebrow", x: -800, top: -400, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }));
    items.push(N3.text(g, "NOON \u00b7 Three touchpoints", { name: "Doc title", x: -800, top: -374, fs: 40, wt: 600, ls: -0.025 }));
    items.push(N3.box(g, { name: "Doc rule", x: -800, y: -310, w: 1600, h: 1.5, fill: "#F2E2E1" }));
    for (i = 0; i < 3; i++) {
        X = K.X[i]; t0 = tin === null || tin === undefined ? null : tin + 0.15 + i * 0.12;
        l = N3.box(g, { name: "Column " + (i + 1), cx: X, cy: 50, w: 500, h: 680, r: 28, fill: N3.COL.blush }); N3.show(l, t0, tout, 26, { din: 0, lin: 0.45 });
        l = N3.image(g, K.TP_IMG[i], { name: "Thumb " + K.TP[i], x: X - 220, y: -258, w: 440, h: 250, r: 16 }); N3.show(l, t0, tout, 26, { din: 0, lin: 0.45, blur: 0 });
        l = N3.ellipse(g, { name: "Badge " + (i + 1), cx: X - 200, cy: -238, d: 46, fill: N3.COL.coral }); N3.show(l, t0, tout, 26, { din: 0, lin: 0.45, blur: 0 });
        l = N3.text(g, String(i + 1), { name: "Badge number " + (i + 1), x: X - 200, cy: -238, fs: 22, wt: 800, color: "#FFFFFF", align: "center" }); N3.show(l, t0, tout, 26, { din: 0, lin: 0.45, blur: 0 });
        l = N3.icon(g, K.TP_ICON[i], { name: "Icon " + K.TP[i], cx: X - 202, cy: 40, size: 36, color: N3.COL.coral, sw: 2 }); N3.show(l, t0, tout, 26, { din: 0, lin: 0.45 });
        l = N3.text(g, K.TP[i], { name: "Name " + K.TP[i], x: X - 172, cy: 40, fs: 32, wt: 600, ls: -0.025 }); N3.show(l, t0, tout, 26, { din: 0, lin: 0.45 });
        l = N3.text(g, "Job", { name: "Job label " + (i + 1), x: X - 220, top: 104, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }); N3.show(l, t0, tout, 26, { din: 0, lin: 0.45 });
        l = N3.box(g, { name: "Job area " + (i + 1), x: X - 220, y: 134, w: 440, h: 230, r: 18, fill: "#FFFFFF" }); N3.show(l, t0, tout, 26, { din: 0, lin: 0.45, blur: 0 });
    }
    for (j = 0; j < items.length; j++) { N3.show(items[j], tin === null || tin === undefined ? null : tin, tout, 18, { din: 0, lin: 0.4 }); }
};
// The job written into column i (chip + two typed lines). t = when it appears (null = already there).
K.job = function (g, i, t, tout) {
    var X = K.X[i], c, l;
    c = K.tag(g, K.JOB[i], { name: "Job " + K.JOB[i], x: X - 196, top: 158, fs: 18 });
    l = N3.text(g, K.JOB_LINE[i], { name: "Job line " + (i + 1), x: X - 196, top: 214, fs: 24, wt: 500, lh: 34, color: N3.COL.ink });
    if (t !== null && t !== undefined) {
        K.pop(c.bg, t);
        N3.show(c.text, t + 0.05, tout, 8, { din: 0, lin: 0.3 });
        N3.typeOn(l, t + 0.35, t + 1.6);
        if (tout !== null && tout !== undefined) { N3.show(l, null, tout, 0, {}); }
    } else if (tout !== null && tout !== undefined) {
        N3.show(c.bg, null, tout, 0, {}); N3.show(c.text, null, tout, 0, {}); N3.show(l, null, tout, 0, {});
    }
    return { chip: c, line: l };
};

// Big-word emphasis page (coral card, layout grid with handles, ghost rows, per-letter word). Builds into card group g.
// o: {word, fs, eyebrow, sub, tWord, tEye, tSub, stagger}
K.emph = function (g, o) {
    var l, i, p, fs = o.fs || 180, GX = [-560, 560], GY = [-170, 150], gi;
    l = N3.shapeLayer(g.comp, N3.uname(g.comp, "Layout grid"));
    N3.place(g, l);
    gi = N3.addGroup(l, "Lines");
    for (i = 0; i < GX.length; i++) { N3.addRect(l, gi, 1.5, 920, 0, [GX[i] + 0.75, 0]); }
    for (i = 0; i < GY.length; i++) { N3.addRect(l, gi, 1720, 1.5, 0, [0, GY[i] + 0.75]); }
    N3.addFill(l, gi, "#FFFFFF", 55);
    gi = N3.addGroup(l, "Handles");
    for (i = 0; i < GX.length; i++) { N3.addRect(l, gi, 14, 14, 0, [GX[i], GY[0]]); N3.addRect(l, gi, 14, 14, 0, [GX[i], GY[1]]); }
    N3.addFill(l, gi, "#FFFFFF");
    N3.pos(l).setValue([g.ox, g.oy]);
    N3.eo(N3.xf(l, "ADBE Opacity"), o.tWord - 0.6, o.tWord + 0.2, 0, 100);
    for (i = 0; i < 2; i++) {
        l = N3.text(g, o.word, { name: "Ghost " + (i + 1), x: 0, top: i ? 190 : -370, fs: fs, wt: 800, ls: -0.05, lh: fs, color: "#FFFFFF", align: "center", opacity: 26 });
        N3.eo(N3.xf(l, "ADBE Opacity"), o.tWord + 0.25, o.tWord + 1.15, 0, 26);
        p = N3.pos(l).value;
        N3.eo(N3.pos(l), o.tWord + 0.25, o.tWord + 1.15, [p[0], p[1] + (i ? 70 : -70), 0], p);
    }
    if (o.eyebrow) {
        l = N3.text(g, o.eyebrow, { name: "Eyebrow", x: 0, top: -150, fs: 30, wt: 600, ls: 0.4, caps: true, color: "#FFFFFF", align: "center" });
        N3.show(l, o.tEye || o.tWord - 0.5, null, 12, { din: 0, lin: 0.35 });
    }
    l = N3.text(g, o.word, { name: o.word, x: 0, cy: 0, fs: fs, wt: 800, ls: -0.05, lh: fs, color: "#FFFFFF", align: "center" });
    N3.unitReveal(l, { times: [o.tWord], stagger: o.stagger || 0.03, based: "chars", dy: 60, blur: 16, lin: 0.45 });
    if (o.sub) {
        l = N3.text(g, o.sub, { name: "Subline", x: 0, top: 395, fs: 40, wt: 600, color: "#FFFFFF", align: "center" });
        N3.show(l, o.tSub, null, 14, { din: 0, lin: 0.4 });
    }
};

// The jobs rail (kept beside us): eyebrow + three stacked job rows with touchpoint icons. Builds into a card group g (rail 340 x 760).
K.rail = function (g, tin, tout) {
    var i, l, c, y, items = [];
    items.push(N3.text(g, "Our three jobs", { name: "Rail eyebrow", x: -130, top: -330, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }));
    for (i = 0; i < 3; i++) {
        y = -200 + i * 190;
        items.push(N3.box(g, { name: "Rail row " + (i + 1), cx: 0, cy: y + 40, w: 280, h: 150, r: 22, fill: N3.COL.blush }));
        items.push(N3.icon(g, K.TP_ICON[i], { name: "Rail icon " + (i + 1), cx: -100, cy: y + 4, size: 30, color: N3.COL.coral, sw: 2 }));
        items.push(N3.text(g, K.TP[i], { name: "Rail name " + (i + 1), x: -76, cy: y + 4, fs: 22, wt: 600 }));
        c = K.tag(g, K.JOB[i], { name: "Rail job " + (i + 1), x: -118, top: y + 50, fs: 16 });
        items.push(c.bg); items.push(c.text);
    }
    for (i = 0; i < items.length; i++) { N3.show(items[i], tin === null || tin === undefined ? null : tin + Math.floor(i / 5) * 0.1, tout, 14, { din: 0, lin: 0.4 }); }
};

// Reveal helper: show(layer) at time t (null = already visible), optional exit.
K.at = function (l, t, tout, dy) { if ((t !== null && t !== undefined) || (tout !== null && tout !== undefined)) { N3.show(l, t === undefined ? null : t, tout === undefined ? null : tout, dy === undefined ? 14 : dy, { din: 0, lin: 0.4 }); } return l; };
K.T = function (T, k) { return T ? T[k] : null; };

// Content plan board (white card in a precomp). T = {in, social:[img,sun,head], product:[bean,roast,caramel,cacao,orange,origin],
// pack:[label,1..6], done} in clip-local seconds, or null for the finished (static) state. Returns the precomp layer.
K.plan = function (ctx, x, y, T, tout) {
    var P = K.pre(ctx, "Content plan", 1300, 880, x, y), c = P.ctx, i, l, X = [-420, 0, 420], cX, r, ch, row, N, sz, rows, notes, col, ti;
    N3.box(c, { name: "Card", cx: 0, cy: 0, w: 1300, h: 880, r: 36, fill: "#FFFFFF" });
    N3.shadow(P.layer, N3.SHADOW.card);
    N3.text(c, "Content plan", { name: "Plan eyebrow", x: -610, top: -404, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(c, "What each touchpoint needs", { name: "Plan title", x: -610, top: -378, fs: 36, wt: 600, ls: -0.025 });
    l = N3.icon(c, "circleCheck", { name: "Plan done", cx: 590, cy: -360, size: 44, color: N3.COL.coral, sw: 2.4 });
    if (T) { K.pop(l, T.done); }
    for (i = 0; i < 3; i++) {
        cX = X[i];
        N3.box(c, { name: "Col " + (i + 1), cx: cX, cy: 60, w: 392, h: 700, r: 24, fill: N3.COL.blush });
        N3.icon(c, K.TP_ICON[i], { name: "Col icon " + (i + 1), cx: cX - 160, cy: -248, size: 30, color: N3.COL.coral, sw: 2 });
        N3.text(c, K.TP[i], { name: "Col name " + (i + 1), x: cX - 136, cy: -248, fs: 24, wt: 600 });
        ch = K.tag(c, K.JOB[i], { name: "Col job " + (i + 1), x: cX - 176, top: -214, fs: 13, bg: "#FFFFFF", color: N3.COL.coral });
    }
    // social post: package image, sun graphic, short headline
    cX = X[0]; rows = [["Package image", 0], ["Sun graphic", 1], ["Short headline", 2]];
    for (i = 0; i < 3; i++) {
        row = -150 + i * 130;
        l = N3.box(c, { name: "Social item " + (i + 1), cx: cX, cy: row + 50, w: 352, h: 110, r: 18, fill: "#FFFFFF" }); K.at(l, K.T(T && T.social, i), tout, 16);
        if (i === 0) { l = N3.image(c, "bag.png", { name: "Item bag", cx: cX - 120, cy: row + 50, w: 84, h: 84, r: 12 }); }
        if (i === 1) { l = N3.ellipse(c, { name: "Item sun", cx: cX - 120, cy: row + 50, d: 74, fill: N3.COL.verm }); }
        if (i === 2) { l = N3.text(c, "Aa", { name: "Item headline", x: cX - 120, cy: row + 50, fs: 40, wt: 800, color: N3.COL.navy, align: "center" }); }
        K.at(l, K.T(T && T.social, i), tout, 16);
        l = N3.text(c, rows[i][0], { name: "Item text " + (i + 1), x: cX - 64, cy: row + 50, fs: 22, wt: 600 }); K.at(l, K.T(T && T.social, i), tout, 16);
    }
    l = N3.text(c, "\u201cYour next ritual.\u201d", { name: "Headline sample", x: cX - 64, cy: row + 80, fs: 16, color: N3.COL.soft }); K.at(l, K.T(T && T.social, 2), tout, 10);
    // product page: whole bean, medium roast, notes, origin
    cX = X[1];
    ch = K.tag(c, "Whole bean", { name: "Chip whole bean", x: cX - 176, top: -140, fs: 18, bg: N3.COL.navy }); K.showChip(ch, K.T(T && T.product, 0), tout);
    ch = K.tag(c, "Medium roast", { name: "Chip roast", x: cX - 176, top: -76, fs: 18, bg: N3.COL.navy }); K.showChip(ch, K.T(T && T.product, 1), tout);
    l = N3.text(c, "Tasting notes", { name: "Notes label", x: cX - 176, top: 4, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }); K.at(l, K.T(T && T.product, 2), tout, 10);
    notes = [["Caramel", "#C98A4B", -176], ["Cacao", "#6B4636", -50], ["Orange", "#F08A3C", 60]];
    for (i = 0; i < 3; i++) { ch = K.tag(c, notes[i][0], { name: "Note " + notes[i][0], x: cX + notes[i][2], top: 36, fs: 16, bg: notes[i][1] }); K.showChip(ch, K.T(T && T.product, 2 + i), tout); }
    l = N3.box(c, { name: "Origin row", cx: cX, cy: 176, w: 352, h: 96, r: 18, fill: "#FFFFFF" }); K.at(l, K.T(T && T.product, 5), tout, 16);
    l = N3.text(c, "Origin", { name: "Origin label", x: cX - 150, top: 140, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }); K.at(l, K.T(T && T.product, 5), tout, 16);
    l = N3.text(c, "Colombia", { name: "Origin text", x: cX - 150, top: 166, fs: 28, wt: 600 }); K.at(l, K.T(T && T.product, 5), tout, 16);
    // packaging: hierarchy 1-6, biggest first
    cX = X[2]; N = ["NOON", "High Sun", "Whole bean coffee", "Origin", "Tasting notes", "Weight"]; sz = [38, 30, 24, 19, 19, 17];
    ch = K.tag(c, "Hierarchy", { name: "Chip hierarchy", x: cX - 176, top: -150, fs: 15, bg: N3.COL.navy }); K.showChip(ch, K.T(T && T.pack, 0), tout);
    for (i = 0; i < 6; i++) {
        ti = K.T(T && T.pack, i + 1); r = -86 + i * 66;
        l = N3.ellipse(c, { name: "Rank " + (i + 1), cx: cX - 156, cy: r + 20, d: 34, fill: N3.COL.coral }); K.at(l, ti, tout, 10);
        l = N3.text(c, String(i + 1), { name: "Rank no " + (i + 1), x: cX - 156, cy: r + 20, fs: 17, wt: 800, color: "#FFFFFF", align: "center" }); K.at(l, ti, tout, 10);
        l = N3.text(c, N[i], { name: "Rank text " + (i + 1), x: cX - 124, cy: r + 20, fs: sz[i], wt: i < 2 ? 800 : 600, color: i < 2 ? N3.COL.navy : N3.COL.ink, caps: i < 3 }); K.at(l, ti, tout, 10);
    }
    return P.layer;
};

// Pack build-up board (lives in a card group g, artboard 1700 x 940). T = {eye, chips:[sun, topo], pal, sw:[4], outline, sun,
// panel, type:[noon, high, bean, origin, notes], bold, organised, photo} clip-local, or null for the finished state.
K.packBoard = function (g, T, tout) {
    var l, i, P, c, sw, ch, x0 = -790, PX = 250, SW = [["Ivory", N3.COL.ivory], ["Navy", N3.COL.navy], ["Vermilion", N3.COL.verm], ["Powder blue", "#AFCFE6"]];
    K.at(N3.text(g, "From the brief", { name: "Brief eyebrow", x: x0, top: -380, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), K.T(T, "eye"), tout);
    K.at(N3.text(g, "Visual direction", { name: "Brief title", x: x0, top: -352, fs: 40, wt: 600, ls: -0.025 }), K.T(T, "eye"), tout);
    ch = K.tag(g, "Sun motif", { name: "Chip sun motif", x: x0, top: -250, fs: 18 }); K.showChip(ch, K.T(T && T.chips, 0), tout);
    ch = K.tag(g, "White topography", { name: "Chip topography", x: x0 + 170, top: -250, fs: 18, bg: N3.COL.navy }); K.showChip(ch, K.T(T && T.chips, 1), tout);
    K.at(N3.text(g, "Palette", { name: "Palette label", x: x0, top: -150, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), K.T(T, "pal"), tout);
    for (i = 0; i < 4; i++) {
        sw = N3.ellipse(g, { name: "Swatch " + SW[i][0], cx: x0 + 52 + i * 130, cy: -60, d: 96, fill: SW[i][1], stroke: i === 0 ? "#E6DCCB" : null, sw: 2 });
        if (T) { K.pop(sw, T.sw[i]); }
        if (tout !== null && tout !== undefined) { N3.show(sw, null, tout, 0, { noScale: true }); }
        K.at(N3.text(g, SW[i][0], { name: "Swatch name " + (i + 1), x: x0 + 52 + i * 130, top: 2, fs: 17, wt: 600, align: "center" }), K.T(T && T.sw, i), tout, 8);
    }
    // the pack, built up inside its own precomp (clipped to the pack shape)
    P = K.pre(g, "Pack build", 420, 600, PX, 20); c = P.ctx;
    l = N3.box(c, { name: "Pack base", cx: 0, cy: 0, w: 420, h: 600, r: 22, fill: "#FFFFFF", stroke: "#E2C9C8", sw: 3 });
    K.at(l, K.T(T, "outline"), tout, 0);
    l = N3.ellipse(c, { name: "Big sun", cx: 0, cy: -120, d: 380, fill: N3.COL.verm }); if (T) { K.pop(l, T.sun); }
    l = N3.box(c, { name: "Ivory info area", cx: 0, cy: 165, w: 420, h: 270, fill: N3.COL.ivory });
    if (T) { N3.spring(N3.pos(l), [c.ox, c.oy + 165 + 300, 0], [[T.panel, [c.ox, c.oy + 165, 0], N3.SP.MORPH]]); }
    l = K.logo(c, { name: "Pack NOON", cx: 0, cy: 82, w: 230 }); K.at(l, K.T(T && T.type, 0), tout, 12);
    l = N3.text(c, "High Sun", { name: "Pack high sun", x: 0, top: 118, fs: 34, wt: 800, caps: true, color: N3.COL.navy, align: "center" }); K.at(l, K.T(T && T.type, 1), tout, 12);
    l = N3.text(c, "Whole bean coffee", { name: "Pack whole bean", x: 0, top: 166, fs: 16, wt: 600, ls: 0.14, caps: true, color: N3.COL.navy, align: "center" }); K.at(l, K.T(T && T.type, 2), tout, 10);
    l = N3.text(c, "Colombia \u00b7 Medium roast", { name: "Pack origin", x: 0, top: 214, fs: 15, color: N3.COL.navy, align: "center" }); K.at(l, K.T(T && T.type, 3), tout, 10);
    l = N3.text(c, "Caramel \u00b7 Cacao \u00b7 Orange", { name: "Pack notes", x: 0, top: 240, fs: 15, color: N3.COL.navy, align: "center" }); K.at(l, K.T(T && T.type, 4), tout, 10);
    N3.mask(P.layer, N3.rrShape(0, 0, 420, 600, 22));
    N3.shadow(P.layer, N3.SHADOW.card);
    if (T) { N3.show(P.layer, T.outline, tout, 30, { din: 0, lin: 0.45 }); } else if (tout !== null && tout !== undefined) { N3.show(P.layer, null, tout, 0, {}); }
    // callouts
    K.at(N3.box(g, { name: "Callout line 1", x: PX + 160, y: -140, w: 80, h: 2, fill: N3.COL.coral }), K.T(T, "bold"), tout, 0);
    ch = K.tag(g, "Bold graphic \u2192 attention", { name: "Callout bold", x: PX + 250, top: -160, fs: 15 }); K.showChip(ch, K.T(T, "bold"), tout);
    K.at(N3.box(g, { name: "Callout line 2", x: PX + 160, y: 200, w: 80, h: 2, fill: N3.COL.navy }), K.T(T, "organised"), tout, 0);
    ch = K.tag(g, "Organised info \u2192 explains", { name: "Callout info", x: PX + 250, top: 180, fs: 15, bg: N3.COL.navy }); K.showChip(ch, K.T(T, "organised"), tout);
    l = N3.text(g, "A clear starting point", { name: "Starting point", x: PX, top: 360, fs: 22, wt: 600, color: N3.COL.soft, align: "center" }); K.at(l, K.T(T, "photo"), tout, 10);
};
