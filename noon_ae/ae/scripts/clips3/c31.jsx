// Clip 31 (597.40 s): the recap - "that's the workflow I've taken to 2027. First ... Second ... Third ... Fourth ... Fifth ... And finally
// ... a process you can follow, explain and build on ... design your future today. Peace."
N3CLIPS["31"] = { tin: 597.40, build: function () {
    var T0 = 597.40, S, g, L = function (t) { return t - T0; }, tList = L(597.80), tEnd = L(645.50), tCard = L(649.60), l, i, c, w, Wd = ["Follow.", "Explain.", "Build on."],
        tWd = [L(647.08), L(647.64), L(648.36)];
    S = N3.scene({ id: "31", title: "Recap and end", T: 63.10, intro: null, drift: 2,
        SH: { win: { w: 1280, h: 760, r: 22, bg: "#1C1C20", cam: 1.0 }, list: { w: 840, h: 760, r: 40, bg: "#FFFFFF", cam: 1.32 },
            pro: { w: 1760, h: 940, r: 56, bg: "#EA6262", cam: 1.06 }, end: { w: 1760, h: 940, r: 40, bg: "#FFFFFF", cam: 1.0 } },
        start: "win", SEQ: [[tList, "list"], [tEnd, "pro"], [tCard, "end"]], cy: [[0.01, -50, N3.SP.INSTANT], [tList, 0, N3.SP.MORPH]] });
    g = N3.group(S, "Dropbox window", { tin: null, tout: tList, lout: 0.16 });
    K.window(g, "Dropbox recording", "dropbox_clip.mp4", 1280, 760, -14.0, "Dropbox · NOON Coffee Branding");
    g = N3.group(S, "Recap list", { tin: tList + 0.1, tout: tEnd, anchor: "t", din: 0.05, lin: 0.35, lout: 0.18 });
    K.recap(g, tList + 0.2, [L(601.08), L(609.08), L(616.84), L(624.20), L(631.64), L(638.84)]);
    g = N3.group(S, "Follow explain build", { tin: tEnd + 0.05, tout: tCard, din: 0.05, lin: 0.35, lout: 0.18 });
    K.at(N3.text(g, "A process you can", { name: "Process eyebrow", x: 0, top: -230, fs: 30, wt: 600, ls: 0.3, caps: true, color: "#FFFFFF", align: "center" }), L(646.0), null, 12);
    for (i = 0; i < 3; i++) {
        w = N3.text(g, Wd[i], { name: Wd[i], x: -520 + i * 520, cy: 10, fs: 120, wt: 800, ls: -0.04, lh: 120, color: "#FFFFFF", align: "center" });
        N3.unitReveal(w, { times: [tWd[i]], stagger: 0.03, based: "chars", dy: 50, blur: 14, lin: 0.42 });
    }
    g = N3.group(S, "End card", { tin: tCard + 0.1, din: 0.05, lin: 0.35 });
    l = K.logo(g, { name: "NOON", cx: -480, cy: -110, w: 420 }); K.at(l, tCard + 0.3, null, 20);
    l = N3.text(g, "Design your\nfuture today.", { name: "Sign-off", x: -690, top: -20, fs: 64, wt: 700, lh: 74, ls: -0.03 }); N3.show(l, L(657.40), null, 18, { din: 0, lin: 0.45 });
    for (i = 0; i < 2; i++) {
        l = N3.box(g, { name: "End screen slot " + (i + 1), cx: 380, cy: -190 + i * 380, w: 560, h: 315, r: 24, fill: "#2B1C1E", opacity: 92 }); N3.show(l, L(652.40) + i * 0.15, null, 30, { din: 0, lin: 0.45, op: 92 });
        c = K.tag(g, i ? "Watch next" : "Recommended", { name: "Slot label " + (i + 1), x: 120, top: -330 + i * 380, fs: 14 }); K.showChip(c, L(652.60) + i * 0.15, null);
    }
    return S;
} };
