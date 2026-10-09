// build_style_test.jsx - NOON style test (first 61 s of VO) as a native, editable AE project.
// Run in After Effects: File > Scripts > Run Script File... (start from a new, empty project).
// Needs: Inter (static) installed; Preferences > Scripting & Expressions > Allow Scripts to Write Files...
// Output: NOON_ST_* comps in organised folders, ../NOON_StyleTest.aep (incremental), a queued
// render to renders/previews/, and build_style_test.result.json next to this script.
#include "ae_lib.jsx"
#include "noon_lib.jsx"
#include "noon_data.jsx"

var CONFIG = {
    prefix: "NOON_ST_",
    rebuild: false,          // true = remove comps named NOON_ST_* from a previous run first
    width: 1920, height: 1080, fps: 23.976,
    assets: "../../assets/_ae/",
    save: { dir: "..", name: "NOON_StyleTest" },
    render: "../../renders/previews/NOON_StyleTest.mp4",
    renderTemplate: "H.264 - Match Render Settings - 15 Mbps"
};
var D = NOON_DATA, C = NL.COL, F, IT = {};

function main() {
    var i, sc, comp, main, layer, built = {};
    if (CONFIG.rebuild) { removePrevious(); }
    F = AEL.standardFolders();
    importAssets();

    main = AEL.comp(CONFIG.prefix + "MAIN", { width: CONFIG.width, height: CONFIG.height, duration: D.duration, fps: CONFIG.fps, folder: F.main, bg: C.paper, motionBlur: true });
    buildBackground(main);

    var builders = { SC01_ColdOpen: sc01, SC02_Tease: sc02, SC03_NewWay: sc03, SC04_Radar: sc04, SC05_Brand: sc05, SC06_SixSteps: sc06, SC07_Inputs: sc07, SC08_Powerhouse: sc08 };
    for (i = 0; i < D.scenes.length; i++) {
        sc = D.scenes[i];
        comp = sceneComp(sc.id, sc.end - sc.start);
        builders[sc.id](comp, sc.start);
        addCaptions(comp, sc.id, sc.start);
        layer = AEL.place(main, comp, sc.start, sc.end, sc.id);
        layer.moveToBeginning();
        AEL.compMarker(main, sc.start, sc.id, sc.end - sc.start);
    }

    layer = main.layers.add(IT.vo);
    layer.name = "VO (excerpt)";
    layer.startTime = D.pre;
    layer.moveToBeginning();
    addSfxMarkers(main);

    main.openInViewer();
    if (AEL.missingFootage().length) { AEL.warn("Missing footage: " + AEL.missingFootage().join(", ")); }
    if (CONFIG.render) { AEL.queueRender(main, AEL.rel($.fileName, CONFIG.render), CONFIG.renderTemplate); }
    AEL.saveIncremental(AEL.rel($.fileName, CONFIG.save.dir), CONFIG.save.name);
}

// ====================================================================== setup

function removePrevious() {
    var all = AEL.items(CompItem), i;
    for (i = 0; i < all.length; i++) { if (all[i].name.indexOf(CONFIG.prefix) === 0) { all[i].remove(); } }
    AEL.log("Removed previous " + CONFIG.prefix + "* comps");
}

function importAssets() {
    var a = AEL.rel($.fileName, CONFIG.assets), g = F.graphics, f = F.footage;
    IT.bag = AEL.importFile(a + "bag.png", g);
    IT.social1 = AEL.importFile(a + "social1.png", g);
    IT.social2 = AEL.importFile(a + "social2.png", g);
    IT.product = AEL.importFile(a + "product_page.png", g);
    IT.docBrief = AEL.importFile(a + "doc_brief.png", g);
    IT.docResearch = AEL.importFile(a + "doc_research.png", g);
    IT.docNotes = AEL.importFile(a + "doc_notes.png", g);
    IT.motionFlat = AEL.importFile(a + "motion1_flat.mp4", f);
    IT.motionBag = AEL.importFile(a + "motion2_bag.mp4", f);
    IT.vo = AEL.importFile(a + "vo_excerpt.wav", F.audio);
}

function sceneComp(id, dur) {
    return AEL.comp(CONFIG.prefix + id, { width: CONFIG.width, height: CONFIG.height, duration: dur, fps: CONFIG.fps, folder: F.sections, motionBlur: true });
}

