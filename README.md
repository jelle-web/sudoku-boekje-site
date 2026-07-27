# sudoku-boekje-site

Interest pages for Jelle's sudoku booklet (NL at `/`, EN at `/en/`).
Static HTML/CSS/JS on GitHub Pages. The form POSTs JSON to a Google Apps
Script web app bound to the "Sudoku boekje interesse" Google Sheet
(Jelle's Google account); the script appends one row per submission.

- Redeploy site: push to `main` (GitHub Pages serves the root).
- Change the script: Sheet → Extensions → Apps Script → edit →
  Deploy → Manage deployments → pencil icon → New version (URL stays the same).
- The web-app URL lives in `site.js` (`SCRIPT_URL`).
