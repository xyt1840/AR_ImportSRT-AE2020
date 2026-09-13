## Panel: AR_ImportSRT_AE2020_Panel

Added a ScriptUI panel that provides a visual interface for the SRT importer.

Files added:
- AR_ImportSRT_AE2020_Panel.jsx — ScriptUI palette (dockable if placed into Scripts/ScriptUI Panels)

How to dock/install the panel:
- Place `AR_ImportSRT_AE2020_Panel.jsx` into the After Effects ScriptUI Panels folder:
  - Windows: `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels\`
  - macOS: `/Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels/`
- Restart After Effects. The panel will appear under the Window menu as "AR Import SRT AE2020" and can be docked like other panels.

Notes:
- The panel lets you browse for an SRT file, choose rounding method (round/floor/ceil), font size and font name (optional), and paragraph justification.
- "Replace existing SRT layers" will remove layers named "SRT" in the active comp before importing (asks confirmation).

