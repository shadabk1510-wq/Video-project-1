// Clip 01 (4.24 s): hook - brief, research and notes fly in fanned, collapse into the card, which becomes the coffee pack
// (ivory panel, the sun grows, the real bag photo resolves), then post -> product page (scrolls) -> sunrise video -> post 2.

// Time remap: linear keys only (AE adds two keys when Time Remap is enabled; they are replaced).
function C01_remap(layer, times, values) {
    var tr, i, j, keep;
    layer.timeRemapEnabled = true;
    tr = layer.property("ADBE Time Remapping");
    N3.lin(tr, times, values);
    for (i = tr.numKeys; i >= 1; i--) {
        keep = false;
        for (j = 0; j < times.length; j++) { if (Math.abs(tr.keyTime(i) - times[j]) < 0.0005) { keep = true; } }
        if (!keep) { tr.removeKey(i); }
    }
    return tr;
}

// One document page in world space: a null "Page n" carries the springs (fly-in, fan, collapse into the card);
// the page image (and the notes highlight) hang from it and take its opacity.
function C01_page(S, n, file, p, label) {
    var ctx, nl, img, sc = N3.SP.MORPH, col = [11, 0.95], opExpr, nm = "Page " + n + " (" + label + ")";
    nl = AEL.nullLayer(S.comp, nm);
    N3.place(S.worldCtx, nl);
    N3.xf(nl, "ADBE Anchor Point").setValue([0, 0]);
    // y: from 900 px below into the fan at p[3]; x/y: into the card centre (0, 20) at 0.92
    N3.spring(N3.pos(nl), [p[0], p[1] + 900], [[p[3], [p[0], p[1]], sc], [0.92, [0, 20], col]]);
    if (p[2] !== 0) { N3.spring(N3.xf(nl, "ADBE Rotate Z"), p[2] * 2.2, [[p[3], p[2], sc], [0.92, 0, col]]); }
    N3.spring(N3.xf(nl, "ADBE Scale"), [100, 100], [[0.92, [142, 142], col]]);
    AEL.expr(N3.xf(nl, "ADBE Opacity"), "// fades while the page grows into the card (scale 100 -> 142)\n" +
        "var b = (transform.scale[0] - 100) / 42;\nlinear(b, 0.55, 0.95, 100, 0)");
    opExpr = "thisComp.layer(\"" + nm + "\").transform.opacity";
    ctx = { comp: S.comp, ox: 0, oy: 0, parent: nl, slot: "world", S: S };
    img = N3.image(ctx, file, { name: label, cx: 0, cy: 0, w: 300, h: 424, r: 10 });
    N3.shadow(img, { color: "#8C2830", opacity: 0.32, dist: 18, soft: 40 });
    AEL.expr(N3.xf(img, "ADBE Opacity"), opExpr);
    return { ctx: ctx, nul: nl, img: img, opExpr: opExpr };
}

