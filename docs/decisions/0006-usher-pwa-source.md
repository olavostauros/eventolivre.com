# 0006. The Usher PWA is built from this repository, behind one build variable

- **Status:** proposed (the owner accepts by merging)
- **Date:** 2026-09-24
- **Deciders:** owner, agent

## Context

Decision 0005 fixed the address (`https://eventolivre.com/usher/`) and the
boundary (what this public repository may say about Usher) and left open
where the PWA's source lives: (a) a public repository of its own, whose
release the deploy workflow fetches at a pinned tag, or (b) this
repository, built by the same `astro build`. The owner asked for the PWA to
be built now. The events API still has no public URL (0005, open item 2),
and until it has one no PWA build may ship from `main`.

Two facts decide between (a) and (b) today:

- The agent may create and configure exactly one repository (`AGENTS.md`,
  deploy boundaries). A second repository, its Pages settings and its
  release process are the owner's to set up, so (a) cannot be started in
  the agent's turn.
- The PWA needs precisely what this repository already has: the design
  system as a pinned dependency, Astro with React islands, the copy
  discipline, the exposure test and the deploy workflow. In its own
  repository all of that would be copied.

## Options considered

1. **(b) now: source here, one island at `/usher/`, gated by a build
   variable.** `PUBLIC_USHER_API_URL` unset (the default, and what CI has
   until the owner sets it) builds `/usher/` as a holding page with no
   island, no manifest link and no worker registration. Set, the same route
   is the app. Pros: one gate, one deploy, the design system without a
   second pin, the exposure test covers the app's source, nothing to ship
   until the URL exists. Cons: this repository is no longer only a page;
   the "one page" rule needs a sentence; a build without the URL still
   leaves the app's chunks in `_astro/`, unreferenced.
2. **(a) now.** Pros: the site repository stays one page. Cons: needs a
   repository the agent may not create, a release process that does not
   exist, and a second copy of the stack; the site would fetch an artifact
   it does not build or test.
3. **Wait for the public URL before writing any of it.** Cons: the URL is
   the last step, not the first; the app can be built and tested against a
   contract-shaped stand-in now.

## Decision

Option 1. Concretely:

- **Layout** (`AGENTS.md` updated): `src/pages/usher/index.astro` (the
  route), `src/pages/usher/manifest.webmanifest.ts` (the manifest, from
  tokens and copy), `src/layouts/App.astro` (the shell: manifest link,
  CSP, B2C register), `src/islands/Usher/` (the app and its client),
  `src/copy/usher.ts` (its strings), `public/usher/` (service worker and
  icons), `tests/fixtures/usher-api.ts` (a stand-in shaped by the public
  contract, for development and tests).
- **One variable.** `PUBLIC_USHER_API_URL` is the only configuration.
  The workflow passes the repository variable `USHER_API_URL`, which is
  unset today. Setting it is the owner's act, in the same turn that records
  the public URL (0005, open item 2). A malformed value fails the build; a
  private address fails the exposure test.
- **Portuguese only.** The app is one shell for attendees in Brazil. Its
  strings live in `src/copy/usher.ts` with their own type; the page's
  two-language rule (0003) does not extend to it. An English version, if
  ever, is a runtime choice inside `/usher/`, not an `/en/usher/` route,
  because the worker's scope is `/usher/`.
- **The "one page" rule stands.** The site is one page. `/usher/` is an
  application mounted under a path; it has no sections, no `hreflang`, and
  is not in `Page.astro`. `AGENTS.md` says so.
- **No new dependency.** Routing is the URL hash, the worker is plain
  JavaScript in `public/`, the manifest is an Astro endpoint, icons are the
  favicon (0004) rasterised.
- **The boundary from 0005 applies to every file above.** Event text is
  API data rendered as text; URLs pass a scheme check; the worker's scope
  is `/usher/`; storage holds the person's place only.

## Consequences

- `bun run check` builds the site twice more inside the tests (with a
  stand-in URL, and with a malformed one) so the live shell is checked on
  every run even while `main` ships the holding page.
- `.github/workflows/deploy.yml` passes `vars.USHER_API_URL` to the check.
  Until the owner sets it, `https://eventolivre.com/usher/` is the holding
  page. Once set, the next push to `main` ships the app; the API must then
  allow the origin `https://eventolivre.com` (0005, open item 2).
- Local development runs the stand-in: `bun run tests/fixtures/usher-api.ts`
  and `PUBLIC_USHER_API_URL=http://localhost:8765 bun run dev`.
- 0005's open item 1 is closed by this record; items 2 to 4 stay open.
- Choosing (a) later means moving `src/islands/Usher/`, `src/copy/usher.ts`
  and `public/usher/` out and replacing the route with a fetch step in the
  workflow; nothing else changes.
