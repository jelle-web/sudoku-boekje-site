# sudoku-boekje-site

Interest pages for Jelle's sudoku booklet (NL at `/`, EN at `/en/`).
Static HTML/CSS/JS on GitHub Pages. The form POSTs JSON to a Google Apps
Script web app, which appends one row per submission to the "Sudoku boekje
interesse" Google Sheet.

- Redeploy site: push to `main` (GitHub Pages serves the root).
- The web-app URL lives in `site.js` (`SCRIPT_URL`).

## Google side

The script is **standalone**, not bound to the sheet: Google could not create a
sheet-bound project, so `Code.gs` addresses the sheet by id (`SHEET_ID`) instead
of using the active spreadsheet.

- Sheet: owned by `siebenjelle@gmail.com`, tab `Reacties`, header row in A1:L1.
- Script: owned by `jelle@orbisk.com`, so the sheet is shared with that account
  as editor. Revoking that share breaks submissions.
- Edit the script: open the "Sudoku boekje interesse - form endpoint" project at
  script.google.com, edit, then Deploy -> Manage deployments -> pencil icon ->
  Version: New version -> Deploy. The URL stays the same.
