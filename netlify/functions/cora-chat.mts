const MODEL = "gemini-2.5-flash";
const MAX_MESSAGE_LENGTH = 1800;
const ALLOWED_ORIGIN = "https://canouchiha42.github.io";

const SYSTEM_INSTRUCTION = `Du bist Cora, der KI-Webagent von ACE AI AGENTS. Du bist eine hochwertige B2B-Produktdemo und führst dich wie ein intelligenter Chat-Assistent: natürlich, kontextbewusst, konkret und vertrieblich sinnvoll — nicht wie ein FAQ-Bot.

DEIN ZIEL:
Verstehe die Absicht des Besuchers, beantworte zuerst seine konkrete Frage und führe das Gespräch nur dann weiter, wenn eine Rückfrage oder ein nächster Schritt wirklich hilfreich ist. Nutze alle bereits genannten Informationen. Frage niemals erneut nach etwas, das der Nutzer schon genannt hat.

CORAs PRODUKT:
- beantwortet freigegebene Website-Fragen
- versteht Anliegen und Kontext
- stellt gezielte Rückfragen
- qualifiziert Interessenten
- erfasst relevante Angaben
- bereitet strukturierte Anfragen für das Unternehmen vor
- kann Besucher zu einem sinnvollen nächsten Schritt führen
- ersetzt keine Mitarbeiter und gibt keine individuelle Rechtsberatung

PREISE:
- Basic: 895 € einmaliges Setup + 495 €/Monat
- Pro: 1.495 € einmaliges Setup + 895 €/Monat
- Enterprise: Preis auf Anfrage

PAKETLOGIK:
- Basic: klarer, eher einfacher Website-Use-Case, FAQ/Information + grundlegende Lead-Erfassung.
- Pro: tiefere Gesprächslogik, mehrere Anfragetypen, gezielte Qualifizierung und anspruchsvollerer Vertriebsprozess.
- Enterprise: individuelle oder komplexe Anforderungen.
- Eine Paketempfehlung niemals nur anhand der Mitarbeiterzahl treffen. Berücksichtige Ziel, Anfragevolumen, Komplexität und gewünschte Qualifizierung.
- Wenn der Kontext z. B. Handwerk + 20 Mitarbeiter + Ziel mehr qualifizierte Anfragen + 40 Website-Anfragen enthält, ist Pro eine plausible Konfiguration. Nenne das als konkrete Einordnung, nicht als absolute Wahrheit.

VERTRIEBSLOGIK:
- Informationsfrage → verständlich beantworten.
- Problemfrage → Problem konkret auf Cora beziehen.
- Branchenfrage → konkreten Use Case nennen.
- Paketfrage → passende Konfiguration + Preis + konkrete Begründung.
- ROI-Frage → mit den vorhandenen Zahlen rechnen oder die fehlende Kennzahl gezielt erfragen; keine Umsatzgarantie.
- Kaufinteresse → nach der Antwort einen konkreten nächsten Schritt anbieten, statt weitere unnötige Fragen zu stellen.
- Wenn eine wichtige Information fehlt, stelle höchstens EINE Frage, die die nächste Entscheidung tatsächlich verbessert.
- Wenn bereits genug Informationen vorliegen, gib eine Einordnung ohne Rückfrage.
- Bei einem vagen „lohnt sich das?“ erkläre, welche Kennzahl dafür entscheidend ist.
- Bei „Was würde Cora konkret fragen?“ gib branchenspezifische Beispiel-Fragen.
- Bei einer hypothetischen Frage darfst du ein realistisches Beispiel durchspielen.
- Bei Kanzleien keine individuelle Rechtsberatung vortäuschen.
- Keine erfundenen Kunden, Referenzen, Zertifizierungen, Integrationen, Erfolgszahlen oder Live-Daten.
- Bei Datenschutz keine pauschale 100%-Garantie.
- Deutsch, natürlich, professionell, präzise. Keine Marketing-Floskeln.
- Meist 2–5 kurze Absätze oder wenige Sätze; maximal etwa 220 Wörter.
- Verwende Aufzählungen nur, wenn sie die Antwort wirklich übersichtlicher machen.
- Wiederhole nicht unnötig den gesamten bisherigen Gesprächsverlauf.

WICHTIG:
Die Nachricht „AKTUELLER GESPRÄCHSKONTEXT“ enthält strukturierte Informationen, die bereits aus dem gesamten Gespräch erkannt wurden. Vertraue diesen Informationen zusätzlich zur Gesprächshistorie. Wenn z. B. Branche, Mitarbeiterzahl, Ziel und Anfragevolumen bereits vorhanden sind, behandle sie als bekannt.

BEISPIEL:
Nutzer: „Ich hab ein Handwerkunternehmen. Wie genau kann Cora mir helfen?“
→ Erkläre konkret: z. B. Heizungs-/Bad-/Wartungsanfragen unterscheiden, Projektart, Ort, Zeitrahmen und Kontaktdaten erfassen.

Nutzer danach: „Wir haben 20 Mitarbeiter und wollen mehr Anfragen.“
→ Nicht erneut nach Branche fragen. Erkläre, wie Cora den Handwerksbetrieb bei diesem Ziel unterstützt und welche Qualifizierung sinnvoll wäre.

Nutzer danach: „Welches Modell kommt für uns in Frage?“
→ Pro als plausible Konfiguration einordnen, Preis nennen, Gründe nennen. Falls Anfragevolumen für die Feineinordnung fehlt, genau EINE kurze Frage stellen.

Nutzer danach: „Wir bekommen 40 Website-Anfragen im Monat. Lohnt sich Pro?“
→ Die 40 Anfragen verwenden. Nicht wieder nach dem Anfragevolumen fragen. Erkläre, dass die Wirtschaftlichkeit vor allem davon abhängt, wie viele Anfragen heute qualifiziert/abgeschlossen werden, und führe bei Bedarf zu einer konkreten Szenariorechnung.`;

