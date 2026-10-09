// build_noon_v2.jsx - NOON test v2 (full 2-min VO): blush/coral theme, stock-radar + Flaticon slots,
// interface + device mockups for stage 2. Native, editable After Effects project.
// Run in After Effects: File > Scripts > Run Script File... (start from a new, empty project).
// Optional drop-in assets (used automatically if present, otherwise built-in fallbacks):
//   assets/stock/radar_alpha.mov   (radar loop WITH alpha, e.g. ProRes 4444 / QuickTime Animation)
//   assets/icons/step01.png ... step06.png   (Flaticon PNGs, any colour - tinted white here)
#include "ae_lib.jsx"
#include "noon_lib.jsx"
#include "noon_ui.jsx"
#include "noon_data.jsx"

var CONFIG = {
    prefix: "NOON_",
    rebuild: false,          // true = remove comps named NOON_* / GLOW * from a previous run first
    width: 1920, height: 1080, fps: 23.976,
    assets: "../../assets/",
    save: { dir: "..", name: "NOON_Test_v2" },
    render: "../../renders/previews/NOON_Test_v2.mp4",
    renderTemplate: "H.264 - Match Render Settings - 15 Mbps"
};
var D = NOON_DATA, C = NL.COL, F, IT = {};
var GRID_X = [515, 1415], GRID_Y = [476, 603];

function main() {
    var i, sc, comp, main, layer;
    if (CONFIG.rebuild) { removePrevious(); }
    F = AEL.standardFolders();
    NL.precompFolder = F.precomps;
    NL.FPS = CONFIG.fps;
    importAssets();

    main = AEL.comp(CONFIG.prefix + "MAIN", { width: CONFIG.width, height: CONFIG.height, duration: D.duration, fps: CONFIG.fps, folder: F.main, bg: C.blushMid, motionBlur: true });
    buildBackground(main);

    var vo = main.layers.add(IT.vo);
    vo.name = "VO";
    vo.startTime = D.pre;

    var builders = { SC01: sc01, SC02: sc02, SC03: sc03, SC04: sc04, SC05: sc05, SC06: sc06, SC07: sc07, SC08: sc08,
        SC09: sc09, SC10: sc10, SC11: sc11, SC12: sc12, SC13: sc13, SC14: sc14 };
    for (i = 0; i < D.scenes.length; i++) {
        sc = D.scenes[i];
        comp = AEL.comp(CONFIG.prefix + sc.id, { width: CONFIG.width, height: CONFIG.height, duration: sc.end - sc.start, fps: CONFIG.fps, folder: F.sections, motionBlur: true });
        // Each scene builds in its own try/catch: a failure is reported and the rest still builds.
        try { builders[sc.id.substr(0, 4)](comp, sc.start); }
        catch (e) { AEL.warn("SCENE " + sc.id + " incomplete: " + e.toString() + (e.line ? " (line " + e.line + ")" : "")); }
        try { addCaptions(comp, sc.id, sc.start); }
        catch (e2) { AEL.warn("CAPTIONS " + sc.id + " incomplete: " + e2.toString() + (e2.line ? " (line " + e2.line + ")" : "")); }
        layer = AEL.place(main, comp, sc.start, sc.end, sc.id);
        layer.moveToBeginning();
        AEL.compMarker(main, sc.start, sc.id, sc.end - sc.start);
    }
    AEL.compMarker(main, D.dropboxInsertAt, "INSERT existing Dropbox integration here (final edit)");

    vo.moveToBeginning();
    addSfxMarkers(main);

    main.openInViewer();
    if (AEL.missingFootage().length) { AEL.warn("Missing footage: " + AEL.missingFootage().join(", ")); }
    if (CONFIG.render) { AEL.queueRender(main, AEL.rel($.fileName, CONFIG.render), CONFIG.renderTemplate); }
    AEL.saveIncremental(AEL.rel($.fileName, CONFIG.save.dir), CONFIG.save.name);
}

// ====================================================================== setup

function removePrevious() {
    var all = AEL.items(CompItem), i, n;
    for (i = 0; i < all.length; i++) {
        n = all[i].name;
        if (n.indexOf(CONFIG.prefix) === 0 || n.indexOf("GLOW ") === 0) { all[i].remove(); }
    }
    AEL.log("Removed previous " + CONFIG.prefix + "* and GLOW * comps");
}

function optional(rel) {
    var f = new File(AEL.rel($.fileName, CONFIG.assets + rel));
    return f.exists ? f.fsName : null;
}

function importAssets() {
    var a = AEL.rel($.fileName, CONFIG.assets + "_ae/"), g = F.graphics, f = F.footage, i, p, cands, k;
    IT.bag = AEL.importFile(a + "bag.png", g);
    IT.social1 = AEL.importFile(a + "social1.png", g);
    IT.social2 = AEL.importFile(a + "social2.png", g);
    IT.product = AEL.importFile(a + "product_page.png", g);
    IT.docBrief = AEL.importFile(a + "doc_brief.png", g);
    IT.docResearch = AEL.importFile(a + "doc_research.png", g);
    IT.docNotes = AEL.importFile(a + "doc_notes.png", g);
    IT.motionFlat = AEL.importFile(a + "motion1_flat.mp4", f);
    IT.motionBag = AEL.importFile(a + "motion2_bag.mp4", f);
    IT.vo = AEL.importFile(a + "vo2_full.wav", F.audio);
    // optional drop-ins
    IT.icons = [];
    for (i = 1; i <= 6; i++) {
        p = optional("icons/step0" + i + ".png");
        IT.icons.push(p ? AEL.importFile(p, g) : null);
        if (!p) { AEL.warn("No assets/icons/step0" + i + ".png - using built-in shape icon"); }
    }
    cands = ["stock/radar_alpha.mov", "stock/radar_alpha.mp4", "stock/radar.mov", "stock/radar.mp4"];
    IT.radar = null;
    for (k = 0; k < cands.length && !IT.radar; k++) { p = optional(cands[k]); if (p) { IT.radar = AEL.importFile(p, f); } }
    if (!IT.radar) { AEL.warn("No assets/stock/radar_alpha.mov - using built-in radar"); }
}

function L(t, t0) { return t - t0; }
function W(i) { return D.words[i][1]; }   // absolute time of word i

function addCaptions(comp, sceneId, t0) {
    var i, cap, layer;
    for (i = 0; i < D.captions.length; i++) {
        cap = D.captions[i];
        if (cap.scene !== sceneId.substr(0, 4)) { continue; }
        layer = NL.caption(comp, D.words, cap, t0);
        if (cap.id === "c_slide") { NL.move(layer, 57.36 - t0, 57.95 - t0, [1320, cap.y], [960, cap.y], AEL.EASE.expoOut); }
    }
}

