import type { Config } from "@netlify/functions";
const MODEL="gemini-3.8-flash";
const MAX_MESSAGE_LENGTH=1800;
const MAX_HISTORY_ITEMS=10;
const ALLOWED_ORIGIN="https://canouchiha42.github.io";
const SYSTEM_INSTRUCTION=`Du bist Cora, der KI-Webagent von ACE AI AGENTS.
Beantworte zuerst die konkrete Nutzerfrage. Nutze bereits bekannte Angaben und frage niemals erneut danach. Stelle höchstens eine Rückfrage, wenn sie für den nächsten sinnvollen Schritt wirklich benötigt wird.
Cora beantwortet freigegebene Website-Fragen, versteht Anliegen, qualifiziert Interessenten, strukturiert Anfragen und führt zum nächsten Schritt. Cora ersetzt keine Mitarbeiter und gibt keine individuelle Rechts-, Medizin- oder Finanzberatung.
Keine erfundenen Kunden, Referenzen, Zertifizierungen, Integrationen, Live-Daten oder Erfolgszahlen. Keine Umsatzgarantie. Keine pauschale 100%-DSGVO-Garantie.
Preise exakt: Basic 895 € einmalig + 495 €/Monat; Pro 1.495 € einmalig + 895 €/Monat; Enterprise Preis auf Anfrage.
Basic = klarer Use Case + einfache Lead-Erfassung. Pro = mehrere Anfragetypen + tiefere Qualifizierung. Enterprise = individuelle Prozesse, mehrere Standorte oder komplexe Anforderungen. Nicht allein nach Mitarbeiterzahl entscheiden.
ROI nur als Modellrechnung auf Basis der Angaben, niemals als Umsatzversprechen.
Branchenlogik: Fitness (Trainingsziel, Probetraining, Mitgliedschaft, Kurse); SHK/Handwerk (Leistung, Projektart, bestehende Anlage, Einsatzgebiet, Zeitraum); Elektrotechnik/PV (Leistung, Objekt, Projektart, Ort, Zeitraum); Immobilien (Kauf/Miete, Objektart, Lage, Budget, Zeitraum); Restaurant/Hotel (Datum, Personen, Anlass, Leistung); B2B/Agentur (Unternehmen, Ziel, Projektart, Umfang, Zeitrahmen); Kanzlei (allgemeines Thema, Anliegen, Kontaktwunsch, Dringlichkeit, keine Rechtsberatung); Praxis (organisatorisches Anliegen, Terminart, keine Diagnose); Auto (Fahrzeug, Service, Termin); IT/Software (Projektziel, Systeme, Umfang); Marketing (Ziel, Kanal, Umfang).
Wenn Kontext bereits vorhanden ist, wiederhole ihn nicht. Bei einer zweiten Frage zum selben Thema direkt darauf aufbauen.
Deutsch, Sie-Ansprache, ruhig, präzise, 2–5 kurze Absätze oder wenige Stichpunkte. Keine Marketing-Floskeln.`;

