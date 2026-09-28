# AGENTS.md — Cora AI / ACE AI AGENTS

## 1. Projektziel

Dieses Repository ist die öffentliche Cora-AI-Website von ACE AI AGENTS:

- Repository: `CanoUchiha42/Cora-Ai-`
- Deployment: GitHub Pages
- Produkt: **Cora AI**
- Marke: **ACE AI AGENTS**

Cora ist ein DSGVO-bewusster KI-Webagent für Unternehmenswebsites. Cora beantwortet Besucherfragen, erklärt Leistungen, ordnet Anliegen ein, qualifiziert Interessenten und kann strukturierte Anfragen erfassen.

Cora soll nicht als Ersatz für Mitarbeiter vermarktet werden. Keine erfundenen Kunden, Logos, Testimonials, Zertifikate, Erfolgsquoten oder angeblichen Live-Daten.

## 2. Arbeitsprinzip

Arbeite zuerst analytisch, dann ändere Code.

Standardablauf:

1. Repository und relevante Dateien untersuchen.
2. Bestehende Architektur und Verhalten verstehen.
3. Problem reproduzieren, wenn möglich.
4. Mit vorhandenen MCPs testen bzw. Dokumentation prüfen.
5. Kleinste sinnvolle Änderung umsetzen.
6. Auswirkungen auf Desktop und Mobile prüfen.
7. Relevante Tests durchführen.
8. Keine funktionierenden Bereiche ohne Grund ersetzen.
9. Änderungen kurz und konkret zusammenfassen.

Bei größeren Änderungen zuerst einen Plan erstellen und dann umsetzen.

## 3. MCP-Nutzung

Nutze MCPs gezielt und nicht automatisch alle gleichzeitig.

### GitHub
Für:
- Repository-Dateien lesen/ändern
- Commits, Branches und Pull Requests
- Repository-Struktur prüfen
- GitHub-spezifische Aufgaben

Bei Codeänderungen immer zuerst die bestehende Datei lesen.

### Playwright
Für:
- echte Browser-Tests der veröffentlichten Cora-Website
- Navigation und Links
- Cora-Demo
- Chat-Eingaben
- Buttons
- Formulare
- ROI-Rechner
- Responsive/Mobile-Verhalten
- sichtbare UI-Probleme
- Browser-/JavaScript-Fehler, soweit zugänglich
- Screenshots bei relevanten Problemen

Wenn eine Änderung die UI oder Interaktion betrifft, nach der Änderung mit Playwright testen.

Live-URL:
`https://canouchiha42.github.io/Cora-Ai-/`

Wichtige Demo-Szenarien:
- Fitnessstudio: "Ich habe ein Fitnessstudio. Wie kann Cora mir helfen?"
- Kanzlei: "Ich habe eine Kanzlei. Wie zahlt sich Cora für mich aus?"
- weitere Branchen nicht mit generischen Standardfragen beantworten, wenn eine konkrete Branchenlogik möglich ist.

### Context7
Für:
- aktuelle Dokumentation von Libraries und Frameworks
- API-/SDK-Nutzung
- Versionsänderungen
- technische Fragen, bei denen veraltete Bibliothekskenntnisse riskant wären

Wenn eine konkrete Library betroffen ist, Context7 gegenüber allgemeinem Erinnerungswissen bevorzugen.

### OpenAI Developer Docs
Für:
- OpenAI APIs
- OpenAI SDKs
- Agents/Responses API
- ChatGPT Apps/MCP
- OpenAI-spezifische technische Fragen

Bei OpenAI-Produkt- oder API-Fragen aktuelle offizielle Dokumentation verwenden.

### Firecrawl
Für:
- strukturierte Webseitenanalyse
- Scraping/Extraktion, wenn Browser-Interaktion nicht ausreicht
- Recherche über Webseiteninhalte

Keine unnötigen Crawls durchführen.

## 4. Cora-Produktdaten

Preise dürfen nicht ohne ausdrücklichen Auftrag geändert werden:

- Cora Basic: **895 € Setup + 495 €/Monat**
- Cora Pro: **1.495 € Setup + 895 €/Monat**
- Cora Enterprise: **Preis auf Anfrage**

Produktname immer exakt:
**Cora AI**

Marke:
**ACE AI AGENTS**

## 5. Design- und UX-Richtung

Ziel ist eine hochwertige, ruhige B2B-SaaS-Präsentation:

- Apple-inspirierte Klarheit
- Schwarz/Weiß als Basis
- dezente Blau-, Grün- und Violett-Akzente
- seriös und hochwertig
- keine übertriebenen Effekte
- schnelle Ladezeiten
- sehr gute mobile Darstellung
- klare Conversion-Pfade
- Animationen nur dort, wo sie die Orientierung verbessern