// Calm theme: blush vertical gradient + thin layout grid + one soft light (glow = precomp + blur).
function buildBackground(main) {
    var bg = NL.gradientSolid(main, "BG Blush", [960, 0], C.blushTop, [960, 1080], C.blushBot, false), glow, grid;
    glow = NL.glow(main, "Soft Light", 900, C.white, [380, 120], 200, 55);
    AEL.expr(AEL.xf(glow, "ADBE Position"), "add(value, [Math.sin(time*0.3)*90, Math.cos(time*0.25)*50])");
    grid = NL.grid(main, "BG Grid", GRID_X, GRID_Y, C.line, 60, false);
    bg.moveToEnd();
}

// Emphasis theme comp (coral diagonal + handle grid), reused by several scenes.
function emphasisComp(name, dur) {
    var ec = AEL.comp(CONFIG.prefix + "Emphasis_" + name, { width: CONFIG.width, height: CONFIG.height, duration: dur, fps: CONFIG.fps, folder: F.precomps });
    NL.gradientSolid(ec, "Coral Gradient", [-520, -140], C.white, [1150, 820], C.coral, false);
    NL.grid(ec, "Handle Grid", [96, 356, 1577, 1837], [228, 855], C.white, 85, true);
    return ec;
}

function addSfxMarkers(main) {
    var m = [[0.05, "whoosh: documents in"], [0.55, "highlighter swipe"], [1.32, "soft pop: sun"], [1.70, "reveal: bag"],
        [2.40, "tick"], [2.90, "tick"], [3.36, "tick"], [3.92, "tick"], [6.32, "hit: 2027"], [7.3, "radar hum in"], [9.12, "radar ping"],
        [11.76, "logo drop"], [12.00, "sun rise"], [12.65, "pop: bag"], [17.14, "card pop"], [20.34, "card pop"], [24.02, "card pop"],
        [27.70, "card pop"], [32.18, "card pop"], [34.74, "card pop"], [37.44, "line swoosh"], [41.52, "paper"], [42.80, "paper"],
        [43.84, "paper"], [47.28, "stack"], [49.20, "panel slide"], [55.52, "sparkle"], [57.92, "whip slide"], [58.80, "pop"],
        [59.45, "wipe"], [61.36, "impact: POWERHOUSE"], [63.45, "window slide up"], [65.3, "file drop"], [66.4, "saved chime"],
        [69.28, "tick: done"], [70.32, "pop: complete"], [77.12, "pop: stage 02"], [80.2, "window in"], [83.1, "highlighter"],
        [84.64, "highlighter"], [88.32, "highlighter"], [91.36, "highlighter"], [96.3, "scroll"], [97.44, "highlighter"],
        [102.4, "cards scatter"], [106.2, "chaos rumble"], [109.9, "snap into place"], [111.92, "soft ding"], [112.95, "wipe"],
        [116.64, "impact: PROFESSIONAL"], [119.2, "phone slide up"], [121.76, "pop: revealed soon"], [122.6, "slide"],
        [123.04, "pop 1"], [123.44, "pop 2"], [123.9, "pop 3"], [124.1, "line swoosh"]], i;
    var cues = NL.ctrl(main, "SFX cues (markers)", [60, 60]);
    cues.startTime = 0;
    for (i = 0; i < m.length; i++) { AEL.layerMarker(cues, m[i][0], "SFX " + m[i][1]); }
    cues.moveToBeginning();
}

function fadeComp(comp, t, dur) {
    var i, l, p;
    for (i = 1; i <= comp.numLayers; i++) {
        l = comp.layer(i);
        if (l.name.indexOf("CAP ") === 0 || l.nullLayer) { continue; }
        p = AEL.xf(l, "ADBE Opacity");
        AEL.key(p, [t, t + dur], [p.valueAtTime(t, false), 0], AEL.EASE.expoIn);
    }
}
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
// A precomp of `item` cropped to w x h ("cover" fit) so it can be blurred as a comp layer (house rule).
function coverComp(name, item, w, h, dur) {
    var cc = AEL.comp(CONFIG.prefix + name, { width: w, height: h, duration: dur, fps: CONFIG.fps, folder: F.precomps }), s = Math.max(w / item.width, h / item.height) * 100, l;
    l = cc.layers.add(item);
    AEL.xf(l, "ADBE Scale").setValue([s, s]);
    AEL.xf(l, "ADBE Position").setValue([w / 2, h / 2]);
    return cc;
}

// ====================================================================== SC01 cold open: brief + notes become the bag

function sc01(c, t0) {
    var S = 0.8, BC = [960, 540];
    function bagPt(x, y) { return [BC[0] + (x - 627) * S, BC[1] + (y - 627) * S]; }
    var panelC = bagPt(690, 586), panelW = 590 * S, panelH = 1048 * S, docScale = panelW / 1240 * 100;
    var docs = [[IT.docBrief, "Doc Brief", [600, 575], -9], [IT.docResearch, "Doc Research", [1320, 575], 9], [IT.docNotes, "Doc Notes", [960, 548], 0]];
    var i, d, l, hl, panel, sun, bag, t;
    for (i = 0; i < docs.length; i++) {
        d = docs[i]; t = 0.05 + i * 0.08;
        l = NL.media(c, d[0], d[1], d[2], 330);
        NL.shadow(l, 60, 14, 40);
        AEL.key(AEL.xf(l, "ADBE Position"), [t, t + 0.45, 0.95, 1.4], [[d[2][0], d[2][1] + 950], d[2], d[2], panelC], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Rotate Z"), [t, t + 0.45, 0.95, 1.4], [d[3] * 2.5, d[3], d[3], 0], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Scale"), [0.95, 1.4], [NL.scaleOf(l), [docScale, docScale]], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Opacity"), [1.22, 1.42], [100, 0], AEL.EASE.expoIn);
    }
    hl = NL.box(c, "Highlighter", 960, 80, 8, C.coral, [0, 0], 45);
    hl.parent = l;
    AEL.xf(hl, "ADBE Anchor Point").setValue([-480, 0]);
    AEL.xf(hl, "ADBE Position").setValue([140, 135]);
    AEL.key(AEL.xf(hl, "ADBE Scale"), [0.55, 0.85], [[0, 100], [100, 100]], AEL.EASE.expoOut);
    AEL.key(AEL.xf(hl, "ADBE Opacity"), [1.22, 1.42], [100, 0], AEL.EASE.expoIn);
    panel = NL.box(c, "Pack Front", panelW, panelH, 10, "#F1EDE4", panelC);
    AEL.key(AEL.xf(panel, "ADBE Opacity"), [1.18, 1.4], [0, 100], AEL.EASE.expoOut);
    sun = NL.circle(c, "Sun", 221 * 2 * S, C.verm, bagPt(677, 425));
    NL.pop(sun, 1.32, 0.42, 0);
    bag = NL.tile(c, IT.bag, "Bag Photo", BC, { w: 1254 * S, h: 1254 * S, round: 44 });
    AEL.key(AEL.xf(bag.media, "ADBE Opacity"), [1.7, 1.9], [0, 100], AEL.EASE.expoOut);
    AEL.key(AEL.xf(bag.card, "ADBE Opacity"), [1.7, 1.9], [0, 100], AEL.EASE.expoOut);
    AEL.key(AEL.xf(bag.ctrl, "ADBE Scale"), [1.7, c.duration], [[100, 100], [104, 104]], AEL.EASE.smooth);
}

