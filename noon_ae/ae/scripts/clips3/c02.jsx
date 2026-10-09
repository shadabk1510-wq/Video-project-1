// Clip 02 (4.24 s): "a new way to work as a designer ... in 2027" - the line types on word by word, then the card turns coral for 2027.
N3CLIPS["02"] = { tin: 4.24, build: function () {
    var T0 = 4.24, tYear = N3.wt(16, T0) - 0.06, S, g, t, i, wordT = [], WI = [7, 8, 9, 10, 11, 12, 13, 14], sel, an, ai;
    S = N3.scene({ id: "02", title: "A new way", T: 2.86, intro: null,
        SH: { post2: { w: 600, h: 600, r: 36, bg: "#FFFFFF", cam: 1.42 }, line: { w: 1180, h: 170, r: 85, bg: "#FFFFFF", cam: 1.25 }, year: { w: 780, h: 440, r: 64, bg: "#EA6262", cam: 1.3 } },
        start: "post2", SEQ: [[0.04, "line"], [tYear, "year"]] });

    g = N3.group(S, "Social post 2", { tin: null, tout: 0.04, lout: 0.12 });
    N3.image(g, "social2.png", { name: "social2", cx: 0, cy: 0, w: 600, h: 600 });

    g = N3.group(S, "Line", { tin: 0.04, tout: tYear, din: 0, lin: 0.01, lout: 0.12 });
    t = N3.text(g, "A new way to work as a designer", { name: "Line", x: -0.13 * 58, cy: 0, fs: 58, wt: 600, ls: -0.025, color: N3.COL.ink, align: "center" });
    for (i = 0; i < WI.length; i++) { wordT.push(N3.wt(WI[i], T0) - 0.04); }
    N3.unitReveal(t, { times: wordT, based: "words", dy: 18, blur: 10, lin: 0.32 });
    // words 2-3 ("new way") in coral: a Fill Color animator with an expression selector
    ai = t.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator").propertyIndex;
    an = t.property("ADBE Text Properties").property("ADBE Text Animators").property(ai);
    an.name = "Coral words";
    an.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
    an.property("ADBE Text Animator Properties").property("ADBE Text Fill Color").setValue(N3.rgba(N3.COL.coral));
    an.property("ADBE Text Selectors").addProperty("ADBE Text Expressible Selector");
    sel = an.property("ADBE Text Selectors").property(1);
    sel.property("ADBE Text Range Type2").setValue(3);
    AEL.expr(sel.property("ADBE Text Expressible Amount"), "// words 2 and 3 in coral\nvar v = (textIndex == 2 || textIndex == 3) ? 100 : 0;\n[v, v, v]");

    g = N3.group(S, "2027", { tin: tYear, din: 0.04, lin: 0.2 });
    t = N3.text(g, "in", { name: "in", x: 0, top: -146.2, fs: 30, wt: 600, color: "#FFFFFF", align: "center", opacity: 85 });
    N3.show(t, tYear + 0.02, null, 10, { din: 0, lin: 0.3, op: 85 });
    t = N3.text(g, "2027", { name: "2027", x: 7.5, top: -103.9, fs: 250, wt: 600, ls: -0.06, lh: 250, color: "#FFFFFF", align: "center" });
    N3.unitReveal(t, { times: [tYear + 0.06], stagger: 0.06, based: "chars", dy: 40, blur: 16, lin: 0.42 });
    return S;
} };
