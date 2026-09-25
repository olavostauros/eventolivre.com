/**
 * Usher: the attendee app, one island mounted at /usher/. It exists because
 * everything it does is interaction: a place, filters, a list that grows,
 * an event opened from the list. It is the only place on the domain that
 * talks to the events API.
 *
 * Must stay true (CYBERSECURITY.md §4, decision 0006):
 * - `apiUrl` is the one build-time value; nothing else is configuration.
 * - The service worker is registered with scope `/usher/`, never `/`.
 * - Storage holds the person's place only (storage.ts). Filters live in
 *   React state and die with the tab.
 * - Every API string is rendered as text through the components in this
 *   folder; URLs pass `safeHttpUrl` first.
 * - Server render and first client render must match: browser-only reads
 *   (storage, hash, geolocation) happen in effects.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiFailure, Category, City, EventItem, Place, UsherApi } from "./api.ts";
import { createApi, failureOf } from "./api.ts";
import { Button, Text } from "../dsx.ts";
import type { UsherCopy } from "../../copy/usher.ts";
import { EventCard } from "./EventCard.tsx";
import { describeFailure, EventDetailView } from "./EventDetailView.tsx";
import { emptyFilters, Filters, type FilterState } from "./Filters.tsx";
import { Notice } from "./Notice.tsx";
import { PlacePicker } from "./PlacePicker.tsx";
import { parseRoute, type Route } from "./route.ts";
import { readPlace, writePlace } from "./storage.ts";
import { useDebounced } from "./useDebounced.ts";

export interface UsherProps {
  readonly apiUrl: string;
  readonly copy: UsherCopy;
}

interface ListState {
  readonly status: "idle" | "loading" | "more" | "ready" | "failed";
  readonly events: readonly EventItem[];
  readonly cursor: string | null;
  readonly failure: ApiFailure | null;
}

const idleList: ListState = { status: "idle", events: [], cursor: null, failure: null };
const pageSize = 20;

export function Usher({ apiUrl, copy }: UsherProps) {
  const api: UsherApi = useMemo(() => createApi(apiUrl), [apiUrl]);
  const [route, setRoute] = useState<Route>({ view: "list" });
  const [place, setPlaceState] = useState<Place | null>(null);
  const [restored, setRestored] = useState(false);
  const [cities, setCities] = useState<readonly City[]>([]);
  const [categories, setCategories] = useState<readonly Category[]>([]);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [list, setList] = useState<ListState>(idleList);
  const [reload, setReload] = useState(0);
  const q = useDebounced(filters.q, 350);
  const categoryKey = filters.categories.join(",");

  /* Browser-only setup: the remembered place, the hash route, the worker. */
  useEffect(() => {
    setPlaceState(readPlace());
    setRestored(true);
    const onHash = () => setRoute(parseRoute(window.location.hash));
    onHash();
    window.addEventListener("hashchange", onHash);
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/usher/sw.js", { scope: "/usher/" }).catch(() => {
        /* No worker means no offline shell; the app still works online. */
      });
    }
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    api
      .listCities(controller.signal)
      .then(setCities)
      .catch(() => {});
    api
      .listCategories(controller.signal)
      .then(setCategories)
      .catch(() => {});
    return () => controller.abort();
  }, [api]);

  const setPlace = useCallback((next: Place | null) => {
    setPlaceState(next);
    writePlace(next);
  }, []);

  /* The first page, whenever the query changes. */
  useEffect(() => {
    if (!restored || place === null) {
      setList(idleList);
      return;
    }
    const controller = new AbortController();
    setList((prev) => ({ ...prev, status: "loading", failure: null }));
    api
      .listEvents({ place, q, free: filters.free, categories: filters.categories, limit: pageSize }, controller.signal)
      .then((page) => setList({ status: "ready", events: page.data, cursor: page.nextCursor, failure: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const failure = failureOf(error);
        setList((prev) => ({
          status: "failed",
          events: failure.kind === "offline" ? prev.events : [],
          cursor: failure.kind === "offline" ? prev.cursor : null,
          failure,
        }));
      });
    return () => controller.abort();
    // categoryKey stands in for the array so a new array with the same slugs does not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, restored, place, q, filters.free, categoryKey, reload]);

  const loadMore = () => {
    if (place === null || list.cursor === null || list.status === "more") return;
    const cursor = list.cursor;
    setList((prev) => ({ ...prev, status: "more", failure: null }));
    api
      .listEvents({ place, q, free: filters.free, categories: filters.categories, limit: pageSize, cursor })
      .then((page) =>
        setList((prev) => ({
          status: "ready",
          events: [...prev.events, ...page.data.filter((e) => !prev.events.some((p) => p.id === e.id))],
          cursor: page.nextCursor,
          failure: null,
        })),
      )
      .catch((error: unknown) => setList((prev) => ({ ...prev, status: "failed", failure: failureOf(error) })));
  };

  if (route.view === "event") {
    return <EventDetailView api={api} id={route.id} copy={copy} />;
  }

  const retry = () => setReload((n) => n + 1);

  return (
    <div className="flex flex-col gap-stack-lg">
      <PlacePicker copy={copy.place} cities={cities} place={place} onChange={setPlace} />
      {place !== null && <Filters copy={copy.filters} categories={categories} value={filters} onChange={setFilters} />}

      {list.failure !== null && (
        <Notice
          tone={list.failure.kind === "offline" ? "info" : "warning"}
          action={copy.list.retry}
          onAction={list.failure.kind === "invalid" ? () => setFilters(emptyFilters) : retry}
        >
          {describeFailure(list.failure, copy)}
        </Notice>
      )}

      {list.status === "loading" && (
        <Text variant="body" tone="muted" role="status">
          {copy.list.loading}
        </Text>
      )}

      {list.status === "ready" && list.events.length === 0 && (
        <Text variant="body" tone="muted" role="status">
          {copy.list.empty}
        </Text>
      )}

      {list.events.length > 0 && (
        <ul className="flex flex-col gap-stack-md" aria-busy={list.status === "loading" || list.status === "more"}>
          {list.events.map((event) => (
            <EventCard key={event.id} event={event} copy={copy.list} />
          ))}
        </ul>
      )}

      {list.events.length > 0 && list.cursor !== null && (
        <div className="flex justify-center">
          <Button variant="secondary" size="lg" loading={list.status === "more"} onClick={loadMore}>
            {copy.list.more}
          </Button>
        </div>
      )}
      {list.status === "ready" && list.events.length > 0 && list.cursor === null && (
        <Text variant="caption" tone="subtle" align="center">
          {copy.list.end}
        </Text>
      )}
    </div>
  );
}