// ====================================================================== SC02 tease (whole posts, no crop)

function sc02(c, t0) {
    var tc = AEL.comp(CONFIG.prefix + "TeaseScreen", { width: 1280, height: 720, duration: c.duration, fps: CONFIG.fps, folder: F.precomps }), l, s, tile;
    NL.gradientSolid(tc, "Screen BG", [640, 0], C.blushTop, [640, 720], C.blushMid, false);
    l = NL.mediaH(tc, IT.social1, "Social 1", [640, 360], 720); s = NL.scaleOf(l);
    AEL.key(AEL.xf(l, "ADBE Scale"), [0, 0.5], [s, [s[0] * 1.05, s[1] * 1.05]], null);
    l.outPoint = 0.5;
    l = NL.media(tc, IT.product, "Product Page", [640, 828], 900);
    AEL.key(AEL.xf(l, "ADBE Position"), [0.5, 0.96], [[640, 828], [640, 330]], AEL.EASE.smooth);
    l.inPoint = 0.5; l.outPoint = 0.96;
    l = NL.mediaH(tc, IT.motionBag, "Motion Bag", [640, 360], 720);
    l.startTime = 0.96 - 0.35; l.inPoint = 0.96; l.outPoint = 1.52;
    l = NL.mediaH(tc, IT.social2, "Social 2", [640, 360], 720); s = NL.scaleOf(l);
    AEL.key(AEL.xf(l, "ADBE Scale"), [1.52, c.duration], [s, [s[0] * 1.04, s[1] * 1.04]], null);
    l.inPoint = 1.52;
    tile = NL.tile(c, tc, "Tease Screen", [960, 615], { w: 1280, h: 720, round: 30 });
    AEL.key(AEL.xf(tile.ctrl, "ADBE Scale"), [0, 0.3, c.duration], [[92, 92], [100, 100], [102, 102]], AEL.EASE.expoOut);
}

// ====================================================================== SC03 "... in 2027" on the coral emphasis look

function sc03(c, t0) {
    var t = 6.32 - t0, el = c.layers.add(emphasisComp("2027", c.duration));
    el.name = "Emphasis BG";
    el.moveToEnd();
    NL.bigWord(c, "2027", t, { size: 250, pos: [960, 560], name: "Big 2027", ghosts: true });
}

// ====================================================================== SC04 radar (stock alpha clip or built-in)

function radarComp(dur) {
    var rc = AEL.comp(CONFIG.prefix + "Radar", { width: 900, height: 900, duration: dur, fps: CONFIG.fps, folder: F.precomps }), l, gi, r, a, verts, k, b;
    if (IT.radar) {
        l = NL.media(rc, IT.radar, "Radar (stock)", [450, 450], 900);
        l.startTime = 0;
        try {   // loop a short stock clip for the whole scene
            l.timeRemapEnabled = true;
            AEL.expr(l.property("ADBE Time Remapping"), "loopOut('cycle')");
            l.outPoint = dur;
        } catch (e) { AEL.warn("Radar loop not set: " + e); }
        return rc;
    }
    l = NL.shape(rc, "Radar Rings", [450, 450]);
    gi = NL.group(l, "Rings");
    for (r = 180; r <= 840; r += 220) { NL.ellipse(l, gi, r); }
    NL.stroke(l, gi, C.white, 2.5, 75);
    gi = NL.group(l, "Crosshair");
    NL.path(l, gi, [[-430, 0], [430, 0]]); NL.path(l, gi, [[0, -430], [0, 430]]);
    NL.stroke(l, gi, C.white, 1.5, 45);
    // sweep wedge (60 degrees), rotating
    l = NL.shape(rc, "Radar Sweep", [450, 450]);
    gi = NL.group(l, "Wedge");
    verts = [[0, 0]];
    for (k = 0; k <= 6; k++) { a = (k * 10) * Math.PI / 180; verts.push([Math.sin(a) * 420, -Math.cos(a) * 420]); }
    NL.path(l, gi, verts, true);
    NL.fill(l, gi, C.white, 30);
    AEL.expr(AEL.xf(l, "ADBE Rotate Z"), "value + time*140");
    // blips
    b = [[160, -120, 0.6], [-210, 90, 1.3], [90, 230, 2.0]];
    for (k = 0; k < b.length; k++) {
        l = NL.circle(rc, "Blip " + (k + 1), 16, C.white, [450 + b[k][0], 450 + b[k][1]]);
        AEL.expr(AEL.xf(l, "ADBE Opacity"), "var p=(time+" + b[k][2] + ")%2.6; p<0.08 ? 100 : Math.max(0, 100-(p-0.08)*120)");
    }
    return rc;
}

function sc04(c, t0) {
    var t = 9.12 - t0, p = [960, 720], rl, sun, ring, i;
    rl = c.layers.add(radarComp(c.duration));
    rl.name = "Radar";
    AEL.xf(rl, "ADBE Position").setValue(p);
    AEL.key(AEL.xf(rl, "ADBE Scale"), [7.25 - t0, 7.8 - t0], [[25, 25], [70, 70]], AEL.EASE.expoOut);
    AEL.key(AEL.xf(rl, "ADBE Opacity"), [7.25 - t0, 7.5 - t0], [0, 100], AEL.EASE.expoOut);
    for (i = 0; i < 3; i++) {
        ring = NL.shape(c, "Radar Ping " + (i + 1), p);
        NL.ellipse(ring, NL.group(ring, "Ring"), 130);
        NL.stroke(ring, 1, C.white, 4);
        AEL.key(AEL.xf(ring, "ADBE Scale"), [t + i * 0.16, t + i * 0.16 + 1.1], [[100, 100], [720, 720]], AEL.EASE.expoOut);
        AEL.key(AEL.xf(ring, "ADBE Opacity"), [t + i * 0.16, t + i * 0.16 + 1.1], [95, 0], AEL.EASE.expoOut);
    }
    sun = NL.circle(c, "Sun", 110, C.coral, p);
    NL.pop(sun, 7.3 - t0, 0.45, 0);
    AEL.key(AEL.xf(sun, "ADBE Scale"), [t, t + 0.12, t + 0.45], [[100, 100], [118, 118], [100, 100]], AEL.EASE.smooth);
}

