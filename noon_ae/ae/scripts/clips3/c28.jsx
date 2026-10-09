// Clip 28 (545.70 s): "in a ChatGPT conversation, we can add our final rules and the design examples, then ask it to organise them
// into a short handover guide using only the decisions we've supplied ... tailor the guides to the visual language". The real screen
// recording (from the Dropbox x ChatGPT segment) plays in a window card.
N3CLIPS["28"] = { tin: 545.70, build: function () {
    var T0 = 545.70, S, g, L = function (t) { return t - T0; }, tWin = L(545.95), i, c, W = ["Final rules + design examples", "Only the decisions we supplied", "Tailored to the NOON look"],
        tW = [L(548.40), L(554.40), L(560.20)], X = [-640, -220, 200];
    S = N3.scene({ id: "28", title: "Handover guide", T: 22.70, intro: null, drift: 2,
        SH: { stage: { w: 1190, h: 156, r: 78, bg: "#FFFFFF", cam: 1.42 }, win: { w: 1280, h: 760, r: 22, bg: "#1C1C20", cam: 1.0 } },
        start: "stage", SEQ: [[tWin, "win"]], cy: [[tWin, -50, N3.SP.MORPH]] });
    g = N3.group(S, "Stage", { tin: null, tout: tWin, lout: 0.16 });
    N3.text(g, "Stage", { name: "Stage cap", x: -540, top: -34, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "06", { name: "Stage 06", x: -540, top: -14, fs: 44, wt: 600, lh: 46, color: N3.COL.coral });
    N3.box(g, { name: "Divider", x: -436, y: -36, w: 1.5, h: 72, fill: "#F2E2E1" });
    N3.text(g, "Hand over a system", { name: "Label", x: -404, cy: 0, fs: 31, wt: 600, ls: -0.025 });
    for (i = 0; i < 6; i++) { N3.box(g, { name: "Segment " + (i + 1), x: 180 + i * 68, y: -6, w: 58, h: 12, r: 6, fill: N3.COL.coral }); }
    g = N3.group(S, "Chat window", { tin: tWin + 0.1, din: 0.05, lin: 0.35 });
    K.window(g, "ChatGPT recording", "chat_clip.mp4", 1280, 760, tWin + 0.2, "ChatGPT");
    for (i = 0; i < 3; i++) {
        c = K.tag(S.worldCtx, W[i], { name: "Chip " + (i + 1), x: X[i], top: 360, fs: 18, padX: 16, padY: 9, bg: i === 2 ? N3.COL.coral : "#FFFFFF", color: i === 2 ? "#FFFFFF" : N3.COL.coral });
        K.pop(c.bg, tW[i]); N3.show(c.text, tW[i] + 0.05, null, 8, { din: 0, lin: 0.3 });
    }
    return S;
} };
