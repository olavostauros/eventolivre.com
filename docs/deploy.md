# Deploy: GitHub Pages at eventolivre.com

Implements `docs/decisions/0002-hosting.md`. The first half is what the agent
found and what it means. The second half is the owner's runbook. The third is
how anyone checks the result.

## What the agent found (2026-09-22)

| Fact | Observed | Consequence |
|---|---|---|
| Registrar | Namecheap, registered 2026-07-14 | Renewals and transfers happen there, nothing else |
| Nameservers | `celine.ns.cloudflare.com`, `rex.ns.cloudflare.com` | **DNS records are edited at Cloudflare**, not Namecheap |
| Apex `A` | `104.21.14.118`, `172.67.133.194` (Cloudflare proxy) | Proxy is on; GitHub cannot reach the site directly |
| Apex over HTTP | 302 to `http://www.eventolivre.com/`, served by "Namecheap URL Forward" | A leftover forwarder from before delegation |
| `www` over HTTPS | 525, SSL handshake failed | The domain serves nothing |
| GitHub Pages | No site, no `olavostauros.github.io` repo | Nothing to conflict with |
| Verification TXT | none | The domain is unverified on the GitHub account |

**Nothing on GitHub's side blocks serving `eventolivre.com`. DNS does.**
Three things have to be true and are not yet:

1. The apex must point at GitHub's four Pages addresses and `www` must be a
   `CNAME` to `olavostauros.github.io`.
2. Those records must be **DNS only** (grey cloud), not proxied. GitHub
   issues the certificate itself and validates the domain over HTTP. With
   Cloudflare's proxy in the way the challenge fails, or the page redirect
   loops between Cloudflare's SSL mode and GitHub's HTTPS enforcement.
   Proxying could be re-enabled after the certificate exists, with SSL mode
   "Full (strict)", but a static page on GitHub's CDN gains nothing from it.
3. The domain should be verified on the GitHub account **before** DNS points
   at GitHub, so no other GitHub user can claim it in between.

Other facts that shape the setup:

- Pages on a private repository needs a paid plan, so the site repository is
  public. The design-system repository is also fetched during the build; the
  owner made it public rather than put a read token in CI.
- With a GitHub Actions deploy, the `CNAME` file is ignored. The custom domain
  is a repository setting; the agent sets it with `gh api`.
- GitHub redirects `www` to the apex on its own once the apex is the custom
  domain.
- "Enforce HTTPS" becomes available after the certificate is issued. GitHub
  says up to 24 hours; with correct DNS it is usually minutes.

## Owner runbook

**Done 2026-09-22.** The owner authorised the agent to make these changes
through the Cloudflare dashboard in the owner's browser session. The old
apex `A` (`192.64.119.113`, proxied) was deleted and `www` was repointed;
the mail records (`privateemail.com`) were left untouched. The custom domain,
certificate and HTTPS enforcement followed the same day.

Everything below is in the Cloudflare dashboard, zone `eventolivre.com`,
**DNS → Records**. Every record's proxy status must be **DNS only**.

### 1. Verify the domain on GitHub (before touching A records)

Open <https://github.com/settings/pages_verified_domains>, add
`eventolivre.com`. GitHub shows a TXT record. Add it at Cloudflare:

| Type | Name | Content | Proxy |
|---|---|---|---|
| TXT | `_github-pages-challenge-olavostauros` | `6a49785cd8a688e5f05460097a70de` | DNS only |

Back on GitHub, press **Verify**. Keep the record afterwards; GitHub
re-checks it.

### 2. Remove what is there

Delete the existing apex `A` and `AAAA` records and the `www` record (they
point at the proxy and the URL forwarder). If Namecheap still shows a
"Redirect Domain" rule for `eventolivre.com`, delete that too; it is dead
once the records below exist, but it is confusing to leave behind.

### 3. Add the GitHub Pages records

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| AAAA | `@` | `2606:50c0:8000::153` | DNS only |
| AAAA | `@` | `2606:50c0:8001::153` | DNS only |
| AAAA | `@` | `2606:50c0:8002::153` | DNS only |
| AAAA | `@` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `olavostauros.github.io` | DNS only |

### 4. Tell the agent

The agent then runs, in order:

```
gh api -X PUT repos/olavostauros/eventolivre.com/pages -f cname=eventolivre.com
# wait until .https_certificate.state is "approved"
gh api repos/olavostauros/eventolivre.com/pages --jq .https_certificate
gh api -X PUT repos/olavostauros/eventolivre.com/pages -F https_enforced=true
```

## Checking

```
resolvectl query eventolivre.com          # four 185.199.10x.153 addresses
resolvectl query --type=CNAME www.eventolivre.com   # olavostauros.github.io
curl -sI https://eventolivre.com | head -3          # HTTP/2 200, server: GitHub.com
curl -sI https://www.eventolivre.com | head -3      # 301 to https://eventolivre.com/
gh api repos/olavostauros/eventolivre.com/pages --jq '{cname,https_enforced,status}'
```

## The Usher PWA: the API URL

Implements decision 0006. `/usher/` is a holding page until the build gets
the events API's public URL. That URL is a repository **variable**, not a
secret: it ends up in the HTML anyway.

Owner, once the API has a public address and allows the origin
`https://eventolivre.com`:

```
gh variable set USHER_API_URL --repo olavostauros/eventolivre.com --body "https://<public host>/"
gh workflow run deploy.yml --repo olavostauros/eventolivre.com
```

Then check:

```
curl -s https://eventolivre.com/usher/ | grep -o 'connect-src[^;]*'     # names the API origin
curl -sI https://eventolivre.com/usher/manifest.webmanifest | head -1   # 200
curl -sI https://eventolivre.com/usher/sw.js | head -1                  # 200
```

To take the app down again, unset the variable and rerun the workflow:

```
gh variable delete USHER_API_URL --repo olavostauros/eventolivre.com
```

The value must be an `http(s)` origin, optionally with a path ending in
`/`; anything else fails the build. A private address fails the exposure
test. The development address never goes here (`CYBERSECURITY.md` §2).

## Rolling back

Put the previous records back (apex `A` to the two `104.21.14.118` /
`172.67.133.194` proxy addresses, proxied) and clear the custom domain:

```
gh api -X PUT repos/olavostauros/eventolivre.com/pages -F cname=
```

The page stays reachable at `https://olavostauros.github.io/eventolivre.com/`
throughout.
