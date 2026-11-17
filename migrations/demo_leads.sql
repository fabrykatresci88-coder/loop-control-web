-- Separate marketing lead storage, never the production CRM database.
CREATE TABLE IF NOT EXISTS demo_leads (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
 email TEXT NOT NULL CHECK (length(email) <= 254),
 demo_contact_consent INTEGER NOT NULL CHECK (demo_contact_consent = 1),
 marketing_consent INTEGER NOT NULL DEFAULT 0 CHECK (marketing_consent IN (0,1)),
 consent_version TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS demo_leads_created_at_idx ON demo_leads(created_at);

