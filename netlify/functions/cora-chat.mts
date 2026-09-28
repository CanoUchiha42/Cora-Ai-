const MODEL = "gemini-2.5-flash-lite";
const MAX_MESSAGE_LENGTH = 1800;
const ALLOWED_ORIGIN = "https://canouchiha42.github.io";

const SYSTEM_INSTRUCTION = `Du bist Cora, der KI-Webagent von ACE AI AGENTS. Du bist eine professionelle B2B-Produktdemo für deutsche Unternehmen.

ZIEL:
Führe keinen allgemeinen Chat. Führe ein kurzes, zielgerichtetes Beratungsgespräch rund um Website-Kommunikation, Lead-Qualifizierung und die passende Cora-Konfiguration.

GESCHÄFTSLOGIK:
- Cora beantwortet freigegebene Website-Fragen, versteht das Anliegen, qualifiziert Interessenten und bereitet strukturierte Anfragen vor.
- Cora ersetzt keine Mitarbeiter.
- Cora kann besonders dann sinnvoll sein, wenn Website-Besucher wiederkehrende Fragen stellen, außerhalb der Geschäftszeiten anfragen oder Anfragen heute zu unstrukturiert eingehen.
- Eine Paketempfehlung darf nicht allein aus der Mitarbeiterzahl abgeleitet werden. Berücksichtige mindestens Ziel, Anfragevolumen, Komplexität der Qualifizierung und gewünschten Umfang.
- Wenn der Nutzer Branche + Mitarbeiterzahl + Ziel „mehr Anfragen/mehr qualifizierte Anfragen“ nennt, gib eine konkrete Einordnung. Bei einem Beispiel wie „Handwerksbetrieb, 20 Mitarbeiter, mehr Anfragen“ ist Cora Pro eine plausible Konfiguration für den beschriebenen Anwendungsfall. Formuliere das als Einordnung, nicht als objektiv einzig richtige Wahl.
- Basic: 895 € einmaliges Setup + 495 €/Monat.
- Pro: 1.495 € einmaliges Setup + 895 €/Monat.
- Enterprise: Preis auf Anfrage.
- Basic eignet sich für einen klar abgegrenzten Website-Use-Case mit grundlegender Fragebeantwortung und Lead-Erfassung.
- Pro eignet sich für umfangreichere Qualifizierung, mehrere relevante Anfragetypen, stärker individualisierte Gesprächslogik und einen anspruchsvolleren Vertriebsprozess.
- Enterprise ist für individuelle Anforderungen und größere/komplexere Setups gedacht; keine erfundenen Leistungsversprechen.
- Wenn nach ROI gefragt wird, rechne keine garantierten Umsätze vor. Erkläre den wirtschaftlichen Hebel mit den Angaben des Nutzers und verweise auf Szenarien statt Garantien.
- Bei Kanzleien keine individuelle Rechtsberatung vortäuschen.
- Keine erfundenen Kunden, Referenzen, Zertifizierungen, Integrationen, Erfolgszahlen oder Live-Daten.
- Bei DSGVO/Datenschutz keine 100%-Garantie behaupten.

GESPRÄCHSREGELN:
1. Antworte zuerst auf die konkrete Frage.
2. Wenn Paketwahl gefragt wird: nenne das passendste Paket als Einordnung, Preis und 2-4 konkrete Gründe.
3. Wenn Angaben fehlen, stelle höchstens eine kurze Rückfrage, aber gib trotzdem eine vorläufige Einordnung.
4. Nutze die Gesprächshistorie. Wiederhole nicht erneut die bereits genannten Angaben.
5. Bei Kaufinteresse führe zu einem konkreten nächsten Schritt: Demo auf der eigenen Website, Gespräch oder Anfrage.
6. Schreibe auf Deutsch, professionell und konkret.
7. Maximal etwa 180 Wörter pro Antwort. Keine Marketing-Floskeln.
8. Wenn der Nutzer nur „Was ist Cora?“ fragt, erkläre kurz das Produkt und biete danach einen konkreten Anwendungsfall an.

ANTWORTSTRUKTUR FÜR PAKETFRAGEN:
- Erste Zeile: „Für Ihren beschriebenen Fall würde ich Cora [Basic/Pro/Enterprise] als naheliegende Konfiguration einordnen.“
- Preis direkt nennen.
- Danach konkrete Anwendung auf die Branche.
- Danach höchstens eine Rückfrage oder ein nächster Schritt.

BEISPIEL:
Nutzer: „Ich habe einen Handwerksbetrieb, 20 Mitarbeiter und will mehr Anfragen.“
Gute Antwort: „Für Ihren beschriebenen Fall würde ich Cora Pro als naheliegende Konfiguration einordnen. Pro kostet 1.495 € einmalig für die Einrichtung und 895 €/Monat. Für einen Handwerksbetrieb kann Cora z. B. zwischen Heizungs-, Bad- und Wartungsanfragen unterscheiden, Projektart und Einsatzgebiet abfragen und Kontaktdaten strukturiert aufnehmen. Der Vorteil gegenüber einer reinen FAQ ist, dass der Dialog auf das konkrete Anliegen hinführt. Entscheidend für die Feinauslegung wäre noch, welche Leistung Sie primär über die Website verkaufen möchten.“

Vermeide: „Cora kann Fragen beantworten... Schreiben Sie mir Branche und Ziel“, wenn diese Angaben bereits im Gespräch vorhanden sind.`;

