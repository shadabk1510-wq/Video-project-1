// Clip 22 (408.40 s): "let's put those rules beside the designs to check them as we go. Full sun or crop sun ... the ivory area keeps
// the information clear ... the same order ... I'm going to save a visual example of each rule so somebody else can understand".
N3CLIPS["22"] = { tin: 408.40, build: function () {
    var T0 = 408.40, S, g, L = function (t) { return t - T0; }, tWall = L(408.70), l, i, c, imgs = ["bag.png", "social1.png", "product_page.png"],
        names = ["Packaging", "Social post", "Product page"], DX = [-250, 120, 490], RY = [-230, -90, 50], rules = ["Sun = the impact", "Info in the ivory area", "Same order, every time"],
        tR = [L(413.28), L(416.8), L(420.0)], tEx = [L(428.24), L(428.68), L(429.16)], hi;
    S = N3.scene({ id: "22", title: "Rules beside the designs", T: 28.50, intro: null, drift: 2,
        SH: { art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 }, wall: { w: 1760, h: 960, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "art", SEQ: [[tWall, "wall"]] });
    g = N3.group(S, "Rule 3", { tin: null, tout: tWall, lout: 0.18 });
    K.rule3(g, null);
    g = N3.group(S, "Rules and designs", { tin: tWall + 0.1, din: 0.05, lin: 0.35 });
    K.at(N3.text(g, "NOON rules", { name: "Rail eyebrow", x: -840, top: -360, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), tWall + 0.3, null, 10);
    for (i = 0; i < 3; i++) {
        l = N3.box(g, { name: "Rule card " + (i + 1), cx: -660, cy: RY[i], w: 360, h: 120, r: 22, fill: N3.COL.blush }); K.at(l, tWall + 0.35 + i * 0.1, null, 20);
        hi = N3.box(g, { name: "Rule highlight " + (i + 1), cx: -660, cy: RY[i], w: 360, h: 120, r: 22, stroke: N3.COL.coral, sw: 4 }); K.at(hi, tR[i], null, 0);
        l = N3.text(g, String(i + 1), { name: "Rule card no " + (i + 1), x: -800, cy: RY[i], fs: 44, wt: 800, color: N3.COL.coral }); K.at(l, tWall + 0.35 + i * 0.1, null, 20);
        l = N3.text(g, rules[i], { name: "Rule card text " + (i + 1), x: -740, cy: RY[i], fs: 22, wt: 600 }); K.at(l, tWall + 0.35 + i * 0.1, null, 20);
        l = N3.image(g, imgs[i], { name: "Design " + names[i], cx: DX[i], cy: -110, w: 330, h: 330, r: 22 }); K.at(l, tWall + 0.5 + i * 0.12, null, 30);
        N3.shadow(l, N3.SHADOW.card);
        l = N3.text(g, names[i], { name: "Design name " + (i + 1), x: DX[i], top: 70, fs: 22, wt: 600, align: "center" }); K.at(l, tWall + 0.6 + i * 0.12, null, 10);
    }
    K.chipAt(g, "Carried into every new layout", { name: "Chip carried", cx: 120, top: 112, fs: 16, bg: N3.COL.navy }, L(423.2), null);
    // the saved examples: a "NOON brand rules" folder with one visual per rule
    K.at(N3.box(g, { name: "Folder", cx: 120, cy: 340, w: 1020, h: 190, r: 26, fill: N3.COL.blush }), L(427.3), null, 30);
    l = N3.icon(g, "folder", { name: "Folder icon", cx: -350, cy: 300, size: 40, color: N3.COL.coral, sw: 2 }); K.at(l, L(427.3), null, 20);
    K.at(N3.text(g, "NOON brand rules", { name: "Folder title", x: -320, cy: 300, fs: 24, wt: 600 }), L(427.3), null, 20);
    for (i = 0; i < 3; i++) {
        c = K.pre(g, "Example " + (i + 1), 150, 110, 30 + i * 180, 350);
        N3.box(c.ctx, { name: "Card", cx: 0, cy: 0, w: 150, h: 110, r: 14, fill: "#FFFFFF" });
        if (i === 0) { N3.ellipse(c.ctx, { name: "Sun", cx: 0, cy: 0, d: 70, fill: N3.COL.verm }); }
        if (i === 1) { N3.box(c.ctx, { name: "Energy", cx: 0, cy: -22, w: 110, h: 40, r: 8, fill: N3.COL.verm }); N3.box(c.ctx, { name: "Info", cx: 0, cy: 22, w: 110, h: 40, r: 8, fill: N3.COL.ivory }); }
        if (i === 2) { N3.box(c.ctx, { name: "Line 1", x: -50, y: -32, w: 100, h: 14, r: 7, fill: N3.COL.navy }); N3.box(c.ctx, { name: "Line 2", x: -50, y: -8, w: 76, h: 12, r: 6, fill: N3.COL.navy }); N3.box(c.ctx, { name: "Line 3", x: -50, y: 14, w: 56, h: 10, r: 5, fill: "#8796A8" }); }
        K.pop(c.layer, tEx[i]);
    }
    K.chipAt(g, "Shared with the team", { name: "Chip shared", x: 470, top: 268, fs: 15 }, L(430.52), null);
    return S;
} };
