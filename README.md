# eventolivre.com

The public site for Evento Livre: one static page, pt-BR with an English
translation, and the Usher PWA under `/usher/`, built with Astro and
`@evento-livre/design-system`, deployed to GitHub Pages.

Start with `MISSION.md`, then `AGENTS.md`, then `CYBERSECURITY.md`.

Status: live at <https://eventolivre.com> (pt-BR) and <https://eventolivre.com/en/>,
deployed from `main` by GitHub Actions. HTTPS is enforced; `www` redirects
to the apex. `/usher/` is a holding page until the owner sets the
`USHER_API_URL` repository variable to the events API's public URL
(`docs/deploy.md`, "The Usher PWA").

```
bun install
bun run dev      # http://localhost:4321
bun run check    # typecheck, build, test

bun run tests/fixtures/usher-api.ts                        # a stand-in events API
PUBLIC_USHER_API_URL=http://localhost:8765 bun run dev     # the app at /usher/
```
