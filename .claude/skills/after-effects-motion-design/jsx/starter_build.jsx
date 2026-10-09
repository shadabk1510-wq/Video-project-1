// starter_build.jsx - CONFIG-driven starter for a native, editable AE build.
// Copy this file and ae_lib.jsx into <project>/ae/scripts/, rename, then edit CONFIG and buildSection().
// Run: File > Scripts > Run Script File...  (or scripts/run_jsx.sh in live mode)
// Output: folders, a brand control rig, one comp per section with kinetic type + accent bar,
// a MAIN comp with section markers, optional VO + reference guide layer, an incremental .aep save,
// and <this file>.result.json describing what happened.
#include "ae_lib.jsx"

var CONFIG = {
    prefix: "PRJ",                       // prefixes every comp this script owns
    rebuild: false,                      // true = delete and rebuild comps owned by this script
    comp: { width: 1920, height: 1080, fps: 25, bg: "#0E0E10" },
    brand: {
        primary: "#FFD400", text: "#FFFFFF", bg: "#0E0E10",
        fontTitle: "ArialMT", fontBody: "ArialMT",   // PostScript names; check probe_env.result.json
        titleSize: 120, bodySize: 48, margin: 120
    },
    motion: { inDur: 0.8, outDur: 0.4, stagger: 0.12 },
    // Seconds on the MAIN timeline. Fill from docs/timing.json (VO speech segments).
    sections: [
        { id: "S01", title: "Headline One", body: "Supporting line", start: 0, end: 4 },
        { id: "S02", title: "Headline Two", body: "Another supporting line", start: 4, end: 8 }
    ],
    voiceover: "",                        // e.g. "../../assets/_ae/vo.wav" (relative to this script)
    reference: "",                        // e.g. "../../assets/_ae/reference.mov" (guide layer, not rendered)
    save: { dir: "..", name: "PRJ_build" },   // relative to this script; never overwrites
    renderPreview: ""                     // e.g. "../../renders/previews/PRJ_main.mp4" (queued, not started)
};

AEL.run($.fileName, CONFIG.prefix + " build", function () {
    var F = AEL.standardFolders(), C = CONFIG, B = C.brand, i, s, main, ctrl, secComp, layer, bg, total = 0, names = [];

    for (i = 0; i < C.sections.length; i++) {
        names.push(C.prefix + "_" + C.sections[i].id);
        if (C.sections[i].end > total) { total = C.sections[i].end; }
    }
    if (C.rebuild) {
        AEL.removeOwned([C.prefix + "_MAIN"], F.main);
        AEL.removeOwned(names, F.sections);
        AEL.removeOwned([C.prefix + "_CTRL"], F.controls);
    }

    ctrl = buildControls(F);
    main = AEL.comp(C.prefix + "_MAIN", { width: C.comp.width, height: C.comp.height, duration: total, fps: C.comp.fps, folder: F.main, bg: B.bg, motionBlur: true });
    bg = AEL.solid(main, B.bg, "BG");

    for (i = 0; i < C.sections.length; i++) {
        s = C.sections[i];
        secComp = buildSection(s, F);
        layer = AEL.place(main, secComp, s.start, s.end, s.id);
        layer.moveToBeginning();
        AEL.compMarker(main, s.start, s.id + " " + s.title, s.end - s.start);
        // Exit: fade the section out over its last outDur seconds (editable keys on the MAIN timeline).
        AEL.key(AEL.xf(layer, "ADBE Opacity"), [s.end - C.motion.outDur, s.end], [100, 0], AEL.EASE.expoIn);
    }

    if (C.voiceover) {
        layer = main.layers.add(AEL.importFile(AEL.rel($.fileName, C.voiceover), F.audio));
        layer.name = "VO";
        layer.moveToEnd();
    }
    if (C.reference) {
        layer = main.layers.add(AEL.importFile(AEL.rel($.fileName, C.reference), F.reference));
        layer.name = "REF (guide)";
        layer.guideLayer = true;
        if (layer.hasAudio) { layer.audioEnabled = false; }
        AEL.xf(layer, "ADBE Opacity").setValue(50);
        layer.moveToEnd();
    }

    bg.moveToEnd();
    bg.locked = true;
    if (AEL.missingFootage().length) { AEL.warn("Missing footage: " + AEL.missingFootage().join(", ")); }
    main.openInViewer();
    if (C.renderPreview) { AEL.queueRender(main, AEL.rel($.fileName, C.renderPreview), "H.264 - Match Render Settings - 15 Mbps"); }
    if (C.save) { AEL.saveIncremental(AEL.rel($.fileName, C.save.dir), C.save.name); }
});

