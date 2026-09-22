# Mission

## Why this exists

Evento Livre wants to capture the event economy: the money, time and attention
that flow around events, from the producer planning them to the person
attending. Before either of them touches a product, they type the company's
name into a browser. What they find is this repository.

eventolivre.com is the company's front door. One page, in the company's own
visual language, that makes a producer and an attendee each recognise the same
company and know what to do next.

## Who we serve

Evento Livre sells to two audiences at once:

- **B2B: event producers.** Organisers, promoters, venue teams. They arrive
  from a search, a referral or an invoice. They need to see that the company
  is real, serious and worth a conversation.
- **B2C: event goers.** People discovering, buying and attending. They arrive
  from a ticket, a friend or a poster. They need to see what Evento Livre does
  for them in ten seconds, on a phone, often outdoors.

A third reader is anyone who is neither: press, partners, candidates. They get
the same page. Nothing is written for them alone.

One brand, two audiences. The page must feel like the same company to both
without forcing one audience's needs onto the other.

## Products today

- **Usher** is the only product. The page presents it as "Usher by Evento
  Livre", the endorsed architecture the design system assumes.

Future products will get their place on this page when they exist. Do not
design for them yet, and do not build the page so that only Usher fits.

## What the site delivers

1. **One page.** Everything a visitor needs, in reading order: who Evento
   Livre is, what it does for producers, what it does for attendees, what
   Usher is, how to get in touch. No second page until a decision record says
   so.
2. **Two languages.** Brazilian Portuguese is the page. English is a
   translation of it, at `/en/`. Both carry the same content.
3. **Two registers, shown not told.** The producer section is set in the B2B
   register, the attendee section in the B2C register. The design system does
   the rest. The page never explains that this is happening.
4. **A way in.** A contact path that works without a backend.
5. **The brand, as decided.** Everything visible comes from
   `@evento-livre/design-system`. Nothing the brand has not decided is invented
   here.

## Principles

- **Single page, static.** HTML that ships from a CDN, with JavaScript only
  where a person interacts.
- **Portuguese first.** The copy is written in pt-BR and translated to English,
  never the other way round.
- **Consume the design system, never fork it.** Tokens, role utilities and
  components come from the package. What the package lacks is a request to
  the package, not a local copy.
- **Nothing invented.** No mark, icon, illustration or motion signature until
  the design system ships one. The wordmark is text until then.
- **Accessible by default.** WCAG 2.2 AA is the floor.
- **Fast on cheap phones.** Much of the attendee audience is on one.
- **Boring technology.** Astro, React, TypeScript, Tailwind, Bun. The same
  stack as the products.

## Definition of success

A producer and an attendee each open eventolivre.com on a phone. Within ten
seconds each understands what Evento Livre is and what to do next. The page is
unmistakably the same brand as Usher, and nothing on it will have to change
when Usher ships.