function addCaptions(comp, sceneId, t0) {
    var i, cap, layer;
    for (i = 0; i < D.captions.length; i++) {
        cap = D.captions[i];
        if (cap.scene !== sceneId.substr(0, 4)) { continue; }
        layer = NL.caption(comp, D.words, cap, t0);
        // "let me slide into..." - the line literally slides in from the right.
        if (cap.id === "c_slide") { NL.move(layer, 57.36 - t0, 57.95 - t0, [1320, cap.y], [960, cap.y], AEL.EASE.expoOut); }
    }
}

// Soft ivory gradient + faint concentric rings + drifting colour glows (reference: soft gradient bg with radial grid).
function buildBackground(main) {
    var bg = AEL.solid(main, C.paper, "BG Gradient"), fx, rings, gi, r, glow;
    try {
        fx = AEL.effect(bg, "ADBE Ramp", "Gradient");
        fx.property("ADBE Ramp-0001").setValue([960, 380]);
        fx.property("ADBE Ramp-0002").setValue(AEL.rgba("#FFFFFF"));
        fx.property("ADBE Ramp-0003").setValue([960, 1350]);
        fx.property("ADBE Ramp-0004").setValue(AEL.rgba("#EFE7D8"));
        fx.property("ADBE Ramp-0005").setValue(2);
    } catch (e) { AEL.warn("Gradient Ramp skipped: " + e); }

    glow = NL.circle(main, "BG Glow Vermilion", 900, C.verm, [1560, 980]);
    NL.blurFx(glow, 260);
    AEL.xf(glow, "ADBE Opacity").setValue(14);
    AEL.expr(AEL.xf(glow, "ADBE Position"), "value + [Math.sin(time*0.35)*80, Math.cos(time*0.28)*50]");
    glow = NL.circle(main, "BG Glow Blue", 800, C.blue, [300, 160]);
    NL.blurFx(glow, 240);
    AEL.xf(glow, "ADBE Opacity").setValue(30);
    AEL.expr(AEL.xf(glow, "ADBE Position"), "value + [Math.cos(time*0.3)*70, Math.sin(time*0.24)*40]");

    rings = NL.shape(main, "BG Rings", [960, 540]);
    gi = NL.group(rings, "Rings");
    for (r = 260; r <= 2200; r += 220) { NL.ellipse(rings, gi, r); }
    NL.stroke(rings, gi, C.navy, 1.5, 7);
    AEL.key(AEL.xf(rings, "ADBE Scale"), [0, D.duration], [[100, 100], [112, 112]], null);
    bg.moveToEnd();
}

function addSfxMarkers(main) {
    var m = [[0.05, "SFX whoosh: documents in"], [0.55, "SFX highlighter swipe"], [1.32, "SFX soft pop: sun"], [1.70, "SFX reveal: bag"],
        [2.40, "SFX tick"], [2.90, "SFX tick"], [3.36, "SFX tick"], [3.92, "SFX tick"], [6.32, "SFX hit: 2027"], [9.12, "SFX radar ping"],
        [11.76, "SFX logo drop"], [12.00, "SFX sun rise"], [12.65, "SFX pop: bag"], [17.14, "SFX card pop"], [20.34, "SFX card pop"],
        [24.02, "SFX card pop"], [27.70, "SFX card pop"], [32.18, "SFX card pop"], [34.74, "SFX card pop"], [37.44, "SFX line swoosh"],
        [41.52, "SFX paper"], [42.80, "SFX paper"], [43.84, "SFX paper"], [47.28, "SFX stack"], [49.20, "SFX panel slide"],
        [55.52, "SFX sparkle"], [57.92, "SFX whip slide"], [58.80, "SFX pop"], [59.45, "SFX whoosh"], [61.36, "SFX impact"]], i;
    var cues = NL.ctrl(main, "SFX cues (markers)", [60, 60]);
    cues.startTime = 0;
    for (i = 0; i < m.length; i++) { AEL.layerMarker(cues, m[i][0], m[i][1]); }
    cues.moveToBeginning();
}

