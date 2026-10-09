// Clip 16 (245.00 s): "And this is why it's so powerful ... now we're going to develop the visual direction, starting with the main
// pack" - plan and rail clear, the card becomes the stage pill: purpose and content plan ticked, then "Visual direction".
N3CLIPS["16"] = { tin: 245.00, build: function () {
    var T0 = 245.00, S, g, plan, l, c, tPill = 245.60 - T0, tTick = 249.36 - T0, tNext = 254.16 - T0, segs, i;
    S = N3.scene({ id: "16", title: "Visual direction", T: 15.30, intro: null, drift: 2,
        SH: { rail: { w: 340, h: 760, r: 32, bg: "#FFFFFF", cam: 1.0 }, stage: { w: 1190, h: 156, r: 78, bg: "#FFFFFF", cam: 1.42 } },
        start: "rail", SEQ: [[tPill, "stage"]], cx: [[0.01, -760, N3.SP.INSTANT], [tPill, 0, N3.SP.MORPH]] });
    g = N3.group(S, "Jobs rail", { tin: null, tout: tPill - 0.05, lout: 0.16 });
    K.rail(g, null);
    plan = K.plan(S.worldCtx, 190, 0, null);
    N3.show(plan, null, tPill - 0.1, 0, { lout: 0.25 });
    g = N3.group(S, "Stage", { tin: tPill + 0.05, din: 0.05, lin: 0.3 });
    N3.text(g, "Stage", { name: "Stage cap", x: -540, top: -34, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    l = N3.text(g, "02", { name: "Stage 02", x: -540, top: -14, fs: 44, wt: 600, lh: 46, color: N3.COL.coral }); N3.show(l, null, tNext, 10, { lout: 0.25 });
    l = N3.text(g, "03", { name: "Stage 03", x: -540, top: -14, fs: 44, wt: 600, lh: 46, color: N3.COL.coral }); N3.show(l, tNext + 0.1, null, 10, { din: 0, lin: 0.35 });
    N3.box(g, { name: "Divider", x: -436, y: -36, w: 1.5, h: 72, fill: "#F2E2E1" });
    l = N3.text(g, "Purpose and content plan", { name: "Label done", x: -404, cy: 0, fs: 31, wt: 600, ls: -0.025 }); N3.show(l, null, tNext, 12, { lout: 0.25 });
    l = N3.text(g, "Visual direction \u00b7 the main pack", { name: "Label next", x: -404, cy: 0, fs: 31, wt: 600, ls: -0.025 }); N3.show(l, tNext + 0.15, null, 12, { din: 0, lin: 0.4 });
    l = N3.icon(g, "circleCheck", { name: "Tick", cx: 548, cy: -44, size: 34, color: N3.COL.coral, sw: 2.4 }); K.pop(l, tTick);
    N3.show(l, null, tNext, 0, { lout: 0.25, noScale: true });
    for (i = 0; i < 6; i++) {
        l = N3.box(g, { name: "Segment " + (i + 1), x: 180 + i * 68, y: -6, w: 58, h: 12, r: 6, fill: i < 2 ? N3.COL.coral : "#F4E1E0" });
    }
    l = N3.box(g, { name: "Segment 3 fill", x: 316, y: -6, w: 58, h: 12, r: 6, fill: N3.COL.coral });
    N3.eo(N3.xf(l, "ADBE Opacity"), tNext + 0.3, tNext + 0.9, 0, 35);
    return S;
} };
