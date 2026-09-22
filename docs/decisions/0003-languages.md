# 0003. Languages: Brazilian Portuguese at `/`, English at `/en/`

- **Status:** accepted
- **Date:** 2026-09-22
- **Deciders:** owner, agent

## Context

The market is Brazil and the design system already treats Portuguese as the
copy language. The owner also wants an English version. A single page with
two languages needs a routing scheme, a place for copy, and a rule for which
language is the source.

## Options considered

1. **pt-BR at `/`, English at `/en/`, Astro's built-in i18n routing with the
   default locale unprefixed; copy as typed TypeScript dictionaries.** Pros:
   two static HTML files, `hreflang` alternates, no runtime; a type and a test
   keep both dictionaries complete. Cons: two files to touch per copy change.
2. **Runtime language switch in one HTML file.** Pros: one URL. Cons: needs
   JavaScript to show the page correctly, bad for search engines and for
   cheap phones.
3. **English only, or pt-BR only.** Pros: half the copy. Cons: the owner asked
   for both.

## Decision

Option 1.

- `astro.config.ts`: `i18n: { defaultLocale: "pt-BR", locales: ["pt-BR",
  "en"], routing: { prefixDefaultLocale: false } }`.
- `src/copy/pt-BR.ts` is the source; `src/copy/en.ts` translates it. Both
  satisfy one `Copy` type from `src/copy/index.ts`. `tests/copy.test.ts` fails
  on a missing key or an empty string.
- Each page passes its dictionary down; components never import a
  dictionary directly.
- `<html lang>` is `pt-BR` or `en`; both pages carry `hreflang` links to each
  other and an `x-default` pointing at `/`.
- Design-system components that carry copy defaults (for example `Link`'s
  external-tab note) are given the English string on the English page.

## Consequences

Unblocks `src/copy/`, the two page files and the layout. A third language is
another dictionary and another page file, no new decision.