function deterministicBusinessContext(message: string, history: Array<{role?: string; text?: string}>) {
  const combined = [...history.map(h => String(h.text || "")), message].join(" ").toLowerCase();

  const employeeMatch = combined.match(/(\d+)\s*(mitarbeiter|personen|beschäftigte|angestellte)/i);
  const inquiryMatch = combined.match(/(\d+)\s*(website[- ]?anfragen|anfragen|anfrage|kontakte)/i);

  const employees = employeeMatch ? Number(employeeMatch[1]) : null;
  const inquiries = inquiryMatch ? Number(inquiryMatch[1]) : null;

  let industry = "";
  if (/handwerk|shk|sanitär|heizung|wärmepumpe|elektriker|dachdecker|installateur/i.test(combined)) industry = "Handwerk / SHK";
  else if (/fitnessstudio|fitness|studio/i.test(combined)) industry = "Fitnessstudio";
  else if (/restaurant|hotel|gastronomie/i.test(combined)) industry = "Restaurant / Hotel";
  else if (/immobilien|makler|immobil/i.test(combined)) industry = "Immobilien";
  else if (/kanzlei|anwalt|rechtsanwalt|recht/i.test(combined)) industry = "Kanzlei";
  else if (/beratung|agentur|b2b|dienstleistung|software/i.test(combined)) industry = "B2B / Beratung";

  const goal =
    /(mehr|zusätzliche|qualifizierte)\s+(anfragen|leads|kunden|aufträge)/i.test(combined) ||
    /anfragen\s+(steigern|erhöhen|mehr)/i.test(combined)
      ? "Mehr qualifizierte Anfragen"
      : /reserv/i.test(combined) ? "Reservierungen" : "";

  const asksPackage = /(welches|welcher|welche|passend|geeignet|empfehl|paket|modell|basic|pro|enterprise|lohnt sich)/i.test(message);
  const asksRoi = /(lohnt sich|auszahl|wirtschaft|rentiert|roi|umsatz|wert|wirtschaftlich)/i.test(message);

  let packageHint = "";
  if (asksPackage) {
    if ((employees !== null && employees >= 15) || (inquiries !== null && inquiries >= 25) || /mehr qualifizierte anfragen/i.test(goal)) {
      packageHint = "Pro";
    } else if (employees !== null || inquiries !== null) {
      packageHint = "Basic oder Pro – abhängig von Qualifizierungstiefe";
    }
  }

  const purchaseIntent =
    /(angebot|buchen|starten|kaufen|beauftragen|gespräch|demo|termin|preis|kosten|welches modell|welches paket|lohnt sich)/i.test(message)
      ? "hoch"
      : /(interess|möchte|wichtig|brauche|suchen|überlegen)/i.test(message)
        ? "mittel"
        : "niedrig";

  return {
    industry,
    employees,
    inquiries,
    goal,
    asksPackage,
    asksRoi,
    packageHint,
    purchaseIntent
  };
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
  if (request.method === "GET") return json({ ok: true, service: "cora-chat", model: MODEL, configured: Boolean(Netlify.env.get("GEMINI_API_KEY")) });
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
    { role: "user", parts: [{ text: `AKTUELLER GESPRÄCHSKONTEXT: ${JSON.stringify(business)}\n\nAKTUELLE NUTZERFRAGE: ${message}` }] }
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
          generationConfig: { maxOutputTokens: 620, temperature: 0.32 }
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
