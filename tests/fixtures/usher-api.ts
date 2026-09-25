/* A stand-in for the Usher events API, shaped by its public contract, for
   developing and testing the PWA without any real address. Run it with
   `bun run tests/fixtures/usher-api.ts` (port 8765, or $PORT) and start the
   site with `PUBLIC_USHER_API_URL=http://localhost:8765 bun run dev`.
   tests/usher.test.ts starts it on a free port. Every string here is made
   up; nothing is taken from a real listing. */

export interface FixtureOptions {
  readonly port?: number;
  /** Answer every request with this status and body instead of data. */
  readonly failWith?: { readonly status: number; readonly body: unknown; readonly retryAfter?: number };
}

const cities = [
  { slug: "vitoria", name: "Vitória", uf: "ES", timezone: "America/Sao_Paulo", events_upcoming: 3 },
  { slug: "vila-velha", name: "Vila Velha", uf: "ES", timezone: "America/Sao_Paulo", events_upcoming: 1 },
  { slug: "sao-paulo", name: "São Paulo", uf: "SP", timezone: "America/Sao_Paulo", events_upcoming: 0 },
  { slug: "manaus", name: "Manaus", uf: "AM", timezone: "America/Manaus", events_upcoming: 1 },
];

const categories = [
  { slug: "music", name: "Música", events_upcoming: 3 },
  { slug: "theatre", name: "Teatro", events_upcoming: 1 },
  { slug: "uncategorized", name: "Sem categoria", events_upcoming: 1 },
];

const venue = {
  id: 912,
  name: "Teatro da Praça",
  address: "Praça Central, 1, Centro, Vitória - ES",
  city: "Vitória",
  uf: "ES",
  lat: -20.319812,
  lon: -40.338104,
};

const events = [
  {
    id: 48213,
    title: "Festival de Jazz da Praça",
    description: "Três noites de jazz ao ar livre.\n\nTraga cadeira e casaco.",
    starts_at: "2026-10-03T23:00:00Z",
    ends_at: "2026-10-04T03:00:00Z",
    timezone: "America/Sao_Paulo",
    is_online: false,
    image_url: "https://images.example/jazz.jpg",
    category: { slug: "music", name: "Música" },
    venue,
    organizer: { name: "Coletivo da Praça", url: "https://organizer.example/" },
    price: { min: "0.00", max: "80.00", currency: "BRL", is_free: true },
    price_lots: [
      { name: "Pista (meia)", amount: "0.00", currency: "BRL" },
      { name: "Pista", amount: "80.00", currency: "BRL" },
    ],
    sources: [{ source: "vendedora-a", url: "https://seller-a.example/evento/48213" }],
    distance_m: 2614,
    sessions: 1,
    city: "vitoria",
    updated_at: "2026-09-20T10:00:00Z",
  },
  {
    id: 48250,
    title: "Visita guiada ao teatro 17h",
    description: null,
    starts_at: "2026-10-05T20:00:00Z",
    ends_at: null,
    timezone: "America/Sao_Paulo",
    is_online: false,
    image_url: null,
    category: { slug: "theatre", name: "Teatro" },
    venue: { ...venue, id: 913, name: "Teatro Velho", address: null },
    organizer: null,
    price: { min: "25.00", max: "25.00", currency: "BRL", is_free: false },
    price_lots: [{ name: "Inteira", amount: "25.00", currency: "BRL" }],
    sources: [
      { source: "vendedora-a", url: "https://seller-a.example/evento/48250" },
      { source: "vendedora-b", url: "javascript:alert(1)" },
    ],
    distance_m: 3100,
    sessions: 47,
    city: "vitoria",
    updated_at: "2026-09-21T10:00:00Z",
  },
  {
    id: 48300,
    title: "<b>Show</b> de encerramento & festa",
    description: "<script>alert('x')</script> Texto com marcação, que deve aparecer como texto.",
    starts_at: "2026-10-10T01:00:00Z",
    ends_at: null,
    timezone: "America/Sao_Paulo",
    is_online: false,
    image_url: "data:image/png;base64,AAAA",
    category: { slug: "music", name: "Música" },
    venue: { ...venue, id: 914, name: "Arena Norte", lat: null, lon: null },
    organizer: { name: "Produtora X", url: null },
    price: null,
    price_lots: [],
    sources: [{ source: "vendedora-c", url: "https://seller-c.example/x" }],
    distance_m: null,
    sessions: 1,
    city: "vitoria",
    updated_at: "2026-09-22T10:00:00Z",
  },
  {
    id: 48400,
    title: "Aula de forró online",
    description: "Ao vivo, de qualquer lugar.",
    starts_at: "2026-10-08T22:00:00Z",
    ends_at: "2026-10-08T23:30:00Z",
    timezone: "America/Sao_Paulo",
    is_online: true,
    image_url: "http://images.example/forro.jpg",
    category: { slug: "music", name: "Música" },
    venue: null,
    organizer: null,
    price: { min: "1234.50", max: "1234.50", currency: "BRL", is_free: false },
    price_lots: [{ name: "Acesso", amount: "1234.50", currency: "BRL" }],
    sources: [{ source: "vendedora-a", url: "https://seller-a.example/evento/48400" }],
    distance_m: null,
    sessions: 1,
    city: "vila-velha",
    updated_at: "2026-09-22T10:00:00Z",
  },
  {
    id: 48500,
    title: "Sarau do Norte",
    description: null,
    starts_at: "2026-10-12T00:00:00Z",
    ends_at: null,
    timezone: "America/Manaus",
    is_online: false,
    image_url: null,
    category: { slug: "uncategorized", name: "Sem categoria" },
    venue: { id: 950, name: "Casa do Rio", address: "Rua do Porto, 10", city: "Manaus", uf: "AM", lat: -3.1, lon: -60.0 },
    organizer: null,
    price: { min: "10.00", max: "40.00", currency: "BRL", is_free: false },
    price_lots: [],
    sources: [{ source: "vendedora-b", url: "https://seller-b.example/sarau" }],
    distance_m: null,
    sessions: 1,
    city: "manaus",
    updated_at: "2026-09-22T10:00:00Z",
  },
];

