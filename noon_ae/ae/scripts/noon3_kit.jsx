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

// ======================================================================== chunk 3
// The three-rules board (end of clip 18). T = {slots, n:[3]} clip-local, or null for the finished state.
K.rulesBoard = function (g, T) {
    var l, i, x, ts = T ? T.slots : null;
    l = N3.text(g, "NOON design rules", { name: "Rules eyebrow", x: -720, top: -320, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }); K.at(l, T ? ts + 0.2 : null, null, 12);
    l = N3.text(g, "Three rules", { name: "Rules title", x: -720, top: -294, fs: 44, wt: 600, ls: -0.025 }); K.at(l, T ? T.n[2] - 0.1 : null, null, 12);
    for (i = 0; i < 3; i++) {
        x = -480 + i * 480;
        l = N3.box(g, { name: "Rule slot " + (i + 1), cx: x, cy: 60, w: 440, h: 440, r: 28, fill: N3.COL.blush }); K.at(l, T ? ts + 0.3 + i * 0.1 : null, null, 24);
        l = N3.text(g, String(i + 1), { name: "Rule number " + (i + 1), x: x, cy: 10, fs: 160, wt: 800, lh: 160, color: N3.COL.coral, align: "center" }); if (T) { K.pop(l, T.n[i]); }
        l = N3.box(g, { name: "Rule line " + (i + 1) + "a", cx: x, cy: 150, w: 240, h: 12, r: 6, fill: "#F2D9D8" }); K.at(l, T ? T.n[i] + 0.2 : null, null, 8);
        l = N3.box(g, { name: "Rule line " + (i + 1) + "b", cx: x - 30, cy: 180, w: 180, h: 12, r: 6, fill: "#F2D9D8" }); K.at(l, T ? T.n[i] + 0.3 : null, null, 8);
    }
};

