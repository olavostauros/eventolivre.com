# 0001. Stack: Astro static site, React islands, Bun, design system as a git dependency

- **Status:** accepted
- **Date:** 2026-09-22
- **Deciders:** owner, agent

## Context

eventolivre.com is a single marketing page. It must use the shared design
system (`@evento-livre/design-system`), which ships React 19 components and a
Tailwind v4 theme as TypeScript source with no build output, no `exports` map
and no npm release. The products use Astro, TypeScript, Tailwind v4 and Bun
(`ticket/web`, design system decision 0005). The owner asked for Astro
components, React components and Bun.

## Options considered

1. **Astro, static output, React integration; design system as a git
   dependency pinned by SHA.** Astro renders design-system React components to
   HTML at build time and hydrates only the components given a client
   directive. Vite compiles the package's `.ts`/`.tsx` source directly. Pros:
   one source of truth for the brand, near-zero client JavaScript, the same
   stack as the products, no publishing step. Cons: Tailwind v4 ignores
   `node_modules` in automatic source detection, so the site must declare an
   `@source`; the pin must be bumped by hand.
2. **A Bun workspace monorepo holding the site and the design system.**
   Pros: no pin. Cons: moves the design system out of its own repository and
   its own decision log; the products do not do this.
3. **Publish the design system to npm or GitHub Packages first.** Pros:
   normal dependency. Cons: a release process the package does not have yet,
   and a private registry needs credentials in CI.
4. **Plain React SPA (Vite) without Astro.** Pros: fewer moving parts. Cons:
   ships a runtime for a page with almost no interaction; against the mission's
   "fast on cheap phones".

## Decision

Option 1.

- `astro` with `output: "static"`, `@astrojs/react`, `react`, `react-dom`,
  `tailwindcss`, `@tailwindcss/vite`.
- `@evento-livre/design-system` from
  `github:olavostauros/evento-livre-design-system#<sha>`. The SHA is bumped in
  its own commit with the reason in the message.
- `src/styles/global.css` imports the package's `src/styles/index.css` and
  adds `@source "../../node_modules/@evento-livre/design-system/src";`.
- Design-system components are used from `.astro` files without a client
  directive. Hydrated islands live in `src/islands/` and each states its
  reason.
- Bun for install, scripts and tests. `check` = `astro check`, `astro build`,
  `bun test`. TypeScript extends `astro/tsconfigs/strict` with the same extra
  flags as `ticket/web`.

## Consequences

Unblocks `package.json`, `astro.config.ts`, `tsconfig.json`,
`src/styles/global.css` and the first sections. The design-system repository
had to become public for GitHub Actions to fetch it without a credential
(owner's decision, 2026-09-22, see 0002). Any further dependency needs its own
record.
