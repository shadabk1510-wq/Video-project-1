// Clip 18 (306.00 s): "But here's another very powerful part of this new workflow. We're going to turn it into a set of design rules
// ... like a well-ordered machine ... I'm going to establish three. Three rules." - DESIGN RULES page, then three numbered slots.
N3CLIPS["18"] = { tin: 306.00, build: function () {
    var T0 = 306.00, S, g, l, i, x, tCard = 306.30 - T0, tSlots = 327.00 - T0, tN = [328.52 - T0, 329.32 - T0, 330.12 - T0];
    S = N3.scene({ id: "18", title: "Design rules", T: 25.45, intro: null, drift: 2,
        SH: { art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 }, pro: { w: 1760, h: 940, r: 56, bg: "#EA6262", cam: 1.06 },
            rules: { w: 1560, h: 720, r: 40, bg: "#FFFFFF", cam: 1.0 } },
        start: "art", SEQ: [[tCard, "pro"], [tSlots, "rules"]] });
    g = N3.group(S, "Pack direction", { tin: null, tout: tCard, lout: 0.16 });
    K.packBoard(g, null);
    g = N3.group(S, "Design rules", { tin: tCard + 0.05, tout: tSlots - 0.05, lout: 0.16 });
    K.emph(g, { word: "DESIGN RULES", fs: 170, eyebrow: "Turn it into", tEye: 307.00 - T0, tWord: 311.08 - T0, stagger: 0.025,
        sub: "so anything designed after this just works", tSub: 313.72 - T0 });
    g = N3.group(S, "Three rules", { tin: tSlots + 0.1, din: 0.05, lin: 0.35 });
    K.rulesBoard(g, { slots: tSlots, n: tN });
    return S;
} };
