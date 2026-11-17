# Public landing privacy baseline — 2026-11-17

Automated Playwright checks in `tests/privacy-baseline.spec.mjs` run against the built local static site:

- No third-party requests on page load or after changing all four demo modules.
- No cookies, localStorage or sessionStorage created by the local page.
- Contact remains two real mailto links; no misleading signup form is shown.

These checks **do not** prove the production Cloudflare edge has no cookies or processing; check production separately. Cloudflare email obfuscation and edge security may differ from the local build. They do not establish legal compliance by themselves.

Publication blockers for a real signup: legal entity/controller identity, reviewed privacy policy and retention, actual D1 and Turnstile bindings, rate limiting, tested deletion/export, processor inventory, consent log and staging E2E. Never publish a privacy policy containing `[UZUPEŁNIĆ]` placeholders.

Legal templates are tracked outside the public static site. GitHub issue #16 records legal rollout prerequisites; issue #12 tracks the signup workflow.