type Fixture = (typeof events)[number];

function item(e: Fixture, withDistance: boolean) {
  const { description: _d, organizer: _o, price_lots: _p, updated_at: _u, city: _c, ...rest } = e;
  return { ...rest, distance_m: withDistance && !e.is_online ? e.distance_m : null };
}

function detail(e: Fixture) {
  const { distance_m: _d, sessions: _s, city: _c, ...rest } = e;
  return rest;
}

function error(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
  return Response.json({ error: { code, message, ...extra } }, { status, headers: cors() });
}

function cors(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "accept, if-none-match",
    "cache-control": "max-age=300",
  };
}

function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function handle(request: Request, options: FixtureOptions = {}): Response {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
  if (options.failWith) {
    const headers = cors();
    if (options.failWith.retryAfter !== undefined) headers["retry-after"] = String(options.failWith.retryAfter);
    return Response.json(options.failWith.body, { status: options.failWith.status, headers });
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "v1") return error(404, "not_found", "no such route");
  if (parts[1] === "cities") return Response.json({ data: cities }, { headers: cors() });
  if (parts[1] === "categories") return Response.json({ data: categories }, { headers: cors() });
  if (parts[1] !== "events") return error(404, "not_found", "no such route");

  if (parts[2] !== undefined) {
    const id = Number(parts[2]);
    if (id === 40410) return error(410, "gone", "cancelled", { status: "cancelled" });
    const found = events.find((e) => e.id === id);
    return found ? Response.json(detail(found), { headers: cors() }) : error(404, "not_found", "no event");
  }

  const p = url.searchParams;
  const lat = p.get("lat");
  const lon = p.get("lon");
  const city = p.get("city");
  if ((lat === null) !== (lon === null)) return error(422, "invalid_parameter", "lat and lon go together", { field: "lat" });
  if (lat === null && city === null) return error(422, "invalid_parameter", "lat/lon or city", { field: "city" });
  if (city !== null && !cities.some((c) => c.slug === city)) return error(422, "invalid_parameter", "unknown city", { field: "city" });
  const radius = Number(p.get("radius_km") ?? "25");
  if (!(radius >= 1 && radius <= 100)) return error(422, "invalid_parameter", "1 to 100", { field: "radius_km" });

  let rows = events.filter((e) => (city !== null ? e.city === city : true));
  if (lat !== null) rows = rows.filter((e) => !e.is_online);
  const q = p.get("q");
  if (q) {
    const words = fold(q).split(/\s+/).filter(Boolean);
    rows = rows.filter((e) => words.every((w) => fold(e.title).includes(w)));
  }
  const free = p.get("free");
  if (free === "true") rows = rows.filter((e) => e.price?.is_free === true);
  if (free === "false") rows = rows.filter((e) => e.price?.is_free !== true);
  const cats = p.getAll("category");
  if (cats.length > 0) rows = rows.filter((e) => cats.includes(e.category.slug));

  const limit = Math.min(100, Math.max(1, Number(p.get("limit") ?? "20")));
  const cursor = p.get("cursor");
  const start = cursor ? Number(Buffer.from(cursor, "base64url").toString()) : 0;
  const page = rows.slice(start, start + limit);
  const next = start + limit < rows.length ? Buffer.from(String(start + limit)).toString("base64url") : null;
  return Response.json({ data: page.map((e) => item(e, lat !== null)), next_cursor: next }, { headers: cors() });
}

export function serve(options: FixtureOptions = {}) {
  return Bun.serve({ port: options.port ?? 0, fetch: (request) => handle(request, options) });
}

if (import.meta.main) {
  const server = serve({ port: Number(process.env["PORT"] ?? "8765") });
  console.log(`Usher API stand-in listening on ${server.url}`);
}
