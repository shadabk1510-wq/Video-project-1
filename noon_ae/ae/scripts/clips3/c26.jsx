// Clip 26 (502.50 s): "when we return to the communication goals from the brief ... the energy Alex wanted? ... composed as Maya
// requested? ... clearly identified, addressing Jo's concerns? ... connect the finished work to the thinking at the very start ...
// explain the direction when we present it".
N3CLIPS["26"] = { tin: 502.50, build: function () {
    var T0 = 502.50, S, g, L = function (t) { return t - T0; }, tB = L(503.10);
    S = N3.scene({ id: "26", title: "Communication goals", T: 25.20, intro: null, drift: 2,
        SH: { review: { w: 1760, h: 980, r: 36, bg: "#FFFFFF", cam: 1.0 }, art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "review", SEQ: [[tB, "art"]] });
    g = N3.group(S, "Review", { tin: null, tout: tB, lout: 0.18 });
    K.review(g, null, true); K.stamps(g, null);
    g = N3.group(S, "Goals", { tin: tB + 0.1, din: 0.05, lin: 0.35 });
    K.goals(g, { eye: L(503.6), cards: [L(507.28), L(510.80), L(514.24)], ticks: [L(509.68), L(513.36), L(516.96)], notes: L(519.04), present: L(524.56) });
    return S;
} };
