// Clip 20 (356.60 s): rule 2 - "product information sits in a very clear ivory area ... watch what happens when I move the graphic
// behind these details ... harder to read ... busy ... I'm going to move it back ... their own separate areas".
N3CLIPS["20"] = { tin: 356.60, build: function () {
    var T0 = 356.60, S, g, L = function (t) { return t - T0; }, tSwap = L(357.00);
    S = N3.scene({ id: "20", title: "Rule 2", T: 27.80, intro: null, drift: 2,
        SH: { art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 }, art2: { w: 1660, h: 920, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "art", SEQ: [[tSwap, "art2"]] });
    g = N3.group(S, "Rule 1", { tin: null, tout: tSwap, lout: 0.18 });
    K.rule1(g, null);
    g = N3.group(S, "Rule 2", { tin: tSwap + 0.15, din: 0.05, lin: 0.35 });
    K.rule2(g, { head: L(357.12), text: L(358.4), pack: L(359.6), down: L(366.08), hard: L(369.36), busy: L(373.2), up: L(376.8),
        zoneE: L(378.72), zoneI: L(379.6) });
    return S;
} };
