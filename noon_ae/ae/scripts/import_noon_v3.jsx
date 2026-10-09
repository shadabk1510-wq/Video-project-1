// import_noon_v3.jsx - put the rendered v3 motion clips, the VO and cue markers on an After Effects timeline.
// Run in AE: File > Scripts > Run Script File... (new project). Clips come from noon_ae/motion/out/.
// The clips are rendered video (made with the motion-broll engine); music, SFX and final tweaks go here.
#include "ae_lib.jsx"

var V3 = {
    fps: 23.976, duration: 130.0, pre: 2.0,
    clips: [["01-hook", 0.00], ["02-year", 4.24], ["03-radar", 7.10], ["04-noon", 9.98], ["05-steps", 15.30], ["06-inputs", 39.00],
            ["07-power", 52.30], ["08-saved", 63.30], ["09-notes", 80.00], ["10-chaos", 102.15], ["11-pro", 112.90], ["12-touchpoints", 119.05]],
    cues: [[0.05, "whoosh: documents"], [0.55, "highlighter"], [1.0, "soft swell: pages become the pack"], [1.3, "pop: sun"], [1.75, "reveal: bag"],
           [2.42, "tick"], [2.9, "tick"], [3.36, "tick"], [3.9, "tick"], [6.3, "hit: 2027"], [7.2, "morph: sun"], [9.12, "radar ping"],
           [11.7, "logo letters"], [12.0, "sun rise"], [12.32, "morph: bag"], [13.4, "ring"], [17.0, "row"], [20.2, "row"], [23.9, "row"],
           [27.6, "row"], [29.1, "pop"], [29.8, "pop"], [30.8, "pop"], [32.0, "row"], [34.6, "row"], [37.44, "ticks x6"], [41.5, "file"],
           [42.8, "file"], [43.8, "file"], [47.3, "merge"], [49.4, "typing"], [52.4, "morph: stage"], [55.5, "sparkle"], [57.92, "whoosh: slide out"],
           [58.3, "whoosh: slide in"], [58.8, "pop"], [59.1, "pop"], [61.3, "impact: POWERHOUSE"], [63.4, "morph: window"], [64.8, "drag"],
           [65.9, "drop"], [66.4, "saved chime"], [67.7, "morph: stage"], [69.3, "fill"], [69.76, "tick"], [74.5, "stage 02"], [80.2, "morph: page"],
           [83.0, "marker"], [84.6, "marker"], [88.3, "marker"], [91.4, "marker"], [96.3, "pan"], [97.4, "marker"], [102.3, "morph: dot"],
           [102.4, "cards in"], [106.2, "chaos rumble"], [109.8, "snap"], [111.9, "soft ding"], [113.0, "morph: coral"], [116.6, "impact: PROFESSIONAL"],
           [119.2, "morph: phone"], [121.8, "pop: revealed soon"], [122.6, "slide"], [123.0, "pop 1"], [123.5, "pop 2"], [124.0, "pop 3"], [124.2, "line"]]
};

function main() {
    var F = AEL.standardFolders(), dir = AEL.rel($.fileName, "../../motion/out/"), comp, i, item, l, cues;
    comp = AEL.comp("NOON_V3_MAIN", { width: 1920, height: 1080, duration: V3.duration, fps: V3.fps, folder: F.main });
    for (i = 0; i < V3.clips.length; i++) {
        item = AEL.importFile(dir + V3.clips[i][0] + ".mp4", F.footage);
        l = comp.layers.add(item);
        l.startTime = V3.clips[i][1];
        l.name = V3.clips[i][0];
        AEL.compMarker(comp, V3.clips[i][1], V3.clips[i][0]);
    }
    l = comp.layers.add(AEL.importFile(AEL.rel($.fileName, "../../assets/_ae/vo2_full.wav"), F.audio));
    l.name = "VO"; l.startTime = V3.pre; l.moveToBeginning();
    cues = AEL.nullLayer(comp, "SFX cues (markers)");
    cues.startTime = 0;
    for (i = 0; i < V3.cues.length; i++) { AEL.layerMarker(cues, V3.cues[i][0], "SFX " + V3.cues[i][1]); }
    cues.moveToBeginning();
    AEL.compMarker(comp, 61.4, "INSERT existing Dropbox integration here (final edit)");
    comp.openInViewer();
    AEL.saveIncremental(AEL.rel($.fileName, ".."), "NOON_v3");
}
AEL.run($.fileName, "NOON v3 import", main);
