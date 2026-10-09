// Clip 04 (5.32 s): "...this coffee brand Noon, so you can follow along with the whole process on one project" -
// the sun shrinks and dips, the NOON wordmark rises letter by letter in front of it, the sun rises behind the wordmark,
// then the card becomes the bag: the wordmark moves up and shrinks, the process ring and the tag line appear.

// NOON wordmark (noon_ae/assets/_ae/NOON-logo.svg, via svg_to_ae.py): viewBox units, centred on the viewBox centre (225, 56).
// One entry per letter: [name, [[closed, verts, inT, outT], ...], evenOdd].
var C04_LOGO = [
    ["N", [[true, [[-225, -55], [-183, -55], [-150, -16], [-150, -55], [-116, -55], [-116, 54], [-155, 54], [-186, 17], [-186, 54], [-225, 54]], null, null]], false],
    ["O", [[true, [[-57, -56], [-1, 0], [-57, 56], [-113, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[-31, -11], [-43, 1], [-31, 13], [-19, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]], true],
    ["O", [[true, [[56.5, -56], [112.5, 0], [56.5, 56], [0.5, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[84.5, -11], [72.5, 1], [84.5, 13], [96.5, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]], true],
    ["N", [[true, [[117, -55], [160, -55], [191, -16], [191, -55], [225, -55], [225, 56], [187, 56], [156, 18], [156, 56], [117, 56]], null, null]], false]
];

// The wordmark as one shape layer, one group per letter (web: #logo, 720 x 179 at left -360, top 20 -> centre (0, 109.6), 1.6 px per unit).
// o: {name, pos:[x,y] (world), scale (%, 160 = web size)}. Returns the layer; groups are named "N 1", "O 1", "O 2", "N 2".
function C04_logo(ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "NOON logo")), i, j, gi, L, fill, cnt = {};
    N3.place(ctx, l);
    for (i = 0; i < C04_LOGO.length; i++) {
        L = C04_LOGO[i];
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

// The process ring: ONE text layer set on a circular mask (Text > Path Options), mask mode None.
// Web: <textPath> on a r=300 circle starting at 12 o'clock, clockwise, textLength 1870 (lengthAdjust spacing).
// Natural width of the string in Inter Bold 19 = 1304.1 px -> extra (1870 - 1304.1) / 114 gaps = 4.96 px = tracking 261.
// o: {cx, cy (world centre), r}
function C04_ring(ctx, o) {
    var str = "", i, l, m, s = new Shape(), r = o.r, k = 0.5523 * o.r;
    for (i = 0; i < 2; i++) { str += "BRIEF → PURPOSE → DIRECTION → RULES → REVIEW → HANDOVER → "; }
    str = str.replace(/\s+$/, "");
    l = N3.text(ctx, str, { name: "Process ring", x: 0, top: 0, fs: 19, wt: 700, ls: 0.261, color: "#B54A50" });
    N3.pos(l).setValue([ctx.ox + o.cx, ctx.oy + o.cy]);
    // circle path in layer space, first vertex at 12 o'clock, clockwise (text sits outside, reading clockwise)
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

N3CLIPS["04"] = { tin: 9.98, build: function () {
    var T0 = 9.98, tSmall = 0.12, tLogo = N3.wt(35, T0) - 0.08, tBag = N3.wt(36, T0), tRing = tBag + 0.45, tTag = N3.wt(43, T0) - 0.1,
        S, g, logo, ring, tag, cy, e, i, rise, gname, GN = ["N 1", "O 1", "O 2", "N 2"];
    S = N3.scene({ id: "04", title: "NOON", T: 5.32, intro: null,
        SH: { sun: { w: 300, h: 300, r: 150, bg: "#F4512B", cam: 1.15 }, sun2: { w: 200, h: 200, r: 100, bg: "#F4512B", cam: 1.15 },
            bag: { w: 440, h: 440, r: 36, bg: "#C6C5C4", cam: 1.15 } },
        start: "sun", SEQ: [[tSmall, "sun2"], [tBag, "bag"]],
        // the sun: shrinks and dips behind the horizon, then rises above the wordmark
        cy: [[tSmall, 280, N3.SP.SOFT], [tLogo + 0.32, -150, [6.5, 0.9]]] });

    // Card height track. Web: cy = t < tBag ? sunY(t) : bagY(t) - the sun track is cut at tBag (mid-spring) and the bag
    // track takes over. In AE: CY keeps the sun keys (start value -110 from clip 03), "CY bag" holds the bag keys,
    // and from the SHAPE marker "bag" on CY reads "CY bag". Drag the marker and the "CY bag" key together to retime.
    cy = N3.ctl(S.shape, "CY");
    cy.setValueAtTime(0, -110);
    N3.spring(N3.slider(S.shape, "CY bag", -150), -150, [[tBag, 40, N3.SP.MORPH]]);
    AEL.layerMarker(S.shape, N3.r3(tBag), "bag: CY follows CY bag");
    e = cy.expression;
    AEL.expr(cy, e.substr(0, e.length - 1) + "// from the marker \"bag\" on, the card follows the \"CY bag\" slider\n" +
        "(marker.numKeys > 0 && time >= marker.key(1).time) ? effect(\"CY bag\")(1) : v");

    // the bag photo inside the card
    g = N3.group(S, "Bag", { tin: tBag + 0.05, din: 0.05, lin: 0.3 });
    N3.image(g, "bag.png", { name: "Bag", cx: 0, cy: 0, w: 440, h: 440 });

    // world (behind the card): the process ring and the tag line
    ring = C04_ring(S.worldCtx, { cx: 0, cy: 40, r: 300 });
    N3.lin(N3.xf(ring, "ADBE Rotate Z"), [0, 5.32], [0, -5.32 * 9]);               // -9 deg/s, continues in clip 05
    N3.eo(N3.xf(ring, "ADBE Opacity"), tRing, tRing + 0.6, 0, 100);
    N3.eo(N3.xf(ring, "ADBE Scale"), tRing, tRing + 0.6, [90, 90, 100], [100, 100, 100]);
    tag = N3.text(S.worldCtx, "The whole process · one project", { name: "Tag", x: -0.07 * 19, top: 372, fs: 19, wt: 600, ls: 0.14,
        caps: true, color: N3.COL.capRed, align: "center" });
    N3.show(tag, tTag, null, 12, { din: 0, lin: 0.4 });

    // over the card: the wordmark. Letters rise in on "Noon" (one Rise slider each, spring [11, 0.9]);
    // on "so" it moves up 470 px and shrinks to 38 % to make room for the bag.
    logo = C04_logo(S.overCtx, { name: "NOON logo", pos: [0, 109.6], scale: 160 });
    for (i = 0; i < GN.length; i++) {
        gname = GN[i];
        rise = N3.slider(logo, "Rise " + gname, 0);
        N3.spring(rise, 0, [[tLogo + i * 0.05, 1, [11, 0.9]]]);
        AEL.expr(N3.root(logo).property(gname).property("ADBE Vector Transform Group").property("ADBE Vector Position"),
            "// rises 40 units (64 px) as its Rise slider springs 0 -> 1\n[0, (1 - effect(\"Rise " + gname + "\")(1)) * 40]");
        AEL.expr(N3.root(logo).property(gname).property("ADBE Vector Transform Group").property("ADBE Vector Group Opacity"),
            "Math.min(100, Math.max(0, 140 * effect(\"Rise " + gname + "\")(1)))");
    }
    N3.spring(N3.pos(logo), [0, 109.6], [[tBag - 0.05, [0, 109.6 - 470]]], N3.SP.MORPH);
    N3.spring(N3.xf(logo, "ADBE Scale"), [160, 160, 100], [[tBag - 0.05, [160 * 0.38, 160 * 0.38, 100]]], N3.SP.MORPH);
    return S;
} };
