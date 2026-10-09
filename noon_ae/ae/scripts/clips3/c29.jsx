// Clip 29 (568.40 s): "you can export this thing as a neat and dandy PDF ... check the wording and pair each rule with its visual
// example, including the variations across applications and motion behaviour".
N3CLIPS["29"] = { tin: 568.40, build: function () {
    var T0 = 568.40, S, g, L = function (t) { return t - T0; }, tB = L(569.30), P, c, l, i, X = [-460, 0, 460], R = [-4, 0, 4], tT = [L(575.64), L(578.12), L(580.44)];
    S = N3.scene({ id: "29", title: "PDF guide", T: 13.70, intro: null, drift: 2,
        SH: { win: { w: 1280, h: 760, r: 22, bg: "#1C1C20", cam: 1.0 }, art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "win", SEQ: [[tB, "art"]], cy: [[0.01, -50, N3.SP.INSTANT], [tB, 0, N3.SP.MORPH]] });
    g = N3.group(S, "Chat window", { tin: null, tout: tB, lout: 0.16 });
    K.window(g, "ChatGPT recording", "chat_clip.mp4", 1280, 760, -21.5, "ChatGPT");
    g = N3.group(S, "PDF pages", { tin: tB + 0.1, din: 0.05, lin: 0.35 });
    for (i = 0; i < 3; i++) {
        P = K.pre(g, "Page " + (i + 1), 340, 480, X[i], 10); c = P.ctx;
        N3.box(c, { name: "Paper", cx: 0, cy: 0, w: 340, h: 480, r: 10, fill: i === 0 ? N3.COL.coral : "#FFFFFF" });
        if (i === 0) { K.logo(c, { name: "NOON", cx: 0, cy: -40, w: 220, color: "#FFFFFF" }); N3.text(c, "Brand guide", { name: "Cover title", x: 0, top: 30, fs: 28, wt: 600, color: "#FFFFFF", align: "center" });
            N3.text(c, "High Sun · 2027", { name: "Cover sub", x: 0, top: 70, fs: 16, color: "#FFFFFF", align: "center", opacity: 85 }); }
        if (i === 1) { N3.text(c, "Rules", { name: "Rules title", x: -140, top: -210, fs: 28, wt: 700 });
            N3.ellipse(c, { name: "Ex sun", cx: -90, cy: -80, d: 90, fill: N3.COL.verm }); N3.box(c, { name: "Ex zones a", cx: 60, cy: -98, w: 110, h: 50, r: 8, fill: N3.COL.verm }); N3.box(c, { name: "Ex zones b", cx: 60, cy: -54, w: 110, h: 38, r: 8, fill: N3.COL.ivory });
            N3.box(c, { name: "Ex order 1", x: -140, y: 20, w: 150, h: 14, r: 7, fill: N3.COL.navy }); N3.box(c, { name: "Ex order 2", x: -140, y: 44, w: 110, h: 12, r: 6, fill: N3.COL.navy }); N3.box(c, { name: "Ex order 3", x: -140, y: 66, w: 80, h: 10, r: 5, fill: "#8796A8" });
            N3.text(c, "with variations across\nsocial, web and pack", { name: "Rules note", x: -140, top: 110, fs: 16, lh: 22, color: N3.COL.soft }); }
        if (i === 2) { N3.text(c, "Motion", { name: "Motion title", x: -140, top: -210, fs: 28, wt: 700 });
            N3.path(c, { name: "Ex curve", verts: [[-130, 40], [-60, -110], [0, -70], [60, -92], [130, -86]], inT: [[0, 0], [-30, 30], [-20, 0], [-20, 0], [-20, 0]], outT: [[30, -90], [20, 0], [20, 0], [20, 0], [0, 0]], stroke: N3.COL.verm, sw: 6 });
            N3.box(c, { name: "Ex flat", x: -130, y: 60, w: 260, h: 6, r: 3, fill: N3.COL.navy }); N3.text(c, "Sun rises and settles;\ninformation stays still", { name: "Motion note", x: -140, top: 110, fs: 16, lh: 22, color: N3.COL.soft }); }
        N3.mask(P.layer, N3.rrShape(0, 0, 340, 480, 10)); N3.shadow(P.layer, N3.SHADOW.card);
        N3.xf(P.layer, "ADBE Rotate Z").setValue(R[i]);
        N3.show(P.layer, tB + 0.3 + i * 0.15, null, 40, { din: 0, lin: 0.5 });
        if (i > 0) { l = N3.icon(g, "circleCheck", { name: "Page tick " + i, cx: X[i] + 140, cy: -210, size: 56, color: N3.COL.coral, sw: 2.6 }); K.pop(l, tT[i - 1]); }
    }
    l = N3.icon(g, "circleCheck", { name: "Variations tick", cx: X[1] + 140, cy: 140, size: 44, color: N3.COL.coral, sw: 2.4 }); K.pop(l, tT[1]);
    l = N3.icon(g, "circleCheck", { name: "Motion tick", cx: X[2] + 140, cy: 140, size: 44, color: N3.COL.coral, sw: 2.4 }); K.pop(l, tT[2] + 0.2);
    K.chipAt(g, "PDF", { name: "Chip PDF", cx: X[0], top: 290, fs: 20, padX: 22, padY: 10 }, L(571.8), null);
    K.chipAt(g, "Each rule + its visual example", { name: "Chip pairing", cx: X[1], top: 290, fs: 16, bg: N3.COL.navy }, L(575.08), null);
    return S;
} };
