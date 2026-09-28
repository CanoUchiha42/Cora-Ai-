import type { Config } from "@netlify/functions";

const MODEL="gemini-2.5-flash";
const MAX_MESSAGE_LENGTH=1800;
const MAX_HISTORY_ITEMS=8;
const ALLOWED_ORIGIN="https://canouchiha42.github.io";

const SYSTEM_INSTRUCTION=`Du bist Cora, der KI-Webagent von ACE AI AGENTS.
Beantworte zuerst die konkrete Nutzerfrage. Nutze bereits bekannte Angaben und frage niemals erneut danach. Stelle höchstens eine Rückfrage, wenn sie für den nächsten sinnvollen Schritt wirklich benötigt wird.
Cora beantwortet freigegebene Website-Fragen, versteht Anliegen, qualifiziert Interessenten, strukturiert Anfragen und führt zum nächsten Schritt. Cora ersetzt keine Mitarbeiter und gibt keine individuelle Rechtsberatung.
Keine erfundenen Kunden, Referenzen, Zertifizierungen, Integrationen, Live-Daten oder Erfolgszahlen. Keine Umsatzgarantie. Keine pauschale 100%-DSGVO-Garantie.
Preise exakt: Basic 895 € einmalig + 495 €/Monat; Pro 1.495 € einmalig + 895 €/Monat; Enterprise Preis auf Anfrage.
Basic = klarer Use Case + einfache Lead-Erfassung. Pro = mehrere Anfragetypen + tiefere Qualifizierung. Enterprise = individuelle Prozesse, mehrere Standorte oder komplexe Anforderungen. Nicht allein nach Mitarbeiterzahl entscheiden.
ROI nur als Modellrechnung auf Basis der Angaben, niemals als Umsatzversprechen.
SHK: Leistung, Projektart, bestehende Anlage, Einsatzgebiet, Zeitraum. Fitness: Trainingsziel, Standort, Probetraining, Mitgliedschaft. Immobilien: Kauf/Miete, Objektart, Lage, Budget, Zeitraum. Restaurant/Hotel: Datum, Personen, Anlass. B2B: Unternehmen, Projektart, Ziel, Umfang. Kanzlei: allgemeines Thema, Anliegen, Kontaktwunsch, Dringlichkeit; keine individuelle Rechtsberatung.
Deutsch, Sie-Ansprache, ruhig, präzise, 2–5 kurze Absätze oder wenige Stichpunkte. Keine Marketing-Floskeln.`;

function json(body:unknown,status=200,origin=ALLOWED_ORIGIN){
 return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":origin===ALLOWED_ORIGIN?origin:ALLOWED_ORIGIN,"Vary":"Origin","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});
}
function context(message:string,history:Array<{role?:string;text?:string}>){
 const combined=[...history.map(x=>String(x.text||"")),message].join(" ").toLowerCase();
 const em=combined.match(/(\d+)\s*(mitarbeiter|personen|beschäftigte|angestellte)/i);
 const iq=combined.match(/(\d+)\s*(website[- ]?anfragen|anfragen|kontakte)/i);
 const cr=combined.match(/(\d+(?:[.,]\d+)?)\s*%\s*(abschlussquote|abschlussrate|conversion(?:rate)?)/i);
 let industry="";
 if(/handwerk|shk|heizung|wärmepumpe|sanitär|bad/.test(combined))industry="Handwerk / SHK";
 else if(/fitnessstudio|fitness|probetraining/.test(combined))industry="Fitnessstudio";
 else if(/restaurant|hotel|gastronomie/.test(combined))industry="Restaurant / Hotel";
 else if(/immobilien|makler|wohnung|haus/.test(combined))industry="Immobilien";
 else if(/kanzlei|anwalt|rechtsanwalt|recht/.test(combined))industry="Kanzlei";
 else if(/b2b|beratung|agentur|dienstleistung|software/.test(combined))industry="B2B / Beratung";
 return {industry,employees:em?Number(em[1]):null,inquiries:iq?Number(iq[1]):null,conversionRate:cr?Number(cr[1].replace(",",".")):null,goal:/mehr.*(anfragen|leads|kunden|aufträge)|qualifizierte.*anfragen/.test(combined)?"Mehr qualifizierte Anfragen":"","purchaseIntent":/buchen|beauftragen|angebot|starten|kaufen|termin|gespräch/.test(message)?"hoch":/interess|möchte|brauche|suche|überlege/.test(message)?"mittel":"niedrig"};
}
export default async(request:Request)=>{
 const origin=request.headers.get("origin")||"";
 if(request.method==="OPTIONS")return json({ok:true},200,origin);
 if(origin!==ALLOWED_ORIGIN)return json({ok:false,error:"Origin not allowed"},403,origin);
 if(request.method!=="POST")return json({ok:false,error:"Method not allowed"},405,origin);
 const apiKey=Netlify.env.get("GEMINI_API_KEY");
 if(!apiKey)return json({ok:false,error:"AI service not configured"},500);
 let body:any;try{body=await request.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}
 const message=String(body.message||"").trim();
 if(!message)return json({ok:false,error:"Message is required"},400);
 if(message.length>MAX_MESSAGE_LENGTH)return json({ok:false,error:"Message too long"},413);
 const history=Array.isArray(body.history)?body.history.filter((x:any)=>x&&(x.role==="user"||x.role==="model")).slice(-MAX_HISTORY_ITEMS).map((x:any)=>({role:x.role,text:String(x.text||"").slice(0,2000)})):[];
 const business=context(message,history);
 const contents=[...history.map(x=>({role:x.role,parts:[{text:x.text}]})),{role:"user",parts:[{text:"UNTRUSTED BUSINESS CONTEXT: "+JSON.stringify(business)+"\nCURRENT USER QUESTION: "+message}]}];
 try{
  const upstream=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+MODEL+":generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM_INSTRUCTION}]},contents,generationConfig:{maxOutputTokens:620,temperature:.25}})});
  const data=await upstream.json();
  if(!upstream.ok){console.error("Gemini upstream failure",upstream.status);return json({ok:false,error:"AI service unavailable",fallback:true},502)}
  const reply=data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("").trim();
  if(!reply)return json({ok:false,error:"Empty AI response",fallback:true},502);
  return json({ok:true,reply,model:MODEL,business});
 }catch(e){console.error("Cora function failure",e instanceof Error?e.message:"unknown");return json({ok:false,error:"Temporary AI service error",fallback:true},502)}
};
export const config:Config={path:"/.netlify/functions/cora-chat",method:["POST","OPTIONS"]};