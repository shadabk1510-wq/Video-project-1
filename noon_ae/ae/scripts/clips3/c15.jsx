// Clip 15 (187.30 s): "assign the content to each application ..." - the content plan fills in beside the jobs rail: package
// image / sun graphic / headline; whole bean, medium roast, caramel / cacao / orange, Colombian origin; the pack hierarchy 1-6.
N3CLIPS["15"] = { tin: 187.30, build: function () {
    var T0 = 187.30, S, g, PX = 190, L = function (t) { return t - T0; }, plan;
    S = N3.scene({ id: "15", title: "Content plan", T: 57.70, intro: null, drift: 2,
        SH: { rail: { w: 340, h: 760, r: 32, bg: "#FFFFFF", cam: 1.0 } }, start: "rail", SEQ: [], cx: [[0.01, -760, N3.SP.INSTANT]],
        fx: [[L(192.50), PX - 420, N3.SP.SOFT], [L(201.00), PX, N3.SP.SOFT], [L(227.00), PX + 420, N3.SP.SOFT], [L(238.40), 0, N3.SP.SOFT]],
        camMul: [[L(192.50), 1.22, N3.SP.SOFT], [L(238.40), 1, N3.SP.SOFT]] });
    g = N3.group(S, "Jobs rail", { tin: null });
    K.rail(g, null);
    plan = K.plan(S.worldCtx, PX, 0, { social: [L(194.56), L(197.04), L(198.80)],
        product: [L(211.12), L(213.52), L(214.56), L(215.28), L(216.00), L(218.24)],
        pack: [L(228.64), L(232.48), L(233.04), L(233.76), L(235.36), L(235.92), L(236.88)], done: L(238.96) });
    return S;
} };
