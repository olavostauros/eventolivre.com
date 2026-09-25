# 0007. The events API's public base URL and its CORS arrangement

- **Status:** proposed (the owner accepts by merging)
- **Date:** 2026-09-25
- **Deciders:** owner, agent

## Context

Decision 0005 left open item 2: the public base URL of the events API and,
with it, the allowed origin `https://eventolivre.com` on the API side.
Decision 0006 made that URL the PWA's only configuration, passed to the
build as the repository variable `USHER_API_URL`. The owner has announced
the URL and the CORS arrangement the API applies. This record states both
as the site sees them, from outside; nothing here says how or where the
API runs (`CYBERSECURITY.md` §2).

## Options considered

1. **Record the announced URL and CORS, set the variable.** The app ships
   on the next deploy. Until the API host answers, the app renders its
   error state; that is expected, not a site defect.
2. **Wait until the host answers before setting the variable.** Keeps the
   holding page up longer, but the first live check would then also be the
   first deploy of the app, with two changes in one step.

## Decision

Option 1.

- **Base URL:** `https://api.eventolivre.com/`. HTTPS, a public host, the
  path ends in `/`. It is the value of `USHER_API_URL` and the only API
  address this repository may hold.
- **CORS, as the site relies on it.** The API allows exactly one origin,
  `https://eventolivre.com`, for credential-free `GET` requests sent with
  `accept: application/json`. Its responses, including the rate limiter's
  `429`, carry:

  ```
  Access-Control-Allow-Origin: https://eventolivre.com
  Access-Control-Allow-Methods: GET
  Access-Control-Allow-Headers: accept
  Access-Control-Expose-Headers: retry-after
  ```

  No credentials, no wildcard. The PWA therefore sends no cookies and no
  header other than `accept`, and may read `Retry-After` on a `429`.
- **The public contract is unchanged.** The PWA's client stays as built in
  0006.

## Consequences

- 0005's open item 2 is closed. No PWA build shipped from `main` before
  this; from the deploy that follows the variable, `/usher/` is the app.
- The CSP in `src/layouts/App.astro` gets `connect-src 'self'
  https://api.eventolivre.com` from the variable; no code change.
- Any other origin (`www`, a preview, `localhost`) is refused by the API.
  Local development keeps using the stand-in (`tests/fixtures/usher-api.ts`).
- A new request header or a credentialed request from the PWA would need
  the API's CORS to change first; that is a request to the Usher repository
  and a new record here.
- Changing the URL is `gh variable set USHER_API_URL` plus a new record;
  taking the app down is `gh variable delete USHER_API_URL` and a redeploy
  (`docs/deploy.md`).
