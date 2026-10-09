// Test harness: builds only clip 04 (for ae_sim or a quick AE check). Not part of the delivery build.
#include "../../ae_lib.jsx"
#include "../../noon3_words.jsx"
#include "../../noon3_icons.jsx"
#include "../../noon3_lib.jsx"
#include "../../noon3_kit.jsx"
var N3CLIPS = {};
#include "../c04.jsx"
function main() {
    var here = AEL.scriptDir($.fileName);
    N3.ASSET_DIR = (new Folder(here + "/../../../../assets/_ae")).fsName;
    N3.folders = AEL.standardFolders();
    AEL.pendingExpr = [];
    N3CLIPS["04"].build();
    AEL.retryExpressions();
}
AEL.run($.fileName, "test clip 04", main);
