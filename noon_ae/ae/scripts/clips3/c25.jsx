// Clip 25 (490.60 s): "in motion, that sun rises and it settles while the information stays more or less still. And we can check if
// each application follows those decisions even though it's a different composition." - motion row ticks, then the stamps.
N3CLIPS["25"] = { tin: 490.60, build: function () {
    var T0 = 490.60, S, g, L = function (t) { return t - T0; };
    S = N3.scene({ id: "25", title: "Follows the rules", T: 11.90, intro: null, drift: 2,
        SH: { review: { w: 1760, h: 980, r: 36, bg: "#FFFFFF", cam: 1.0 } }, start: "review", SEQ: [] });
    g = N3.group(S, "Review", { tin: null });
    K.review(g, { "in": null, rows: [null, null, null, L(491.10)] }, true);
    K.stamps(g, [L(497.24), L(497.80), L(498.28)]);
    return S;
} };
