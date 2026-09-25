/* The PWA's pure modules, and its client against the contract-shaped
   stand-in in tests/fixtures/usher-api.ts. No DOM: rendering is covered by
   the built-output test and by hand in a browser. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  ApiError,
  categoriesUrl,
  citiesUrl,
  createApi,
  eventUrl,
  eventsUrl,
  windowEnd,
  failureOf,
  readEventDetail,
  readEventItem,
  readEventPage,
  type UsherApi,
} from "../src/islands/Usher/api.ts";
import { countText, formatDistance, formatEnd, formatMoney, formatPriceRange, formatVenue, formatWhen, isZero, safeHttpUrl } from "../src/islands/Usher/format.ts";
import { eventHref, parseRoute } from "../src/islands/Usher/route.ts";
import { clampRadius, parsePlace } from "../src/islands/Usher/storage.ts";
import { serve } from "./fixtures/usher-api.ts";

const words = { free: "Grátis", from: "a partir de", upTo: "até", noPrice: "Preço no site" };

describe("format", () => {
  test("money is formatted from the decimal string, not a float", () => {
    expect(formatMoney("45.00", "BRL")).toBe("R$ 45,00");
    expect(formatMoney("1234.5", "BRL")).toBe("R$ 1.234,50");
    expect(formatMoney("0", "BRL")).toBe("R$ 0,00");
    expect(formatMoney("12345678901234567890.99", "BRL")).toBe("R$ 12.345.678.901.234.567.890,99");
    expect(formatMoney("7.25", "USD")).toBe("USD 7,25");
    expect(formatMoney("abc", "BRL")).toBe("BRL abc");
    expect(isZero("0.00")).toBe(true);
    expect(isZero("0.01")).toBe(false);
  });

  test("price ranges", () => {
    expect(formatPriceRange(null, words)).toBe("Preço no site");
    expect(formatPriceRange({ min: "0.00", max: "0.00", currency: "BRL", isFree: true }, words)).toBe("Grátis");
    expect(formatPriceRange({ min: "0.00", max: "80.00", currency: "BRL", isFree: true }, words)).toBe("Grátis até R$ 80,00");
    expect(formatPriceRange({ min: "25.00", max: "25.00", currency: "BRL", isFree: false }, words)).toBe("R$ 25,00");
    expect(formatPriceRange({ min: "10.00", max: "40.00", currency: "BRL", isFree: false }, words)).toBe("a partir de R$ 10,00");
  });

  test("times show in the event's zone", () => {
    expect(formatWhen("2026-10-03T23:00:00Z", "America/Sao_Paulo")).toContain("20:00");
    expect(formatWhen("2026-10-03T23:00:00Z", "America/Manaus")).toContain("19:00");
    expect(formatWhen("not a date", "America/Sao_Paulo")).toBe("");
    expect(formatWhen("2026-10-03T23:00:00Z", "Not/AZone")).not.toBe("");
    expect(formatEnd("2026-10-03T23:00:00Z", "2026-10-04T01:00:00Z", "America/Sao_Paulo")).toBe("22:00");
    expect(formatEnd("2026-10-03T23:00:00Z", "2026-10-04T03:00:00Z", "America/Sao_Paulo")).toContain("4 de out.");
  });

  test("counts pick the singular template at one", () => {
    expect(countText(1, "{n} evento", "{n} eventos")).toBe("1 evento");
    expect(countText(0, "{n} evento", "{n} eventos")).toBe("0 eventos");
    expect(countText(46, "e mais {n} sessão", "e mais {n} sessões")).toBe("e mais 46 sessões");
  });

  test("distance and venue captions", () => {
    expect(formatDistance(850)).toBe("850 m");
    expect(formatDistance(2614)).toBe("2,6 km");
    expect(formatDistance(12_400)).toBe("12 km");
    expect(formatVenue({ name: "Teatro", city: "Vitória" })).toBe("Teatro · Vitória");
    expect(formatVenue({ name: null, city: "Vitória" })).toBe("Vitória");
    expect(formatVenue(null)).toBe("");
  });

  test("only http(s) URLs reach href or src", () => {
    expect(safeHttpUrl("https://seller.example/x")).toBe("https://seller.example/x");
    expect(safeHttpUrl("http://images.example/a.jpg")).toBe("http://images.example/a.jpg");
    expect(safeHttpUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeHttpUrl("data:image/png;base64,AAAA")).toBeUndefined();
    expect(safeHttpUrl("//seller.example/x")).toBeUndefined();
    expect(safeHttpUrl("")).toBeUndefined();
    expect(safeHttpUrl(null)).toBeUndefined();
  });
});

describe("route and storage", () => {
  test("hash routes", () => {
    expect(parseRoute("")).toEqual({ view: "list" });
    expect(parseRoute("#/")).toEqual({ view: "list" });
    expect(parseRoute("#/evento/48213")).toEqual({ view: "event", id: 48213 });
    expect(parseRoute("#/evento/abc")).toEqual({ view: "list" });
    expect(parseRoute("#/evento/1e5")).toEqual({ view: "list" });
    expect(eventHref(48213)).toBe("#/evento/48213");
  });

  test("a stored place is validated before use", () => {
    expect(parsePlace({ kind: "city", city: "sao-paulo" })).toEqual({ kind: "city", city: "sao-paulo" });
    expect(parsePlace({ kind: "city", city: "<x>" })).toBeNull();
    expect(parsePlace({ kind: "near", lat: -20.3, lon: -40.3, radiusKm: 10 })).toEqual({ kind: "near", lat: -20.3, lon: -40.3, radiusKm: 10 });
    expect(parsePlace({ kind: "near", lat: 91, lon: 0, radiusKm: 10 })).toBeNull();
    expect(parsePlace({ kind: "near", lat: 0, lon: 0, radiusKm: 999 })).toEqual({ kind: "near", lat: 0, lon: 0, radiusKm: 100 });
    expect(parsePlace("junk")).toBeNull();
    expect(clampRadius(Number.NaN)).toBe(25);
  });
});

describe("api urls", () => {
  const base = "https://api.example/";
  test("only filters travel, in the contract's names", () => {
    const url = new URL(eventsUrl(base, { place: { kind: "near", lat: -20.3155, lon: -40.3128, radiusKm: 10 }, q: "  jazz   na praça  ", free: true, categories: ["music"], limit: 20 }));
    expect(url.pathname).toBe("/v1/events");
    expect(url.searchParams.get("lat")).toBe("-20.315500");
    expect(url.searchParams.get("lon")).toBe("-40.312800");
    expect(url.searchParams.get("radius_km")).toBe("10");
    expect(url.searchParams.get("q")).toBe("jazz na praça");
    expect(url.searchParams.get("free")).toBe("true");
    expect(url.searchParams.getAll("category")).toEqual(["music"]);
    expect(url.searchParams.has("city")).toBe(false);
    expect([...url.searchParams.keys()].sort()).toEqual(["category", "free", "lat", "limit", "lon", "q", "radius_km"]);
  });
  test("a city search sends the slug and no position; free=false is not sent", () => {
    const url = new URL(eventsUrl("https://api.example", { place: { kind: "city", city: "vitoria" }, free: false, cursor: "abc" }));
    expect(url.searchParams.get("city")).toBe("vitoria");
    expect(url.searchParams.has("free")).toBe(false);
    expect(url.searchParams.get("cursor")).toBe("abc");
    expect(url.searchParams.has("lat")).toBe(false);
  });
  test("the window reaches as far as the API allows, so the list covers the city count", () => {
    expect(windowEnd(new Date("2026-09-25T23:59:00Z"))).toBe("2027-03-23");
    const url = new URL(eventsUrl(base, { place: { kind: "city", city: "vila-velha" }, to: "2027-03-23" }));
    expect(url.searchParams.get("to")).toBe("2027-03-23");
  });
  test("a base with a path keeps it", () => {
    expect(eventUrl("https://api.example/usher", 5)).toBe("https://api.example/usher/v1/events/5");
    expect(citiesUrl("https://api.example/usher/")).toBe("https://api.example/usher/v1/cities");
    expect(categoriesUrl("https://api.example")).toBe("https://api.example/v1/categories");
  });
});

describe("parsing", () => {
  const item = {
    id: 1, title: "t", starts_at: "2026-10-03T23:00:00Z", ends_at: null, timezone: "America/Sao_Paulo", is_online: false,
    image_url: null, category: { slug: "music", name: "Música" }, venue: null, distance_m: null, price: null, sources: [], sessions: 1,
  };
  test("unknown fields are ignored, missing required fields drop the item", () => {
    expect(readEventItem({ ...item, brand_new_field: 1 })?.id).toBe(1);
    expect(readEventItem({ ...item, title: undefined })).toBeUndefined();
    expect(readEventItem({ ...item, category: { slug: "x" } })).toBeUndefined();
    const page = readEventPage({ data: [item, { junk: true }, { ...item, id: 2 }], next_cursor: null });
    expect(page?.data.map((e) => e.id)).toEqual([1, 2]);
    expect(readEventPage({ data: "no" })).toBeUndefined();
  });
  test("a detail needs description, organizer and updated_at", () => {
    expect(readEventDetail({ ...item, description: null, organizer: null, updated_at: "2026-09-22T10:00:00Z" })?.priceLots).toEqual([]);
    expect(readEventDetail({ ...item, description: null, organizer: null })).toBeUndefined();
    expect(readEventDetail({ ...item, description: "d", organizer: { url: null }, updated_at: "x" })).toBeUndefined();
  });
});

describe("client against the stand-in", () => {
  let server: ReturnType<typeof serve>;
  let api: UsherApi;
  beforeAll(() => {
    server = serve();
    api = createApi(server.url.toString());
  });
  afterAll(() => server.stop(true));

  test("cities and categories", async () => {
    const cities = await api.listCities();
    expect(cities.map((c) => c.slug)).toContain("vitoria");
    expect(cities[0]?.eventsUpcoming).toBeGreaterThan(0);
    const categories = await api.listCategories();
    expect(categories.map((c) => c.slug)).toContain("uncategorized");
  });

  test("a city list, then the next page by cursor", async () => {
    const first = await api.listEvents({ place: { kind: "city", city: "vitoria" }, limit: 2 });
    expect(first.data).toHaveLength(2);
    expect(first.nextCursor).not.toBeNull();
    const second = await api.listEvents({ place: { kind: "city", city: "vitoria" }, limit: 2, cursor: first.nextCursor ?? "" });
    expect(second.data).toHaveLength(1);
    expect(second.nextCursor).toBeNull();
    expect(second.data[0]?.distanceM).toBeNull();
  });

  test("a radius search carries distances and excludes online events", async () => {
    const page = await api.listEvents({ place: { kind: "near", lat: -20.3155, lon: -40.3128, radiusKm: 25 } });
    expect(page.data.every((e) => !e.isOnline)).toBe(true);
    expect(page.data.find((e) => e.id === 48213)?.distanceM).toBe(2614);
  });

  test("filters: words, free, category", async () => {
    const jazz = await api.listEvents({ place: { kind: "city", city: "vitoria" }, q: "JAZZ praca" });
    expect(jazz.data.map((e) => e.id)).toEqual([48213]);
    const free = await api.listEvents({ place: { kind: "city", city: "vitoria" }, free: true });
    expect(free.data.map((e) => e.id)).toEqual([48213]);
    const theatre = await api.listEvents({ place: { kind: "city", city: "vitoria" }, categories: ["theatre"] });
    expect(theatre.data.map((e) => e.id)).toEqual([48250]);
    expect(theatre.data[0]?.sessions).toBe(47);
  });

  test("a detail, a missing id, and a gone event", async () => {
    const detail = await api.getEvent(48213);
    expect(detail.priceLots).toHaveLength(2);
    expect(detail.organizer?.name).toBe("Coletivo da Praça");
    expect(detail.description).toContain("\n");
    await expect(api.getEvent(1)).rejects.toMatchObject({ failure: { kind: "not_found" } });
    await expect(api.getEvent(40410)).rejects.toMatchObject({ failure: { kind: "gone", status: "cancelled" } });
  });

  test("bad input is `invalid` with the field", async () => {
    await expect(api.listEvents({ place: { kind: "city", city: "nowhere" } })).rejects.toMatchObject({ failure: { kind: "invalid", field: "city" } });
  });

  test("429 carries Retry-After, 503 is `unavailable`, a dead server is `offline`", async () => {
    const limited = serve({ failWith: { status: 429, body: { error: { code: "rate_limited", message: "slow down" } }, retryAfter: 7 } });
    const down = serve({ failWith: { status: 503, body: { error: { code: "db_unavailable", message: "later" } } } });
    try {
      await expect(createApi(limited.url.toString()).listCities()).rejects.toMatchObject({ failure: { kind: "rate_limited", retryAfterS: 7 } });
      await expect(createApi(down.url.toString()).listCities()).rejects.toMatchObject({ failure: { kind: "unavailable" } });
    } finally {
      limited.stop(true);
      down.stop(true);
    }
    const gone = serve();
    const url = gone.url.toString();
    gone.stop(true);
    await expect(createApi(url).listCities()).rejects.toMatchObject({ failure: { kind: "offline" } });
  });

  test("failureOf maps anything else to unknown", () => {
    expect(failureOf(new Error("x"))).toEqual({ kind: "unknown", httpStatus: null });
    expect(failureOf(new ApiError({ kind: "not_found" }))).toEqual({ kind: "not_found" });
  });
});