// Fade every layer (except captions, which have their own exit) from its current opacity to 0.
function fadeComp(comp, t, dur) {
    var i, l, p;
    for (i = 1; i <= comp.numLayers; i++) {
        l = comp.layer(i);
        if (l.name.indexOf("CAP ") === 0 || l.nullLayer) { continue; }
        p = AEL.xf(l, "ADBE Opacity");
        AEL.key(p, [t, t + dur], [p.valueAtTime(t, false), 0], AEL.EASE.expoIn);
    }
}
// Set static opacity on all layers whose name starts with prefix (groups built from a null + children).
function groupOpacity(comp, prefix, value) {
    var i;
    for (i = 1; i <= comp.numLayers; i++) { if (comp.layer(i).name.indexOf(prefix) === 0 && !comp.layer(i).nullLayer) { AEL.xf(comp.layer(i), "ADBE Opacity").setValue(value); } }
}
function groupFade(comp, prefix, t, dur, from, to) {
    var i, l;
    for (i = 1; i <= comp.numLayers; i++) {
        l = comp.layer(i);
        if (l.name.indexOf(prefix) === 0 && !l.nullLayer) { AEL.key(AEL.xf(l, "ADBE Opacity"), [t, t + dur], [from, to], to > from ? AEL.EASE.expoOut : AEL.EASE.expoIn); }
    }
}

// ====================================================================== SC01 cold open: brief + notes become the bag

function sc01(c, t0) {
    var S = 0.8, BC = [960, 540];
    function bagPt(x, y) { return [BC[0] + (x - 627) * S, BC[1] + (y - 627) * S]; }  // bag.png pixel -> comp
    var panelC = bagPt(690, 586), panelW = 590 * S, panelH = 1048 * S, docScale = panelW / 1240 * 100;
    var docs = [[IT.docBrief, "Doc Brief", [600, 575], -9], [IT.docResearch, "Doc Research", [1320, 575], 9], [IT.docNotes, "Doc Notes", [960, 548], 0]];
    var i, d, l, hl, panel, sun, bag, t;

    for (i = 0; i < docs.length; i++) {
        d = docs[i]; t = 0.05 + i * 0.08;
        l = NL.media(c, d[0], d[1], d[2], 330);
        NL.shadow(l, 45, 14, 40);
        AEL.key(AEL.xf(l, "ADBE Position"), [t, t + 0.45, 0.95, 1.4], [[d[2][0], d[2][1] + 950], d[2], d[2], panelC], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Rotate Z"), [t, t + 0.45, 0.95, 1.4], [d[3] * 2.5, d[3], d[3], 0], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Scale"), [0.95, 1.4], [NL.scaleOf(l), [docScale, docScale]], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Opacity"), [1.22, 1.42], [100, 0], AEL.EASE.expoIn);
    }
    // Highlighter swipe across the meeting notes title (parented: lives in the page's pixel space).
    hl = NL.box(c, "Highlighter", 960, 80, 8, C.verm, [0, 0], 40);
    hl.parent = l;
    AEL.xf(hl, "ADBE Anchor Point").setValue([-480, 0]);
    AEL.xf(hl, "ADBE Position").setValue([140, 135]);
    AEL.key(AEL.xf(hl, "ADBE Scale"), [0.55, 0.85], [[0, 100], [100, 100]], AEL.EASE.expoOut);
    AEL.key(AEL.xf(hl, "ADBE Opacity"), [1.22, 1.42], [100, 0], AEL.EASE.expoIn);

    panel = NL.box(c, "Pack Front", panelW, panelH, 10, "#F1EDE4", panelC);
    AEL.key(AEL.xf(panel, "ADBE Opacity"), [1.18, 1.4], [0, 100], AEL.EASE.expoOut);
    sun = NL.circle(c, "Sun", 221 * 2 * S, C.verm, bagPt(677, 425));
    NL.pop(sun, 1.32, 0.42, 0);
    sun.motionBlur = true;

    bag = NL.tile(c, IT.bag, "Bag Photo", BC, { w: 1254 * S, h: 1254 * S, round: 44 });
    AEL.key(AEL.xf(bag.media, "ADBE Opacity"), [1.7, 1.9], [0, 100], AEL.EASE.expoOut);
    AEL.key(AEL.xf(bag.card, "ADBE Opacity"), [1.7, 1.9], [0, 100], AEL.EASE.expoOut);
    AEL.key(AEL.xf(bag.ctrl, "ADBE Scale"), [1.7, c.duration], [[100, 100], [104, 104]], AEL.EASE.smooth);
}

// ====================================================================== SC02 tease: social, product page, motion

