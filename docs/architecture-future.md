# Cora AI – zukünftige Architektur

## Aktueller Pfad
GitHub Pages (statisches Frontend) → Netlify Functions → Gemini bzw. Lead-Proxy → Google Apps Script → Google Sheets.

## Migrationspfad

### 1. Datenbank
Später können die Sheets durch PostgreSQL/Supabase ersetzt werden. Zieltabellen:
- leads
- conversations
- messages
- knowledge_base

Jede fachliche Tabelle erhält tenant_id. Knowledge-Einträge enthalten zusätzlich approval_status, valid_from, valid_until, version, checksum und sensitivity.

### 2. Multi-Tenant
Mandantenkontext muss serverseitig aus einem vertrauenswürdigen Tenant-Identifier stammen. Niemals aus frei editierbarem Nutzertext ableiten.

### 3. RAG
Geplante hybride Suche aus Volltext + Vektorsuche (pgvector). Jede faktische Antwort soll auf freigegebene Knowledge-Einträge mit Quellenreferenz zurückführbar sein.

### 4. Audit
Änderungen an Knowledge, Konfiguration, Freigaben und sicherheitsrelevanten Aktionen werden in einem unveränderlichen Audit-Log dokumentiert.

### 5. DSGVO-Löschung
Lead-, Conversation- und Message-Daten erhalten definierte Aufbewahrungsfristen und einen nachweisbaren Löschpfad. Analytics bleiben ohne PII.

### 6. CRM
Spätere Integrationen können HubSpot/Pipedrive oder andere Systeme über einen serverseitigen Adapter anbinden. Demo-Karten bleiben ausdrücklich Simulationen, bis eine echte Integration konfiguriert ist.

### 7. Golden Set
Vor Produktions-RAG werden freigegebene Testdialoge als Golden Set gespeichert. Änderungen an Prompts, Knowledge oder Retrieval werden gegen dieses Set evaluiert.

## Leitprinzip
Die aktuelle Demo bleibt statisch, kostengünstig und unabhängig. Die spätere Datenbank-/RAG-Schicht wird hinter stabilen Schnittstellen ergänzt, statt die Demo erneut umzubauen.
