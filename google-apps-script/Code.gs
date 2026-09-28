const SPREADSHEET_ID = "1WTw7peU05h0AJ2i2jTkDL14wcsjX6jSFcOXLxXs4cK4";
const SHEET_NAME = "Cora Leads";
const DEFAULT_SOURCE = "Cora Website";

const HEADERS = [
  "Zeitpunkt","Lead-ID","Name","Unternehmen","E-Mail","Telefon",
  "Unternehmensgröße","Leistung","Anliegen","Quelle","Status",
  "Website","Branche","Ziel","Website-Anfragen/Monat","Seite",
  "Interesse","Datenschutz-Einwilligung"
];

function doGet() {
  return json_({ok:true, service:"Cora Leads", sheet:SHEET_NAME});
}

function doPost(e) {
  try {
    const data = e && e.parameter ? e.parameter : {};
    if (String(data.website_check || "").trim()) return json_({ok:false, ignored:true});

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    ensureHeaders_(sheet);

    const leadId = clean_(data.lead_id || Utilities.getUuid());
    const row = [
      new Date(),
      leadId,
      clean_(data.name),
      clean_(data.company),
      clean_(data.email),
      clean_(data.phone),
      clean_(data.company_size),
      clean_(data.service || data.plan || data.interest),
      clean_(data.message),
      clean_(data.source || DEFAULT_SOURCE),
      "Neu",
      clean_(data.website),
      clean_(data.industry),
      clean_(data.goal),
      clean_(data.monthlyInquiries),
      clean_(data.page),
      clean_(data.interest || data.plan),
      clean_(data.privacy_consent)
    ];

    sheet.appendRow(row);
    return json_({ok:true, leadId:leadId, status:"Neu"});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function ensureHeaders_(sheet) {
  const needed = HEADERS.length;
  const current = sheet.getLastColumn();
  if (current === 0) {
    sheet.getRange(1,1,1,needed).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }
  const existing = sheet.getRange(1,1,1,Math.max(current,needed)).getValues()[0];
  let changed = false;
  HEADERS.forEach((h,i) => {
    if (existing[i] !== h) {
      sheet.getRange(1,i+1).setValue(h);
      changed = true;
    }
  });
  if (changed) sheet.setFrozenRows(1);
}

function clean_(value) {
  return String(value == null ? "" : value).trim().slice(0,5000);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
