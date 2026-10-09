// Clip 21 (384.40 s): rule 3 - "the product information follows the same order. Noon first, High Sun second, then whole bean coffee,
// the origin, tasting notes and the weight ... adjust the size and position to suit the format, but preserve this hierarchy".
N3CLIPS["21"] = { tin: 384.40, build: function () {
    var T0 = 384.40, S, g, L = function (t) { return t - T0; }, tSwap = L(384.80);
    S = N3.scene({ id: "21", title: "Rule 3", T: 24.00, intro: null, drift: 2,
        SH: { art2: { w: 1660, h: 920, r: 36, bg: "#FFFFFF", cam: 1.0 }, art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "art2", SEQ: [[tSwap, "art"]] });
    g = N3.group(S, "Rule 2", { tin: null, tout: tSwap, lout: 0.18 });
    K.rule2(g, null);
    g = N3.group(S, "Rule 3", { tin: tSwap + 0.15, din: 0.05, lin: 0.35 });
    K.rule3(g, { head: L(384.88), text: L(386.4), pack: L(387.2), items: [L(389.68), L(390.64), L(392.32), L(393.28), L(393.68), L(394.64)],
        formats: L(398.64), same: L(402.0) });
    return S;
} };