function sc02(c, t0) {
    var tc = AEL.comp(CONFIG.prefix + "TeaseScreen", { width: 1280, height: 720, duration: c.duration, fps: CONFIG.fps, folder: F.precomps, bg: C.ivory }), l, s, tile;
    l = NL.media(tc, IT.social1, "Social 1", [640, 360], 1280); s = NL.scaleOf(l);
    AEL.key(AEL.xf(l, "ADBE Scale"), [0, 0.5], [s, [s[0] * 1.08, s[1] * 1.08]], null);
    l.outPoint = 0.5;
    l = NL.media(tc, IT.product, "Product Page", [640, 1178], 1280);
    AEL.key(AEL.xf(l, "ADBE Position"), [0.5, 0.96], [[640, 1178], [640, 700]], AEL.EASE.smooth);
    l.inPoint = 0.5; l.outPoint = 0.96;
    l = NL.media(tc, IT.motionBag, "Motion Bag", [640, 420], 1280);
    l.startTime = 0.96 - 0.35; l.inPoint = 0.96; l.outPoint = 1.52;
    l = NL.media(tc, IT.social2, "Social 2", [640, 360], 1280); s = NL.scaleOf(l);
    AEL.key(AEL.xf(l, "ADBE Scale"), [1.52, c.duration], [s, [s[0] * 1.06, s[1] * 1.06]], null);
    l.inPoint = 1.52;

    tile = NL.tile(c, tc, "Tease Screen", [960, 615], { w: 1280, h: 720, round: 30 });
    AEL.key(AEL.xf(tile.ctrl, "ADBE Scale"), [0, 0.3, c.duration], [[92, 92], [100, 100], [102, 102]], AEL.EASE.expoOut);
}

// ====================================================================== SC03 "a new way ... in 2027"

function sc03(c, t0) {
    var t = 6.32 - t0, big, r, w, h, p = [960, 690], box, gi, hs, k, guides;
    big = NL.bigWord(c, "2027", t, { size: 230, color: C.verm, pos: p, name: "Big 2027" });
    r = big.sourceRectAtTime(0, false); w = r.width + 50; h = r.height + 30;
    // Artboard selection box + handles + guides (design-tool language).
    box = NL.shape(c, "2027 Selection", p);
    gi = NL.group(box, "Frame"); NL.rect(box, gi, w, h, 0); NL.stroke(box, gi, C.navy, 2);
    hs = NL.group(box, "Handles");
    for (k = 0; k < 4; k++) { NL.rect(box, hs, 14, 14, 0, [(k % 2 ? 1 : -1) * w / 2, (k < 2 ? -1 : 1) * h / 2]); }
    NL.fill(box, hs, C.white); NL.stroke(box, hs, C.navy, 2);
    NL.pop(box, t + 0.12, 0.35, 0.85);
    guides = NL.shape(c, "2027 Guides", p);
    gi = NL.group(guides, "Lines");
    NL.path(guides, gi, [[-1100, -h / 2], [1100, -h / 2]]); NL.path(guides, gi, [[-1100, h / 2], [1100, h / 2]]);
    NL.path(guides, gi, [[-w / 2, -700], [-w / 2, 700]]); NL.path(guides, gi, [[w / 2, -700], [w / 2, 700]]);
    NL.stroke(guides, gi, C.navy, 1, 25);
    AEL.key(NL.trim(guides, gi).property("ADBE Vector Trim End"), [t + 0.05, t + 0.55], [0, 100], AEL.EASE.expoOut);
    guides.moveToEnd();
}

// ====================================================================== SC04 "... everybody's radar"

function sc04(c, t0) {
    var t = 9.12 - t0, p = [960, 730], sun, ring, i;
    for (i = 0; i < 3; i++) {
        ring = NL.shape(c, "Radar Ring " + (i + 1), p);
        NL.ellipse(ring, NL.group(ring, "Ring"), 130);
        NL.stroke(ring, 1, C.verm, 3);
        AEL.key(AEL.xf(ring, "ADBE Scale"), [t + i * 0.16, t + i * 0.16 + 1.1], [[100, 100], [720, 720]], AEL.EASE.expoOut);
        AEL.key(AEL.xf(ring, "ADBE Opacity"), [t + i * 0.16, t + i * 0.16 + 1.1], [90, 0], AEL.EASE.expoOut);
    }
    sun = NL.circle(c, "Sun", 130, C.verm, p);
    NL.pop(sun, 7.3 - t0, 0.45, 0);
    AEL.key(AEL.xf(sun, "ADBE Scale"), [t, t + 0.12, t + 0.45], [[100, 100], [118, 118], [100, 100]], AEL.EASE.smooth);
}

// ====================================================================== SC05 NOON wordmark, sun rule, whole process ring

