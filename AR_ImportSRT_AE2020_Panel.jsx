/*
AR_ImportSRT_AE2020_Panel.jsx
ScriptUI Panel wrapper for AR_ImportSRT_AE2020

- Dockable panel: place this file into After Effects Scripts/ScriptUI Panels folder to dock.
- Provides UI for selecting SRT, rounding method, font size, font, and justification.
- Uses the same robust SRT parser as AR_ImportSRT_AE2020.jsx

Usage:
- Run once: File > Scripts > Run Script File... > AR_ImportSRT_AE2020_Panel.jsx (it will open a floating palette)
- To dock the panel: move the file to the Scripts/ScriptUI Panels/ folder and restart AE; the panel will appear in Window > AR Import SRT AE2020
*/

//@target aftereffects
(function (thisObj) {
    var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "AR Import SRT AE2020", undefined, {resizeable:true});

    function buildUI(p) {
        p.orientation = 'column';
        p.alignChildren = ['fill', 'top'];

        var grpFile = p.add('group');
        grpFile.orientation = 'row';
        grpFile.add('statictext', undefined, 'SRT file:');
        var txtFile = grpFile.add('edittext', undefined, 'No file selected');
        txtFile.characters = 40;
        txtFile.enabled = false;
        var btnBrowse = grpFile.add('button', undefined, 'Browse...');

        var grpOptions = p.add('panel', undefined, 'Options');
        grpOptions.orientation = 'column';
        grpOptions.alignChildren = ['fill', 'top'];

        var r1 = grpOptions.add('group');
        r1.add('statictext', undefined, 'Rounding:');
        var ddRounding = r1.add('dropdownlist', undefined, ['round','floor','ceil']);
        ddRounding.selection = 0;

        var r2 = grpOptions.add('group');
        r2.add('statictext', undefined, 'Font size:');
        var edFontSize = r2.add('edittext', undefined, '48');
        edFontSize.characters = 6;
        r2.add('statictext', undefined, 'Font name (optional):');
        var edFont = r2.add('edittext', undefined, '');
        edFont.characters = 20;

        var r3 = grpOptions.add('group');
        r3.add('statictext', undefined, 'Justify:');
        var ddJust = r3.add('dropdownlist', undefined, ['Left','Center','Right']);
        ddJust.selection = 1;

        var r4 = grpOptions.add('group');
        var cbReplaceLayers = r4.add('checkbox', undefined, 'Replace existing SRT layers in comp');
        cbReplaceLayers.value = false;

        var grpActions = p.add('group');
        grpActions.alignment = ['fill','top'];
        var btnRun = grpActions.add('button', undefined, 'Import SRT');
        var btnClose = grpActions.add('button', undefined, 'Close');

        // Browse action
        btnBrowse.onClick = function () {
            var f = File.openDialog('Select a SRT file', 'SRT subtitles:*.srt;*.txt');
            if (f) {
                txtFile.text = f.fsName;
                txtFile.helpTip = f.fsName;
                txtFile.file = f;
            }
        };

        // Close
        btnClose.onClick = function () {
            if (!(panel instanceof Window)) {
                // docked panel can't be closed programmatically
            } else {
                panel.close();
            }
        };

        // Run action
        btnRun.onClick = function () {
            var file = txtFile.file || null;
            if (!file) {
                alert('Please choose an SRT file first.');
                return;
            }
            var rounding = ddRounding.selection ? ddRounding.selection.text : 'round';
            var fontSize = parseFloat(edFontSize.text) || 48;
            var fontName = edFont.text || '';
            var just = ddJust.selection ? ddJust.selection.text : 'Center';
            var replaceLayers = cbReplaceLayers.value;
            importSRTFromFile(file, {rounding:rounding, fontSize:fontSize, fontName:fontName, justification:just, replaceLayers:replaceLayers});
        };

        p.onResizing = p.onResize = function () { this.layout.resize(); };
    }

    // Parser & importer (based on earlier improved script)
    function parseSRTTime(timeInString) {
        if (!timeInString) return 0;
        var s = timeInString.trim();
        s = s.replace(',', '.');
        var parts = s.split(':');
        var hours = 0, minutes = 0, seconds = 0;
        if (parts.length === 3) {
            hours = parseInt(parts[0], 10) || 0;
            minutes = parseInt(parts[1], 10) || 0;
            seconds = parseFloat(parts[2]) || 0;
        } else if (parts.length === 2) {
            minutes = parseInt(parts[0], 10) || 0;
            seconds = parseFloat(parts[1]) || 0;
        } else {
            seconds = parseFloat(s) || 0;
        }
        return hours * 3600 + minutes * 60 + seconds;
    }

    function TimeToFrames(time, comp) { return time * (1.0 / comp.frameDuration); }
    function FramesToTime(frames, comp) { return frames / (1.0 / comp.frameDuration); }

    function importSRTFromFile(srtFile, opts) {
        opts = opts || {};
        var rounding = opts.rounding || 'round';
        var fontSize = opts.fontSize || 48;
        var fontName = opts.fontName || '';
        var justification = (opts.justification || 'Center');
        var replaceLayers = !!opts.replaceLayers;

        app.beginUndoGroup('AR_ImportSRT_AE2020_Panel');
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { alert('Please open or select a composition first.'); app.endUndoGroup(); return; }

        if (!srtFile.open('r')) { alert('Cannot open file.'); app.endUndoGroup(); return; }

        try {
            if (replaceLayers) {
                // remove existing layers named "SRT" (ask for confirm)
                var toRemove = [];
                for (var i = 1; i <= comp.numLayers; i++) {
                    var ly = comp.layer(i);
                    if (ly && ly.name === 'SRT') toRemove.push(ly);
                }
                if (toRemove.length > 0) {
                    if (confirm('Remove ' + toRemove.length + ' existing SRT layers?')) {
                        // remove from top to bottom
                        for (var r = toRemove.length-1; r >=0; r--) {
                            toRemove[r].remove();
                        }
                    }
                }
            }

            while (!srtFile.eof) {
                var line = srtFile.readln();
                if (line == null) break;
                line = line.replace(/^\uFEFF/, '');
                line = line.trim();
                if (line === '') continue;
                if (/^\d+$/.test(line)) { continue; }
                if (line.indexOf('-->') === -1) continue;
                var parts = line.split('-->');
                if (parts.length < 2) continue;
                var inStr = parts[0].trim();
                var outStr = parts[1].trim().split(/\s+/)[0];
                var inSec = parseSRTTime(inStr);
                var outSec = parseSRTTime(outStr);
                var textLines = [];
                while (!srtFile.eof) {
                    var tline = srtFile.readln();
                    if (tline == null) break;
                    if (tline.replace(/^\uFEFF/, '').trim() === '') break;
                    tline = tline.replace(/<(?:.|\n)*?>/g, '');
                    textLines.push(tline);
                }
                var text = textLines.join('\r\n');

                var layer = comp.layers.addText('SRT');
                var sourceText = layer.property('Source Text');
                var td = new TextDocument(text);
                td.fontSize = fontSize;
                if (fontName) td.font = fontName;
                // justification
                try {
                    if (justification === 'Left') td.justification = ParagraphJustification.LEFT_JUSTIFY;
                    else if (justification === 'Center') td.justification = ParagraphJustification.CENTER_JUSTIFY;
                    else if (justification === 'Right') td.justification = ParagraphJustification.RIGHT_JUSTIFY;
                } catch (e) {
                    // ignore if ParagraphJustification is unavailable
                }
                sourceText.setValue(td);

                var inFrame = TimeToFrames(inSec, comp);
                var outFrame = TimeToFrames(outSec, comp);
                var rIn = Math.round(inFrame), rOut = Math.round(outFrame);
                if (rounding === 'floor') { rIn = Math.floor(inFrame); rOut = Math.floor(outFrame); }
                else if (rounding === 'ceil') { rIn = Math.ceil(inFrame); rOut = Math.ceil(outFrame); }
                var inTime = FramesToTime(rIn, comp);
                var outTime = FramesToTime(rOut, comp);
                layer.inPoint = inTime;
                layer.outPoint = outTime;
            }
        } catch (err) {
            alert('Error: ' + err.toString());
        } finally {
            srtFile.close();
        }

        app.endUndoGroup();
        alert('Import complete.');
    }

    // build UI
    buildUI(panel);

    if (panel instanceof Window) {
        panel.center();
        panel.show();
    } else {
        panel.layout.layout(true);
    }

    return panel;
})(this);