// Vector NOON pack (precomp 420 x 600, clipped). o: {scale, sunY (-120), sunD (380), sunAbove (sun over the ivory panel, under the type), weight}
K.pack = function (ctx, name, x, y, o) {
    var P, c, R = {}, sd, sy, mkSun;
    o = o || {}; sd = o.sunD || 380; sy = o.sunY === undefined ? -120 : o.sunY;
    P = K.pre(ctx, name, 420, 600, x, y); c = P.ctx; R.layer = P.layer; R.ctx = c;
    N3.box(c, { name: "Pack base", cx: 0, cy: 0, w: 420, h: 600, r: 22, fill: "#FFFFFF", stroke: "#E2C9C8", sw: 3 });
    mkSun = function () { R.sun = N3.ellipse(c, { name: "Sun", cx: 0, cy: sy, d: sd, fill: N3.COL.verm }); R.sunPos = [c.ox, c.oy + sy, 0]; };
    if (!o.sunAbove) { mkSun(); }
    R.panel = N3.box(c, { name: "Ivory info area", cx: 0, cy: 165, w: 420, h: 270, fill: N3.COL.ivory });
    if (o.sunAbove) { mkSun(); }
    R.type = [K.logo(c, { name: "Pack NOON", cx: 0, cy: 82, w: 230 }),
        N3.text(c, "High Sun", { name: "Pack high sun", x: 0, top: 118, fs: 34, wt: 800, caps: true, color: N3.COL.navy, align: "center" }),
        N3.text(c, "Whole bean coffee", { name: "Pack whole bean", x: 0, top: 166, fs: 16, wt: 600, ls: 0.14, caps: true, color: N3.COL.navy, align: "center" }),
        N3.text(c, "Colombia \u00b7 Medium roast", { name: "Pack origin", x: 0, top: 206, fs: 15, color: N3.COL.navy, align: "center" }),
        N3.text(c, "Caramel \u00b7 Cacao \u00b7 Orange", { name: "Pack notes", x: 0, top: 230, fs: 15, color: N3.COL.navy, align: "center" }),
        N3.text(c, "250 g", { name: "Pack weight", x: 0, top: 262, fs: 14, wt: 600, color: N3.COL.navy, align: "center" })];
    N3.mask(P.layer, N3.rrShape(0, 0, 420, 600, 22));
    N3.shadow(P.layer, N3.SHADOW.card);
    if (o.scale) { N3.xf(P.layer, "ADBE Scale").setValue([o.scale * 100, o.scale * 100]); }
    return R;
};
// Social post (square s): sun enlarged beyond the frame, info in an ivory band.
K.social = function (ctx, name, x, y, s) {
    var P = K.pre(ctx, name, s, s, x, y), c = P.ctx;
    N3.box(c, { name: "Sky", cx: 0, cy: 0, w: s, h: s, fill: "#AFCFE6" });
    N3.ellipse(c, { name: "Sun", cx: s * 0.22, cy: -s * 0.3, d: s * 1.25, fill: N3.COL.verm });
    N3.box(c, { name: "Ivory info area", cx: 0, cy: s * 0.33, w: s, h: s * 0.34, fill: N3.COL.ivory });
    K.logo(c, { name: "NOON", cx: -s * 0.24, cy: s * 0.27, w: s * 0.36 });
    N3.text(c, "High Sun", { name: "High sun", x: -s * 0.42, top: s * 0.335, fs: Math.round(s * 0.065), wt: 800, caps: true, color: N3.COL.navy });
    N3.text(c, "Your next ritual.", { name: "Headline", x: -s * 0.42, top: s * 0.41, fs: Math.round(s * 0.045), color: N3.COL.navy });
    N3.mask(P.layer, N3.rrShape(0, 0, s, s, 18));
    N3.shadow(P.layer, N3.SHADOW.card);
    return P;
};
// Product page (w x h): image side with the sun, ivory info column with the same order.
K.web = function (ctx, name, x, y, w, h) {
    var P = K.pre(ctx, name, w, h, x, y), c = P.ctx, x0 = w * 0.04;
    N3.box(c, { name: "Page", cx: 0, cy: 0, w: w, h: h, fill: N3.COL.ivory });
    N3.box(c, { name: "Image side", cx: -w * 0.25, cy: 0, w: w * 0.5, h: h, fill: "#AFCFE6" });
    N3.ellipse(c, { name: "Sun", cx: -w * 0.25, cy: -h * 0.05, d: h * 0.62, fill: N3.COL.verm });
    K.logo(c, { name: "NOON", cx: x0 + h * 0.21, cy: -h * 0.3, w: h * 0.42 });
    N3.text(c, "High Sun", { name: "High sun", x: x0, top: -h * 0.2, fs: Math.round(h * 0.1), wt: 800, caps: true, color: N3.COL.navy });
    N3.text(c, "Whole bean coffee", { name: "Whole bean", x: x0, top: -h * 0.06, fs: Math.round(h * 0.055), wt: 600, ls: 0.12, caps: true, color: N3.COL.navy });
    N3.text(c, "Colombia \u00b7 Medium roast", { name: "Origin", x: x0, top: h * 0.04, fs: Math.round(h * 0.05), color: N3.COL.navy });
    N3.text(c, "Caramel \u00b7 Cacao \u00b7 Orange", { name: "Notes", x: x0, top: h * 0.12, fs: Math.round(h * 0.05), color: N3.COL.navy });
    N3.box(c, { name: "Buy button", x: x0, y: h * 0.26, w: w * 0.3, h: h * 0.13, r: h * 0.065, fill: N3.COL.coral });
    N3.mask(P.layer, N3.rrShape(0, 0, w, h, 16));
    N3.shadow(P.layer, N3.SHADOW.card);
    return P;
};
// Rule header: big number + two-line statement (top-left of a 1700 x 940 board).
K.ruleHead = function (g, n, text, tN, tText, tout) {
    var l = N3.text(g, n, { name: "Rule no", x: -790, top: -400, fs: 110, wt: 800, lh: 110, color: N3.COL.coral }); K.at(l, tN, tout, 20);
    l = N3.text(g, text, { name: "Rule text", x: -790, top: -270, fs: 44, wt: 600, lh: 54, ls: -0.025 }); K.at(l, tText, tout, 16);
};
K.chipAt = function (g, str, o, t, tout) { var c = K.tag(g, str, o); K.showChip(c, t, tout); return c; };
// small sun tile (variations). k: 'size' | 'crop' | 'pos'
K.sunTile = function (g, name, x, y, k) {
    var P = K.pre(g, name, 220, 220, x, y), c = P.ctx;
    N3.box(c, { name: "Tile", cx: 0, cy: 0, w: 220, h: 220, fill: N3.COL.blush });
    if (k === "size") { N3.ellipse(c, { name: "Sun", cx: 0, cy: 0, d: 110, fill: N3.COL.verm }); }
    if (k === "crop") { N3.ellipse(c, { name: "Sun", cx: 0, cy: 40, d: 300, fill: N3.COL.verm }); }
    if (k === "pos") { N3.ellipse(c, { name: "Sun", cx: 70, cy: -70, d: 220, fill: N3.COL.verm }); }
    N3.mask(P.layer, N3.rrShape(0, 0, 220, 220, 20));
    return P.layer;
};