function sc05(c, t0) {
    var tLogo = 11.76 - t0, logo, i, L, p, sun, matte, bag, ring, r, k, m, s, ringStr;
    logo = NL.logo(c, "NOON Logo", [960, 560], 170, C.navy);
    for (i = 0; i < logo.letters.length; i++) {
        L = logo.letters[i]; p = NL.posOf(L);
        AEL.key(AEL.xf(L, "ADBE Position"), [tLogo + i * 0.05, tLogo + i * 0.05 + 0.45], [[p[0], p[1] + 70], p], AEL.EASE.expoOut);
        AEL.key(AEL.xf(L, "ADBE Opacity"), [tLogo + i * 0.05, tLogo + i * 0.05 + 0.2], [0, 100], AEL.EASE.expoOut);
    }
    // Motion rule preview: the sun rises from behind a horizon above the wordmark, then settles.
    sun = NL.circle(c, "Sun", 135, C.verm, [0, 0]);
    matte = NL.box(c, "Sun Horizon Matte", 700, 420, 0, C.white, [0, 0]);
    sun.parent = logo.ctrl; matte.parent = logo.ctrl;
    AEL.xf(matte, "ADBE Position").setValue([0, -62 - 210]);
    AEL.key(AEL.xf(sun, "ADBE Position"), [tLogo + 0.2, tLogo + 0.75, tLogo + 1.05], [[0, 20], [0, -146], [0, -134]], AEL.EASE.smooth);
    AEL.xf(sun, "ADBE Scale").setValue([100, 100]);
    matte.moveBefore(sun);
    AEL.trackMatte(sun, matte, TrackMatteType.ALPHA);
    // Make room: wordmark moves up and shrinks when "follow along" starts.
    NL.move(logo.ctrl, 12.4 - t0, 12.95 - t0, [960, 560], [960, 200], AEL.EASE.smooth);
    AEL.key(AEL.xf(logo.ctrl, "ADBE Scale"), [12.4 - t0, 12.95 - t0], [[170, 170], [72, 72]], AEL.EASE.smooth);

    bag = NL.tile(c, IT.bag, "Hero Bag", [960, 590], { w: 420, h: 420, round: 30 });
    NL.pop(bag.ctrl, 12.65 - t0, 0.5, 0);

    // Rotating process ring around the bag (text on a circular mask path).
    ringStr = "BRIEF → PURPOSE → DIRECTION → RULES → REVIEW → HANDOVER → ";
    ring = AEL.text(c, ringStr + ringStr, { font: NL.FONT.bold, size: 20, color: C.navy, tracking: 120, justify: "left", name: "Process Ring" });
    AEL.xf(ring, "ADBE Anchor Point").setValue([0, 0]);
    AEL.xf(ring, "ADBE Position").setValue([960, 590]);
    r = 292; k = 0.5523 * r;
    m = ring.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    s = new Shape();
    s.vertices = [[0, -r], [r, 0], [0, r], [-r, 0]];
    s.inTangents = [[-k, 0], [0, -k], [k, 0], [0, k]];
    s.outTangents = [[k, 0], [0, k], [-k, 0], [0, -k]];
    s.closed = true;
    m.property("ADBE Mask Shape").setValue(s);
    m.maskMode = MaskMode.NONE;
    try {
        ring.property("ADBE Text Properties").property("ADBE Text Path Options").property("ADBE Text Path").setValue(1);
        try { ring.property("ADBE Text Properties").property("ADBE Text Path Options").property("ADBE Text Force Align Path").setValue(1); } catch (e2) {}
    } catch (e) { AEL.warn("Text on path skipped: " + e); }
    AEL.expr(AEL.xf(ring, "ADBE Rotate Z"), "value - time*14");
    AEL.key(AEL.xf(ring, "ADBE Opacity"), [12.85 - t0, 13.3 - t0], [0, 100], AEL.EASE.expoOut);
    AEL.key(AEL.xf(ring, "ADBE Scale"), [12.85 - t0, 13.4 - t0], [[85, 85], [100, 100]], AEL.EASE.expoOut);

    fadeComp(c, 15.0 - t0, 0.28);
}

// ====================================================================== SC06 the six-step plan

var STEPS = [
    ["01", "Professional\rdirection", "doc", 17.04],
    ["02", "Clear\rpurpose", "target", 20.24],
    ["03", "Design\rrules", "rules", 23.92],
    ["04", "Across\revery format", "formats", 27.60],
    ["05", "Check the\rgoals", "check", 32.08],
    ["06", "Hand over\ra system", "folder", 34.64]
];
function stepX(i) { return 960 + (i - 2.5) * 292; }

