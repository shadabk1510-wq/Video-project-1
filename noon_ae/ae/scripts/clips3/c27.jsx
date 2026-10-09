// Clip 27 (527.70 s): "a quick rundown summary towards the end ... the final stage is to turn those working rules into guidance so
// somebody else can use it in one week, one month, one year, ten years from now".
N3CLIPS["27"] = { tin: 527.70, build: function () {
    var T0 = 527.70, S, g, L = function (t) { return t - T0; }, tPill = L(533.50), i, l, W = ["1 week", "1 month", "1 year", "10 years from now"],
        tW = [L(539.12), L(539.60), L(540.00), L(540.40)], X = [-470, -250, -30, 230];
    S = N3.scene({ id: "27", title: "Final stage", T: 18.00, intro: null, drift: 2,
        SH: { art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 }, stage: { w: 1190, h: 156, r: 78, bg: "#FFFFFF", cam: 1.42 } },
        start: "art", SEQ: [[tPill, "stage"]] });
    g = N3.group(S, "Goals", { tin: null, tout: tPill, lout: 0.18 });
    K.goals(g, null);
    K.chipAt(g, "Full recap at the end of the video", { name: "Chip recap", x: 140, top: 330, fs: 16, bg: N3.COL.navy }, L(528.9), null);
    g = N3.group(S, "Stage", { tin: tPill + 0.05, din: 0.05, lin: 0.3 });
    N3.text(g, "Stage", { name: "Stage cap", x: -540, top: -34, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "06", { name: "Stage 06", x: -540, top: -14, fs: 44, wt: 600, lh: 46, color: N3.COL.coral });
    N3.box(g, { name: "Divider", x: -436, y: -36, w: 1.5, h: 72, fill: "#F2E2E1" });
    l = N3.text(g, "Hand over a system", { name: "Label", x: -404, cy: 0, fs: 31, wt: 600, ls: -0.025 }); N3.show(l, L(534.0), null, 12, { din: 0, lin: 0.4 });
    for (i = 0; i < 6; i++) { N3.box(g, { name: "Segment " + (i + 1), x: 180 + i * 68, y: -6, w: 58, h: 12, r: 6, fill: i < 5 ? N3.COL.coral : "#F4E1E0" }); }
    l = N3.box(g, { name: "Segment 6 fill", x: 520, y: -6, w: 58, h: 12, r: 6, fill: N3.COL.coral }); N3.eo(N3.xf(l, "ADBE Opacity"), L(536.0), L(537.0), 0, 100);
    for (i = 0; i < 4; i++) {
        l = K.tag(S.worldCtx, W[i], { name: "Time " + (i + 1), x: X[i], top: 120, fs: 20, bg: i === 3 ? N3.COL.coral : "#FFFFFF", color: i === 3 ? "#FFFFFF" : N3.COL.coral, padX: 18, padY: 10 });
        K.pop(l.bg, tW[i]); N3.show(l.text, tW[i] + 0.05, null, 8, { din: 0, lin: 0.3 });
    }
    return S;
} };
