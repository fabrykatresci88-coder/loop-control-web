# Demo lead API — deployment gate

This is a server-only Cloudflare Pages Function at `POST /api/demo-lead`. No public form is enabled by this PR.

Prerequisites before accepting real people:
1. Create a dedicated D1 database (not the LCOS production CRM database). Apply `migrations/demo_leads.sql`.
2. Bind D1 to Pages Functions as `DEMO_LEADS_DB`. Configure secret `TURNSTILE_SECRET_KEY` in Cloudflare Pages.
3. Register a Turnstile widget for `loopcontrolos.pl`. Never commit secret keys.
4. Publish a reviewed Polish privacy notice with controller identity, purpose, retention, deletion contact, and legal basis. Add separate optional marketing consent.
5. Add frontend form with required demo-contact consent and optional marketing checkbox, both unchecked initially.
6. Test a genuine Turnstile submission on a staging hostname with isolated D1; verify database insert and failure paths.
7. Add rate limiting / abuse protections and a deletion process before production launch.
8. Only then connect marketing leads to a separate authorized CRM workspace.

Endpoint deliberately returns HTTP 503 when D1 or Turnstile secret is absent. No lead data is logged.

