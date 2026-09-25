# 0005. The Usher PWA is served under `/usher/`; this repository says what Usher does, never how it is built

- **Status:** proposed (the owner accepts by merging; the open items below stay open until each has its own record)
- **Date:** 2026-09-24
- **Deciders:** owner, agent

## Context

The owner decided that the Usher progressive web app will be served from the
company's domain under `/usher/`. Decision 0002 makes `www` a redirect to the
apex, so the address is `https://eventolivre.com/usher/`. The site is one
static page on GitHub Pages, deployed from this public repository, and
`AGENTS.md` forbids a second page.

Usher is built and operated from a private repository of the owner's. The
PWA needs one thing from it: the events API contract. Everything else about
it (how the catalogue is gathered, where it runs, what it is made of, who
works on it, its security state) is not public and must not become public
through this repository, which anyone can read on GitHub and which is served
to anyone on the domain.

The API is not public yet. It is reachable only on the owner's private
network until the owner decides how to expose it. The PWA does not exist yet
either, and its source has no home.

## Options considered

For the boundary:

1. **A written rule plus a test.** `CYBERSECURITY.md` §2 says what never
   appears here. `tests/exposure.test.ts` fails `bun run check` on the part
   of that a machine can match, in the tracked tree and in `dist/`. Pros:
   cheap, runs in CI, catches the copy-and-paste case before it deploys.
   Cons: the test only matches what it lists; the rule carries the rest.
2. **A rule only.** Pros: nothing to maintain. Cons: a pasted host name in
   a comment ships before anyone reads it.
3. **A separate origin** (`usher.eventolivre.com`) so nothing of the PWA
   touches this repository. Pros: separate blast radius for scripts and
   storage. Cons: not what the owner decided; the path is the address.

For the mount at `/usher/` (recorded, not decided):

- (a) **The PWA's source lives in a public repository of its own.** The
  deploy workflow here fetches a release at a pinned tag or commit and places
  it under `dist/usher/`. Public because the workflow may hold no credential
  and the client holds no secret. This repository stays one page.
- (b) **The PWA's source lives here**, under a path a later record adds to
  the layout, built by the same `astro build`. One repository and one gate,
  but it makes this repository the PWA's, and the one-page rule would need
  rewriting.
- (c) **A user site**, so project repositories share the domain. Rejected:
  every project repository with Pages enabled would then be served under the
  domain at `/<repository-name>/`, and the owner has a private repository
  named after the product.

## Decision

Option 1 for the boundary, now:

- The address is `https://eventolivre.com/usher/`. `www` stays a redirect.
- This repository says what Usher does for a person. It never says how it
  is built, where it runs, what it is made of, who works on it or what its
  security state is. `CYBERSECURITY.md` §2 is the rule;
  `tests/exposure.test.ts` is the mechanical part of it and runs in
  `bun run check`.
- From the private Usher repository the agent reads only the public API
  contract, and only while building the PWA's client.
- The PWA is a static artifact from a pinned, credential-free source. It
  points only at the public API URL, ships no secret, registers its service
  worker at `/usher/`, and treats every string the API returns as untrusted
  text (`CYBERSECURITY.md` §4).
- Pages stays on this repository and is never enabled on the Usher one.

Open, the owner's to decide, each in its own record:

1. (a) or (b) above for the PWA's source.
2. The public base URL of the events API (the Usher repository's exposure
   task) and, with it, the allowed origin `https://eventolivre.com` on the
   API side.
3. Any third-party script the PWA would load (analytics, maps).
4. Whether this repository gets an encrypted `notes/` directory (git-crypt
   through the `notes` tool the owner's other households use) for the
   agent's working memory. If it does, encryption does not lift
   `CYBERSECURITY.md` §2: what is kept out of a public repository stays out,
   encrypted or not.

## Consequences

- `CYBERSECURITY.md` joins the files the agent reads first, and `AGENTS.md`
  points at it.
- `bun run check` can now fail on content, not only on types and copy
  parity. A red exposure test is fixed by removing the content, never by
  editing the test's lists, unless a commit titled for that change says why.
- No PWA build ships from `main` until open items 1 and 2 are recorded.
- "Do not add a second page" in `AGENTS.md` is unchanged: the PWA is an
  application mounted under a path, not a page of the site. If option (b) is
  chosen, that record amends the rule.
