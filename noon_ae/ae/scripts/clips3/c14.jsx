// Clip 14 (165.00 s): "Sounds simple, yes. But look what we've just done here. We now have a purpose for each design section ...
// we're going to keep these three jobs beside us" - the board becomes the coral PURPOSE page, which then folds into a slim
// rail holding the three jobs.
N3CLIPS["14"] = { tin: 165.00, build: function () {
    var T0 = 165.00, S, g, i, l, tCard = 166.70 - T0, tRail = 183.00 - T0;
    S = N3.scene({ id: "14", title: "Purpose", T: 22.30, intro: null, drift: 2,
        SH: { board: { w: 1720, h: 900, r: 40, bg: "#FFFFFF", cam: 1.0 }, pro: { w: 1760, h: 940, r: 56, bg: "#EA6262", cam: 1.06 },
            rail: { w: 340, h: 760, r: 32, bg: "#FFFFFF", cam: 1.0 } },
        start: "board", SEQ: [[tCard, "pro"], [tRail, "rail"]], cx: [[tRail, -760, N3.SP.MORPH]] });
    g = N3.group(S, "Working doc", { tin: null, tout: tCard, lout: 0.16 });
    K.board(g, { tin: null });
    for (i = 0; i < 3; i++) { K.job(g, i, null); }
    g = N3.group(S, "Purpose", { tin: tCard + 0.05, tout: tRail - 0.05, lout: 0.16 });
    K.emph(g, { word: "PURPOSE", fs: 200, eyebrow: "Every design now has a", tEye: 167.40 - T0, tWord: 169.64 - T0,
        sub: "and better design choices later down the line", tSub: 177.40 - T0 });
    g = N3.group(S, "Jobs rail", { tin: tRail + 0.1, din: 0.05, lin: 0.35 });
    K.rail(g, tRail + 0.25);
    // the content plan board arrives beside the rail (empty columns; clip 15 fills them in)
    l = K.plan(S.worldCtx, 190, 0, { social: [99, 99, 99], product: [99, 99, 99, 99, 99, 99], pack: [99, 99, 99, 99, 99, 99, 99], done: 99 });
    N3.show(l, tRail + 0.7, null, 40, { din: 0, lin: 0.5 });
    return S;
} };
