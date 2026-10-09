// build_noon3.jsx - NOON v3 as native, editable After Effects layers.
// Run: File > Scripts > Run Script File... (Preferences > Scripting & Expressions > "Allow Scripts to Write Files" on).
// Builds one comp per clip (NOON3 01 ... NOON3 12) and NOON3_MAIN (130 s) with the voice-over, background,
// SFX/insert markers and the reference render as a guide layer. Saves NOON3.aep next to the assets folder.
#include "ae_lib.jsx"
#include "noon3_words.jsx"
#include "noon3_icons.jsx"
#include "noon3_lib.jsx"
var N3CLIPS = {};
#include "clips3/c01.jsx"
#include "clips3/c02.jsx"
#include "clips3/c03.jsx"
#include "clips3/c04.jsx"
#include "clips3/c05.jsx"
#include "clips3/c06.jsx"
#include "clips3/c07.jsx"
#include "clips3/c08.jsx"
#include "clips3/c09.jsx"
#include "clips3/c10.jsx"
#include "clips3/c11.jsx"
#include "clips3/c12.jsx"

var CONFIG = {
    assets: "../../assets/_ae",                 // client assets (relative to this script)
    reference: "../../motion/out/NOON_v3_preview_small.mp4",   // optional guide layer (the approved preview)
    vo: "vo2_full.wav", voStart: 2.0,
    only: null,                                 // e.g. ["02", "05"] to build just those clips
    save: "../NOON3.aep"
};
var ORDER = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

function main() {
    var here = AEL.scriptDir($.fileName), main, i, id, S, l, failed = [], ref, vo, ends = [];
    N3.ASSET_DIR = (new Folder(here + "/" + CONFIG.assets)).fsName;
    N3.folders = AEL.standardFolders();
    main = AEL.comp("NOON3_MAIN", { width: N3.W, height: N3.H, duration: 130, fps: N3.FPS, folder: N3.folders.main });
    N3.background(main);
    main.motionBlur = true;
    for (i = 0; i < ORDER.length; i++) {
        id = ORDER[i];
        if (!N3CLIPS[id]) { failed.push(id + " (missing)"); continue; }
        if (CONFIG.only && !AEL.contains(CONFIG.only, id)) { continue; }
        try {
            S = N3CLIPS[id].build();
            N3.motionBlur(S.comp);
            l = main.layers.add(S.comp);
            l.motionBlur = true;
            l.startTime = N3CLIPS[id].tin;
            l.moveToBeginning();
            AEL.created("clip", S.comp.name);
        } catch (e) {
            failed.push(id + ": " + e.toString() + (e.line ? " (line " + e.line + ")" : ""));
            AEL.warn("clip " + id + " failed: " + e.toString() + (e.line ? " (line " + e.line + ")" : ""));
        }
    }
    try {
        vo = AEL.importFile(N3.ASSET_DIR + "/" + CONFIG.vo, N3.folders.audio);
        l = main.layers.add(vo); l.startTime = CONFIG.voStart; l.name = "VO"; l.moveToEnd();
    } catch (e2) { AEL.warn("VO: " + e2); }
    try {
        ref = AEL.importFile((new File(here + "/" + CONFIG.reference)).fsName, N3.folders.reference);
        l = main.layers.add(ref); l.name = "REFERENCE render (guide, off)"; l.guideLayer = true; l.enabled = false; l.audioEnabled = false; l.moveToBeginning();
    } catch (e3) { AEL.log("no reference render: " + e3); }
    AEL.compMarker(main, 61.4, "INSERT: Dropbox x ChatGPT segment");
    AEL.result.failedClips = failed;
    if (failed.length) { AEL.warn("Clips that did not build: " + failed.join(" | ")); }
    if (CONFIG.save) { AEL.saveIncremental((new File(here + "/" + CONFIG.save)).parent.fsName, "NOON3"); }
}

AEL.run($.fileName, "Build NOON v3", main);
