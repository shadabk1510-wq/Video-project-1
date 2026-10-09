// Clip 06 (13.3 s): "client brief, audience research and notes from a discovery meeting ... work out what we're designing towards".
// The six-step list (clip 05's end state) morphs into a project folder; the three documents arrive one per spoken word,
// merge into one row, and the card becomes the Creative brief: NOON wordmark, typed bullets, skeleton lines.

// NOON wordmark (assets/_ae/NOON-logo.svg, viewBox 450x112) as AE shape data centred on the viewBox (svg_to_ae.py).
// Groups: N, O (outer + counter), O, N. The counters are holes (Fill Rule even-odd).
var C06_LOGO = [
    ["N", [[true, [[-225, -55], [-183, -55], [-150, -16], [-150, -55], [-116, -55], [-116, 54], [-155, 54], [-186, 17], [-186, 54], [-225, 54]]]]],
    ["O 1", [[true, [[-57, -56], [-1, 0], [-57, 56], [-113, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[-31, -11], [-43, 1], [-31, 13], [-19, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]]],
    ["O 2", [[true, [[56.5, -56], [112.5, 0], [56.5, 56], [0.5, 0]], [[-30.928, 0], [0, -30.928], [30.928, 0], [0, 30.928]], [[30.928, 0], [0, 30.928], [-30.928, 0], [0, -30.928]]],
        [true, [[84.5, -11], [72.5, 1], [84.5, 13], [96.5, 1]], [[6.627, 0], [0, -6.627], [-6.627, 0], [0, 6.627]], [[-6.627, 0], [0, 6.627], [6.627, 0], [0, -6.627]]]]],
    ["N 2", [[true, [[117, -55], [160, -55], [191, -16], [191, -55], [225, -55], [225, 56], [187, 56], [156, 18], [156, 56], [117, 56]]]]]
];
// The wordmark in an SVG box (x, y = top-left, w, h; preserveAspectRatio meet). o: {name, x, y, w, h, color}
function C06_logo(ctx, o) {
    var l = N3.shapeLayer(ctx.comp, N3.uname(ctx.comp, o.name || "NOON wordmark")), gi, i, j, part, sub, si, pr, sh, fl, s = Math.min(o.w / 450, o.h / 112),
        vg = function () { return N3.gc(l, gi).property(si).property("ADBE Vectors Group"); };
    N3.place(ctx, l);
    gi = N3.addGroup(l, "Wordmark");
    for (i = 0; i < C06_LOGO.length; i++) {
        part = C06_LOGO[i];
        sub = N3.gc(l, gi).addProperty("ADBE Vector Group");
        sub.name = part[0];
        si = sub.propertyIndex;
        for (j = 0; j < part[1].length; j++) {
            pr = vg().addProperty("ADBE Vector Shape - Group");
            sh = new Shape();
            sh.vertices = part[1][j][1];
            sh.inTangents = part[1][j][2] || C06_zeros(part[1][j][1].length);
            sh.outTangents = part[1][j][3] || C06_zeros(part[1][j][1].length);
            sh.closed = true;
            vg().property(pr.propertyIndex).property("ADBE Vector Shape").setValue(sh);
        }
        fl = vg().addProperty("ADBE Vector Graphic - Fill");
        fl = vg().property(fl.propertyIndex);
        fl.property("ADBE Vector Fill Rule").setValue(2);                       // even-odd: the O counters are holes
        fl.property("ADBE Vector Fill Color").setValue(N3.rgba(o.color || N3.COL.navy));
    }
    N3.gxf(l, gi, "ADBE Vector Scale").setValue([s * 100, s * 100]);
    N3.pos(l).setValue(N3.P(ctx, o.x + o.w / 2, o.y + o.h / 2));
    return l;
}
function C06_zeros(n) { var z = [], i; for (i = 0; i < n; i++) { z.push([0, 0]); } return z; }

// A nested precomp inside a content group (one unit that moves/fades/blurs as a whole, like a web <div>).
// w,h = canvas; (cx,cy) = where its centre sits in the group; (ox,oy) = canvas position of the unit's own origin.
function C06_sub(g, name, w, h, cx, cy, ox, oy) {
    var S = g.S, pc = app.project.items.addComp(S.id + " · " + name, w, h, 1, S.T, N3.FPS), l;
    if (N3.folders) { pc.parentFolder = N3.folders.precomps; }
    AEL.created("precomp", pc.name);
    l = g.comp.layers.add(pc);
    l.name = N3.uname(g.comp, name);
    N3.xf(l, "ADBE Anchor Point").setValue([w / 2, h / 2]);
    N3.pos(l).setValue(N3.P(g, cx, cy));
    try { l.collapseTransformation = true; } catch (e) { AEL.warn("collapse: " + e); }
    return { layer: l, ctx: { comp: pc, ox: ox, oy: oy, parent: null, slot: "pre", S: S } };
}

// Chip whose RIGHT edge sits at o.right (CSS right:-400px -> right edge at x=400).
function C06_chipRight(ctx, str, o) {
    var padX = o.padX === undefined ? 14 : o.padX, c = N3.chip(ctx, str, { name: o.name, cx: 0, top: o.top, fs: o.fs || 16, wt: o.wt || 600, color: o.color, bg: o.bg }),
        tp = c.text.property("ADBE Text Properties").property("ADBE Text Document"), doc = tp.value;
    doc.justification = ParagraphJustification.RIGHT_JUSTIFY;
    tp.setValue(doc);
    N3.pos(c.text).setValue([ctx.ox + o.right - padX, N3.pos(c.text).value[1]]);
    return c;
}

// The six-step list card exactly as clip 05 leaves it (all steps ticked, no active highlight, thumbnails on row 4).
var C06_STEPS = [
    ["brief", "Turn project files into direction", "Brief, research and meeting notes"],
    ["target", "Give every design a clear purpose", "Before we start anything"],
    ["rules", "Create design rules", "That change the whole workflow"],
    ["devices", "Carry it across every format", "Packaging · digital · motion"],
    ["checklist", "Check against the original goals", "Review the work with the brief"],
    ["handover", "Hand over a system", "So anyone can build on it"]
];
function C06_stepTop(i) { return 160 + i * 94; }
function C06_steps(g) {
    var i, top, x0 = -370, l, th = 451;
    N3.text(g, "The workflow · 2027", { name: "Workflow cap", x: x0, top: 42, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    N3.text(g, "What we're going to do", { name: "List title", x: x0, top: 70, fs: 40, wt: 600, ls: -0.025 });
    for (i = 0; i < C06_STEPS.length; i++) {
        top = C06_stepTop(i);
        N3.box(g, { name: "Tile " + (i + 1), x: x0, y: top + 5, w: 60, h: 60, r: 17, fill: "#FBE3E2" });
        N3.icon(g, C06_STEPS[i][0], { name: "Icon " + C06_STEPS[i][0], cx: x0 + 30, cy: top + 35, size: 32, color: N3.COL.coral, sw: 2 });
        N3.text(g, C06_STEPS[i][1], { name: "Step " + (i + 1), x: x0 + 84, top: top + 4, fs: 28, wt: 600, ls: -0.025 });
        N3.text(g, C06_STEPS[i][2], { name: "Step " + (i + 1) + " sub", x: x0 + 84, top: top + 41, fs: 18, color: N3.COL.soft });
        N3.ellipse(g, { name: "Check " + (i + 1), cx: x0 + 708, cy: top + 35, d: 36, fill: N3.COL.coral });
        N3.icon(g, "check", { name: "Tick " + (i + 1), cx: x0 + 708, cy: top + 35, size: 20, color: "#FFFFFF", sw: 3 });
    }
    // thumbnails on row 4 (packaging, digital, motion): 52 px, r13
    l = N3.image(g, "bag.png", { name: "Thumb bag", x: 110, y: th, w: 52, h: 52, r: 13 }); N3.shadow(l, N3.SHADOW.small);
    l = N3.image(g, "social1.png", { name: "Thumb social", x: 172, y: th, w: 52, h: 52, r: 13 }); N3.shadow(l, N3.SHADOW.small);
    l = C06_frame(g, { name: "Thumb motion", x: 234, y: th, w: 52, h: 52, r: 13, at: 1.5 }); N3.shadow(l, N3.SHADOW.small);
}
// A still frame of motion2_bag.mp4 (the web clips' sunrise/030.jpg = 1.5 s into the video), held with Time Remap.
function C06_frame(ctx, o) {
    var l = N3.image(ctx, "motion2_bag.mp4", o), tr;
    l.timeRemapEnabled = true;
    tr = l.property("ADBE Time Remapping");
    while (tr.numKeys > 0) { tr.removeKey(1); }
    tr.setValue(o.at);
    try { l.outPoint = ctx.comp.duration; } catch (e) {}
    return l;
}

// Creative brief card contents (shared look with clip 07). o: {from, tw, bullets:[t...] | null (static), skel: t | null (static)}
var C06_BUL = ["Energy without the noise", "Creative focus, not hustle", "Calm information, one moment of energy"];
var C06_SKEL = [430, 500, 380, 470, 300];
function C06_brief(g, o) {
    var t, i, dot, tx, top, bar, r0;
    C06_logo(g, { x: -270, y: 44, w: 118, h: 30 });
    N3.text(g, "Creative brief", { name: "Brief title", x: -270, top: 96, fs: 46, wt: 600, ls: -0.025 });
    t = N3.text(g, "Built from the client brief, audience research and meeting notes", { name: "Built from", x: -270, top: 162, fs: 18, color: N3.COL.soft });
    if (o.from !== undefined) { N3.show(t, o.from, null, 10, { din: 0, lin: 0.4 }); }
    N3.box(g, { name: "Rule", x: -270, y: 206, w: 540, h: 1.5, fill: "#F2E2E1" });
    t = N3.text(g, "Designing towards", { name: "Designing towards", x: -270, top: 236, fs: 15, wt: 600, ls: 0.14, caps: true, color: N3.COL.capRed });
    if (o.tw !== undefined) { N3.show(t, o.tw, null, 10, { din: 0, lin: 0.35 }); }
    for (i = 0; i < C06_BUL.length; i++) {
        top = 276 + i * 62;
        dot = N3.ellipse(g, { name: "Bullet " + (i + 1) + " dot", cx: -263, cy: top + 20, d: 14, fill: N3.COL.coral });
        tx = N3.text(g, C06_BUL[i], { name: "Bullet " + (i + 1), x: -236, top: top, fs: 28, wt: 600, ls: -0.025 });
        if (o.bullets) {
            N3.show(dot, o.bullets[i], null, 12, { din: 0, lin: 0.3 });
            N3.show(tx, o.bullets[i], null, 12, { din: 0, lin: 0.3 });
            N3.typeOn(tx, o.bullets[i], o.bullets[i] + 0.4);
        }
    }
    for (i = 0; i < C06_SKEL.length; i++) {
        if (o.skel === undefined) {
            N3.box(g, { name: "Skeleton " + (i + 1), x: -270, y: 500 + i * 30, w: C06_SKEL[i], h: 12, r: 6, fill: "#F4E4E3" });
            continue;
        }
        // grows from its left edge (smooth in-out over 0.4 s, 0.05 s apart): rect size + rect position keys
        bar = N3.box(g, { name: "Skeleton " + (i + 1), cx: -270, cy: 506 + i * 30, w: C06_SKEL[i], h: 12, r: 6, fill: "#F4E4E3" });
        r0 = N3.root(bar).property(1).property("ADBE Vectors Group").property(1);
        N3.io(r0.property("ADBE Vector Rect Size"), o.skel + 0.05 * i, o.skel + 0.05 * i + 0.4, [0, 12], [C06_SKEL[i], 12]);
        r0 = N3.root(bar).property(1).property("ADBE Vectors Group").property(1);
        N3.io(r0.property("ADBE Vector Rect Position"), o.skel + 0.05 * i, o.skel + 0.05 * i + 0.4, [0, 0], [C06_SKEL[i] / 2, 0]);
    }
}

N3CLIPS["06"] = { tin: 39.00, build: function () {
    var T0 = 39.00, S, g, i, r, l, nl, f, rowTop, tIn = [],
        FILES = [["doc_brief.png", "NOON_Client_Brief.pdf", "Client brief · PDF · 75 KB", "pdf", 141],
                 ["doc_research.png", "NOON_Audience_Research.pdf", "Audience research · PDF · 77 KB", "pdf", 147],
                 ["doc_notes.png", "NOON_Discovery_Meeting_Notes.docx", "Discovery meeting · DOCX · 40 KB", "docx", 153]],
        tFolder = 0.12, tBring = N3.wt(161, T0) - 0.1, tBrief = tBring + 0.55, tWork = N3.wt(166, T0);
    for (i = 0; i < FILES.length; i++) { tIn.push(N3.wt(FILES[i][4], T0) - 0.12); }
    rowTop = function (k) { return 144 + k * 124; };

    S = N3.scene({ id: "06", title: "Three inputs", T: 13.3, intro: null,
        SH: { list: { w: 840, h: 760, r: 40, bg: "#FFFFFF", cam: 1.32 }, folder: { w: 900, h: 540, r: 34, bg: "#FFFFFF", cam: 1.38 },
            brief: { w: 720, h: 720, r: 30, bg: "#FFFFFF", cam: 1.36 } },
        start: "list", SEQ: [[tFolder, "folder"], [tBrief, "brief"]] });

    // 1. the step list from clip 05 (visible at t=0)
    g = N3.group(S, "Step list", { anchor: "t", tin: null, tout: tFolder, lout: 0.14 });
    C06_steps(g);

    // 2. the project folder: header + one row per document, each arriving on its spoken word, then merging into the middle row
    g = N3.group(S, "Folder", { anchor: "t", tin: tFolder, tout: tBrief, din: 0.06, lin: 0.3, lout: 0.16 });
    N3.box(g, { name: "Folder tile", x: -400, y: 36, w: 54, h: 54, r: 15, fill: N3.COL.coral });
    N3.icon(g, "folder", { name: "Folder icon", cx: -373, cy: 63, size: 30, color: "#FFFFFF", sw: 2 });
    N3.text(g, "NOON · High Sun", { name: "Folder title", x: -330, top: 42, fs: 34, wt: 600, ls: -0.025 });
    C06_chipRight(g, "Project files", { name: "Project files", right: 400, top: 44, bg: "#FCECEB", color: N3.COL.capRed });
    N3.box(g, { name: "Header rule", x: -400, y: 116, w: 800, h: 1.5, fill: "#F2E2E1" });
    // merge control: one spring (drag its key to retime); every row reads it - moves onto the middle row, shrinks, fades, softens
    nl = AEL.nullLayer(g.comp, "Rows merge");
    N3.spring(N3.slider(nl, "Merge", 0), 0, [[tBring, 1]], N3.SP.MORPH);
    for (i = 0; i < FILES.length; i++) {
        f = FILES[i];
        // the row (800 x 100, origin = its top-left) on a 1000 x 240 canvas
        r = C06_sub(g, "File row " + (i + 1), 1000, 240, 0, rowTop(i) + 50, 100, 70);
        l = N3.image(r.ctx, f[0], { name: "Thumb", x: 0, y: 4, w: 66, h: 92, r: 8 });
        N3.shadow(l, N3.SHADOW.small);
        N3.text(r.ctx, f[1], { name: "File name", x: 94, top: 18, fs: 26, wt: 600, ls: -0.025 });
        N3.text(r.ctx, f[2], { name: "File meta", x: 94, top: 56, fs: 18, color: N3.COL.soft });
        N3.chip(r.ctx, f[3].toUpperCase(), { name: "Type chip", x: 690, top: 30, fs: 16, wt: 600,
            bg: f[3] === "pdf" ? "#FCE3E2" : "#E1EEF6", color: f[3] === "pdf" ? N3.COL.capRed : "#3D6E8E" });
        N3.show(r.layer, tIn[i], null, 26, { din: 0, lin: 0.45, blur: 10 });
        AEL.expr(N3.pos(r.layer), "// merge onto the middle row\nvar m = thisComp.layer(\"Rows merge\").effect(\"Merge\")(1);\nadd(value, [0, " + (rowTop(1) - rowTop(i)) + " * m])");
        AEL.expr(N3.xf(r.layer, "ADBE Scale"), "var m = thisComp.layer(\"Rows merge\").effect(\"Merge\")(1), k = 1 - 0.12 * m;\n[value[0] * k, value[1] * k]");
        AEL.expr(N3.xf(r.layer, "ADBE Opacity"), "var m = thisComp.layer(\"Rows merge\").effect(\"Merge\")(1);\nvalue * (1 - 0.6 * m)");
        AEL.expr(N3.blur(r.layer), "var m = thisComp.layer(\"Rows merge\").effect(\"Merge\")(1);\n(value + 6 * m) * " + N3.BLUR_K);
    }

    // 3. the Creative brief
    g = N3.group(S, "Brief", { anchor: "t", tin: tBrief, din: 0.05, lin: 0.3 });
    C06_brief(g, { from: tBrief + 0.15, tw: tWork - 0.05, bullets: [tWork + 0.4, tWork + 0.78, tWork + 1.16], skel: tWork + 1.3 });
    return S;
} };