N3CLIPS["01"] = { tin: 0, build: function () {
    var S, g, l, pg, gi, i, PG = [[-360, 30, -9, 0.05], [360, 30, 9, 0.12], [0, 0, 0, 0.19]], FILES = ["doc_brief.png", "doc_research.png", "doc_notes.png"],
        LBL = ["Brief", "Research", "Notes"], rs, hlW = 240;
    S = N3.scene({ id: "01", title: "Hook", T: 4.24, intro: 0.95,
        SH: { pack: { w: 600, h: 600, r: 44, bg: "#C6C5C4", cam: 1.42 }, post: { w: 600, h: 600, r: 36, bg: "#FFFFFF", cam: 1.42 },
            page: { w: 520, h: 680, r: 30, bg: "#FFFFFF", cam: 1.25 }, sun: { w: 600, h: 600, r: 36, bg: "#FFFFFF", cam: 1.42 },
            post2: { w: 600, h: 600, r: 36, bg: "#FFFFFF", cam: 1.42 } },
        start: "pack", SEQ: [[2.42, "post"], [2.9, "page"], [3.36, "sun"], [3.9, "post2"]] });

    // ---- world: the three pages (behind the card)
    for (i = 0; i < 3; i++) { pg = C01_page(S, i + 1, FILES[i], PG[i], LBL[i]); }
    // notes highlight (.hl, multiply): grows to 240 px wide from its left edge (spring SOFT at 0.5)
    l = N3.shapeLayer(S.comp, "Notes highlight");
    N3.place(pg.ctx, l);
    gi = N3.addGroup(l, "Highlight");
    rs = N3.addRect(l, gi, 0, 22, 5);
    N3.addFill(l, gi, N3.COL.coral, 42);
    N3.spring(rs.property("ADBE Vector Rect Size"), [0, 22], [[0.5, [hlW, 22], N3.SP.SOFT]]);
    N3.spring(rs.property("ADBE Vector Rect Position"), [0, 0], [[0.5, [hlW / 2, 0], N3.SP.SOFT]]);
    N3.pos(l).setValue([-150 + 30, -212 + 22 + 11]);          // left edge, vertical centre (page-local)
    l.blendingMode = BlendingMode.MULTIPLY;
    AEL.expr(N3.xf(l, "ADBE Opacity"), pg.opExpr);

    // ---- card contents
    g = N3.group(S, "Pack", { tin: 0.95, tout: 2.42, din: 0.02, lin: 0.2 });
    N3.box(g, { name: "Ivory panel", x: -111, y: -270, w: 282, h: 501, r: 6, fill: "#F6F2EA", shadow: { color: "#3C2828", opacity: 0.3, dist: 12, soft: 24 } });
    l = N3.ellipse(g, { name: "Sun", cx: 24, cy: -97, d: 212, fill: N3.COL.verm });
    N3.spring(N3.xf(l, "ADBE Scale"), [0, 0], [[1.28, [100, 100], [13, 0.86]]]);   // grows exactly where the photo's sun is
    l = N3.image(g, "bag.png", { name: "Bag photo", cx: 0, cy: 0, w: 600, h: 600 });
    N3.eo(N3.xf(l, "ADBE Opacity"), 1.72, 2.02, 0, 100);       // the real photo resolves

    g = N3.group(S, "Social post", { tin: 2.42, tout: 2.9, din: 0.03, lin: 0.18, lout: 0.1 });
    N3.image(g, "social1.png", { name: "social1", cx: 0, cy: 0, w: 600, h: 600 });

    // product page hangs from the card's top edge and scrolls 300 px (spring SOFT at 2.95)
    g = N3.group(S, "Product page", { anchor: "t", tin: 2.9, tout: 3.36, din: 0.03, lin: 0.18, lout: 0.1 });
    l = N3.image(g, "product_page.png", { name: "Product page", x: -260, y: 0, w: 520, fit: "width" });
    rs = N3.pos(l).value;
    N3.spring(N3.pos(l), [rs[0], rs[1]], [[2.95, [rs[0], rs[1] - 300], N3.SP.SOFT]]);

    // sunrise: motion2_bag.mp4 from 0.2 s at 1.6x (time remap), cover in 600 x 600
    g = N3.group(S, "Sunrise video", { tin: 3.36, tout: 3.9, din: 0.03, lin: 0.18, lout: 0.1 });
    l = N3.image(g, "motion2_bag.mp4", { name: "Sunrise (motion2_bag)", cx: 0, cy: 0, w: 600, h: 600 });
    if (l.hasAudio) { l.audioEnabled = false; }
    C01_remap(l, [3.36, 4.24], [0.2, N3.r3(0.2 + (4.24 - 3.36) * 1.6)]);

    g = N3.group(S, "Social post 2", { tin: 3.9, din: 0.03, lin: 0.18 });
    N3.image(g, "social2.png", { name: "social2", cx: 0, cy: 0, w: 600, h: 600 });
    return S;
} };
