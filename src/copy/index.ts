/* One type, two dictionaries. pt-BR is the source; en translates it.
   tests/copy.test.ts fails when their keys differ or a value is empty. */

import { en } from "./en.ts";
import { ptBR } from "./pt-BR.ts";

export const locales = ["pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];

export interface Point {
  readonly title: string;
  readonly body: string;
}

export interface Copy {
  readonly meta: {
    readonly title: string;
    readonly description: string;
  };
  readonly nav: {
    readonly skipToContent: string;
    readonly producers: string;
    readonly attendees: string;
    readonly usher: string;
    readonly contact: string;
    readonly themeLabel: string;
    readonly themeToLight: string;
    readonly themeToDark: string;
    readonly otherLanguage: string;
  };
  readonly hero: {
    readonly overline: string;
    readonly title: string;
    readonly lede: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
  };
  readonly producers: {
    readonly overline: string;
    readonly title: string;
    readonly lede: string;
    readonly points: readonly [Point, Point, Point];
    readonly cta: string;
  };
  readonly attendees: {
    readonly overline: string;
    readonly title: string;
    readonly lede: string;
    readonly points: readonly [Point, Point, Point];
  };
  readonly usher: {
    readonly overline: string;
    readonly title: string;
    readonly lede: string;
    readonly points: readonly [Point, Point, Point];
    readonly status: string;
  };
  readonly contact: {
    readonly title: string;
    readonly lede: string;
    readonly email: string;
    readonly cta: string;
  };
  readonly footer: {
    readonly company: string;
    readonly rights: string;
    readonly region: string;
  };
  /** Visually hidden suffix the design system's Link appends to external links. */
  readonly externalLabel: string;
}

export const copy: Readonly<Record<Locale, Copy>> = { "pt-BR": ptBR, en };

/** Site-relative path of a locale's page. The default locale is unprefixed. */
export function pathFor(locale: Locale): string {
  return locale === "pt-BR" ? "/" : "/en/";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "pt-BR" ? "en" : "pt-BR";
}