// Rule 1 board. T = {head, text, pack, size, crop, pos, circle, bag, social, recog} or null (finished).
K.rule1 = function (g, T, tout) {
    var p, l;
    K.ruleHead(g, "01", "The sun creates the\nmain visual impact", K.T(T, "head"), K.T(T, "text"), tout);
    p = K.pack(g, "Rule 1 pack", -520, 150, { scale: 0.62 }); K.at(p.layer, K.T(T, "pack"), tout, 30);
    K.chipAt(g, "Bag: the full sun", { name: "Chip bag", x: -650, top: 350, fs: 15 }, K.T(T, "bag"), tout);
    K.at(K.sunTile(g, "Tile size", 0, -170, "size"), K.T(T, "size"), tout, 24);
    K.at(K.sunTile(g, "Tile crop", 260, -170, "crop"), K.T(T, "crop"), tout, 24);
    K.at(K.sunTile(g, "Tile position", 520, -170, "pos"), K.T(T, "pos"), tout, 24);
    K.at(N3.text(g, "Size", { name: "Label size", x: 0, top: -40, fs: 18, wt: 600, align: "center" }), K.T(T, "size"), tout, 8);
    K.at(N3.text(g, "Crop", { name: "Label crop", x: 260, top: -40, fs: 18, wt: 600, align: "center" }), K.T(T, "crop"), tout, 8);
    K.at(N3.text(g, "Position", { name: "Label position", x: 520, top: -40, fs: 18, wt: 600, align: "center" }), K.T(T, "pos"), tout, 8);
    K.chipAt(g, "Always a circle", { name: "Chip circle", cx: 260, top: 6, fs: 15, bg: N3.COL.navy }, K.T(T, "circle"), tout);
    l = K.social(g, "Rule 1 social", 260, 300, 300); K.at(l.layer, K.T(T, "social"), tout, 30);
    K.chipAt(g, "Social: beyond the frame", { name: "Chip social", x: 430, top: 230, fs: 15 }, K.T(T, "social"), tout);
    K.chipAt(g, "Varied, still recognisable", { name: "Chip recognisable", x: 430, top: 290, fs: 15, bg: N3.COL.navy }, K.T(T, "recog"), tout);
};
// Rule 2 board. T = {head, text, pack, down, hard, busy, up, zoneE, zoneI} or null. The sun sits over the panel layer so moving it
// down covers the type (the demo); in the finished state it is back up.
K.rule2 = function (g, T, tout) {
    var p, l, sp, up, dn, c1, c2;
    K.ruleHead(g, "02", "Product information sits\nin a clear ivory area", K.T(T, "head"), K.T(T, "text"), tout);
    p = K.pack(g, "Rule 2 pack", 250, 30, { scale: 1.2, sunAbove: true, sunY: -160, sunD: 360 }); K.at(p.layer, K.T(T, "pack"), tout, 30);
    if (T) {
        up = p.sunPos; dn = [up[0], up[1] + 330, 0];
        N3.spring(N3.pos(p.sun), up, [[T.down, dn, N3.SP.SLOW], [T.up, up, N3.SP.SLOW]]);
        c1 = K.tag(g, "\u2715  Harder to read", { name: "Chip hard", x: 560, top: 60, fs: 16 }); K.showChip(c1, T.hard, T.up);
        c2 = K.tag(g, "\u2715  Too busy", { name: "Chip busy", x: 560, top: 118, fs: 16 }); K.showChip(c2, T.busy, T.up);
    }
    l = N3.box(g, { name: "Zone energy", cx: 250, cy: -132, w: 524, h: 396, r: 24, stroke: N3.COL.coral, sw: 4 }); K.at(l, K.T(T, "zoneE"), tout, 0);
    l = N3.box(g, { name: "Zone information", cx: 250, cy: 228, w: 524, h: 324, r: 24, stroke: N3.COL.navy, sw: 4 }); K.at(l, K.T(T, "zoneI"), tout, 0);
    K.chipAt(g, "Energy", { name: "Chip energy", x: -230, top: -150, fs: 18 }, K.T(T, "zoneE"), tout);
    K.chipAt(g, "Information", { name: "Chip information", x: -230, top: 210, fs: 18, bg: N3.COL.navy }, K.T(T, "zoneI"), tout);
};
// Rule 3 board. T = {head, text, pack, items:[6], formats, same} or null.
K.rule3 = function (g, T, tout) {
    var p, l, i, ys = [82, 135, 174, 214, 238, 269], s = 0.85, X = -330, Y = 110, soc, web;
    K.ruleHead(g, "03", "Product information\nfollows the same order", K.T(T, "head"), K.T(T, "text"), tout);
    p = K.pack(g, "Rule 3 pack", X, Y, { scale: s }); K.at(p.layer, K.T(T, "pack"), tout, 30);
    for (i = 0; i < 6; i++) {
        l = N3.ellipse(g, { name: "Order " + (i + 1), cx: X + 210 * s + 36, cy: Y + ys[i] * s, d: 26, fill: N3.COL.coral }); if (T) { K.pop(l, T.items[i]); }
        l = N3.text(g, String(i + 1), { name: "Order no " + (i + 1), x: X + 210 * s + 36, cy: Y + ys[i] * s, fs: 14, wt: 800, color: "#FFFFFF", align: "center" }); if (T) { K.pop(l, T.items[i]); }
    }
    soc = K.social(g, "Rule 3 social", 320, -150, 280); K.at(soc.layer, K.T(T, "formats"), tout, 30);
    web = K.web(g, "Rule 3 web", 400, 220, 560, 260); K.at(web.layer, K.T(T, "formats") === null ? null : K.T(T, "formats") + 0.25, tout, 30);
    K.chipAt(g, "Same order, every format", { name: "Chip same order", x: 120, top: 380, fs: 16 }, K.T(T, "same"), tout);
};

