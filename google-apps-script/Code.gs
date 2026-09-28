const SPREADSHEET_ID="1WTw7peU05h0AJ2i2jTkDL14wcsjX6jSFcOXLxXs4cK4";
const DEFAULT_SOURCE="Cora Website";
const SHEETS={
 "Cora Leads":["Lead-ID","Zeitpunkt","Name","Unternehmen","E-Mail","Telefon","Website","Branche","Unternehmensgröße","Hauptziel","Leistung","Anliegen","Website-Anfragen/Monat","Interesse","Empfohlenes Paket","Kaufabsicht","Lead-Status","Quelle","Landingpage","Datenschutz-Einwilligung"],
 "Cora Conversations":["Conversation-ID","Lead-ID","Startzeit","Endzeit","Branche","Ziel","Anzahl Nachrichten","Intent","Purchase Intent","Qualification Status","Recommended Package","ROI Requested","Contact Requested","Outcome","Summary"],
 "Cora Events":["Event-ID","Session-ID","Zeitpunkt","Event","Branche","Section","Intent","Device","Source"],
 "Cora Knowledge":["Knowledge-ID","Branche","Kategorie","Frage","Antwort","Use Case","Priorität","Aktiv","Version","Status","Verbotene Formulierungen","Eskalation nötig"],
 "Cora Config":["Key","Value","Description","Active","Updated"]
};
const MAX=1000;
function doGet(){return json_({ok:true,service:"Cora Leads",sheets:Object.keys(SHEETS)})}
function doPost(e){
 try{
  const p=e&&e.parameter?e.parameter:{};
  if(clean_(p.website_check))return json_({ok:false,ignored:true});
  if(!clean_(p.name)||!clean_(p.company)||!clean_(p.email)||!clean_(p.message)||clean_(p.privacy_consent)!=="yes")return json_({ok:false,error:"Required fields missing"});
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const lock=LockService.getScriptLock();lock.waitLock(5000);
  try{
   Object.keys(SHEETS).forEach(k=>ensureSheet_(ss,k,SHEETS[k]));
   const leadId=Utilities.getUuid(),lead=ss.getSheetByName("Cora Leads");
   const row=[leadId,new Date(),clean_(p.name),clean_(p.company),clean_(p.email),clean_(p.phone),clean_(p.website),clean_(p.industry),clean_(p.company_size),clean_(p.goal),clean_(p.service||p.plan),clean_(p.message),clean_(p.monthlyInquiries),clean_(p.interest||p.plan),clean_(p.plan),clean_(p.purchase_intent||"niedrig"),"Neu",DEFAULT_SOURCE,clean_(p.page),clean_(p.privacy_consent)];
   lead.appendRow(row);
   return json_({ok:true,leadId,status:"Neu"});
  }finally{lock.releaseLock()}
 }catch(err){return json_({ok:false,error:"Lead storage failed"})}
}
function initializeSheets(){const ss=SpreadsheetApp.openById(SPREADSHEET_ID);Object.keys(SHEETS).forEach(k=>ensureSheet_(ss,k,SHEETS[k]));}
function ensureSheet_(ss,name,headers){
 let sheet=ss.getSheetByName(name);if(!sheet)sheet=ss.insertSheet(name);
 if(sheet.getLastRow()===0)sheet.getRange(1,1,1,headers.length).setValues([headers]);
 else{const current=sheet.getRange(1,1,1,Math.max(sheet.getLastColumn(),headers.length)).getValues()[0];headers.forEach((h,i)=>{if(current[i]!==h)sheet.getRange(1,i+1).setValue(h)})}
 sheet.setFrozenRows(1);
}
function clean_(v){let s=String(v==null?"":v).trim().slice(0,MAX);if(/^[=+\\-@]/.test(s))s="'"+s;return s}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}