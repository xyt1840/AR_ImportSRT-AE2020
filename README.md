# AR_ImportSRT-AE2020

Improved AR_ImportSRT script for Adobe After Effects (compatible with AE 2020).

Includes:
- AR_ImportSRT_AE2020.jsx (improved, more robust parser)
- Instructions for installing and for local ZIP packaging (Windows/macOS)

## Quick install

1. Download the repository as ZIP from GitHub: https://github.com/xyt1840/AR_ImportSRT-AE2020 (Use Code > Download ZIP)
2. Extract and copy `AR_ImportSRT_AE2020.jsx` to your After Effects scripts folder, or run it directly:
   - Run once: After Effects > File > Scripts > Run Script File... > select `AR_ImportSRT_AE2020.jsx`
   - Install permanently (so it appears in the menu):
     - Windows: copy to `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\`
     - macOS: copy to `/Applications/Adobe After Effects <version>/Scripts/`
   - After copying into the Scripts folder, restart After Effects.

## Local ZIP packaging (if you prefer to create ZIP yourself)

### On Windows (PowerShell)

1. Save `AR_ImportSRT_AE2020.jsx` into a new folder, e.g. `C:\Users\<you>\Desktop\AR_ImportSRT-AE2020\`
2. Run PowerShell and execute:

   Compress-Archive -Path "C:\Users\<you>\Desktop\AR_ImportSRT-AE2020\*" -DestinationPath "C:\Users\<you>\Desktop\AR_ImportSRT-AE2020.zip"

This will create `AR_ImportSRT-AE2020.zip` on your Desktop.

### On Windows (Explorer)

- Right-click the folder containing the script > Send to > Compressed (zipped) folder.

### On macOS (Terminal)

1. Put `AR_ImportSRT_AE2020.jsx` into a folder, e.g. `~/Desktop/AR_ImportSRT-AE2020/`
2. Open Terminal and run:

   cd ~/Desktop
   zip -r AR_ImportSRT-AE2020.zip AR_ImportSRT-AE2020

A ZIP file `AR_ImportSRT-AE2020.zip` will be created on your Desktop.

### On macOS (Finder)

- Right-click the folder > Compress "AR_ImportSRT-AE2020".

## Usage notes

- The script prompts for frame rounding method (round/floor/ceil). Default is round.
- Save the script using UTF-8 without BOM to avoid encoding issues.
- The script expects standard SRT timecodes but tolerates `hh:mm:ss,ms` and `mm:ss,ms`, and both `,` and `.` decimal separators.
- If you want default font size/position/alignment changed, edit the script and set `td.fontSize`, or set layer properties after creation.

## License & credit

Original idea & base script by Arttu Rautio (aturtur). This repository contains an improved/ported version for AE2020 created by xyt1840.
