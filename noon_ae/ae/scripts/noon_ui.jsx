// noon_ui.jsx - native, editable interface + device mockups (ES3). Requires ae_lib.jsx + noon_lib.jsx.
// Everything is shape/text layers parented to a null, so each mockup can be moved/scaled as one piece.

var UI = {};

// Parent a list of layers to ctrl and set their local positions: items = [[layer, [x,y]], ...]
UI.attach = function (ctrl, items) {
    var i;
    for (i = 0; i < items.length; i++) {
        items[i][0].parent = ctrl;
        AEL.xf(items[i][0], "ADBE Position").setValue(items[i][1]);
    }
};
UI.label = function (comp, name, text, size, hex, font, justify) {
    return AEL.text(comp, text, { font: font || NL.FONT.med, size: size, color: hex || NL.COL.ink, justify: justify || "center", name: name });
};
// Left-anchored text at its baseline-left so x positions line up.
UI.leftText = function (comp, name, text, size, hex, font) {
    var t = UI.label(comp, name, text, size, hex, font, "left"), r = t.sourceRectAtTime(0, false);
    AEL.xf(t, "ADBE Anchor Point").setValue([r.left, r.top + r.height / 2]);
    return t;
};

// App window: white rounded panel, title bar with three dots and a centred title. Returns {ctrl, top}.
UI.window = function (comp, name, pos, w, h, title) {
    var ctrl = NL.ctrl(comp, name, pos), card, bar, sep, dots, t, top = -h / 2, gi, k, cols = ["#F57F7A", "#F6C25B", "#6CCB7E"];
    card = NL.box(comp, name + " Panel", w, h, 22, NL.COL.paper, [0, 0]);
    NL.shadow(card, 70, 26, 80);
    bar = NL.shape(comp, name + " Titlebar", [0, 0]);
    gi = NL.group(bar, "Bar");
    NL.rect(bar, gi, w, 54, 22, [0, top + 27]);
    NL.rect(bar, gi, w, 27, 0, [0, top + 40]);
    NL.fill(bar, gi, "#FBF1F0");
    sep = NL.shape(comp, name + " Titlebar Line", [0, 0]);
    gi = NL.group(sep, "Line"); NL.path(sep, gi, [[-w / 2, top + 54], [w / 2, top + 54]]); NL.stroke(sep, gi, "#F0D6D6", 1.5);
    dots = NL.shape(comp, name + " Dots", [0, 0]);
    for (k = 0; k < 3; k++) { gi = NL.group(dots, "Dot " + (k + 1)); NL.ellipse(dots, gi, 13, [-w / 2 + 28 + k * 22, top + 27]); NL.fill(dots, gi, cols[k]); }
    t = UI.label(comp, name + " Title", title, 17, NL.COL.inkSoft, NL.FONT.med);
    UI.attach(ctrl, [[card, [0, 0]], [bar, [0, 0]], [sep, [0, 0]], [dots, [0, 0]], [t, [0, top + 27]]]);
    return { ctrl: ctrl, top: top + 54 };
};

// File tile for a project-files window: thumbnail card + name + meta. item = image or null (then a folder icon).
UI.fileTile = function (comp, name, item, label, meta, thumbFn) {
    var ctrl = NL.ctrl(comp, name, [0, 0]), card, img, matte, lt, mt, ic;
    card = NL.box(comp, name + " Thumb", 150, 200, 14, NL.COL.white, [0, 0]);
    NL.shadow(card, 40, 8, 26);
    lt = UI.label(comp, name + " Name", label, 15, NL.COL.ink, NL.FONT.med);
    mt = UI.label(comp, name + " Meta", meta, 12, NL.COL.inkSoft, NL.FONT.reg);
    UI.attach(ctrl, [[card, [0, 0]], [lt, [0, 128]], [mt, [0, 150]]]);
    if (item) {
        img = NL.media(comp, item, name + " Image", [0, 0], 150);
        matte = NL.box(comp, name + " Matte", 150, 200, 14, NL.COL.white, [0, 0]);
        UI.attach(ctrl, [[img, [0, 6]], [matte, [0, 0]]]);
        matte.moveBefore(img);
        AEL.trackMatte(img, matte, TrackMatteType.ALPHA);
    } else if (thumbFn) {
        thumbFn(ctrl);
    } else {
        ic = NL.icon(comp, "folder", name + " Folder Icon", NL.COL.coral, NL.COL.coralLight);
        AEL.xf(ic, "ADBE Scale").setValue([160, 160]);
        UI.attach(ctrl, [[ic, [0, 0]]]);
    }
    return ctrl;
};

