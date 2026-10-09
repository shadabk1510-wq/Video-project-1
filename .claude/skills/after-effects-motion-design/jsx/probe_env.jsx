// probe_env.jsx - read-only After Effects environment probe.
// Writes probe_env.result.json next to this file. If that file does not appear, scripting file
// access is disabled: Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network.
// Optional: set LIST_RENDER_TEMPLATES = true to list Output Module templates (temporarily adds and
// removes a 1-frame comp + render queue item; the project is marked as changed).
#include "ae_lib.jsx"

var CHECK_FONTS = ["ArialMT", "Arial-BoldMT", "Inter-Regular", "Inter-Bold", "Montserrat-Bold"];
var LIST_RENDER_TEMPLATES = false;

AEL.run($.fileName, "AEL probe", function () {
    var r = AEL.result, i, f, fonts = {}, tmp, rq;
    r.os = $.os;
    r.extendScriptVersion = $.version;
    r.aeVersion = app.version;
    r.language = app.isoLanguage;
    r.projectFile = app.project.file ? app.project.file.fsName : null;
    r.projectItems = app.project.numItems;
    r.activeComp = (app.project.activeItem instanceof CompItem) ? app.project.activeItem.name : null;
    r.missingFootage = AEL.missingFootage();
    r.trackMatteByLayer = parseFloat(app.version) >= 23; // layer.setTrackMatte() exists from AE 2023 (23.0)

    try {
        r.scriptFileNetworkPref = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
    } catch (e1) { r.scriptFileNetworkPref = "unknown"; }

    if (app.fonts && app.fonts.getFontsByPostScriptName) {
        for (i = 0; i < CHECK_FONTS.length; i++) {
            f = app.fonts.getFontsByPostScriptName(CHECK_FONTS[i]);
            fonts[CHECK_FONTS[i]] = !!(f && f.length);
        }
        r.fonts = fonts;
    } else {
        r.fonts = "app.fonts API unavailable (AE < 24); verify fonts via AEL.text warnings";
    }

    if (LIST_RENDER_TEMPLATES) {
        tmp = app.project.items.addComp("__ael_probe__", 16, 16, 1, 1 / 25, 25);
        rq = app.project.renderQueue.items.add(tmp);
        r.outputModuleTemplates = rq.outputModule(1).templates;
        r.renderSettingsTemplates = rq.templates;
        rq.remove();
        tmp.remove();
    }
});
