/**
 * Client for the Usher events API, v1. The shapes mirror the public
 * contract (its openapi.json wins over prose). Must stay true:
 *
 * - The base URL is the one build-time value, never a development address.
 * - Every field the API returns is untrusted text. This module only parses
 *   shape; rendering decides where a string may go (see format.ts).
 * - Unknown fields are ignored, so an additive change upstream never breaks
 *   the app. A missing required field makes the item invalid, not the app.
 * - Money stays a decimal string. Nothing here turns it into a number.
 * - Only filters travel to the API: a position or a city, a window, a
 *   search. Never an identity.
 */

export interface CategoryRef {
  readonly slug: string;
  readonly name: string;
}

export interface Category extends CategoryRef {
  readonly eventsUpcoming: number;
}

export interface City {
  readonly slug: string;
  readonly name: string;
  readonly uf: string;
  readonly timezone: string;
  readonly eventsUpcoming: number;
}

export interface Venue {
  readonly id: number;
  readonly name: string | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly uf: string | null;
  readonly lat: number | null;
  readonly lon: number | null;
}

export interface PriceRange {
  readonly min: string;
  readonly max: string;
  readonly currency: string;
  readonly isFree: boolean;
}

export interface PriceLot {
  readonly name: string;
  readonly amount: string;
  readonly currency: string;
}

export interface SourceLink {
  readonly source: string;
  readonly url: string;
}

export interface Organizer {
  readonly name: string;
  readonly url: string | null;
}

export interface EventItem {
  readonly id: number;
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly timezone: string;
  readonly isOnline: boolean;
  readonly imageUrl: string | null;
  readonly category: CategoryRef;
  readonly venue: Venue | null;
  readonly distanceM: number | null;
  readonly price: PriceRange | null;
  readonly sources: readonly SourceLink[];
  readonly sessions: number;
}

export interface EventDetail {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly timezone: string;
  readonly isOnline: boolean;
  readonly imageUrl: string | null;
  readonly category: CategoryRef;
  readonly venue: Venue | null;
  readonly organizer: Organizer | null;
  readonly price: PriceRange | null;
  readonly priceLots: readonly PriceLot[];
  readonly sources: readonly SourceLink[];
  readonly updatedAt: string;
}

export interface EventPage {
  readonly data: readonly EventItem[];
  readonly nextCursor: string | null;
}

export type Place =
  | { readonly kind: "city"; readonly city: string }
  | { readonly kind: "near"; readonly lat: number; readonly lon: number; readonly radiusKm: number };

