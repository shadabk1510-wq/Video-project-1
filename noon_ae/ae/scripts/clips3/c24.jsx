// Clip 24 (459.90 s): "we've developed the identity across the applications. Now we're going to review the work against the brief
// and the rules ... designs beside each other ... first ... second ... third" - stage 05 pill, then the review board ticks off.
N3CLIPS["24"] = { tin: 459.90, build: function () {
    var T0 = 459.90, S, g, L = function (t) { return t - T0; }, tPill = L(460.30), tRev = L(468.10), l, i;
    S = N3.scene({ id: "24", title: "Review", T: 30.70, intro: null, drift: 2,
        SH: { art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 }, stage: { w: 1190, h: 156, r: 78, bg: "#FFFFFF", cam: 1.42 },
            review: { w: 1760, h: 980, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "art", SEQ: [[tPill, "stage"], [tRev, "review"]] });
    g = N3.group(S, "Motion rule", { tin: null, tout: tPill, lout: 0.18 });
    N3.text(g, "Motion rule", { name: "Motion eyebrow", x: -790, top: -400, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "The sun rises, then settles.\nThe information stays still.", { name: "Motion text", x: -790, top: -370, fs: 44, wt: 600, lh: 54, ls: -0.025 });
    K.pack(g, "Motion pack", -330, 150, { scale: 0.75 });
    g = N3.group(S, "Stage", { tin: tPill + 0.05, din: 0.05, lin: 0.3, tout: tRev, lout: 0.16 });
    N3.text(g, "Stage", { name: "Stage cap", x: -540, top: -34, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "05", { name: "Stage 05", x: -540, top: -14, fs: 44, wt: 600, lh: 46, color: N3.COL.coral });
    N3.box(g, { name: "Divider", x: -436, y: -36, w: 1.5, h: 72, fill: "#F2E2E1" });
    l = N3.text(g, "Check against the original goals", { name: "Label", x: -404, cy: 0, fs: 31, wt: 600, ls: -0.025 }); N3.show(l, L(460.7), null, 12, { din: 0, lin: 0.4 });
    for (i = 0; i < 6; i++) { N3.box(g, { name: "Segment " + (i + 1), x: 180 + i * 68, y: -6, w: 58, h: 12, r: 6, fill: i < 4 ? N3.COL.coral : "#F4E1E0" }); }
    l = N3.box(g, { name: "Segment 5 fill", x: 452, y: -6, w: 58, h: 12, r: 6, fill: N3.COL.coral }); N3.eo(N3.xf(l, "ADBE Opacity"), L(463.6), L(464.4), 0, 40);
    g = N3.group(S, "Review", { tin: tRev + 0.1, din: 0.05, lin: 0.35 });
    K.review(g, { "in": tRev + 0.2, rows: [L(478.2), L(481.64), L(487.16), null] }, false);
    return S;
} };