function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Vary":"Origin","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});}
function context(message:string,history:Array<{role?:string;text?:string}>,provided:any){
 const combined=[...history.map(x=>String(x.text||"")),message].join(" ").toLowerCase();
 const em=combined.match(/(\\d+)\\s*(mitarbeiter|personen|beschäftigte|angestellte)/i);
 const iq=combined.match(/(\\d+)\\s*(website[- ]?anfragen|anfragen|kontakte)/i);
 const cr=combined.match(/(\\d+(?:[.,]\\d+)?)\\s*%\\s*(abschlussquote|abschlussrate|conversion(?:rate)?)/i);
 let industry="";
 if(/handwerk|shk|heizung|wärmepumpe|sanitär|bad/.test(combined))industry="Handwerk / SHK";
 else if(/fitnessstudio|fitness|probetraining/.test(combined))industry="Fitnessstudio";
 else if(/restaurant|hotel|gastronomie/.test(combined))industry="Restaurant / Hotel";
 else if(/immobilien|makler|wohnung|haus/.test(combined))industry="Immobilien";
 else if(/kanzlei|anwalt|rechtsanwalt|recht/.test(combined))industry="Kanzlei";
 else if(/elektro|photovoltaik|pv|wallbox/.test(combined))industry="Elektrotechnik";
 else if(/arzt|zahnarzt|praxis|physio/.test(combined))industry="Arztpraxis / Gesundheit";
 else if(/autohaus|werkstatt|fahrzeug|inspektion/.test(combined))industry="Autohaus / Werkstatt";
 else if(/it|software|cloud|webentwicklung/.test(combined))industry="IT / Software";
 else if(/marketing|seo|social media|branding/.test(combined))industry="Marketing / Kreativagentur";
 else if(/b2b|beratung|agentur|dienstleistung/.test(combined))industry="B2B / Beratung";
 return {industry:provided?.industry||industry,employees:provided?.companySize??(em?Number(em[1]):null),inquiries:provided?.monthlyWebsiteInquiries??(iq?Number(iq[1]):null),conversionRate:provided?.conversionRate??(cr?Number(cr[1].replace(",",".")):null),goal:provided?.goal||(/mehr.*(anfragen|leads|kunden|aufträge)|qualifizierte.*anfragen/.test(combined)?"Mehr qualifizierte Anfragen":""),purchaseIntent:provided?.purchaseIntent||(/buchen|beauftragen|angebot|starten|kaufen|termin|gespräch/.test(message)?"hoch":/interess|möchte|brauche|suche|überlege/.test(message)?"mittel":"niedrig")};
}
export default async(request:Request)=>{
 const origin=request.headers.get("origin")||"";
 if(origin&&origin!==ALLOWED_ORIGIN)return json({ok:false,error:"Origin not allowed"},403);
 if(request.method==="OPTIONS")return json({ok:true});
 const apiKey=Netlify.env.get("GEMINI_API_KEY");
 if(request.method==="GET")return json({ok:true,service:"gemini",configured:Boolean(apiKey),model:MODEL,timestamp:new Date().toISOString()});
 if(request.method!=="POST")return json({ok:false,error:"Method not allowed"},405);
 if(!apiKey)return json({ok:false,error:"AI service not configured",fallback:true},500);
 let body:any;try{body=await request.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}
 const message=String(body.message||"").trim();
 if(!message)return json({ok:false,error:"Message is required"},400);
 if(message.length>MAX_MESSAGE_LENGTH)return json({ok:false,error:"Message too long"},413);
 const history=Array.isArray(body.history)?body.history.filter((x:any)=>x&&(x.role==="user"||x.role==="model")).slice(-MAX_HISTORY_ITEMS).map((x:any)=>({role:x.role,text:String(x.text||"").slice(0,1800)})):[];
 const business=context(message,history,body.businessContext||{});
 const contents=[...history.map(x=>({role:x.role,parts:[{text:x.text}]})),{role:"user",parts:[{text:"UNTRUSTED BUSINESS CONTEXT: "+JSON.stringify(business)+"\\nCURRENT USER QUESTION: "+message}]}];
 try{
  const upstream=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+MODEL+":generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM_INSTRUCTION}]},contents,generationConfig:{maxOutputTokens:1200,thinkingConfig:{thinkingLevel:"high"}}})});
  const data=await upstream.json();
  if(!upstream.ok){console.error("Gemini upstream failure",upstream.status);return json({ok:false,error:"AI service unavailable",fallback:true},502)}
  const reply=data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("").trim();
  if(!reply)return json({ok:false,error:"Empty AI response",fallback:true},502);
  return json({ok:true,reply,model:MODEL,business});
 }catch(e){console.error("Cora function failure",e instanceof Error?e.message:"unknown");return json({ok:false,error:"Temporary AI service error",fallback:true},502)}
};
export const config:Config={path:"/.netlify/functions/cora-chat",method:["GET","POST","OPTIONS"]};