// Steps row in its own precomp (reusable). animT0 = scene start for animated build, or -1 for a static row.
function buildStepsRow(name, dur, animT0, highlightIdx) {
    var rc = AEL.comp(CONFIG.prefix + name, { width: CONFIG.width, height: CONFIG.height, duration: dur, fps: CONFIG.fps, folder: F.precomps }), i, card, line, gi, tl, hl;
    if (animT0 >= 0) {
        line = NL.shape(rc, "Connector", [0, 0]);
        gi = NL.group(line, "Line");
        NL.path(line, gi, [[stepX(0), 760], [stepX(5), 760]]);
        NL.stroke(line, gi, C.verm, 4);
        tl = NL.trim(line, gi);
        AEL.key(tl.property("ADBE Vector Trim End"), [37.44 - animT0, 38.1 - animT0], [0, 100], AEL.EASE.expoOut);
    }
    for (i = 0; i < STEPS.length; i++) {
        card = NL.card(rc, STEPS[i][0], STEPS[i][1], STEPS[i][2], [stepX(i), 760]);
        if (animT0 >= 0) {
            NL.pop(card, STEPS[i][3] + 0.1 - animT0, 0.5, 0.55);
            groupFade(rc, "Card " + STEPS[i][0], STEPS[i][3] + 0.1 - animT0, 0.2, 0, 100);
            NL.move(card, STEPS[i][3] + 0.1 - animT0, STEPS[i][3] + 0.6 - animT0, [stepX(i), 820], [stepX(i), 760], AEL.EASE.expoOut);
            AEL.key(AEL.xf(card, "ADBE Scale"), [37.44 - animT0 + i * 0.06, 37.6 - animT0 + i * 0.06, 37.85 - animT0 + i * 0.06], [[100, 100], [108, 108], [100, 100]], AEL.EASE.smooth);
        } else if (highlightIdx !== undefined && i !== highlightIdx) {
            groupOpacity(rc, "Card " + STEPS[i][0], 35);
        }
    }
    if (animT0 < 0 && highlightIdx !== undefined) {
        hl = NL.box(rc, "Active Outline", 290, 132, 30, C.white, [stepX(highlightIdx), 760], 0);
        NL.stroke(hl, 1, C.verm, 3);
        hl.moveToEnd();
    }
    return rc;
}

function sc06(c, t0) {
    var row = buildStepsRow("StepsRow", c.duration, t0), rl, thumbs, i, tile, t;
    rl = c.layers.add(row);
    rl.name = "Steps Row";
    AEL.key(AEL.xf(rl, "ADBE Opacity"), [38.55 - t0, 38.95 - t0], [100, 0], AEL.EASE.expoIn);
    AEL.key(AEL.xf(rl, "ADBE Position"), [38.55 - t0, 38.95 - t0], [[960, 540], [960, 600]], AEL.EASE.expoIn);

    // Step 4: show the formats as they are named (packaging, digital, motion).
    thumbs = [[IT.bag, "Thumb Packaging", 700, 29.12, 230, [0, 0]], [IT.social1, "Thumb Digital", 960, 29.76, 230, [0, 0]], [IT.motionFlat, "Thumb Motion", 1220, 30.80, 409, [0, 30]]];
    for (i = 0; i < thumbs.length; i++) {
        t = thumbs[i][3] - t0;
        tile = NL.tile(c, thumbs[i][0], thumbs[i][1], [thumbs[i][2], 545], { w: 230, h: 230, round: 22, mediaWidth: thumbs[i][4], mediaOffset: thumbs[i][5] });
        NL.pop(tile.ctrl, t, 0.45, 0);
        if (thumbs[i][0] === IT.motionFlat) { tile.media.startTime = t - 0.2; }
        groupFade(c, thumbs[i][1], 31.95 - t0, 0.25, 100, 0);
    }
}

// ====================================================================== SC07 the three inputs come together

