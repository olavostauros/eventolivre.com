# eventolivre.com

The public site for Evento Livre: one static page, pt-BR with an English
translation, built with Astro and `@evento-livre/design-system`, deployed to
GitHub Pages.

Start with `MISSION.md`, then `AGENTS.md`.

Status: deployed from `main` by GitHub Actions. Reachable at
<https://olavostauros.github.io/eventolivre.com/> (assets are root-relative,
so only the HTML is a smoke check there). `eventolivre.com` is waiting on
the owner's DNS change in `docs/deploy.md`.

```
bun install
bun run dev      # http://localhost:4321
bun run check    # typecheck, build, test
```