// Brand rig: one null with named Color Controls. Layers link to it by expression, so a colour
// change in one place updates the whole project.
function buildControls(F) {
    var c = AEL.comp(CONFIG.prefix + "_CTRL", { width: 100, height: 100, duration: 1, fps: CONFIG.comp.fps, folder: F.controls }), n, fx;
    n = AEL.nullLayer(c, "Brand");
    fx = AEL.effect(n, "ADBE Color Control", "Primary");
    fx.property("ADBE Color Control-0001").setValue(AEL.rgba(CONFIG.brand.primary));
    fx = AEL.effect(n, "ADBE Color Control", "Text");
    fx.property("ADBE Color Control-0001").setValue(AEL.rgba(CONFIG.brand.text));
    return c;
}

function brandColorExpr(name) {
    return "comp(\"" + CONFIG.prefix + "_CTRL\").layer(\"Brand\").effect(\"" + name + "\")(1)";
}

// One section = one comp. Edit this to change the look; keep everything named and keyframed.
function buildSection(s, F) {
    var C = CONFIG, B = C.brand, M = C.motion, dur = s.end - s.start, c, title, body, bar, barW, x0, y0, fill;
    c = AEL.comp(C.prefix + "_" + s.id, { width: C.comp.width, height: C.comp.height, duration: dur, fps: C.comp.fps, folder: F.sections, motionBlur: true });
    x0 = B.margin;
    y0 = C.comp.height / 2;

    title = AEL.text(c, s.title, { font: B.fontTitle, size: B.titleSize, color: B.text, justify: "left", name: "Title" });
    AEL.xf(title, "ADBE Anchor Point").setValue([0, 0]);          // baseline-left anchor for layout
    AEL.xf(title, "ADBE Position").setValue([x0, y0]);
    title.motionBlur = true;
    AEL.textReveal(title, { start: 0.1, duration: M.inDur, basedOn: "characters", y: 60, wave: true, waveWidth: 35 });

    // Accent bar: grows from its left edge. Fill colour is linked to the brand rig.
    barW = 240;
    bar = AEL.rect(c, { w: barW, h: 12, color: B.primary, name: "Accent Bar" });
    AEL.xf(bar, "ADBE Anchor Point").setValue([-barW / 2, 0]);
    AEL.xf(bar, "ADBE Position").setValue([x0, y0 + 40]);
    AEL.expr(bar.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group")
        .property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color"), brandColorExpr("Primary"));
    AEL.key(AEL.xf(bar, "ADBE Scale"), [0.1 + M.stagger, 0.1 + M.stagger + M.inDur], [[0, 100], [100, 100]], AEL.EASE.expoOut);
    bar.motionBlur = true;

    if (s.body) {
        body = AEL.text(c, s.body, { font: B.fontBody, size: B.bodySize, color: B.text, justify: "left", name: "Body" });
        AEL.xf(body, "ADBE Anchor Point").setValue([0, 0]);
        AEL.xf(body, "ADBE Position").setValue([x0, y0 + 120]);
        // Text colour via a Fill effect linked to the rig (keeps the TextDocument untouched).
        fill = AEL.effect(body, "ADBE Fill", "Brand Fill");
        try { AEL.expr(fill.property("ADBE Fill-0002"), brandColorExpr("Text")); } catch (e) { AEL.warn("Fill colour link skipped: " + e); }
        AEL.textReveal(body, { start: 0.1 + 2 * M.stagger, duration: M.inDur, basedOn: "words", y: 30 });
    }
    return c;
}
