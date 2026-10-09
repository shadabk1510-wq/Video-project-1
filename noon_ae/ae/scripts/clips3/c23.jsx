// Clip 23 (436.90 s): motion rule - "for noon the sun rises into position, then it settles while the product information stays more
// or less still. That gives us a moment of energy followed by a clear reading moment."
N3CLIPS["23"] = { tin: 436.90, build: function () {
    var T0 = 436.90, S, g, L = function (t) { return t - T0; }, tMot = L(437.20), p, up, dn, i, n, v, x, t, path, k, w = 640, h = 280, gx = 120, gy = -60;
    S = N3.scene({ id: "23", title: "Motion rule", T: 23.00, intro: null, drift: 2,
        SH: { wall: { w: 1760, h: 960, r: 36, bg: "#FFFFFF", cam: 1.0 }, art: { w: 1700, h: 940, r: 36, bg: "#FFFFFF", cam: 1.0 } },
        start: "wall", SEQ: [[tMot, "art"]] });
    g = N3.group(S, "Rules and designs", { tin: null, tout: tMot, lout: 0.18 });
    K.at(N3.text(g, "NOON rules", { name: "Rail eyebrow", x: -840, top: -360, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), null, null);
    (function () {   // the clip-22 end state, static
        var imgs = ["bag.png", "social1.png", "product_page.png"], DX = [-250, 120, 490], RY = [-230, -90, 50], R = ["Sun = the impact", "Info in the ivory area", "Same order, every time"], j, c;
        for (j = 0; j < 3; j++) {
            N3.box(g, { name: "Rule card " + (j + 1), cx: -660, cy: RY[j], w: 360, h: 120, r: 22, fill: N3.COL.blush });
            N3.box(g, { name: "Rule highlight " + (j + 1), cx: -660, cy: RY[j], w: 360, h: 120, r: 22, stroke: N3.COL.coral, sw: 4 });
            N3.text(g, String(j + 1), { name: "Rule card no " + (j + 1), x: -800, cy: RY[j], fs: 44, wt: 800, color: N3.COL.coral });
            N3.text(g, R[j], { name: "Rule card text " + (j + 1), x: -740, cy: RY[j], fs: 22, wt: 600 });
            N3.shadow(N3.image(g, imgs[j], { name: "Design " + (j + 1), cx: DX[j], cy: -110, w: 330, h: 330, r: 22 }), N3.SHADOW.card);
        }
        N3.box(g, { name: "Folder", cx: 120, cy: 340, w: 1020, h: 190, r: 26, fill: N3.COL.blush });
        for (j = 0; j < 3; j++) { c = N3.box(g, { name: "Example " + (j + 1), cx: 30 + j * 180, cy: 350, w: 150, h: 110, r: 14, fill: "#FFFFFF" }); }
    })();
    g = N3.group(S, "Motion rule", { tin: tMot + 0.1, din: 0.05, lin: 0.35 });
    K.at(N3.text(g, "Motion rule", { name: "Motion eyebrow", x: -790, top: -400, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), L(437.4), null, 10);
    K.at(N3.text(g, "The sun rises, then settles.\nThe information stays still.", { name: "Motion text", x: -790, top: -370, fs: 44, wt: 600, lh: 54, ls: -0.025 }), L(438.0), null, 14);
    p = K.pack(g, "Motion pack", -330, 150, { scale: 0.75 }); K.at(p.layer, L(438.6), null, 30);
    up = p.sunPos; dn = [up[0], up[1] + 380, 0];
    N3.spring(N3.pos(p.sun), dn, [[L(442.92), up, [5.5, 0.55]], [L(448.70), dn, N3.SP.FAST], [L(449.32), up, [5.5, 0.55]], [L(454.70), dn, N3.SP.FAST], [L(455.30), up, [5.5, 0.55]]]);
    // the curve: sun height over time (rise + settle) against the flat information line
    K.at(N3.box(g, { name: "Graph", x: gx - 40, y: gy - 60, w: w + 80, h: h + 120, r: 24, fill: N3.COL.blush }), L(441.0), null, 20);
    K.at(N3.text(g, "Height over time", { name: "Graph label", x: gx, top: gy - 40, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed }), L(441.0), null, 10);
    v = []; n = 48;
    for (i = 0; i <= n; i++) { t = i / n * 1.6; x = gx + i / n * w; k = 1 - Math.exp(-0.55 * 5.5 * t) * (Math.cos(5.5 * Math.sqrt(1 - 0.3025) * t) + 0.55 / Math.sqrt(1 - 0.3025) * Math.sin(5.5 * Math.sqrt(1 - 0.3025) * t));
        v.push([N3.r3(x), N3.r3(gy + h - k * (h - 40))]); }
    path = N3.path(g, { name: "Sun curve", verts: v, stroke: N3.COL.verm, sw: 6, trim: true });
    N3.io(N3.trimOf(path).property("ADBE Vector Trim End"), L(442.92), L(444.4), 0, 100);
    path = N3.path(g, { name: "Info line", verts: [[gx, gy + h - 20], [gx + w, gy + h - 20]], stroke: N3.COL.navy, sw: 6, trim: true });
    N3.io(N3.trimOf(path).property("ADBE Vector Trim End"), L(446.36), L(447.6), 0, 100);
    K.at(N3.text(g, "Sun", { name: "Sun label", x: gx + w + 14, top: gy + 30, fs: 18, wt: 600, color: N3.COL.verm }), L(444.2), null, 6);
    K.at(N3.text(g, "Info", { name: "Info label", x: gx + w + 14, top: gy + h - 34, fs: 18, wt: 600, color: N3.COL.navy }), L(447.4), null, 6);
    K.chipAt(g, "Moment of energy", { name: "Chip energy", x: gx + 60, top: gy + 300, fs: 16 }, L(450.12), null);
    K.chipAt(g, "Clear reading moment", { name: "Chip reading", x: gx + 300, top: gy + 300, fs: 16, bg: N3.COL.navy }, L(451.8), null);
    K.chipAt(g, "Same thinking as the static designs", { name: "Chip same thinking", x: gx + 60, top: gy + 370, fs: 16, bg: "#FFFFFF", color: N3.COL.coral }, L(453.96), null);
    return S;
} };
