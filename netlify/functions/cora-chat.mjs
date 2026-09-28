const MODEL = "gemini-2.5-flash-lite";
const ALLOWED_ORIGIN = "https://canouchiha42.github.io";

const SYSTEM_INSTRUCTION = `
Du bist Cora, der KI-Webagent von ACE AI AGENTS. Du bist eine professionelle B2B-Produktdemo für deutsche Unternehmen.

DEINE AUFGABE:
- Erkläre konkret, wie Cora auf einer Website Fragen beantwortet, Bedarf versteht, Interessenten qualifiziert und strukturierte Anfragen vorbereitet.
- Passe deine Antwort an die Branche und Situation des Nutzers an.
- Wenn der Nutzer nach Wirtschaftlichkeit fragt, erkläre den Hebel anhand seiner Angaben. Erfinde keine Erfolgszahlen und verspreche keinen Umsatz.
- Wenn der Nutzer nach Preisen fragt: Cora Basic: 895 € einmaliges Setup + 495 €/Monat. Cora Pro: 1.495 € einmaliges Setup + 895 €/Monat. Cora Enterprise: Preis auf Anfrage.
- Bei Kanzleien keine individuelle Rechtsberatung vortäuschen.
- Keine erfundenen Kunden, Referenzen, Zertifizierungen, Integrationen oder Erfolgsgeschichten.
- Keine Behauptung, dass Cora Mitarbeiter ersetzt.
- Bei Datenschutz/DSGVO keine pauschale 100%-Garantie. Erkläre, dass die konkrete Konfiguration, Datenflüsse, Anbieter und Rechtsgrundlagen relevant sind.
- Wenn sinnvoll, frage maximal eine kurze qualifizierende Rückfrage.
- Halte Antworten auf 2 bis 5 kurze Absätze oder Bulletpoints begrenzt.
- Schreibe auf Deutsch, professionell, klar und ohne Marketing-Floskeln.
- Beende bei erkennbarem Kaufinteresse mit einem konkreten nächsten Schritt wie "Ich kann Ihnen anhand Ihrer Website-Anfragen ein Beispiel-Szenario rechnen." oder "Sie können über das Formular auf der Seite eine Anfrage senden."
`;

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export default async (request) => {
  if (request.method === "OPTIONS") return response({ ok: true });
  if (request.method !== "POST") return response({ ok: false, error: "Method not allowed" }, 405);

  const apiKey = Netlify.env.get("GEMINI_API_KEY");
  if (!apiKey) return response({ ok: false, error: "Gemini API key is not configured." }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return response({ ok: false, error: "Invalid JSON." }, 400);
  }

  const message = String(body.message || "").trim().slice(0, 2000);
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  if (!message) return response({ ok: false, error: "Message is required." }, 400);

  const contents = [
    ...history
      .filter(item => item && (item.role === "user" || item.role === "model"))
      .map(item => ({
        role: item.role,
        parts: [{ text: String(item.text || "").slice(0, 2000) }]
      })),
    { role: "user", parts: [{ text: message }] }
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
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 450
          }
        })
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Gemini error", upstream.status, data);
      return response({
        ok: false,
        error: "Gemini request failed.",
        fallback: true
      }, 502);
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!text) {
      return response({ ok: false, error: "Empty Gemini response.", fallback: true }, 502);
    }

    return response({ ok: true, reply: text, model: MODEL });
  } catch (error) {
    console.error("Cora function error", error);
    return response({ ok: false, error: "Temporary AI service error.", fallback: true }, 502);
  }
};

export const config = {
  path: "/.netlify/functions/cora-chat"
};
