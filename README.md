# eventolivre.com

The public site for Evento Livre: one static page, pt-BR with an English
translation, built with Astro and `@evento-livre/design-system`, deployed to
GitHub Pages.

Start with `MISSION.md`, then `AGENTS.md`, then `CYBERSECURITY.md`.

Status: live at <https://eventolivre.com> (pt-BR) and <https://eventolivre.com/en/>,
deployed from `main` by GitHub Actions. HTTPS is enforced; `www` redirects
to the apex.

```
bun install
bun run dev      # http://localhost:4321
bun run check    # typecheck, build, test
```
