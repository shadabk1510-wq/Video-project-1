// Clip 03 (2.88 s): "on everybody's radar" - the 2027 card shrinks into the vermilion sun, a radar sweep turns inside it,
// a faint radar grid grows around it, the phrase reveals word by word and three pings ripple out on "radar".

// Radar sweep: AE shape layers have no conic gradient, so the sweep is a stack of white wedges that all end at the
// leading edge (359 deg, 0 = 12 o'clock, clockwise) and start progressively later; their opacities are solved so the
// stack's alpha ramps linearly from 0 at 290 deg to 0.55 at the edge (the web's conic-gradient). Rotation = linear keys.
function C03_sweep(ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "Radar sweep")), n = o.wedges, a0 = o.from, a1 = o.to, peak = o.peak,
        R = o.r, i, j, gi, verts, start, ang, A, Aprev = 0, op, step = (a1 - a0) / n;
    N3.place(ctx, l);
    for (i = 0; i < n; i++) {
        start = a0 + i * step;
        A = peak * (i + 0.5) / n;                           // target alpha of band i
        op = 1 - (1 - A) / (1 - Aprev);                     // this wedge's share so the stacked alpha equals A
        Aprev = A;
        verts = [[0, 0]];
        for (j = 0; j <= 24; j++) {
            ang = (start + (o.edge - start) * j / 24) * Math.PI / 180;
            verts.push([N3.r3(R * Math.sin(ang)), N3.r3(-R * Math.cos(ang))]);
        }
        gi = N3.addGroup(l, "Wedge " + (i + 1) + " (from " + N3.r3(start) + " deg)");
        N3.addPath(l, gi, verts, null, null, true);
        N3.addFill(l, gi, "#FFFFFF", N3.r3(op * 100));
    }
    N3.pos(l).setValue(N3.P(ctx, o.cx || 0, o.cy || 0));
    return l;
}

N3CLIPS["03"] = { tin: 7.10, build: function () {
    var T0 = 7.10, T = 2.88, tSun = 0.08, tRadar = N3.wt(26, T0), S, g, t, l, gi, i, D = [380, 560, 740, 920], WI = [24, 25, 26], times = [],
        sw, an, ai, sel, tr;
    S = N3.scene({ id: "03", title: "On everybody's radar", T: T, intro: null,
        SH: { year: { w: 780, h: 440, r: 64, bg: "#EA6262", cam: 1.3 }, sun: { w: 300, h: 300, r: 150, bg: "#F4512B", cam: 1.15 } },
        start: "year", SEQ: [[tSun, "sun"]],
        cy: [[tSun, -110, [9, 0.95]]] });

    // ---- world (behind the card): radar grid, pings, phrase
    l = N3.shapeLayer(S.comp, "Radar grid");
    N3.place(S.worldCtx, l);
    for (i = 0; i < D.length; i++) {
        gi = N3.addGroup(l, "Ring " + D[i]);
        N3.addEllipse(l, gi, D[i], D[i], [0, -110]);
        N3.addStroke(l, gi, N3.COL.coral, 1.5, 28);
    }
    N3.pos(l).setValue([0, 0]);                                   // scales around the world origin like the web #grid
    N3.eo(N3.xf(l, "ADBE Opacity"), tSun + 0.2, tSun + 1.0, 0, 100);
    N3.eo(N3.xf(l, "ADBE Scale"), tSun + 0.2, tSun + 1.0, [85, 85], [100, 100]);

    for (i = 0; i < 3; i++) {                                     // pings on "radar": d 300 -> 1200 (ease out), fade out over 1.3 s
        tr = tRadar + i * 0.18;
        l = N3.ellipse(S.worldCtx, { name: "Ping " + (i + 1), cx: 0, cy: -110, d: 300, stroke: "#FFFFFF", sw: 2 });
        N3.gc(l, 1).property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Opacity").setValue(90);
        N3.eo(N3.gc(l, 1).property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size"), tr, tr + 1.3, [300, 300], [1200, 1200]);
        N3.lin(N3.xf(l, "ADBE Opacity"), [tr, tr + 1.3], [90, 0]);
        l.inPoint = N3.r3(tr);
    }

    t = N3.text(S.worldCtx, "On everybody's radar.", { name: "Phrase", x: -0.13 * 56, top: 150, fs: 56, wt: 600, ls: -0.025, color: N3.COL.ink, align: "center" });
    for (i = 0; i < WI.length; i++) { times.push(N3.wt(WI[i], T0) - 0.05); }
    N3.unitReveal(t, { times: times, based: "words", dy: 18, blur: 10, lin: 0.34 });
    // The web row only lays out the words already shown, so the centred phrase re-centres as each word arrives.
    // Hold keys at the word markers: shift right by half the width of the words still hidden
    // (Inter SemiBold 56 px incl. the .26em gap: "everybody's " 338.5 px, "radar. " 163.7 px).
    tr = N3.pos(t).value;
    N3.hold(N3.pos(t), [0, times[1], times[2]], [[tr[0] + 251.1, tr[1]], [tr[0] + 81.86, tr[1]], [tr[0], tr[1]]]);
    // word 3 ("radar.") in coral: a Fill Color animator with an expression selector
    ai = t.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator").propertyIndex;
    an = t.property("ADBE Text Properties").property("ADBE Text Animators").property(ai);
    an.name = "Coral word";
    an.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
    an.property("ADBE Text Animator Properties").property("ADBE Text Fill Color").setValue(N3.rgba(N3.COL.coral));
    an.property("ADBE Text Selectors").addProperty("ADBE Text Expressible Selector");
    sel = an.property("ADBE Text Selectors").property(1);
    sel.property("ADBE Text Range Type2").setValue(3);
    AEL.expr(sel.property("ADBE Text Expressible Amount"), "// word 3 in coral\nvar v = (textIndex == 3) ? 100 : 0;\n[v, v, v]");

    // ---- card contents
    g = N3.group(S, "2027", { tin: null, tout: tSun, lout: 0.12 });
    N3.text(g, "2027", { name: "2027", x: 7.5, cy: 0, fs: 250, wt: 600, ls: -0.06, lh: 250, color: "#FFFFFF", align: "center" });

    g = N3.group(S, "Radar sweep", { tin: tSun + 0.2 });
    sw = C03_sweep(g, { name: "Sweep", wedges: 17, from: 290, to: 358, edge: 359, peak: 0.55, r: 160 });
    N3.lin(N3.xf(sw, "ADBE Rotate Z"), [0, T], [0, 150 * T]);       // 150 deg/s, clockwise
    return S;
} };
