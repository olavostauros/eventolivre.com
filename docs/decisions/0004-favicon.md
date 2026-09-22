# 0004. Favicon: a brand-colour square, no glyph, until the mark exists

- **Status:** accepted
- **Date:** 2026-09-22
- **Deciders:** owner, agent

## Context

The site needs a favicon. The design system's `docs/brand/semiotics.md`
governs favicons: every non-verbal token must trace back to the one sign, the
attendee's hand presenting a phone to be validated, and must pass a
four-question test. Design-system decision 0002 fixes that subject for the
mark but the mark is not drawn yet and the package ships no `Logo`.
`AGENTS.md` forbids inventing brand assets here. Something still has to sit in
the browser tab.

## Options considered

1. **A brand-colour rounded square with nothing inside.** Pros: depicts
   nothing, so it makes no claim about the sign and cannot contradict the
   mark later; reads in one colour at 16px; trivially replaced. Cons: means
   "Evento Livre" only by convention, learned from the page.
2. **An interim glyph: a letter, a phone, a checkmark.** Pros: a tab that
   looks finished. Cons: teaches attendees a wrong sign that the real mark
   then has to unteach; a phone or check on its own is on the semiotics
   doc's never-depict list; the letter would be a second wordmark.
3. **An early drawing of the hand-and-phone gesture made here.** Pros: the
   right subject. Cons: invents a brand asset outside the design system,
   which `AGENTS.md` and decision 0002 both reserve for that repository.

## Decision

Option 1. `public/favicon.svg` is a 32px square, corner radius from the
design system's shape scale, filled with brand-600. No glyph.

Semiotic reading, recorded so nobody mistakes the square for a sign:

- **It is a symbol, not an index.** In the terms of the semiotics doc it means
  "Evento Livre" only because the brand colour is reserved for the wordmark
  and primary actions, and the reader learns the pairing from the page. It
  does not point at the moment of entry.
- **It depicts nothing on purpose.** Showing less than an interim glyph is the
  point: a blank field cannot pre-empt or contradict the gesture the design
  system will draw.
- **Against the four-question test** it fails questions 1 to 3 (no moment of
  entry, no hand and phone, a stranger reads a coloured tab) and passes only
  question 4 (one colour, 16px). That failure is known and accepted because
  the square is a placeholder, not a token.
- **The colour is borrowed.** The hex in the SVG is a copy of brand-600 from
  design-system decision 0001. It is not a second brand asset; regenerate it
  when 0001 changes.

## Consequences

- No letter, check, phone, gate or other glyph goes into the favicon while
  this record stands.
- When the design system ships a `Logo`, the favicon becomes the mark at 16px
  in one colour, in the same commit that bumps the package pin. That commit
  supersedes this record.
- `public/og.png` follows the same rule: wordmark as text, no drawn mark.
