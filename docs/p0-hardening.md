# Cora P0 Hardening — Deployment Notes

## Changes
- Demo skill registry expanded for the requested core industries.
- Qualification state keeps prior context and exposes one next-best question.
- Demo renderer maps both the current state IDs and the requested compatibility IDs: qIndustry, qNeed, qNext, qEmployees, qInquiries, qConversion, qPlan.
- Local fallback remains explicitly distinguishable from Live Cora AI.
- Gemini endpoint adds best-effort per-instance rate limiting and stronger untrusted-input / prompt-injection instructions.
- Lead proxy validates email, rate-limits requests, requires a server-side shared secret, and forwards an idempotency key.
- Apps Script validates the shared secret and deduplicates repeated submissions.
- Existing Google Sheets spreadsheet and sheet names remain unchanged.
- Prices remain unchanged.

## Required configuration before merging/deploying the lead hardening
Set the same random secret in:
1. Netlify environment variable: CORA_LEADS_SHARED_SECRET
2. Google Apps Script Script Property: CORA_LEADS_SHARED_SECRET

Then redeploy the Apps Script web app so the new Code.gs is active.

Do not put the secret in frontend JavaScript, HTML, GitHub, or README files.

## Verification status
Repository inspection and source-level review were performed through the GitHub repository connector.

Automated Node/browser execution was not available through the repository connector in this run. Therefore no runtime test result is claimed here.

Browser deployment, Netlify environment variables, the Apps Script deployment, and the live Google Sheet write path remain NOT VERIFIED until executed in their respective environments.