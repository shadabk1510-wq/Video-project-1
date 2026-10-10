// ae_sim harness for add_sfx.jsx: a bare NOON3_MAIN plus stand-in sound files.
var SFX_FOLDER_OVERRIDE = "/tmp/sfxdummy";   // folder of silent stand-ins named like the real files
app.project.items.addComp("NOON3_MAIN", 1920, 1080, 1, 660.5, 23.976);
#include "../../add_sfx.jsx"
