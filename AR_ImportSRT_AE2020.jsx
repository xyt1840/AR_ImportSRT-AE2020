/*
AR_ImportSRT_AE2020.jsx
Improved, AE2020-compatible SRT importer (based on Arttu Rautio's AR_ImportSRT)

Features:
- Fixed time parsing bug and tolerant parsing of "hh:mm:ss,ms" or "mm:ss,ms"
- Skips index lines and non-time lines robustly
- Removes simple HTML tags from subtitle text
- Lets you choose frame rounding method: round / floor / ceil
- Uses TextDocument when setting layer sourceText
*/
//@target aftereffects
(function () {
    function TimeToFrames(time, comp) {
        return time * (1.0 / comp.frameDuration);
    }
    function FramesToTime(frames, comp) {
        return frames / (1.0 / comp.frameDuration);
    }
    function parseSRTTime(timeInString) {
        if (!timeInString) return 0;
        var s = timeInString.trim();
        // Accept either comma or dot as decimal separator
        s = s.replace(',', '.');
        var parts = s.split(':');
        var hours = 0, minutes = 0, seconds = 0;
        if (parts.length === 3) {
            hours = parseInt(parts[0], 10) || 0;
            minutes = parseInt(parts[1], 10) || 0;
            seconds = parseFloat(parts[2]) || 0;
        } else if (parts.length === 2) {
            // Some SRTs omit hours: mm:ss,ms
            minutes = parseInt(parts[0], 10) || 0;
            seconds = parseFloat(parts[1]) || 0;
        } else {
            // Fallback: try parseFloat whole string
            seconds = parseFloat(s) || 0;
        }
        return hours * 3600 + minutes * 60 + seconds;
    }

    // Ask user for rounding preference
    var roundingPrompt = prompt("Frame rounding method? Enter: round (default), floor, or ceil", "round");
    var rounding = (roundingPrompt || "round").toLowerCase();
    if (["round","floor","ceil"].indexOf(rounding) === -1) rounding = "round";

    app.beginUndoGroup("AR_ImportSRT_AE2020");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("请先打开或选中一个合成 (composition)。");
        app.endUndoGroup();
        return;
    }

    var srtFile = File.openDialog("Select a SRT file to open.", "SRT subtitles:*.srt;*.txt");
    if (srtFile == null) {
        app.endUndoGroup();
        return;
    }

    if (!srtFile.open("r")) {
        alert("无法打开所选文件。请检查权限或文件是否存在。");
        app.endUndoGroup();
        return;
    }

    try {
        while (!srtFile.eof) {
            var line = srtFile.readln();
            if (line == null) break;
            line = line.replace(/^\uFEFF/, ""); // remove BOM if present
            line = line.trim();
            if (line === "") {
                // skip empty lines between blocks
                continue;
            }
            // skip index lines which are usually just numbers
            if (/^\d+$/.test(line)) {
                // read next lines until we find the timecode
                // continue the loop to read the next line
                continue;
            }
            // find a timecode line (contain -->)
            if (line.indexOf("-->") === -1) {
                // Not a timecode: skip
                continue;
            }
            // parse timecodes
            var parts = line.split("-->");
            if (parts.length < 2) {
                continue; // malformed, skip
            }
            var inStr = parts[0].trim();
            var outStr = parts[1].trim().split(/\s+/)[0]; // in case there's style info after time
            var inSeconds = parseSRTTime(inStr);
            var outSeconds = parseSRTTime(outStr);

            // read subtitle text lines until an empty line or EOF
            var textLines = [];
            while (!srtFile.eof) {
                var tline = srtFile.readln();
                if (tline == null) break;
                // stop at blank line (end of block)
                if (tline.replace(/^\uFEFF/, "").trim() === "") break;
                // remove simple HTML-like tags
                tline = tline.replace(/<(?:.|\n)*?>/g, "");
                textLines.push(tline);
            }
            var text = textLines.join("\r\n");

            // create text layer
            var layer = comp.layers.addText("SRT");
            var sourceText = layer.property("Source Text");
            // set as TextDocument to preserve formatting possibilities
            var td = new TextDocument(text);
            // optional: set default font size/leading if you'd like:
            // td.fontSize = 48;
            sourceText.setValue(td);

            // compute in/out times, with chosen rounding
            var inFrame = TimeToFrames(inSeconds, comp);
            var outFrame = TimeToFrames(outSeconds, comp);
            var roundedInFrame = Math.round(inFrame);
            var roundedOutFrame = Math.round(outFrame);
            if (rounding === "floor") {
                roundedInFrame = Math.floor(inFrame);
                roundedOutFrame = Math.floor(outFrame);
            } else if (rounding === "ceil") {
                roundedInFrame = Math.ceil(inFrame);
                roundedOutFrame = Math.ceil(outFrame);
            }
            var inTime = FramesToTime(roundedInFrame, comp);
            var outTime = FramesToTime(roundedOutFrame, comp);

            layer.inPoint = inTime;
            layer.outPoint = outTime;
        }
    } catch (e) {
        alert("脚本运行出错: " + e.toString());
    } finally {
        srtFile.close();
    }

    app.endUndoGroup();
})();