// Review board (clips 24-25): rules column + three real designs with a tick grid. T = {in, rows:[4], stamps:[3]} or null; motion row
// shown when T is null or T.rows[3] set.
K.REV_X = [-200, 190, 580];
K.REV_Y = [-70, 40, 150, 260];
K.review = function (g, T, motion) {
    var l, i, j, imgs = ["bag.png", "social1.png", "product_page.png"], names = ["Packaging", "Social post", "Product page"],
        rules = ["1  Sun = the impact", "2  Info in the ivory area", "3  Same order", "M  Rises, then settles"], t;
    K.at(N3.text(g, "Review", { name: "Review eyebrow", x: -840, top: -420, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), K.T(T, "in"), null, 12);
    K.at(N3.text(g, "Against the brief and the rules", { name: "Review title", x: -840, top: -394, fs: 34, wt: 600, ls: -0.025 }), K.T(T, "in"), null, 12);
    for (i = 0; i < 3; i++) {
        l = N3.image(g, imgs[i], { name: "Design " + names[i], cx: K.REV_X[i], cy: -285, w: 220, h: 220, r: 18 }); K.at(l, T ? T["in"] + 0.15 + i * 0.12 : null, null, 30);
        l = N3.text(g, names[i], { name: "Design name " + (i + 1), x: K.REV_X[i], top: -164, fs: 22, wt: 600, align: "center" }); K.at(l, T ? T["in"] + 0.25 + i * 0.12 : null, null, 10);
    }
    for (j = 0; j < 4; j++) {
        if (j === 3 && !motion) { continue; }
        t = T ? T.rows[j] : null;
        l = N3.box(g, { name: "Rule row " + (j + 1), cx: 0, cy: K.REV_Y[j], w: 1680, h: 92, r: 20, fill: N3.COL.blush }); K.at(l, t === null ? null : t - 0.2, null, 0);
        l = N3.text(g, rules[j], { name: "Rule row text " + (j + 1), x: -800, cy: K.REV_Y[j], fs: 24, wt: 600 }); K.at(l, t === null ? null : t - 0.15, null, 10);
        for (i = 0; i < 3; i++) {
            l = N3.icon(g, "circleCheck", { name: "Tick " + (j + 1) + "." + (i + 1), cx: K.REV_X[i], cy: K.REV_Y[j], size: 44, color: N3.COL.coral, sw: 2.4 });
            if (t !== null) { K.pop(l, t + 0.3 + i * 0.18); }
        }
    }
};
K.stamps = function (g, T) {
    var i, c;
    for (i = 0; i < 3; i++) {
        c = K.tag(g, "\u2713  Follows the rules", { name: "Stamp " + (i + 1), cx: K.REV_X[i], top: 336, fs: 21, padX: 18, padY: 9 });
        if (T) { K.pop(c.bg, T[i]); N3.show(c.text, T[i] + 0.05, null, 8, { din: 0, lin: 0.3 }); }
    }
};

// ======================================================================== chunk 4
// Screen recording in a window card (dark title bar). Footage plays from clip-local tPlay; it holds its last frame at the end.
K.window = function (g, name, file, w, h, tPlay, title) {
    var l, bar = 40, s;
    N3.box(g, { name: name + " bar", cx: 0, cy: -h / 2 + bar / 2, w: w, h: bar, fill: "#2A2A2E" });
    N3.ellipse(g, { name: "Dot red", cx: -w / 2 + 24, cy: -h / 2 + 20, d: 12, fill: "#F57F7A" });
    N3.ellipse(g, { name: "Dot amber", cx: -w / 2 + 44, cy: -h / 2 + 20, d: 12, fill: "#F6C25B" });
    N3.ellipse(g, { name: "Dot green", cx: -w / 2 + 64, cy: -h / 2 + 20, d: 12, fill: "#6CCB7E" });
    if (title) { N3.text(g, title, { name: name + " title", x: 0, cy: -h / 2 + 20, fs: 15, wt: 500, color: "#B9B9C0", align: "center" }); }
    l = N3.image(g, file, { name: name, x: -w / 2, y: -h / 2 + bar, w: w, h: h - bar });
    try { l.audioEnabled = false; } catch (e) {}
    K.play(l, tPlay, g.S.T);
    return l;
};

// Play footage from clip-local tPlay (negative = already running), holding the first/last frame outside its length, via time remap.
K.play = function (l, tPlay, T) {
    var tr, d, k, at = function (t) { return Math.max(0, Math.min(d, t - tPlay)); };
    d = l.source.duration - 1 / N3.FPS;
    try {
        l.timeRemapEnabled = true;                     // AE adds keys at the in and out points
        tr = l.property("ADBE Time Remapping");
        for (k = tr.numKeys; k >= 1; k--) { tr.setValueAtTime(tr.keyTime(k), at(tr.keyTime(k))); }
        N3.lin(tr, [0, Math.max(0, tPlay), Math.max(0, tPlay + d)], [at(0), at(Math.max(0, tPlay)), d]);
        l.outPoint = T;
    } catch (e) { AEL.warn("time remap on " + l.name + ": " + e); }
};
// Communication goals board. T = {eye, cards:[3], ticks:[3], notes, present} or null.
K.goals = function (g, T) {
    var i, x, l, c, who = ["ALEX \u00B7 MARKETING", "MAYA \u00B7 FOUNDER", "JO \u00B7 SALES"], goal = ["Energy", "Composed information", "Clearly coffee"],
        q = ["Does the work have the\nenergy Alex wanted?", "Does the information feel\ncomposed, as Maya asked?", "Is the coffee clearly\nidentified for Jo?"];
    K.at(N3.text(g, "Back to the brief", { name: "Goals eyebrow", x: -790, top: -400, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), K.T(T, "eye"), null, 10);
    K.at(N3.text(g, "Communication goals", { name: "Goals title", x: -790, top: -372, fs: 44, wt: 600, ls: -0.025 }), K.T(T, "eye"), null, 12);
    for (i = 0; i < 3; i++) {
        x = -530 + i * 530; t = T ? T.cards[i] : null;
        K.at(N3.box(g, { name: "Goal card " + (i + 1), cx: x, cy: 40, w: 470, h: 470, r: 28, fill: N3.COL.blush }), t, null, 30);
        c = K.tag(g, who[i], { name: "Goal who " + (i + 1), x: x - 200, top: -160, fs: 14, bg: i === 0 ? N3.COL.coral : "#FCE3E2", color: i === 0 ? "#FFFFFF" : N3.COL.capRed }); K.showChip(c, t, null);
        K.at(N3.text(g, goal[i], { name: "Goal " + (i + 1), x: x - 200, top: -100, fs: 40, wt: 700, ls: -0.025 }), t, null, 14);
        K.at(N3.text(g, q[i], { name: "Goal question " + (i + 1), x: x - 200, top: -26, fs: 24, lh: 34, color: N3.COL.soft }), t === null ? null : t + 0.15, null, 10);
        l = N3.icon(g, "circleCheck", { name: "Goal tick " + (i + 1), cx: x, cy: 180, size: 110, color: N3.COL.coral, sw: 3 }); if (T) { K.pop(l, T.ticks[i]); }
    }
    K.chipAt(g, "Linked to the discovery notes", { name: "Chip notes", x: -790, top: 330, fs: 16, bg: N3.COL.navy }, K.T(T, "notes"), null);
    K.chipAt(g, "Ready to present", { name: "Chip present", x: -440, top: 330, fs: 16 }, K.T(T, "present"), null);
};
var t;   // shared loop temp for K.goals (ES3 has no block scope)

// The six-step workflow list (recap). Card 840 x 760, contents relative to the card top (anchor 't').
K.STEPS = [["brief", "Turn project files into direction", "Brief, research and meeting notes"], ["target", "Give every design a clear purpose", "Before we start anything"],
    ["rules", "Create design rules", "That change the whole workflow"], ["devices", "Carry it across every format", "Packaging \u00B7 digital \u00B7 motion"],
    ["checklist", "Check against the original goals", "Review the work with the brief"], ["handover", "Hand over a system", "So anyone can build on it"]];
K.recap = function (g, tIn, tStep) {
    var i, y, hi, l, ys = [];
    K.at(N3.text(g, "The workflow \u00B7 2027", { name: "Recap eyebrow", x: -370, top: 42, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), tIn, null, 10);
    K.at(N3.text(g, "The whole process, in six steps", { name: "Recap title", x: -370, top: 68, fs: 34, wt: 600, ls: -0.025 }), tIn, null, 10);
    for (i = 0; i < 6; i++) { ys.push(160 + i * 94); }
    hi = N3.box(g, { name: "Active row", x: -396, y: ys[0] - 8, w: 792, h: 86, r: 22, fill: N3.COL.blush });
    (function () { var k, keys = []; for (k = 1; k < 6; k++) { keys.push([tStep[k], [g.ox, g.oy + ys[k] - 8 + 43, 0], N3.SP.MORPH]); }
        N3.spring(N3.pos(hi), [g.ox, g.oy + ys[0] - 8 + 43, 0], keys); })();
    K.at(hi, tStep[0], null, 0);
    for (i = 0; i < 6; i++) {
        y = ys[i];
        K.at(N3.box(g, { name: "Step tile " + (i + 1), x: -370, y: y, w: 54, h: 54, r: 15, fill: N3.COL.coral }), tIn + 0.1 + i * 0.06, null, 16);
        K.at(N3.icon(g, K.STEPS[i][0], { name: "Step icon " + (i + 1), cx: -343, cy: y + 27, size: 28, color: "#FFFFFF", sw: 2 }), tIn + 0.1 + i * 0.06, null, 16);
        K.at(N3.text(g, K.STEPS[i][1], { name: "Step " + (i + 1), x: -296, top: y + 2, fs: 26, wt: 600, ls: -0.02 }), tIn + 0.1 + i * 0.06, null, 16);
        K.at(N3.text(g, K.STEPS[i][2], { name: "Step sub " + (i + 1), x: -296, top: y + 36, fs: 17, color: N3.COL.soft }), tIn + 0.1 + i * 0.06, null, 16);
        l = N3.icon(g, "circleCheck", { name: "Step tick " + (i + 1), cx: 340, cy: y + 27, size: 40, color: N3.COL.coral, sw: 2.4 }); K.pop(l, tStep[i] + 0.4);
    }
};
