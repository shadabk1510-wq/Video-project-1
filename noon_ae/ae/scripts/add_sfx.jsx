// add_sfx.jsx: adds the NOON3 sound effects to the project that is open now (your tweaked NOON3 .aep).
//
// Run it with that project open: File > Scripts > Run Script File... > add_sfx.jsx. Your clips are not touched.
// It builds one comp, "NOON3 SFX", holding every sound as its own layer, and places that comp in NOON3_MAIN as a
// single layer (video switch off). That layer's Audio Levels is the master volume for all SFX.
// Inside "NOON3 SFX", every layer is named "<sound>  <mm:ss>  <clip> <element>": drag it to retime, swap its
// source (Alt-drag a file onto it), change its Audio Levels, or delete it.
// Running the script again rebuilds "NOON3 SFX" from scratch (it asks first); the master layer is kept.
//
// Sounds come from the NOON_SFX folder (the 33 files picked from your library). Cue times are in sfx/noon3_sfx_cues.jsx.

#include "ae_lib.jsx"
#include "sfx/noon3_sfx_cues.jsx"

var SFX = {
    // first folder that exists is used; otherwise you are asked to pick it
    folders: ["D:/AE Assets/3. sfx/NOON_SFX", "../assets/_ae/sfx"],
    main: "NOON3_MAIN",
    comp: "NOON3 SFX",
    // For each sound: db = how loud its peak sits in the mix (dBFS; the voice-over peaks around -15 to -19),
    // at = where that peak lands after the cue (s), label = layer colour,
    // files = [file name, time of the peak inside the file (s; typing: where the typing starts), level that brings
    // the file's own peak to 0 dB, optional extra delay (s)]. Files take turns so repeats vary.
    // Measured from the NOON_SFX files. stack: true plays all of its files together (the end card).
    SOUNDS: {
        whoosh: { db: -27, at: 0.15, label: 8, files: [["Soft_Whoosh_22.wav", 0.39, 9.5], ["Whooshe_Modern_12.wav", 0.67, 3.5], ["Whoosh Deep Light.wav", 0.75, 8.0]] },
        swish:  { db: -29, at: 0.08, label: 14, files: [["Sharp swoosh.wav", 0.17, 14.0], ["Fast swish.wav", 0.21, 19.0], ["Short whip.wav", 0.32, 13.5]] },
        pop:    { db: -28, at: 0.03, label: 2, files: [["ui-pop-up-14-197900.mp3", 0.04, 12.0], ["floraphonic-ui-pop-up-5-197889.mp3", 0.04, 12.5], ["ui-pop-up-15-197897.mp3", 0.03, 15.0], ["bubble-pop-293342.mp3", 0.13, 12.0]] },
        tick:   { db: -31, at: 0.02, label: 12, files: [["Click_02.wav", 0.08, 12.0], ["Digital Click - 1.mp3", 0.24, 22.0], ["Digital Click - 3.mp3", 0.25, 25.5], ["Digital Click - 7.mp3", 0.08, 19.5]] },
        click:  { db: -27, at: 0.00, label: 9, files: [["Button_01.wav", 0.02, 12.0], ["click 0.mp3", 0.35, 27.5]] },
        type:   { db: -31, at: 0.00, label: 10, files: [["Keyboard - 4.mp3", 0.08, 29.0], ["typing_keyboard.mp3", 0.04, 38.0]] },
        ding:   { db: -26, at: 0.02, label: 11, files: [["Right (bells).wav", 0.04, 22.5], ["notification-ping-372479.mp3", 0.10, 12.5], ["new-notification-08-352461.mp3", 0.12, 15.5], ["Notification.wav", 0.03, 8.5]] },
        paper:  { db: -29, at: 0.05, label: 3, files: [["Just Sound Effects - Smartphone UI - Menu Navigation Swipe Short 2.wav", 0.16, 13.5]] },
        window: { db: -26, at: 0.10, label: 5, files: [["ES_Flash, Modern, Design 01 - Epidemic Sound.mp3", 0.10, 21.5], ["HUD Screen - 02.wav", 0.43, 20.5]] },
        accent: { db: -23, at: 0.15, label: 13, files: [["Reverse Boom 2.wav", 0.99, 5.0]] },
        end:    { db: -22, at: 0.00, label: 1, stack: true, files: [["swoosh-riser-reverb-390309.mp3", 1.86, 13.5, 0.00], ["Gleam hit.wav", 0.75, 23.0, 0.30], ["SD_Low_01.wav", 0.04, 8.0, 0.30]] }
    },
    TYPE_TAIL: 0.25,   // typing sounds stop this long after the line finishes, with a short fade
    MASTER_NAME: "SFX (all sounds) - Audio Levels here = master volume"
};

