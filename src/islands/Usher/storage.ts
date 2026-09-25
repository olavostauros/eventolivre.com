/**
 * What the app remembers, and where. Must stay true: only the person's own
 * place (a city slug, or a position and radius) lives in localStorage, under
 * one key, and it never leaves the device except as query parameters to
 * the API (CYBERSECURITY.md §4). Storage may be blocked or full; every
 * access is wrapped and the app works without it.
 */

import type { Place } from "./api.ts";

export const placeKey = "usher:place";

export function readPlace(): Place | null {
  try {
    const raw = localStorage.getItem(placeKey);
    if (raw === null) return null;
    return parsePlace(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writePlace(place: Place | null): void {
  try {
    if (place === null) localStorage.removeItem(placeKey);
    else localStorage.setItem(placeKey, JSON.stringify(place));
  } catch {
    /* Private mode or blocked storage: the choice lasts for this visit only. */
  }
}

export function parsePlace(value: unknown): Place | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as { readonly [key: string]: unknown };
  if (v["kind"] === "city" && typeof v["city"] === "string" && /^[a-z0-9-]{1,64}$/.test(v["city"])) {
    return { kind: "city", city: v["city"] };
  }
  if (v["kind"] === "near") {
    const lat = v["lat"];
    const lon = v["lon"];
    const radiusKm = v["radiusKm"];
    if (typeof lat !== "number" || typeof lon !== "number" || typeof radiusKm !== "number") return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return { kind: "near", lat, lon, radiusKm: clampRadius(radiusKm) };
  }
  return null;
}

export const radiusOptions = [5, 10, 25, 50] as const;
export const defaultRadiusKm = 25;

export function clampRadius(km: number): number {
  if (!Number.isFinite(km)) return defaultRadiusKm;
  return Math.min(100, Math.max(1, Math.round(km)));
}