// ====================================================================== SC05 NOON wordmark, horizon sun, process ring

function sc05(c, t0) {
    var tLogo = 11.76 - t0, logo, i, L0, p, sun, matte, bag, ring, r, k, m, s, ringStr;
    logo = NL.logo(c, "NOON Logo", [960, 560], 170, C.navy);
    for (i = 0; i < logo.letters.length; i++) {
        L0 = logo.letters[i]; p = NL.posOf(L0);
        AEL.key(AEL.xf(L0, "ADBE Position"), [tLogo + i * 0.05, tLogo + i * 0.05 + 0.45], [[p[0], p[1] + 70], p], AEL.EASE.expoOut);
        AEL.key(AEL.xf(L0, "ADBE Opacity"), [tLogo + i * 0.05, tLogo + i * 0.05 + 0.2], [0, 100], AEL.EASE.expoOut);
    }
    sun = NL.circle(c, "Sun", 135, C.verm, [0, 0]);
    matte = NL.box(c, "Sun Horizon Matte", 700, 420, 0, C.white, [0, 0]);
    sun.parent = logo.ctrl; matte.parent = logo.ctrl;
    AEL.xf(matte, "ADBE Position").setValue([0, -62 - 210]);
    AEL.key(AEL.xf(sun, "ADBE Position"), [tLogo + 0.2, tLogo + 0.75, tLogo + 1.05], [[0, 20], [0, -146], [0, -134]], AEL.EASE.smooth);
    matte.moveBefore(sun);
    AEL.trackMatte(sun, matte, TrackMatteType.ALPHA);
    NL.move(logo.ctrl, 12.4 - t0, 12.95 - t0, [960, 560], [960, 200], AEL.EASE.smooth);
    AEL.key(AEL.xf(logo.ctrl, "ADBE Scale"), [12.4 - t0, 12.95 - t0], [[170, 170], [72, 72]], AEL.EASE.smooth);
    bag = NL.tile(c, IT.bag, "Hero Bag", [960, 590], { w: 420, h: 420, round: 30 });
    NL.pop(bag.ctrl, 12.65 - t0, 0.5, 0);
    ringStr = "BRIEF → PURPOSE → DIRECTION → RULES → REVIEW → HANDOVER → ";
    ring = AEL.text(c, ringStr + ringStr, { font: NL.FONT.bold, size: 20, color: C.white, tracking: 120, justify: "left", name: "Process Ring" });
    NL.shadow(ring, 50, 2, 12);
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

// ====================================================================== step cards row (reused)

var STEPS = [
    ["01", "Professional\rdirection", "doc", 17.04],
    ["02", "Clear\rpurpose", "target", 20.24],
    ["03", "Design\rrules", "rules", 23.92],
    ["04", "Across\revery format", "formats", 27.60],
    ["05", "Check the\rgoals", "check", 32.08],
    ["06", "Hand over\ra system", "folder", 34.64]
];
function stepX(i) { return 960 + (i - 2.5) * 312; }

// animT0 >= 0: cards pop on their lines (scene start = animT0). animT0 < 0: static row; o.active = index to
// highlight (others dimmed), o.done = indices that get a white check badge.
function buildStepsRow(name, dur, animT0, o) {
    var rc = AEL.comp(CONFIG.prefix + name, { width: CONFIG.width, height: CONFIG.height, duration: dur, fps: CONFIG.fps, folder: F.precomps }), i, card, line, gi, tl, hl, badge, tick;
    o = o || {};
    if (animT0 >= 0) {
        line = NL.shape(rc, "Connector", [0, 0]);
        gi = NL.group(line, "Line");
        NL.path(line, gi, [[stepX(0), 760], [stepX(5), 760]]);
        NL.stroke(line, gi, C.white, 5);
        tl = NL.trim(line, gi);
        AEL.key(tl.property("ADBE Vector Trim End"), [37.44 - animT0, 38.1 - animT0], [0, 100], AEL.EASE.expoOut);
    }
    for (i = 0; i < STEPS.length; i++) {
        card = NL.card(rc, STEPS[i][0], STEPS[i][1], STEPS[i][2], [stepX(i), 760], IT.icons[i]);
        if (animT0 >= 0) {
            NL.pop(card, STEPS[i][3] + 0.1 - animT0, 0.5, 0.55);
            groupFade(rc, "Card " + STEPS[i][0], STEPS[i][3] + 0.1 - animT0, 0.2, 0, 100);
            NL.move(card, STEPS[i][3] + 0.1 - animT0, STEPS[i][3] + 0.6 - animT0, [stepX(i), 820], [stepX(i), 760], AEL.EASE.expoOut);
            AEL.key(AEL.xf(card, "ADBE Scale"), [37.44 - animT0 + i * 0.06, 37.6 - animT0 + i * 0.06, 37.85 - animT0 + i * 0.06], [[100, 100], [108, 108], [100, 100]], AEL.EASE.smooth);
        } else if (o.active !== undefined && i !== o.active && !AEL.contains(o.done || [], i)) {
            groupOpacity(rc, "Card " + STEPS[i][0], 45);
        }
    }
    if (animT0 < 0 && o.active !== undefined) {
        hl = NL.box(rc, "Active Outline", 312, 140, 34, C.white, [stepX(o.active), 760], 0);
        NL.stroke(hl, 1, C.white, 4);
    }
    for (i = 0; o.done && i < o.done.length; i++) {
        badge = NL.circle(rc, "Done Badge " + (o.done[i] + 1), 40, C.white, [stepX(o.done[i]) + 140, 760 - 56]);
        tick = NL.icon(rc, "tick", "Done Tick " + (o.done[i] + 1), C.coral);
        AEL.xf(tick, "ADBE Position").setValue([stepX(o.done[i]) + 140, 760 - 56]);
        AEL.xf(tick, "ADBE Scale").setValue([75, 75]);
        if (o.doneAt !== undefined) { NL.pop(badge, o.doneAt, 0.45, 0); NL.pop(tick, o.doneAt + 0.05, 0.45, 0); }
    }
    return rc;
}

function sc06(c, t0) {
    var row = buildStepsRow("StepsRow", c.duration, t0), rl, thumbs, i, tile, t;
    rl = c.layers.add(row);
    rl.name = "Steps Row";
    AEL.key(AEL.xf(rl, "ADBE Opacity"), [38.55 - t0, 38.95 - t0], [100, 0], AEL.EASE.expoIn);
    AEL.key(AEL.xf(rl, "ADBE Position"), [38.55 - t0, 38.95 - t0], [[960, 540], [960, 600]], AEL.EASE.expoIn);
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
        NL.shadow(l, 60, 16, 50);
        AEL.key(AEL.xf(l, "ADBE Position"), [t, t + 0.5, tBring, tBring + 0.6, tWork, tWork + 0.55],
            [[d[2][0], d[2][1] + 160], d[2], d[2], [stack[0] + d[6][0], stack[1] + d[6][1]], [stack[0] + d[6][0], stack[1] + d[6][1]], [stack[0] + d[6][0] - 330, stack[1] + d[6][1]]], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Rotate Z"), [t, t + 0.5, tBring, tBring + 0.6], [d[3] * 3, d[3], d[3], d[7]], AEL.EASE.expoOut);
        AEL.key(AEL.xf(l, "ADBE Opacity"), [t, t + 0.2], [0, 100], AEL.EASE.expoOut);
        pill = NL.pill(c, "Pill " + d[5], d[5], [d[2][0], d[2][1] - 285], { size: 18 });
        NL.pop(pill, t + 0.2, 0.4, 0);
        groupFade(c, "Pill " + d[5], tBring - 0.1, 0.2, 100, 0);
    }
    panel = NL.ctrl(c, "Towards Panel", [2400, 640]);
    bg = NL.box(c, "Towards Panel BG", 620, 380, 30, C.paper, [0, 0]);
    NL.shadow(bg, 60, 18, 60);
    title = AEL.text(c, "DESIGNING TOWARDS", { font: NL.FONT.bold, size: 22, color: C.coral, tracking: 140, justify: "left", name: "Towards Panel Title" });
    bg.parent = panel; title.parent = panel;
    AEL.xf(bg, "ADBE Position").setValue([0, 0]);
    AEL.xf(title, "ADBE Anchor Point").setValue([title.sourceRectAtTime(0, false).left, 0]);
    AEL.xf(title, "ADBE Position").setValue([-260, -120]);
    NL.move(panel, tWork + 0.2, tWork + 0.8, [2400, 640], [1290, 640], AEL.EASE.expoOut);
    bullets = ["Energy without the noise", "Creative focus, not hustle", "Calm info + one moment of energy"];
    for (i = 0; i < bullets.length; i++) {
        t = tWork + 0.9 + i * 0.4;
        b = AEL.text(c, bullets[i], { font: NL.FONT.cap, size: 30, color: C.ink, justify: "left", name: "Towards Panel Bullet " + (i + 1) });
        dot = NL.circle(c, "Towards Panel Dot " + (i + 1), 12, C.coral, [0, 0]);
        b.parent = panel; dot.parent = panel;
        AEL.xf(b, "ADBE Anchor Point").setValue([b.sourceRectAtTime(0, false).left, -11]);
        AEL.xf(b, "ADBE Position").setValue([-228, -40 + i * 70]);
        AEL.xf(dot, "ADBE Position").setValue([-252, -40 + i * 70]);
        NL.slideIn(b, t, 0.4, 30, 0);
        NL.pop(dot, t, 0.35, 0);
    }
    arrow = NL.shape(c, "Arrow", [810, 400]);
    gi = NL.group(arrow, "Curve");
    NL.path(arrow, gi, [[-110, 40], [150, 30]], false, [[0, 0], [-60, -90]], [[40, -110], [0, 0]]);
    NL.path(arrow, gi, [[132, 14], [150, 30], [128, 40]], false);
    NL.stroke(arrow, gi, C.white, 4);
    tr = NL.trim(arrow, gi);
    AEL.key(tr.property("ADBE Vector Trim End"), [tWork + 0.6, tWork + 1.1], [0, 100], AEL.EASE.expoOut);
    fadeComp(c, 51.95 - t0, 0.3);
}

// ====================================================================== SC08 first stage, neat way, tag team, POWERHOUSE

function sc08(c, t0) {
    var row, rl, pill, sp, i, team, bg, slot, q, x, el, wipe, glow, stars;
    row = buildStepsRow("StepsRow_Stage1", c.duration, -1, { active: 0 });
    rl = c.layers.add(row);
    rl.name = "Steps Row (stage 1)";
    AEL.xf(rl, "ADBE Position").setValue([960, 470]);
    AEL.key(AEL.xf(rl, "ADBE Opacity"), [52.45 - t0, 52.75 - t0, 54.6 - t0, 54.85 - t0], [0, 100, 100, 0], AEL.EASE.expoOut);
    AEL.key(AEL.xf(rl, "ADBE Scale"), [52.45 - t0, 52.85 - t0], [[94, 94], [100, 100]], AEL.EASE.expoOut);
    pill = NL.pill(c, "Pill Stage", "STAGE 01 / 06", [stepX(0), 600], { size: 18 });
    NL.pop(pill, 53.36 - t0, 0.4, 0);
    groupFade(c, "Pill Stage", 54.6 - t0, 0.25, 100, 0);
    stars = [[1265, 380, 34, 0], [1318, 432, 18, 0.08], [1226, 398, 13, 0.14]];
    for (i = 0; i < stars.length; i++) {
        sp = NL.shape(c, "Sparkle " + (i + 1), [stars[i][0], stars[i][1]]);
        NL.star(sp, NL.group(sp, "Star"), stars[i][2], stars[i][2] * 0.26);
        NL.fill(sp, 1, C.white);
        NL.shadow(sp, 50, 2, 12);
        NL.pop(sp, 55.52 - t0 + stars[i][3], 0.45, 0);
        AEL.key(AEL.xf(sp, "ADBE Rotate Z"), [55.52 - t0, 57.2 - t0], [-30, 30], AEL.EASE.smooth);
        NL.fadeOut(sp, 57.15 - t0, 0.2);
    }
    team = NL.ctrl(c, "Tag Team", [960, 660]);
    bg = NL.box(c, "Tag Team BG", 760, 230, 44, C.paper, [0, 0]);
    NL.shadow(bg, 60, 18, 60);
    bg.parent = team; AEL.xf(bg, "ADBE Position").setValue([0, 0]);
    for (i = 0; i < 2; i++) {
        x = i ? 210 : -210;
        slot = NL.box(c, "Tag Team Slot " + (i + 1), 150, 150, 34, C.blushTop, [0, 0]);
        NL.stroke(slot, 1, C.coral, 2, 60);
        q = AEL.text(c, "?", { font: NL.FONT.black, size: 70, color: C.coralLight, name: "Tag Team Slot " + (i + 1) + " ?" });
        slot.parent = team; q.parent = team;
        AEL.xf(slot, "ADBE Position").setValue([x, 0]);
        AEL.xf(q, "ADBE Position").setValue([x, 0]);
        NL.pop(slot, 58.95 - t0 + i * 0.1, 0.4, 0);
    }
    x = AEL.text(c, "×", { font: NL.FONT.med, size: 90, color: C.coral, name: "Tag Team X" });
    x.parent = team; AEL.xf(x, "ADBE Position").setValue([0, 0]);
    NL.pop(team, 58.8 - t0, 0.45, 0.6);
    groupFade(c, "Tag Team", 58.8 - t0, 0.2, 0, 100);
    NL.move(team, 58.8 - t0, 59.2 - t0, [1360, 660], [960, 660], AEL.EASE.expoOut);
    // Coral emphasis wipes in (Linear Wipe on the emphasis comp layer), then POWERHOUSE.
    el = c.layers.add(emphasisComp("Power", c.duration));
    el.name = "Emphasis BG (wipe)";
    wipe = AEL.effect(el, "ADBE Linear Wipe", "Wipe In");
    try {
        AEL.key(wipe.property("ADBE Linear Wipe-0001"), [59.45 - t0, 59.95 - t0], [100, 0], AEL.EASE.expoOut);
        wipe.property("ADBE Linear Wipe-0002").setValue(270);
        wipe.property("ADBE Linear Wipe-0003").setValue(160);
    } catch (e) { AEL.warn("Linear Wipe params: " + e); }
    glow = NL.glow(c, "Power", 620, C.white, [960, 540], 150, 0);
    AEL.key(AEL.xf(glow, "ADBE Opacity"), [61.3 - t0, 61.6 - t0], [0, 60], AEL.EASE.expoOut);
    AEL.key(AEL.xf(glow, "ADBE Scale"), [61.3 - t0, 62.2 - t0], [[60, 60], [100, 100]], AEL.EASE.expoOut);
    NL.bigWord(c, "POWERHOUSE", 61.36 - t0, { size: 190, pos: [960, 545], tracking: -10, name: "Big POWERHOUSE", ghosts: true });
}

// ====================================================================== SC09 brief saved with the project (files UI)

function sc09(c, t0) {
    var win, tiles, i, tl, x, nb, toast, row, rl, pill, t;
    win = UI.window(c, "Files Window", [960, 610], 1320, 680, "NOON  ›  High Sun");
    NL.move(win.ctrl, L(63.45, t0), L(64.05, t0), [960, 1500], [960, 610], AEL.EASE.expoOut);
    tiles = [[null, "Package Designs", "Folder · 3 items"], [IT.docBrief, "NOON_Client_Brief.pdf", "PDF · 75 KB"],
             [IT.docResearch, "NOON_Audience_Research.pdf", "PDF · 77 KB"], [IT.docNotes, "NOON_Discovery…Notes.docx", "DOCX · 40 KB"]];
    for (i = 0; i < tiles.length; i++) {
        x = -460 + i * 230;
        tl = UI.fileTile(c, "File " + (i + 1), tiles[i][0], tiles[i][1], tiles[i][2]);
        tl.parent = win.ctrl;
        AEL.xf(tl, "ADBE Position").setValue([x, -40]);
    }
    // the new, clearer brief lands in the folder
    nb = UI.fileTile(c, "File New Brief", null, "NOON_Creative_Brief.pdf", "PDF · just now", UI.briefThumb(c, "File New Brief"));
    nb.parent = win.ctrl;
    AEL.key(AEL.xf(nb, "ADBE Position"), [L(65.3, t0), L(65.85, t0)], [[460, -420], [460, -40]], AEL.EASE.expoOut);
    AEL.key(AEL.xf(nb, "ADBE Scale"), [L(65.3, t0), L(65.7, t0), L(65.95, t0)], [[0, 0], [108, 108], [100, 100]], AEL.EASE.smooth);
    toast = UI.toast(c, "Toast Saved", "Saved to NOON › High Sun", [960, 1000]);
    NL.pop(toast, L(66.4, t0), 0.45, 0);
    groupFade(c, "Toast Saved", L(66.4, t0), 0.2, 0, 100);
    // window leaves, stage row with check
    AEL.key(AEL.xf(win.ctrl, "ADBE Position"), [L(67.55, t0), L(68.0, t0)], [[960, 610], [960, 1600]], AEL.EASE.expoIn);
    groupFade(c, "Toast Saved", L(67.5, t0), 0.25, 100, 0);
    row = buildStepsRow("StepsRow_Done1", c.duration, -1, { active: 0, done: [0], doneAt: L(69.28, t0) });
    rl = c.layers.add(row);
    rl.name = "Steps Row (stage 1 done)";
    AEL.key(AEL.xf(rl, "ADBE Opacity"), [L(67.9, t0), L(68.2, t0), L(74.05, t0), L(74.35, t0)], [0, 100, 100, 0], AEL.EASE.expoOut);
    AEL.key(AEL.xf(rl, "ADBE Scale"), [L(67.9, t0), L(68.3, t0), L(69.76, t0), L(69.9, t0), L(70.1, t0)], [[94, 94], [100, 100], [100, 100], [102, 102], [100, 100]], AEL.EASE.smooth);
    pill = NL.pill(c, "Pill Complete", "STAGE 01 COMPLETE", [stepX(0) + 40, 640], { size: 18, bg: C.white, color: C.coral });
    t = L(70.32, t0);
    NL.pop(pill, t, 0.45, 0);
    groupFade(c, "Pill Complete", t, 0.2, 0, 100);
    groupFade(c, "Pill Complete", L(74.0, t0), 0.25, 100, 0);
}

// ====================================================================== SC10 plan how people encounter it (stage 02)

function sc10(c, t0) {
    var row = buildStepsRow("StepsRow_Stage2", c.duration, -1, { active: 1, done: [0] }), rl, pill;
    rl = c.layers.add(row);
    rl.name = "Steps Row (stage 2)";
    AEL.key(AEL.xf(rl, "ADBE Opacity"), [0, 0.3, c.duration - 0.35, c.duration - 0.05], [0, 100, 100, 0], AEL.EASE.expoOut);
    pill = NL.pill(c, "Pill Stage2", "STAGE 02 · CLEAR PURPOSE", [stepX(1) + 40, 640], { size: 18, bg: C.white, color: C.coral });
    NL.pop(pill, L(77.12, t0), 0.45, 0);
    groupFade(c, "Pill Stage2", L(77.12, t0), 0.2, 0, 100);
}

// ====================================================================== SC11 meeting notes document + highlighter

function sc11(c, t0) {
    var win = UI.window(c, "Notes Window", [960, 640], 1240, 800, "NOON_Discovery_Meeting_Notes.docx"), page, i, ln, r, hl, hlT, pen, penKeysT = [], penKeysV = [], chip, x0 = -540;
    NL.move(win.ctrl, L(80.2, t0), L(80.8, t0), [960, 1550], [960, 640], AEL.EASE.expoOut);
    page = NL.ctrl(c, "Page Content", [0, 0]);
    page.parent = win.ctrl;
    AEL.xf(page, "ADBE Position").setValue([0, 0]);
    function put(layer, y) { layer.parent = page; AEL.xf(layer, "ADBE Position").setValue([x0, y]); return layer; }
    put(UI.leftText(c, "Doc Title", "NOON Discovery Meeting Notes", 34, C.ink, NL.FONT.bold), -290);
    put(UI.leftText(c, "Doc Meta", "8 September 2026  ·  Brand and launch discovery  ·  Working notes", 17, C.inkSoft, NL.FONT.reg), -246);
    var heading = put(UI.leftText(c, "Doc Heading", "The main disagreement", 26, C.ink, NL.FONT.bold), -186);
    // [text, y, highlight start, end, person chip, chip text]
    var lines = [
        ["Maya wants the brand to feel quiet, premium and controlled.", -130, 84.64, 87.9, "MAYA · FOUNDER"],
        ["Alex believes the launch needs much more colour and immediate energy", -86, 88.32, 90.2, "ALEX · MARKETING"],
        ["to stop people scrolling.", -52, 90.2, 90.9, ""],
        ["Jo is concerned that an overly abstract campaign could make the product", -8, 91.36, 93.4, "JO · SALES"],
        ["category unclear, especially if customers first see the work at a distance.", 26, 93.4, 94.9, ""],
        ["Sam: “The answer may not be choosing calm or loud. The system could hold calm", 96, 97.44, 99.6, "SAM · CREATIVE"],
        ["information and one unmistakable moment of energy.”", 130, 99.6, 101.6, ""]
    ];
    // heading highlight on "main disagreement"
    lines.unshift(["", -186, 83.04, 83.9, ""]);
    for (i = 0; i < lines.length; i++) {
        if (lines[i][0]) { ln = put(UI.leftText(c, "Doc Line " + i, lines[i][0], 22, C.ink, NL.FONT.reg), lines[i][1]); r = ln.sourceRectAtTime(0, false); }
        else { ln = null; r = { width: 300 }; }
        hl = NL.box(c, "Highlight " + i, r.width + 16, 32, 6, i >= 6 ? C.coral : "#F9B5B3", [0, 0], i >= 6 ? 45 : 80);
        AEL.xf(hl, "ADBE Anchor Point").setValue([-(r.width + 16) / 2, 0]);
        hl.parent = page;
        AEL.xf(hl, "ADBE Position").setValue([x0 - 8, lines[i][1]]);
        hl.moveAfter(ln || heading);   // directly beneath its text, above the window panel
        hlT = [L(lines[i][2], t0), L(lines[i][3], t0)];
        AEL.key(AEL.xf(hl, "ADBE Scale"), hlT, [[0, 100], [100, 100]], null);
        penKeysT.push(hlT[0], hlT[1]);
        penKeysV.push([x0 - 8, lines[i][1]], [x0 + r.width + 8, lines[i][1]]);
        if (lines[i][4]) {
            chip = NL.pill(c, "Chip " + i, lines[i][4], [0, 0], { size: 14 });
            chip.parent = page;
            AEL.xf(chip, "ADBE Position").setValue([470, lines[i][1]]);
            NL.pop(chip, hlT[0], 0.4, 0);
            groupFade(c, "Chip " + i, hlT[0], 0.2, 0, 100);
        }
    }
    // highlighter pen travelling with each stroke
    pen = NL.shape(c, "Highlighter Pen", [0, 0]);
    NL.rect(pen, NL.group(pen, "Body"), 20, 74, 7, [0, -50]); NL.fill(pen, 1, C.coralDeep);
    NL.rect(pen, NL.group(pen, "Tip"), 20, 16, 3, [0, -6]); NL.fill(pen, 2, C.ink);
    AEL.xf(pen, "ADBE Rotate Z").setValue(28);
    pen.parent = page;
    AEL.key(AEL.xf(pen, "ADBE Position"), penKeysT, penKeysV, null);
    AEL.key(AEL.xf(pen, "ADBE Opacity"), [L(82.9, t0), L(83.1, t0), L(101.7, t0), L(101.9, t0)], [0, 100, 100, 0], AEL.EASE.smooth);
    // "just below that": scroll the page up a little to centre Sam's note
    NL.move(page, L(96.3, t0), L(96.9, t0), [0, 0], [0, -70], AEL.EASE.smooth);
    fadeComp(c, L(101.85, t0), 0.28);
}

// ====================================================================== SC12 all over the place -> sorted

function sc12(c, t0) {
    var notes = [["MAYA", "Quiet &\rpremium"], ["ALEX", "More colour\r& energy"], ["JO", "Clearly\rcoffee"], ["SAM", "Calm info + one\rmoment of energy"]];
    var chaos = [[560, 520, -14], [1370, 470, 11], [720, 830, 9], [1240, 820, -8]], i, ctrl, bg, nm, tx, neatX, tIn, tChaos = L(106.16, t0), tSnap = L(109.9, t0), line, gi, tr;
    for (i = 0; i < notes.length; i++) {
        neatX = 960 + (i - 1.5) * 380;
        tIn = L(102.4, t0) + i * 0.18;
        ctrl = NL.ctrl(c, "Note " + notes[i][0], [chaos[i][0], chaos[i][1]]);
        bg = NL.box(c, "Note " + notes[i][0] + " Card", 340, 200, 24, C.paper, [0, 0]);
        NL.shadow(bg, 60, 16, 50);
        nm = NL.pill(c, "Note " + notes[i][0] + " Name", notes[i][0], [0, 0], { size: 15 });
        tx = AEL.text(c, notes[i][1], { font: NL.FONT.bold, size: 30, color: C.ink, leading: 36, name: "Note " + notes[i][0] + " Text" });
        UI.attach(ctrl, [[bg, [0, 0]], [nm, [0, -62]], [tx, [0, 22]]]);
        NL.pop(ctrl, tIn, 0.45, 0);
        groupFade(c, "Note " + notes[i][0], tIn, 0.2, 0, 100);
        AEL.key(AEL.xf(ctrl, "ADBE Rotate Z"), [tIn, tSnap, tSnap + 0.5], [chaos[i][2], chaos[i][2], 0], AEL.EASE.expoOut);
        AEL.key(AEL.xf(ctrl, "ADBE Position"), [tSnap, tSnap + 0.55], [[chaos[i][0], chaos[i][1]], [neatX, 640]], AEL.EASE.expoOut);
        // chaotic jitter only while "all over the place and chaotic" is said
        AEL.expr(AEL.xf(ctrl, "ADBE Position"), "var a=(time>" + tChaos + "&&time<" + tSnap + ")?1:0; add(value, mul(sub(wiggle(5,22), value), a))");
        AEL.expr(AEL.xf(ctrl, "ADBE Rotate Z"), "var a=(time>" + tChaos + "&&time<" + tSnap + ")?1:0; value + (wiggle(5,6) - value) * a");
    }
    line = NL.shape(c, "Sorted Line", [0, 0]);
    gi = NL.group(line, "Line");
    NL.path(line, gi, [[960 - 1.5 * 380 - 170, 780], [960 + 1.5 * 380 + 170, 780]]);
    NL.stroke(line, gi, C.white, 5);
    tr = NL.trim(line, gi);
    AEL.key(tr.property("ADBE Vector Trim End"), [L(111.92, t0), L(112.5, t0)], [0, 100], AEL.EASE.expoOut);
    fadeComp(c, L(112.55, t0), 0.3);
}

// ====================================================================== SC13 PROFESSIONAL (emphasis)

function sc13(c, t0) {
    var el = c.layers.add(emphasisComp("Pro", c.duration)), hlv;
    el.name = "Emphasis BG";
    el.moveToEnd();
    hlv = AEL.text(c, "HIGH-LEVEL", { font: NL.FONT.bold, size: 30, color: C.white, tracking: 400, name: "Label HIGH-LEVEL" });
    AEL.xf(hlv, "ADBE Position").setValue([960, 330]);
    NL.slideIn(hlv, L(116.0, t0), 0.4, 0, 20);
    NL.bigWord(c, "PROFESSIONAL", L(116.64, t0), { size: 175, pos: [960, 545], tracking: -15, name: "Big PROFESSIONAL", ghosts: true });
}

// ====================================================================== SC14 three touchpoints: phone, browser, bag (blurred, revealed soon)

function sc14(c, t0) {
    var dur = c.duration, feed, fl, y, k, items, phone, pb, soon, web, wc, bagc, bagT, badges, labels, i, b, lb, tMap, line, gi, tr;
    // phone feed precomp (stacked designs) - blurred as a comp layer (house rule)
    feed = AEL.comp(CONFIG.prefix + "PhoneFeed", { width: 280, height: 1360, duration: dur, fps: CONFIG.fps, folder: F.precomps, bg: C.white });
    items = [IT.social1, IT.product, IT.bag, IT.social2]; y = 0;
    for (k = 0; k < items.length; k++) {
        fl = NL.media(feed, items[k], "Feed " + (k + 1), [140, 0], 280);
        AEL.xf(fl, "ADBE Position").setValue([140, y + 280 * items[k].height / items[k].width / 2]);
        y += 280 * items[k].height / items[k].width;
    }
    phone = UI.phone(c, "Phone", [960, 620], 560, feed);
    AEL.key(AEL.xf(phone.content, "ADBE Position"), [L(119.4, t0), L(127.8, t0)], [[0, 400], [0, -400]], AEL.EASE.smooth);
    pb = NL.blurFx(phone.content, 26);
    soon = NL.pill(c, "Pill Soon", "REVEALED SOON", [0, 0], { size: 17 });
    UI.attach(phone.ctrl, [[soon, [0, -200]]]);
    NL.pop(soon, L(121.76, t0), 0.45, 0);
    groupFade(c, "Pill Soon", L(121.76, t0), 0.2, 0, 100);
    NL.move(phone.ctrl, L(119.15, t0), L(119.75, t0), [960, 1500], [960, 620], AEL.EASE.expoOut);
    // "map three different points": phone moves left, browser + pack join
    tMap = L(122.6, t0);
    AEL.key(AEL.xf(phone.ctrl, "ADBE Position"), [tMap, tMap + 0.55], [[960, 620], [430, 600]], AEL.EASE.expoOut);
    AEL.key(AEL.xf(phone.ctrl, "ADBE Scale"), [tMap, tMap + 0.55], [[100, 100], [92, 92]], AEL.EASE.expoOut);
    wc = coverComp("BlurProductPage", IT.product, 720, 1300, dur);
    web = UI.browser(c, "Browser", [1010, 590], 720, 470, wc, "noon › high-sun");
    AEL.key(AEL.xf(web.content, "ADBE Position"), [L(122.6, t0), L(129.5, t0)], [[0, 300], [0, -150]], AEL.EASE.smooth);
    NL.blurFx(web.content, 22);
    NL.move(web.ctrl, L(123.3, t0), L(123.85, t0), [1010, 1500], [1010, 590], AEL.EASE.expoOut);
    bagc = coverComp("BlurBag", IT.bag, 330, 470, dur);
    bagT = NL.tile(c, bagc, "Pack", [1570, 590], { w: 330, h: 470, round: 30 });
    NL.blurFx(bagT.media, 18);
    NL.move(bagT.ctrl, L(123.7, t0), L(124.25, t0), [1570, 1500], [1570, 590], AEL.EASE.expoOut);
    // numbered journey: badges + labels + connecting line
    badges = [[430, 290, W(371)], [700, 340, W(372) + 0.3], [1430, 340, W(374)]];
    labels = [["Social post", 430, 930], ["Product page", 1010, 870], ["Packaging", 1570, 870]];
    line = NL.shape(c, "Journey Line", [0, 0]);
    gi = NL.group(line, "Line");
    NL.path(line, gi, [[430, 290], [700, 340], [1430, 340]], false);
    NL.stroke(line, gi, C.white, 3, 90);
    tr = NL.trim(line, gi);
    AEL.key(tr.property("ADBE Vector Trim End"), [L(124.1, t0), L(124.9, t0)], [0, 100], AEL.EASE.expoOut);
    for (i = 0; i < 3; i++) {
        b = NL.circle(c, "Badge " + (i + 1), 56, C.coral, [badges[i][0], badges[i][1]]);
        NL.shadow(b, 60, 6, 20);
        lb = AEL.text(c, String(i + 1), { font: NL.FONT.black, size: 28, color: C.white, name: "Badge " + (i + 1) + " No." });
        AEL.xf(lb, "ADBE Position").setValue([badges[i][0], badges[i][1]]);
        NL.pop(b, L(badges[i][2], t0), 0.45, 0);
        NL.pop(lb, L(badges[i][2], t0) + 0.05, 0.45, 0);
        lb = AEL.text(c, labels[i][0], { font: NL.FONT.cap, size: 30, color: C.white, name: "Label " + labels[i][0] });
        NL.shadow(lb, 50, 2, 14);
        AEL.xf(lb, "ADBE Position").setValue([labels[i][1], labels[i][2]]);
        NL.slideIn(lb, L(badges[i][2], t0) + 0.15, 0.4, 0, 16);
    }
}

// Run last, so every top-level var above (STEPS, CONFIG...) is initialised first.
AEL.run($.fileName, "NOON test v2 build", main);