export interface EventQuery {
  readonly place: Place;
  readonly q?: string;
  readonly free?: boolean;
  readonly categories?: readonly string[];
  readonly to?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export type GoneStatus = "cancelled" | "ended" | "removed_from_source" | "unknown";

export type ApiFailure =
  | { readonly kind: "offline" }
  | { readonly kind: "invalid"; readonly field: string | null; readonly message: string }
  | { readonly kind: "not_found" }
  | { readonly kind: "gone"; readonly status: GoneStatus }
  | { readonly kind: "rate_limited"; readonly retryAfterS: number | null }
  | { readonly kind: "unavailable" }
  | { readonly kind: "unknown"; readonly httpStatus: number | null };

export class ApiError extends Error {
  readonly failure: ApiFailure;
  constructor(failure: ApiFailure) {
    super(failure.kind);
    this.name = "ApiError";
    this.failure = failure;
  }
}

/* Parsing. Each `read*` returns undefined when the required shape is not
   there; the list drops such items, the detail fails as `unknown`. */

type Json = { readonly [key: string]: unknown };

function isRecord(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function strOrNull(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  return str(value);
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function numOrNull(value: unknown): number | null | undefined {
  if (value === null || value === undefined) return null;
  return num(value);
}

function bool(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readCategoryRef(value: unknown): CategoryRef | undefined {
  if (!isRecord(value)) return undefined;
  const slug = str(value["slug"]);
  const name = str(value["name"]);
  return slug !== undefined && name !== undefined ? { slug, name } : undefined;
}

export function readCategory(value: unknown): Category | undefined {
  const ref = readCategoryRef(value);
  if (!ref || !isRecord(value)) return undefined;
  const eventsUpcoming = num(value["events_upcoming"]);
  return eventsUpcoming === undefined ? undefined : { ...ref, eventsUpcoming };
}

export function readCity(value: unknown): City | undefined {
  if (!isRecord(value)) return undefined;
  const slug = str(value["slug"]);
  const name = str(value["name"]);
  const uf = str(value["uf"]);
  const timezone = str(value["timezone"]);
  const eventsUpcoming = num(value["events_upcoming"]);
  if (slug === undefined || name === undefined || uf === undefined || timezone === undefined) return undefined;
  if (eventsUpcoming === undefined) return undefined;
  return { slug, name, uf, timezone, eventsUpcoming };
}

function readVenue(value: unknown): Venue | null | undefined {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return undefined;
  const id = num(value["id"]);
  const name = strOrNull(value["name"]);
  const address = strOrNull(value["address"]);
  const city = strOrNull(value["city"]);
  const uf = strOrNull(value["uf"]);
  const lat = numOrNull(value["lat"]);
  const lon = numOrNull(value["lon"]);
  if (id === undefined || name === undefined || address === undefined || city === undefined) return undefined;
  if (uf === undefined || lat === undefined || lon === undefined) return undefined;
  return { id, name, address, city, uf, lat, lon };
}

function readPrice(value: unknown): PriceRange | null | undefined {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return undefined;
  const min = str(value["min"]);
  const max = str(value["max"]);
  const currency = str(value["currency"]);
  const isFree = bool(value["is_free"]);
  if (min === undefined || max === undefined || currency === undefined || isFree === undefined) return undefined;
  return { min, max, currency, isFree };
}

function readSources(value: unknown): readonly SourceLink[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: SourceLink[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const source = str(item["source"]);
    const url = str(item["url"]);
    if (source !== undefined && url !== undefined) out.push({ source, url });
  }
  return out;
}

function readLots(value: unknown): readonly PriceLot[] {
  if (!Array.isArray(value)) return [];
  const out: PriceLot[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const name = str(item["name"]);
    const amount = str(item["amount"]);
    const currency = str(item["currency"]);
    if (name !== undefined && amount !== undefined && currency !== undefined) out.push({ name, amount, currency });
  }
  return out;
}

function readOrganizer(value: unknown): Organizer | null | undefined {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return undefined;
  const name = str(value["name"]);
  const url = strOrNull(value["url"]);
  return name === undefined || url === undefined ? undefined : { name, url };
}

interface EventCore {
  readonly id: number;
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly timezone: string;
  readonly isOnline: boolean;
  readonly imageUrl: string | null;
  readonly category: CategoryRef;
  readonly venue: Venue | null;
  readonly price: PriceRange | null;
  readonly sources: readonly SourceLink[];
}

function readEventCore(value: Json): EventCore | undefined {
  const id = num(value["id"]);
  const title = str(value["title"]);
  const startsAt = str(value["starts_at"]);
  const endsAt = strOrNull(value["ends_at"]);
  const timezone = str(value["timezone"]);
  const isOnline = bool(value["is_online"]);
  const imageUrl = strOrNull(value["image_url"]);
  const category = readCategoryRef(value["category"]);
  const venue = readVenue(value["venue"]);
  const price = readPrice(value["price"]);
  const sources = readSources(value["sources"]);
  if (id === undefined || title === undefined || startsAt === undefined || endsAt === undefined) return undefined;
  if (timezone === undefined || isOnline === undefined || imageUrl === undefined || !category) return undefined;
  if (venue === undefined || price === undefined || sources === undefined) return undefined;
  return { id, title, startsAt, endsAt, timezone, isOnline, imageUrl, category, venue, price, sources };
}

export function readEventItem(value: unknown): EventItem | undefined {
  if (!isRecord(value)) return undefined;
  const core = readEventCore(value);
  const distanceM = numOrNull(value["distance_m"]);
  const sessions = num(value["sessions"]) ?? 1;
  if (!core || distanceM === undefined) return undefined;
  return { ...core, distanceM, sessions };
}

export function readEventDetail(value: unknown): EventDetail | undefined {
  if (!isRecord(value)) return undefined;
  const core = readEventCore(value);
  const description = strOrNull(value["description"]);
  const organizer = readOrganizer(value["organizer"]);
  const updatedAt = str(value["updated_at"]);
  if (!core || description === undefined || organizer === undefined || updatedAt === undefined) return undefined;
  return { ...core, description, organizer, priceLots: readLots(value["price_lots"]), updatedAt };
}

export function readEventPage(value: unknown): EventPage | undefined {
  if (!isRecord(value) || !Array.isArray(value["data"])) return undefined;
  const nextCursor = strOrNull(value["next_cursor"]);
  if (nextCursor === undefined) return undefined;
  const data: EventItem[] = [];
  for (const item of value["data"]) {
    const event = readEventItem(item);
    if (event) data.push(event);
  }
  return { data, nextCursor };
}

function readList<T>(value: unknown, read: (item: unknown) => T | undefined): readonly T[] | undefined {
  if (!isRecord(value) || !Array.isArray(value["data"])) return undefined;
  const out: T[] = [];
  for (const item of value["data"]) {
    const parsed = read(item);
    if (parsed) out.push(parsed);
  }
  return out;
}

/* URLs. The base is normalised once so `/v1/...` paths join cleanly. */

export function eventsUrl(base: string, query: EventQuery): string {
  const url = new URL("v1/events", withSlash(base));
  const p = url.searchParams;
  if (query.place.kind === "city") {
    p.set("city", query.place.city);
  } else {
    p.set("lat", query.place.lat.toFixed(6));
    p.set("lon", query.place.lon.toFixed(6));
    p.set("radius_km", String(query.place.radiusKm));
  }
  const q = query.q?.trim();
  if (q) p.set("q", q.split(/\s+/).slice(0, 6).join(" "));
  if (query.free === true) p.set("free", "true");
  for (const slug of (query.categories ?? []).slice(0, 10)) p.append("category", slug);
  if (query.to) p.set("to", query.to);
  if (query.limit !== undefined) p.set("limit", String(query.limit));
  if (query.cursor) p.set("cursor", query.cursor);
  return url.toString();
}

export function eventUrl(base: string, id: number): string {
  return new URL(`v1/events/${Math.trunc(id)}`, withSlash(base)).toString();
}

export function citiesUrl(base: string): string {
  return new URL("v1/cities", withSlash(base)).toString();
}

export function categoriesUrl(base: string): string {
  return new URL("v1/categories", withSlash(base)).toString();
}

/* The list must reach as far as a city's `events_upcoming` counts, or the
   count promises events the list never shows. The API defaults `to` to 30
   days and caps the span at 180 from `from` (default now); `to` as a date is
   inclusive, so 180 days ahead overshoots and 179 is the widest it accepts. */
const windowDays = 179;

export function windowEnd(now: Date): string {
  const end = new Date(now.getTime() + windowDays * 86_400_000);
  return end.toISOString().slice(0, 10);
}

function withSlash(base: string): string {
  return base.endsWith("/") ? base : `${base}/`;
}

/* Errors. The body shape is `{error: {code, message, field?, status?}}`. */

function readFailure(status: number, body: unknown, retryAfter: string | null): ApiFailure {
  const error = isRecord(body) && isRecord(body["error"]) ? body["error"] : undefined;
  if (status === 404) return { kind: "not_found" };
  if (status === 410) {
    const s = error ? str(error["status"]) : undefined;
    const known: GoneStatus = s === "cancelled" || s === "ended" || s === "removed_from_source" ? s : "unknown";
    return { kind: "gone", status: known };
  }
  if (status === 429) {
    const seconds = retryAfter === null ? NaN : Number.parseInt(retryAfter, 10);
    return { kind: "rate_limited", retryAfterS: Number.isFinite(seconds) ? seconds : null };
  }
  if (status === 503) return { kind: "unavailable" };
  if (status === 400 || status === 422) {
    const field = error ? (strOrNull(error["field"]) ?? null) : null;
    const message = (error && str(error["message"])) ?? "";
    return { kind: "invalid", field, message };
  }
  return { kind: "unknown", httpStatus: status };
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal: signal ?? null, headers: { accept: "application/json" } });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError({ kind: "offline" });
  }
  let body: unknown = undefined;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  if (!response.ok) throw new ApiError(readFailure(response.status, body, response.headers.get("retry-after")));
  return body;
}

export interface UsherApi {
  readonly listCities: (signal?: AbortSignal) => Promise<readonly City[]>;
  readonly listCategories: (signal?: AbortSignal) => Promise<readonly Category[]>;
  readonly listEvents: (query: EventQuery, signal?: AbortSignal) => Promise<EventPage>;
  readonly getEvent: (id: number, signal?: AbortSignal) => Promise<EventDetail>;
}

export function createApi(base: string): UsherApi {
  const shape = (): ApiError => new ApiError({ kind: "unknown", httpStatus: null });
  return {
    async listCities(signal) {
      const list = readList(await getJson(citiesUrl(base), signal), readCity);
      if (!list) throw shape();
      return list;
    },
    async listCategories(signal) {
      const list = readList(await getJson(categoriesUrl(base), signal), readCategory);
      if (!list) throw shape();
      return list;
    },
    async listEvents(query, signal) {
      const page = readEventPage(await getJson(eventsUrl(base, query), signal));
      if (!page) throw shape();
      return page;
    },
    async getEvent(id, signal) {
      const event = readEventDetail(await getJson(eventUrl(base, id), signal));
      if (!event) throw shape();
      return event;
    },
  };
}

export function failureOf(error: unknown): ApiFailure {
  if (error instanceof ApiError) return error.failure;
  return { kind: "unknown", httpStatus: null };
}
