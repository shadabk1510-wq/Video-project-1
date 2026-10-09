// Clip 17 (260.30 s): "The brief suggests a sun motif, white topography and a palette of ivory, navy and vermilion, and powder blue.
// ... a large vermilion sun ... a separate ivory area ... the type in order ... one bold graphic ... organised space".
N3CLIPS["17"] = { tin: 260.30, build: function () {
    var T0 = 260.30, S, g, l, tBoard = 260.50 - T0, L = function (t) { return t - T0; };
    S = N3.scene({ id: "17", title: "The main pack", T: 45.70, intro: null, drift: 2.5,
        SH: { stage: { w: 1190, h: 156, r: 78, bg: "#FFFFFF", cam: 1.42 }, art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "stage", SEQ: [[tBoard, "art"]],
        fx: [[L(269.20), 300, N3.SP.SOFT], [L(303.60), 0, N3.SP.SOFT]], camMul: [[L(269.20), 1.12, N3.SP.SOFT], [L(303.60), 1, N3.SP.SOFT]] });
    g = N3.group(S, "Stage", { tin: null, tout: tBoard, lout: 0.14 });
    N3.text(g, "Stage", { name: "Stage cap", x: -540, top: -34, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "03", { name: "Stage 03", x: -540, top: -14, fs: 44, wt: 600, lh: 46, color: N3.COL.coral });
    N3.box(g, { name: "Divider", x: -436, y: -36, w: 1.5, h: 72, fill: "#F2E2E1" });
    N3.text(g, "Visual direction \u00b7 the main pack", { name: "Label", x: -404, cy: 0, fs: 31, wt: 600, ls: -0.025 });
    g = N3.group(S, "Pack direction", { tin: tBoard + 0.1, din: 0.05, lin: 0.35 });
    K.packBoard(g, { eye: L(260.60), chips: [L(261.72), L(262.76)], pal: L(264.20), sw: [L(264.84), L(265.48), L(266.20), L(267.64)],
        outline: L(269.32), sun: L(270.76), panel: L(280.04), type: [L(287.48), L(288.68), L(290.28), L(291.80), L(292.52)],
        bold: L(297.16), organised: L(300.28), photo: L(304.12) });
    return S;
} };