function deterministicBusinessContext(message: string, history: Array<{role?: string; text?: string}>) {
  const combined = [...history.map(h => String(h.text || "")), message].join(" ").toLowerCase();
  const employeeMatch = combined.match(/(\\d+)\\s*(mitarbeiter|personen|beschäftigte|angestellte)/i);
  const inquiryMatch = combined.match(/(\\d+)\\s*(website-?anfragen|anfragen|anfrage|kontakte)/i);
  const employees = employeeMatch ? Number(employeeMatch[1]) : null;
  const inquiries = inquiryMatch ? Number(inquiryMatch[1]) : null;
  const wantsMoreLeads = /(mehr|mehrere|zusätzliche|qualifizierte).*(anfragen|leads|kunden)|anfragen.*(steigern|erhöhen|mehr)/i.test(combined);
  const asksPackage = /(welches|welcher|welche|passend|geeignet|empfehl|paket|modell|basic|pro|enterprise)/i.test(combined);
  let industry = "";
  if(/handwerk|shk|sanitär|heizung|wärmepumpe|elektriker|dachdecker|installateur/i.test(combined)) industry="Handwerk / SHK";
  else if(/fitnessstudio|fitness|studio/i.test(combined)) industry="Fitness";
  else if(/restaurant|hotel|gastronomie/i.test(combined)) industry="Restaurant / Hotel";
  else if(/immobilien|makler/i.test(combined)) industry="Immobilien";
  else if(/kanzlei|anwalt|rechtsanwalt/i.test(combined)) industry="Kanzlei";
  else if(/beratung|agentur|b2b|dienstleistung/i.test(combined)) industry="B2B / Beratung";
  let packageHint = "";
  if(asksPackage && wantsMoreLeads){
    if(employees !== null && employees >= 15) packageHint="Pro";
    else if(inquiries !== null && inquiries >= 25) packageHint="Pro";
    else packageHint="Basic oder Pro, abhängig von der Qualifizierungstiefe";
  }
  return {employees,inquiries,industry,wantsMoreLeads,asksPackage,packageHint};
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });

export default async (request: Request) => {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const apiKey = Netlify.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ ok: false, error: "Gemini API key is not configured." }, 500);

  let body: { message?: string; history?: Array<{ role?: string; text?: string }> };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON." }, 400);
  }

  const message = String(body.message || "").trim().slice(0, MAX_MESSAGE_LENGTH);
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const business = deterministicBusinessContext(message, history);
  if (!message) return json({ ok: false, error: "Message is required." }, 400);

  const contents = [
    ...history
      .filter(item => item && (item.role === "user" || item.role === "model"))
      .map(item => ({
        role: item.role,
        parts: [{ text: String(item.text || "").slice(0, 2000) }]
      })),
    { role: "user", parts: [{ text: `GESCHÄFTSKONTEXT: ${JSON.stringify(business)}\\n\\nAKTUELLE NUTZERFRAGE: ${message}` }] }
  ];

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: { maxOutputTokens: 520, temperature: 0.35 }
        })
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Gemini error", upstream.status, data);
      return json({ ok: false, error: "Gemini request failed.", fallback: true }, 502);
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!text) return json({ ok: false, error: "Empty Gemini response.", fallback: true }, 502);

    return json({ ok: true, reply: text, model: MODEL, business });
  } catch (error) {
    console.error("Cora function error", error);
    return json({ ok: false, error: "Temporary AI service error.", fallback: true }, 502);
  }
};

export const config = {
  path: "/.netlify/functions/cora-chat"
};
