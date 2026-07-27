// Standalone (not sheet-bound) script: Google could not create a bound project
// for this sheet, so the sheet is addressed by id instead of "active spreadsheet".
const SHEET_ID = "1hKWQfuUUwXY_rM1hud2qFBTI2huiuR0w1CpJcb96SyY";
const SHEET_NAME = "Reacties";
const COLUMNS = ["page_lang", "name", "contact", "booklet_lang", "copies",
                 "delivery", "street", "postcode", "city", "country", "comment"];

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.website) return json({ ok: true }); // honeypot hit: pretend success, store nothing
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([new Date()].concat(COLUMNS.map((k) => (data[k] == null ? "" : String(data[k])))));
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
