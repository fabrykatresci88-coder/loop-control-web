const json = (status, message) => new Response(JSON.stringify({ ok: status === 201, message }), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
});
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function onRequestPost({ request, env }) {
  if (!env?.DEMO_LEADS_DB || !env?.TURNSTILE_SECRET_KEY) {
    return json(503, 'Zapisy są chwilowo niedostępne.');
  }
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/x-www-form-urlencoded') && !type.includes('multipart/form-data')) {
    return json(415, 'Nieobsługiwany format zgłoszenia.');
  }
  if (Number(request.headers.get('content-length') || 0) > 8192) return json(413, 'Zbyt duże zgłoszenie.');
  let form;
  try { form = await request.formData(); } catch { return json(400, 'Nieprawidłowe dane.'); }
  const get = key => typeof form.get(key) === 'string' ? form.get(key).trim() : '';
  if (get('website')) return json(400, 'Nieprawidłowe zgłoszenie.');
  const name = get('name');
  const email = get('email').toLowerCase();
  const token = get('cf-turnstile-response');
  const consent = get('demo_contact_consent') === 'yes';
  const marketing = get('marketing_consent') === 'yes';
  if (name.length < 2 || name.length > 100 || email.length > 254 || !emailPattern.test(email) || !consent || !token || token.length > 2048) {
    return json(400, 'Sprawdź dane i zgodę na kontakt.');
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== 'https://loopcontrolos.pl') return json(403, 'Niedozwolone pochodzenie.');
  let verified;
  try {
    const body = new FormData();
    body.set('secret', env.TURNSTILE_SECRET_KEY);
    body.set('response', token);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) body.set('remoteip', ip);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(5000) });
    verified = response.ok && (await response.json()).success === true;
  } catch { verified = false; }
  if (!verified) return json(400, 'Nie udało się potwierdzić zabezpieczenia formularza.');
  try {
    await env.DEMO_LEADS_DB.prepare('INSERT INTO demo_leads (id, name, email, demo_contact_consent, marketing_consent, consent_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), name, email, 1, marketing ? 1 : 0, '2026-11-17-v1', new Date().toISOString()).run();
  } catch {
    return json(503, 'Nie udało się zapisać zgłoszenia. Spróbuj później.');
  }
  return json(201, 'Zgłoszenie zostało zapisane.');
}
export function onRequestGet() { return json(405, 'Metoda niedozwolona.'); }

