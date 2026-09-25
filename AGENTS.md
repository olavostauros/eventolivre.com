# AGENTS.md

Contract for the agent building and deploying eventolivre.com.
Read `MISSION.md` first. It says why this exists and who it serves.

## What this repo is

The public marketing site for Evento Livre: one static page, in Brazilian
Portuguese with an English translation, deployed to GitHub Pages under the
company's domain, plus the Usher PWA mounted under `/usher/` (decision
0006). It is the second consumer of `@evento-livre/design-system`, after
Usher.

## Stack

- **Astro**, static output. Sections are `.astro` components. Astro's built-in
  i18n routing serves `/` (pt-BR) and `/en/`.
- **React** function components only, in two roles: design-system components
  rendered to HTML from `.astro` files with no client directive, and islands
  under `src/islands/` for the few places a person interacts.
- **TypeScript** strict mode. No `any`. Export prop types alongside islands.
- **Tailwind CSS v4** through the design system's entry CSS. There is no
  `tailwind.config.ts`. `src/styles/global.css` imports the entry and adds a
  `@source` line so Tailwind sees the package's classes inside `node_modules`.
- **`@evento-livre/design-system`** as a git dependency pinned to a commit
  SHA in `package.json`. Bump the pin on purpose, in its own commit. Never
  vendor it, never patch it from here.
- **Bun** is the package manager, script runner and test runner. Lockfile is
  committed. `bun run check` is the gate: typecheck, build, tests.

## Layout

```
MISSION.md              why, who, what
AGENTS.md               this file
CYBERSECURITY.md        what never appears here, rules for the agent, the PWA boundary
README.md               status line and the three commands
docs/
  decisions/            one file per decision (ADR style), numbered
  deploy.md             hosting evaluation and the owner's DNS runbook
  og.svg                source of public/og.png
.github/workflows/      deploy.yml: check, build, publish to Pages
public/                 static files served as-is: robots, favicon, OG image
src/
  copy/                 pt-BR.ts and en.ts, one shared type, identical keys;
                        usher.ts, the app's strings (pt-BR only)
  styles/global.css     the only stylesheet: imports the design system
  layouts/Base.astro    html lang, meta, hreflang, fonts, theme boot
  layouts/App.astro     the Usher PWA shell: manifest, CSP, B2C register
  components/Page.astro composes the sections in reading order
  sections/             one section, one .astro file
  islands/              hydrated React components, one per folder
  islands/dsx.ts        re-exports of design-system components used here
  islands/Usher/        the app: one island, its API client, formatters, storage
  pages/usher/          index.astro (the app, or a holding page) and the manifest
public/usher/           service worker and manifest icons, served as-is
tests/                  bun tests: copy parity, built output, exposure, the app
tests/fixtures/         usher-api.ts, a stand-in shaped by the public API contract
```

## Working rules

- **Tokens and roles only.** Surfaces, text and borders use role utilities
  (`bg-canvas`, `text-fg-muted`, `border-border-strong`). Type uses `type-*`.
  Spacing uses the numeric scale and the density names (`inset-*`,
  `stack-*`, `gutter`). No hex, no raw px, no Tailwind default colours (the
  theme removes them, so they do not exist).
- **Copy lives in `src/copy/`.** Components take strings as props and never
  contain a sentence. `pt-BR.ts` is the source; `en.ts` translates it. A test
  fails when their keys differ or a value is empty.
- **Islands only where there is interaction.** Everything else renders to
  HTML with no client JavaScript. A new island needs a reason in its file
  header.
- **One section, one file.** `src/sections/Name.astro`. Sections do not import
  each other. `Page.astro` orders them.
- **Registers are set on sections.** The producer section wraps its subtree
  in `data-register="b2b"`, the attendee section in `data-register="b2c"`.
  Nothing else sets a register.
- **The PWA has one setting.** `PUBLIC_USHER_API_URL` at build time, the
  public URL the owner announces, and nothing else. Unset, `/usher/` is a
  holding page and no app ships. Develop against the stand-in:
  `bun run tests/fixtures/usher-api.ts`, then
  `PUBLIC_USHER_API_URL=http://localhost:8765 bun run dev`.
- **Record decisions.** Anything that constrains future work gets a numbered
  file in `docs/decisions/`. Copy `0000-template.md`.
- **Branch per change.** `site/<short-topic>`, kebab-case, from `main`.
  Small commits, one concern each. `bun run check` green before every commit.
- **Never silently skip a failing gate.** A red check is the next task, not
  a `--no-verify`.
- **Comments carry constraints, not narrative.** Say what must stay true and
  why. Do not say what the code does.

## Brand rules

- Read `docs/brand/semiotics.md` in the design system before adding any
  non-verbal element. Its four-question test applies here too.
- **The wordmark is text.** "Evento Livre" set in the display face through the
  design system's `Text` until the package ships a `Logo`. Do not draw a mark,
  an icon set, an illustration, or a favicon glyph. The favicon is a
  brand-colour square.
- **Brand colour is for primary actions** and the wordmark. The accent follows
  the register and is never on a button.
- **Product naming.** "Usher by Evento Livre". "Evento Livre" is two words,
  capitalised, in every language.

## Deploy boundaries

The agent may, without asking:

- create and push the GitHub repository `olavostauros/eventolivre.com`;
- configure GitHub Pages on it through `gh` (source: Actions; custom domain;
  enforce HTTPS);
- run and re-run the deploy workflow, and verify the result with `curl`,
  `resolvectl` and `gh api`.

The agent must not:

- hold, print or write any credential into the tree, the workflow, or a
  commit;
- change DNS. Records live at Cloudflare and are the owner's to change, from
  `docs/deploy.md`;
- change the design-system repository's visibility, settings or contents.
  What the site needs from the package is a proposal in that repository, in
  the owner's turn;
- deploy from a checkout that has not passed `bun run check`;
- read anything from the private Usher repository except its public API
  contract, or bring anything from it here (`CYBERSECURITY.md` §2, §3).

## Do not

- Do not add a second page. `/usher/` is an application mounted under a
  path (decision 0006), not a page of the site; it has no sections.
- Do not add a dependency without a decision record.
- Do not put a sentence of copy in a component.
- Do not invent brand assets.
- Do not say how Usher is built, where it runs or who works on it.
  `CYBERSECURITY.md` §2 is the line; `tests/exposure.test.ts` enforces
  part of it.
- Do not create files outside the layout above without updating this file.

## Where to start

1. Read `MISSION.md`.
2. Read every file in `docs/decisions/`, then `docs/deploy.md`, then
   `CYBERSECURITY.md`.
3. `bun install && bun run check`.
4. Pick the smallest useful next step and do that.