Keine unnötigen UI-Komponenten oder visuelle Effekte hinzufügen.

## 6. Demo-Regeln

Die Demo ist ein zentraler Bestandteil der Website.

Sie soll:
- Kontext aus vorherigen Nachrichten berücksichtigen
- Branche/Intent erkennen
- konkrete Antworten geben
- Nutzen und mögliche Einsatzbereiche erklären
- bei passenden Fragen ROI bzw. wirtschaftlichen Nutzen verständlich machen
- Lead-Qualifizierung unterstützen
- bei Kontaktabsicht eine strukturierte Anfrage vorbereiten
- nicht wiederholt dieselbe generische Rückfrage stellen
- ohne externe kostenpflichtige KI-API funktionsfähig bleiben
- klar als Demo/Simulation erkennbar sein, wenn keine echte Backend-KI verwendet wird

Fallback-Verhalten muss funktionieren, wenn externe Dienste nicht verfügbar sind.

## 7. Lead-Erfassung

Die bestehende Lead-Infrastruktur darf nicht ohne Prüfung verändert werden.

Aktuelle Struktur:
- statische GitHub-Pages-Website
- Google Apps Script
- Google Sheets
- Tab: `Cora Leads`

Erwartete Lead-Felder:
- Zeit
- Name
- Unternehmen
- E-Mail
- Telefon
- Leistung
- Anliegen
- Status

Standardstatus:
**Neu**

Quelle:
**Cora Website**

Lead-IDs sollen eindeutig sein, wenn die bestehende Implementierung UUIDs verwendet.

Keine Secrets, API-Keys oder privaten Zugangsdaten in HTML, JavaScript, GitHub-Dateien oder Commits speichern.

Bei Änderungen am Apps-Script-Backend daran denken: Eine Änderung am Quellcode veröffentlicht nicht automatisch eine neue Web-App-Deployment-Version. Vor produktiver Nutzung Deployment-Version prüfen.

## 8. DSGVO und Sicherheit

Keine pauschalen oder rechtlich nicht belegten Versprechen machen.

Bei Datenschutz-/Security-Texten:
- sachlich formulieren
- nur tatsächlich implementierte Eigenschaften behaupten
- keine erfundenen Zertifizierungen
- keine erfundenen Compliance-Nachweise
- keine "100 % sicher"-Aussagen

Impressum und Datenschutzerklärung müssen mit den tatsächlichen Unternehmens-, Kontakt- und Verarbeitungsdaten vervollständigt werden.

## 9. Code-Regeln

- Bestehende funktionierende Architektur respektieren.
- Keine unnötige Framework-Migration.
- Keine unnötigen Dependencies.
- Keine Secrets hardcoden.
- Keine API-Keys committen.
- Keine Fake-Daten als echte Live-Daten darstellen.
- Keine Accessibility-Grundlagen verschlechtern.
- Mobile zuerst mitdenken.
- Bestehende URLs und GitHub-Pages-Pfade nicht ohne Auftrag brechen.
- Bei statischem GitHub-Pages-Deployment relative Pfade und Asset-Pfade sorgfältig behandeln.
- Änderungen klein und nachvollziehbar halten.

## 10. Qualitätsprüfung vor Abschluss

Bei relevanten Websiteänderungen mindestens prüfen:

1. Build/technische Syntax, sofern ein Build vorhanden ist.
2. GitHub-Pages-Pfade.
3. Desktop-Layout.
4. Mobile-Layout.
5. Cora-Demo.
6. ROI-Rechner.
7. Lead-Formular.
8. Buttons und interne Links.
9. Browser-/JavaScript-Fehler.
10. Keine versehentlich veröffentlichten Secrets.

Bei UI-Änderungen Playwright verwenden.

## 11. Entscheidungsregel

Wenn mehrere technische Lösungen möglich sind, bevorzuge:

1. zuverlässig
2. kostenlos bzw. kostengünstig
3. einfach zu warten
4. DSGVO-bewusst
5. GitHub-Pages-kompatibel
6. mobil performant
7. möglichst wenig zusätzliche Infrastruktur

Nicht die technisch komplexeste Lösung wählen, sondern diejenige, die für Cora tatsächlich den größten Nutzen bei möglichst geringer Komplexität bringt.

## 12. Kommunikationsstil

Antworten und technische Zusammenfassungen:
- direkt
- präzise
- sachlich
- keine Marketingfloskeln
- keine unbelegten Superlative

Bei Änderungen immer nennen:
- was geändert wurde
- warum
- welche Tests durchgeführt wurden
- welche offenen Punkte verbleiben
