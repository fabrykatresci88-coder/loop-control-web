import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost, onRequestGet } from '../functions/api/demo-lead.js';
const req = (fields, headers = {}) => new Request('https://loopcontrolos.pl/api/demo-lead', {
 method: 'POST', headers: { origin: 'https://loopcontrolos.pl', ...headers },
 body: new URLSearchParams(fields)
});
const base = { name: 'Jan Test', email: 'jan@example.com', demo_contact_consent: 'yes', 'cf-turnstile-response': 'token' };
const db = { prepare: () => ({ bind: () => ({ run: async () => ({ success: true }) }) }) };
const env = { DEMO_LEADS_DB: db, TURNSTILE_SECRET_KEY: 'test-secret' };
test('fails closed without configuration', async () => {
 assert.equal((await onRequestPost({ request: req(base), env: {} })).status, 503);
});
test('rejects missing consent and honeypot', async () => {
 assert.equal((await onRequestPost({ request: req({ ...base, demo_contact_consent: '' }), env })).status, 400);
 assert.equal((await onRequestPost({ request: req({ ...base, website: 'bot' }), env })).status, 400);
});
test('rejects foreign origin', async () => {
 assert.equal((await onRequestPost({ request: req(base, { origin: 'https://attacker.example' }), env })).status, 403);
});
test('rejects missing turnstile token', async () => {
 assert.equal((await onRequestPost({ request: req({ ...base, 'cf-turnstile-response': '' }), env })).status, 400);
});
test('GET does not expose leads', () => {
 assert.equal(onRequestGet().status, 405);
});


test('valid verified submission writes only approved fields', async () => {
  const originalFetch = globalThis.fetch;
  let saved;
  globalThis.fetch = async () => new Response(JSON.stringify({ success: true }), { status: 200 });
  const fakeDb = { prepare: (sql) => {
    assert.match(sql, /INSERT INTO demo_leads/);
    return { bind: (...args) => {
      saved = args;
      return { run: async () => ({ success: true }) };
    } };
  } };
  try {
    const response = await onRequestPost({ request: req({ ...base, marketing_consent: 'yes' }), env: { ...env, DEMO_LEADS_DB: fakeDb } });
    assert.equal(response.status, 201);
    assert.equal(saved[1], 'Jan Test');
    assert.equal(saved[2], 'jan@example.com');
    assert.equal(saved[3], 1);
    assert.equal(saved[4], 1);
    assert.equal(saved.length, 7);
  } finally { globalThis.fetch = originalFetch; }
});
test('failed verification never stores data', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false }), { status: 200 });
  try {
    assert.equal((await onRequestPost({ request: req(base), env })).status, 400);
  } finally { globalThis.fetch = originalFetch; }
});
