/**
 * Display helpers for API values. Must stay true:
 *
 * - A URL from the API goes into `href` or `src` only through `safeHttpUrl`,
 *   which keeps `https:` and `http:` and drops everything else
 *   (CYBERSECURITY.md §4).
 * - Money is formatted from the decimal string without a float. Display
 *   only; there is no arithmetic on prices anywhere in the app.
 * - Times show in the event's own zone, never the phone's.
 */

export function safeHttpUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }
  return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
}

/** `"45.00"` + `"BRL"` → `R$ 45,00`; `"1234.5"` → `R$ 1.234,50`. Unknown currencies keep their code. */
export function formatMoney(amount: string, currency: string): string {
  const match = /^\s*(-)?(\d+)(?:\.(\d+))?\s*$/.exec(amount);
  if (!match) return `${currency} ${amount}`;
  const sign = match[1] ?? "";
  const whole = (match[2] ?? "0").replace(/^0+(?=\d)/, "");
  const fraction = ((match[3] ?? "") + "00").slice(0, 2);
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const symbol = currency === "BRL" ? "R$" : currency;
  return `${sign}${symbol} ${grouped},${fraction}`;
}

/** True when the decimal string is zero, whatever its precision. */
export function isZero(amount: string): boolean {
  return /^\s*-?0*(?:\.0*)?\s*$/.test(amount);
}

export interface PriceWords {
  readonly free: string;
  readonly from: string;
  readonly upTo: string;
  readonly noPrice: string;
}

export function formatPriceRange(
  price: { readonly min: string; readonly max: string; readonly currency: string; readonly isFree: boolean } | null,
  words: PriceWords,
): string {
  if (price === null) return words.noPrice;
  if (price.isFree && isZero(price.max)) return words.free;
  if (price.isFree) return `${words.free} ${words.upTo} ${formatMoney(price.max, price.currency)}`;
  if (price.min === price.max) return formatMoney(price.min, price.currency);
  return `${words.from} ${formatMoney(price.min, price.currency)}`;
}

const dateFormats = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  let cached = dateFormats.get(key);
  if (!cached) {
    try {
      cached = new Intl.DateTimeFormat("pt-BR", { ...options, timeZone });
    } catch {
      cached = new Intl.DateTimeFormat("pt-BR", options);
    }
    dateFormats.set(key, cached);
  }
  return cached;
}

/** `sáb., 3 de out., 20:00` in the event's zone. Empty when the instant does not parse. */
export function formatWhen(iso: string, timeZone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatter(timeZone, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date,
  );
}

/** The end as `20:00` when it falls on the start's local day, else as `formatWhen`. */
export function formatEnd(startIso: string, endIso: string, timeZone: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const day = formatter(timeZone, { year: "numeric", month: "numeric", day: "numeric" });
  if (day.format(start) === day.format(end)) return formatter(timeZone, { hour: "2-digit", minute: "2-digit" }).format(end);
  return formatWhen(endIso, timeZone);
}

/** `3 de out. de 2026` in the event's zone. */
export function formatDate(iso: string, timeZone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatter(timeZone, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

/** `850 m`, `2,6 km`, `12 km`. */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  const km = metres / 1000;
  return km < 10 ? `${km.toFixed(1).replace(".", ",")} km` : `${Math.round(km)} km`;
}

/** One-line venue caption: `Teatro Municipal · Vitória`. */
export function formatVenue(venue: { readonly name: string | null; readonly city: string | null } | null): string {
  if (venue === null) return "";
  return [venue.name, venue.city].filter((part): part is string => typeof part === "string" && part.length > 0).join(" · ");
}
