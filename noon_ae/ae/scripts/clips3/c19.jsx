// Clip 19 (331.45 s): rule 1 - "the sun creates the main visual impact ... change its size, the crop ... keep it circular ...
// on the bag in full, on a social post enlarged beyond the frame ... recognisable as an element".
N3CLIPS["19"] = { tin: 331.45, build: function () {
    var T0 = 331.45, S, g, L = function (t) { return t - T0; }, tBoard = L(331.90);
    S = N3.scene({ id: "19", title: "Rule 1", T: 25.15, intro: null, drift: 2,
        SH: { rules: { w: 1560, h: 720, r: 40, bg: "#FFFFFF", cam: 1.0 }, art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "rules", SEQ: [[tBoard, "art"]] });
    g = N3.group(S, "Three rules", { tin: null, tout: tBoard, lout: 0.16 });
    K.rulesBoard(g, null);
    g = N3.group(S, "Rule 1", { tin: tBoard + 0.1, din: 0.05, lin: 0.35 });
    K.rule1(g, { head: L(332.0), text: L(333.16), pack: L(334.4), size: L(338.44), crop: L(339.24), pos: L(340.12), circle: L(342.6),
        bag: L(346.08), social: L(348.32), recog: L(353.6) });
    return S;
} };