// Natively drawn "Creative Brief" document thumbnail (the new file that gets saved).
UI.briefThumb = function (comp, name) {
    return function (ctrl) {
        var head = UI.label(comp, name + " Doc Title", "CREATIVE\rBRIEF", 15, NL.COL.coral, NL.FONT.black), lines, gi, k, logo;
        lines = NL.shape(comp, name + " Doc Lines", [0, 0]);
        gi = NL.group(lines, "Lines");
        for (k = 0; k < 6; k++) { NL.path(lines, gi, [[-52, 8 + k * 14], [k % 3 === 2 ? 20 : 52, 8 + k * 14]]); }
        NL.stroke(lines, gi, "#E7CFCF", 3);
        logo = NL.logo(comp, name + " Logo", [0, 0], 13, NL.COL.navy);
        UI.attach(ctrl, [[head, [0, -40]], [lines, [0, 0]], [logo.ctrl, [0, -78]]]);
    };
};

// "Saved" toast: white pill with a coral check badge.
UI.toast = function (comp, name, text, pos) {
    var ctrl = NL.ctrl(comp, name, pos), t = UI.label(comp, name + " Text", text, 20, NL.COL.ink, NL.FONT.cap), r = t.sourceRectAtTime(0, false);
    var w = r.width + 110, bg = NL.box(comp, name + " BG", w, 58, 29, NL.COL.white, [0, 0]), badge = NL.circle(comp, name + " Badge", 34, NL.COL.coral, [0, 0]);
    var tick = NL.icon(comp, "tick", name + " Tick", NL.COL.white);
    NL.shadow(bg, 60, 12, 40);
    AEL.xf(tick, "ADBE Scale").setValue([70, 70]);
    UI.attach(ctrl, [[bg, [0, 0]], [badge, [-w / 2 + 34, 0]], [tick, [-w / 2 + 34, 0]], [t, [22, 0]]]);
    return ctrl;
};

// Smartphone: dark body, rounded screen showing `contentItem` (a comp or image) fitted to the screen width.
UI.phone = function (comp, name, pos, screenH, contentItem) {
    var sw = Math.round(screenH * 0.5), ctrl = NL.ctrl(comp, name, pos), body, scr, matte, isl, content;
    body = NL.box(comp, name + " Body", sw + 30, screenH + 30, 62, "#1F1A1C", [0, 0]);
    NL.shadow(body, 80, 30, 90);
    scr = NL.box(comp, name + " Screen BG", sw, screenH, 48, "#FFFFFF", [0, 0]);
    content = NL.media(comp, contentItem, name + " Content", [0, 0], sw);
    matte = NL.box(comp, name + " Screen Matte", sw, screenH, 48, NL.COL.white, [0, 0]);
    isl = NL.box(comp, name + " Island", 96, 28, 14, "#1F1A1C", [0, 0]);
    UI.attach(ctrl, [[body, [0, 0]], [scr, [0, 0]], [content, [0, 0]], [matte, [0, 0]], [isl, [0, -screenH / 2 + 26]]]);
    matte.moveBefore(content);
    AEL.trackMatte(content, matte, TrackMatteType.ALPHA);
    isl.moveToBeginning();
    return { ctrl: ctrl, content: content, screenW: sw };
};

// Browser window: app window + address pill; contentItem fitted to the content width, matted to the page area.
UI.browser = function (comp, name, pos, w, h, contentItem, address) {
    var win = UI.window(comp, name, pos, w, h, "High Sun \u2014 NOON"), url, ut, content, matte, ph = h - 54;
    url = NL.box(comp, name + " Address", w * 0.5, 30, 15, "#F3E2E1", [0, 0]);
    ut = UI.label(comp, name + " Address Text", address, 14, NL.COL.inkSoft, NL.FONT.reg);
    content = NL.media(comp, contentItem, name + " Page", [0, 0], w);
    matte = NL.box(comp, name + " Page Matte", w, ph, 0, NL.COL.white, [0, 0]);
    UI.attach(win.ctrl, [[url, [w * 0.12, -h / 2 + 27]], [ut, [w * 0.12, -h / 2 + 27]], [content, [0, 0]], [matte, [0, 27]]]);
    matte.moveBefore(content);
    AEL.trackMatte(content, matte, TrackMatteType.ALPHA);
    return { ctrl: win.ctrl, content: content, pageTop: -h / 2 + 54 };
};