SFX.findFolder = function () {
    var i, p, f, here = AEL.scriptDir($.fileName);
    if (typeof SFX_FOLDER_OVERRIDE !== "undefined") { SFX.folders = [SFX_FOLDER_OVERRIDE]; }
    for (i = 0; i < SFX.folders.length; i++) {
        p = SFX.folders[i];
        f = new Folder(p.charAt(0) === "." ? here + "/" + p : p);
        if (f.exists) { return f; }
    }
    f = Folder.selectDialog("Select the NOON_SFX folder (the sound files for NOON3)");
    if (!f) { throw new Error("No SFX folder selected."); }
    return f;
};

SFX.importAll = function (dir, folderItem) {
    var k, s, i, f, items = {}, missing = [], kept;
    for (k in SFX.SOUNDS) {
        if (!SFX.SOUNDS.hasOwnProperty(k)) { continue; }
        s = SFX.SOUNDS[k]; kept = [];
        for (i = 0; i < s.files.length; i++) {
            f = new File(dir.fsName + "/" + s.files[i][0]);
            if (!f.exists) { missing.push(s.files[i][0]); continue; }
            items[s.files[i][0]] = AEL.importFile(f.fsName, folderItem);
            kept.push(s.files[i]);
        }
        s.files = kept;
        if (!kept.length) { AEL.warn("No files found for '" + k + "' sounds; those cues are skipped."); }
    }
    if (missing.length) { AEL.warn("Missing in " + dir.fsName + ": " + missing.join(", ")); }
    return items;
};

SFX.place = function (comp, items, cue, i, pick) {
    var t = cue[0], cat = cue[1], note = cue[2], dur = cue[3], s = SFX.SOUNDS[cat], list, j, f, l, lev, levels, end, placed = 0;
    if (!s || !s.files.length) { return 0; }
    list = s.stack ? s.files : [s.files[pick % s.files.length]];
    for (j = 0; j < list.length; j++) {
        f = list[j];
        l = comp.layers.add(items[f[0]]);
        l.startTime = t + s.at + (f[3] || 0) - f[1];
        lev = s.db + f[2] + ((i * 7) % 5 - 2) * 0.5;   // +/-1 dB so repeats don't sound stamped
        levels = l.property("ADBE Audio Group").property("ADBE Audio Levels");
        if (dur > 0) {
            end = Math.min(l.outPoint, t + dur + SFX.TYPE_TAIL);
            l.outPoint = end;
            levels.setValueAtTime(end - 0.2, [lev, lev]);
            levels.setValueAtTime(end, [-48, -48]);
        } else {
            levels.setValue([lev, lev]);
        }
        l.name = cat + "  " + note;
        l.label = s.label;
        l.comment = "NOON3 SFX cue " + t + " s (" + cat + ")";
        placed += 1;
    }
    return placed;
};

function addSfx() {
    var main = AEL.findItem(SFX.main, CompItem), comp, dir, folderItem, items, i, n = 0, turn = {}, pick = [], k, ml = null, L;
    if (!main) { throw new Error("Open your NOON3 project first: there is no comp named " + SFX.main + "."); }
    dir = SFX.findFolder();
    folderItem = AEL.folder("09_SFX");
    items = SFX.importAll(dir, folderItem);
    comp = AEL.findItem(SFX.comp, CompItem);
    if (comp) {
        if (comp.numLayers && !confirm("Rebuild '" + SFX.comp + "'? Its " + comp.numLayers + " sound layers are replaced, so edits made to them are lost.")) {
            AEL.log("Cancelled: " + SFX.comp + " left as it was."); return;
        }
        while (comp.numLayers) { comp.layer(1).remove(); }
    } else {
        comp = app.project.items.addComp(SFX.comp, main.width, main.height, main.pixelAspect, main.duration, main.frameRate);
        comp.parentFolder = folderItem;
        AEL.created("comp", SFX.comp);
    }
    comp.duration = main.duration;
    // files of a sound take turns in time order; layers are added last to first so the earliest is on top
    for (i = 0; i < NOON3_SFX_CUES.length; i++) { k = NOON3_SFX_CUES[i][1]; turn[k] = (turn[k] || 0); pick[i] = turn[k]; turn[k] += 1; }
    for (i = NOON3_SFX_CUES.length - 1; i >= 0; i--) {
        try { n += SFX.place(comp, items, NOON3_SFX_CUES[i], i, pick[i]); }
        catch (e) { AEL.warn("cue at " + NOON3_SFX_CUES[i][0] + " s: " + e.toString()); }
    }
    for (i = 1; i <= main.numLayers; i++) {
        L = main.layer(i);
        if (L.source && L.source.id === comp.id) { ml = L; }
    }
    if (!ml) {
        ml = main.layers.add(comp);
        ml.startTime = 0;
        ml.name = SFX.MASTER_NAME;
        ml.enabled = false;   // video off; the audio still plays
        ml.label = 11;
        ml.moveToEnd();
    }
    AEL.result.sfxFolder = dir.fsName;
    AEL.result.sfxLayers = n;
    AEL.log("Placed " + n + " sound layers for " + NOON3_SFX_CUES.length + " cues in '" + SFX.comp + "'.");
}

AEL.run($.fileName, "Add NOON3 SFX", addSfx);
