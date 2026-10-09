// Clip 30 (582.10 s): "That guide goes into Dropbox alongside the editable artwork, the exports and the approved brief ... find the
// work, understand the decisions, and use the same rules to develop the next assets" - the real Dropbox folder recording.
N3CLIPS["30"] = { tin: 582.10, build: function () {
    var T0 = 582.10, S, g, L = function (t) { return t - T0; }, tWin = L(582.40), i, c, A = ["Brand guide (PDF)", "Editable artwork", "Exports", "Approved brief"],
        tA = [L(583.32), L(584.44), L(585.80), L(586.76)], XA = [-640, -330, -60, 150], B = ["Find the work", "Understand the decisions", "Build the next assets"],
        tBb = [L(591.08), L(591.96), L(594.36)], XB = [-560, -260, 130], tSwap = L(589.40);
    S = N3.scene({ id: "30", title: "Into Dropbox", T: 15.30, intro: null, drift: 2,
        SH: { art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 }, win: { w: 1280, h: 760, r: 22, bg: "#1C1C20", cam: 1.0 } },
        start: "art", SEQ: [[tWin, "win"]], cy: [[tWin, -50, N3.SP.MORPH]] });
    g = N3.group(S, "PDF pages", { tin: null, tout: tWin, lout: 0.16 });
    (function () { var j, P; for (j = 0; j < 3; j++) { P = K.pre(g, "Page " + (j + 1), 340, 480, -460 + j * 460, 10); N3.box(P.ctx, { name: "Paper", cx: 0, cy: 0, w: 340, h: 480, r: 10, fill: j === 0 ? N3.COL.coral : "#FFFFFF" });
        if (j === 0) { K.logo(P.ctx, { name: "NOON", cx: 0, cy: -40, w: 220, color: "#FFFFFF" }); } N3.shadow(P.layer, N3.SHADOW.card); N3.xf(P.layer, "ADBE Rotate Z").setValue([-4, 0, 4][j]); } })();
    g = N3.group(S, "Dropbox window", { tin: tWin + 0.1, din: 0.05, lin: 0.35 });
    K.window(g, "Dropbox recording", "dropbox_clip.mp4", 1280, 760, tWin + 0.2, "Dropbox · NOON Coffee Branding");
    for (i = 0; i < 4; i++) {
        c = K.tag(S.worldCtx, A[i], { name: "File " + (i + 1), x: XA[i], top: 360, fs: 18, padX: 16, padY: 9, bg: i === 0 ? N3.COL.coral : "#FFFFFF", color: i === 0 ? "#FFFFFF" : N3.COL.coral });
        K.pop(c.bg, tA[i]); N3.show(c.text, tA[i] + 0.05, null, 8, { din: 0, lin: 0.3 });
    }
    for (i = 0; i < 3; i++) {
        c = K.tag(S.worldCtx, B[i], { name: "Use " + (i + 1), x: XB[i], top: 418, fs: 18, padX: 16, padY: 9, bg: N3.COL.navy });
        K.pop(c.bg, tBb[i]); N3.show(c.text, tBb[i] + 0.05, null, 8, { din: 0, lin: 0.3 });
    }
    return S;
} };
