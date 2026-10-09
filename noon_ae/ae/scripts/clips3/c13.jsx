// Clip 13 (145.40 s): "So the social post needs to attract attention ... the product page needs to explain ... and the packaging
// needs to clearly identify the product" - the camera drifts to each column of the working document as its job is written in.
N3CLIPS["13"] = { tin: 145.40, build: function () {
    var T0 = 145.40, S, g, i, tJ = [147.40 - T0, 153.00 - T0, 159.96 - T0];
    S = N3.scene({ id: "13", title: "Three jobs", T: 19.60, intro: null, drift: 2,
        SH: { board: { w: 1720, h: 900, r: 40, bg: "#FFFFFF", cam: 1.0 } }, start: "board", SEQ: [],
        fx: [[145.90 - T0, -560, N3.SP.SOFT], [151.40 - T0, 0, N3.SP.SOFT], [158.20 - T0, 560, N3.SP.SOFT], [162.80 - T0, 0, N3.SP.SOFT]],
        camMul: [[145.90 - T0, 1.16, N3.SP.SOFT], [162.80 - T0, 1, N3.SP.SOFT]] });
    g = N3.group(S, "Working doc", { tin: null });
    K.board(g, { tin: null });
    for (i = 0; i < 3; i++) { K.job(g, i, tJ[i]); }
    return S;
} };