function sc07(c, t0) {
    var docs = [[IT.docBrief, "Doc Brief", [560, 640], -6, 41.52, "CLIENT BRIEF", [-14, -10], -5],
                [IT.docResearch, "Doc Research", [960, 620], 0, 42.80, "AUDIENCE RESEARCH", [12, 6], 4],
                [IT.docNotes, "Doc Notes", [1360, 640], 6, 43.84, "DISCOVERY NOTES", [0, 0], 0]];
    var i, d, l, t, pill, stack = [900, 650], tBring = 47.28 - t0, tWork = 48.96 - t0, panel, bg, title, b, dot, bullets, arrow, gi, tr;
    for (i = 0; i < docs.length; i++) {
        d = docs[i]; t = d[4] - t0;
        l = NL.media(c, d[0], d[1], d[2], 330);
        NL.shadow(l, 50, 16, 50);
        AEL.key(AEL.xf(l, "ADBE Position"), [t, t + 0.5, tBring, tBring + 0.6, tWork, tWork + 0.55],
            [[d[2][0], d[2][1] + 160], d[2], d[2], [stack[0] + d[6][0], stack[1] + d[6][1]], [stack[0] + d[6][0], stack[1] + d[6][1]], [stack[0] + d[6][0] - 330, stack[1] + d[6][1]]], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Rotate Z"), [t, t + 0.5, tBring, tBring + 0.6], [d[3] * 3, d[3], d[3], d[7]], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Opacity"), [t, t + 0.2], [0, 100], AEL.EASE.expoOut);
        pill = NL.pill(c, "Pill " + d[5], d[5], [d[2][0], d[2][1] - 285], { size: 18 });
        NL.pop(pill, t + 0.2, 0.4, 0);
        groupFade(c, "Pill " + d[5], tBring - 0.1, 0.2, 100, 0);
    }

    // "Designing towards" panel (content taken from the brief, research and meeting notes).
    panel = NL.ctrl(c, "Towards Panel", [2400, 640]);
    bg = NL.box(c, "Towards Panel BG", 620, 380, 30, C.white, [0, 0], 92);
    NL.shadow(bg, 45, 18, 60);
    NL.stroke(bg, 1, C.navy, 1.5, 18);
    title = AEL.text(c, "DESIGNING TOWARDS", { font: NL.FONT.bold, size: 22, color: C.verm, tracking: 140, justify: "left", name: "Towards Panel Title" });
    bg.parent = panel; title.parent = panel;
    AEL.xf(bg, "ADBE Position").setValue([0, 0]);
    AEL.xf(title, "ADBE Anchor Point").setValue([title.sourceRectAtTime(0, false).left, 0]);
    AEL.xf(title, "ADBE Position").setValue([-260, -120]);
    NL.move(panel, tWork + 0.2, tWork + 0.8, [2400, 640], [1290, 640], AEL.EASE.expoOut);
    bullets = ["Energy without the noise", "Creative focus, not hustle", "Calm info + one moment of energy"];
    for (i = 0; i < bullets.length; i++) {
        t = tWork + 0.9 + i * 0.4;
        b = AEL.text(c, bullets[i], { font: NL.FONT.cap, size: 30, color: C.navy, justify: "left", name: "Towards Panel Bullet " + (i + 1) });
        dot = NL.circle(c, "Towards Panel Dot " + (i + 1), 12, C.verm, [0, 0]);
        b.parent = panel; dot.parent = panel;
        AEL.xf(b, "ADBE Anchor Point").setValue([b.sourceRectAtTime(0, false).left, -11]);
        AEL.xf(b, "ADBE Position").setValue([-228, -40 + i * 70]);
        AEL.xf(dot, "ADBE Position").setValue([-252, -40 + i * 70]);
        NL.slideIn(b, t, 0.4, 30, 0);
        NL.pop(dot, t, 0.35, 0);
    }
    // Hand-drawn style arrow from the stack to the panel.
    arrow = NL.shape(c, "Arrow", [810, 400]);
    gi = NL.group(arrow, "Curve");
    NL.path(arrow, gi, [[-110, 40], [150, 30]], false, [[0, 0], [-60, -90]], [[40, -110], [0, 0]]);
    NL.path(arrow, gi, [[132, 14], [150, 30], [128, 40]], false);
    NL.stroke(arrow, gi, C.navy, 3.5);
    tr = NL.trim(arrow, gi);
    AEL.key(tr.property("ADBE Vector Trim End"), [tWork + 0.6, tWork + 1.1], [0, 100], AEL.EASE.expoOut);

    fadeComp(c, 51.95 - t0, 0.3);
}

// ====================================================================== SC08 first stage, neat way, tag team, powerhouse

