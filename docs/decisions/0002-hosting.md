# 0002. Hosting: GitHub Pages through Actions, apex domain, DNS-only records at Cloudflare

- **Status:** accepted
- **Date:** 2026-09-22
- **Deciders:** owner, agent

## Context

The owner asked for the page to be served by GitHub Pages at
`eventolivre.com` and asked what stands in the way. Findings on 2026-09-22:

- The domain is registered at Namecheap. Its nameservers are delegated to
  Cloudflare, so records are edited in the Cloudflare dashboard, not at
  Namecheap.
- The apex and `www` resolve to Cloudflare proxy addresses. Plain HTTP on the
  apex is answered by a Namecheap URL forwarder redirecting to `www`; HTTPS on
  `www` fails with a 525 (SSL handshake between Cloudflare and the origin).
  The domain serves nothing today.
- No GitHub Pages site and no `olavostauros.github.io` repository exist. No
  domain-verification TXT record exists.
- GitHub Pages on a private repository needs a paid plan. The design system
  is also fetched by the build, so the owner made it public rather than add a
  read token to CI.
- GitHub issues the site's certificate itself and must reach the domain
  directly to do so. With Cloudflare's proxy in front, the challenge fails or
  loops.

## Options considered

1. **GitHub Pages, deploy from a GitHub Actions workflow, public repository,
   apex domain with `www` redirecting to it, Cloudflare records set to DNS
   only.** Pros: free, no credentials anywhere, GitHub's CDN and certificate,
   the workflow is the only deploy path. Cons: the owner must edit DNS by hand;
   the repository is public (fine for a marketing page).
2. **Same, but keep Cloudflare's proxy on.** Pros: Cloudflare features. Cons:
   certificate issuance conflicts, a second cache in front of a CDN, an SSL
   mode to get right, nothing gained for a static page.
3. **A different host (Vercel, Cloudflare Pages).** Pros: either would work.
   Cons: not what the owner asked for; another account to hold.
4. **Publish from a `gh-pages` branch instead of Actions.** Pros: simpler
   mental model. Cons: built files in git, a `CNAME` file to keep in sync.

## Decision

Option 1.

- Repository `olavostauros/eventolivre.com`, public, default branch `main`.
- Pages source is GitHub Actions. `.github/workflows/deploy.yml` runs
  `bun run check` and publishes `dist/` on every push to `main`.
- Custom domain `eventolivre.com`; GitHub redirects `www` to it. Set through
  `gh api`, not through a `CNAME` file (ignored for Actions deploys).
- The domain is verified on the owner's GitHub account before DNS points at
  GitHub, so nobody else can claim it in between.
- DNS records are the owner's to change. The exact records and their order
  are in `docs/deploy.md`.

## Consequences

Unblocks the workflow and the Pages configuration. Until the owner's DNS
change, the page is reachable only at the repository's `github.io` URL.
Enforce HTTPS is switched on once GitHub has issued the certificate. Moving
to a proxied setup later would need this record superseded.