function sc08(c, t0) {
    var row, rl, pill, sp, i, team, bg, slot, q, x, wipe, glow, big, cap, stars;
    row = buildStepsRow("StepsRow_Stage1", c.duration, -1, 0);
    rl = c.layers.add(row);
    rl.name = "Steps Row (stage 1)";
    AEL.xf(rl, "ADBE Position").setValue([960, 470]);
    AEL.key(AEL.xf(rl, "ADBE Opacity"), [52.45 - t0, 52.75 - t0, 54.6 - t0, 54.85 - t0], [0, 100, 100, 0], AEL.EASE.expoOut);
    AEL.key(AEL.xf(rl, "ADBE Scale"), [52.45 - t0, 52.85 - t0], [[94, 94], [100, 100]], AEL.EASE.expoOut);
    pill = NL.pill(c, "Pill Stage", "STAGE 01 / 06", [stepX(0), 600], { size: 18, bg: C.verm });
    NL.pop(pill, 53.36 - t0, 0.4, 0);
    groupFade(c, "Pill Stage", 54.6 - t0, 0.25, 100, 0);

    // Sparkles beside "neat".
    stars = [[1265, 380, 34, 0], [1318, 432, 18, 0.08], [1226, 398, 13, 0.14]];  // approx. beside "neat"; nudge if needed
    for (i = 0; i < stars.length; i++) {
        sp = NL.shape(c, "Sparkle " + (i + 1), [stars[i][0], stars[i][1]]);
        NL.star(sp, NL.group(sp, "Star"), stars[i][2], stars[i][2] * 0.26);
        NL.fill(sp, 1, C.verm);
        NL.pop(sp, 55.52 - t0 + stars[i][3], 0.45, 0);
        AEL.key(AEL.xf(sp, "ADBE Rotate Z"), [55.52 - t0, 57.2 - t0], [-30, 30], AEL.EASE.smooth);
        NL.fadeOut(sp, 57.15 - t0, 0.2);
    }

    // Tag-team card: two tool slots revealed in the next segment.
    team = NL.ctrl(c, "Tag Team", [960, 660]);
    bg = NL.box(c, "Tag Team BG", 760, 230, 44, C.white, [0, 0]);
    NL.shadow(bg, 45, 18, 60);
    bg.parent = team; AEL.xf(bg, "ADBE Position").setValue([0, 0]);
    for (i = 0; i < 2; i++) {
        x = i ? 210 : -210;
        slot = NL.box(c, "Tag Team Slot " + (i + 1), 150, 150, 34, C.ivory, [0, 0]);
        NL.stroke(slot, 1, C.navy, 2, 25);
        q = AEL.text(c, "?", { font: NL.FONT.black, size: 70, color: "#AEB7C2", name: "Tag Team Slot " + (i + 1) + " ?" });
        slot.parent = team; q.parent = team;
        AEL.xf(slot, "ADBE Position").setValue([x, 0]);
        AEL.xf(q, "ADBE Position").setValue([x, 0]);
        NL.pop(slot, 58.95 - t0 + i * 0.1, 0.4, 0);
    }
    x = AEL.text(c, "×", { font: NL.FONT.med, size: 90, color: C.navy, name: "Tag Team X" });
    x.parent = team; AEL.xf(x, "ADBE Position").setValue([0, 0]);
    NL.pop(team, 58.8 - t0, 0.45, 0.6);
    groupFade(c, "Tag Team", 58.8 - t0, 0.2, 0, 100);
    NL.move(team, 58.8 - t0, 59.2 - t0, [1360, 660], [960, 660], AEL.EASE.expoOut);

    // Navy wipe hands over to the darker Dropbox/ChatGPT segment.
    wipe = NL.box(c, "Navy Wipe", 1920, 1080, 0, C.navy, [960, 1080]);
    AEL.xf(wipe, "ADBE Anchor Point").setValue([0, 540]);
    AEL.key(AEL.xf(wipe, "ADBE Scale"), [59.45 - t0, 59.9 - t0], [[100, 0], [100, 100]], AEL.EASE.expoOut);
    glow = NL.circle(c, "Power Glow", 560, C.verm, [960, 600]);
    NL.blurFx(glow, 140);
    AEL.key(AEL.xf(glow, "ADBE Opacity"), [61.3 - t0, 61.6 - t0], [0, 55], AEL.EASE.expoOut);
    AEL.key(AEL.xf(glow, "ADBE Scale"), [61.3 - t0, 62.2 - t0], [[60, 60], [100, 100]], AEL.EASE.expoOut);
    big = NL.bigWord(c, "POWERHOUSE", 61.36 - t0, { size: 190, color: C.white, pos: [960, 600], tracking: -10, name: "Big POWERHOUSE" });
}

// Run last, so every top-level var above (STEPS, CONFIG...) is initialised first.
AEL.run($.fileName, "NOON style test build", main);
