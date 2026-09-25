/* One event, fetched by id. Description is text with line breaks kept by
   CSS, never HTML. Links to sellers and organizers pass safeHttpUrl and open
   in a new tab with a safe rel through the design system's Link. A 410
   explains itself with the status the API gives. */

import { useEffect, useState } from "react";
import type { ApiFailure, EventDetail, UsherApi } from "./api.ts";
import { failureOf } from "./api.ts";
import { Link, Text } from "../dsx.ts";
import type { UsherCopy } from "../../copy/usher.ts";
import { formatDate, formatEnd, formatMoney, formatPriceRange, formatWhen, safeHttpUrl } from "./format.ts";
import { EventImage } from "./EventImage.tsx";
import { Notice } from "./Notice.tsx";
import { listHref } from "./route.ts";

export interface EventDetailViewProps {
  readonly api: UsherApi;
  readonly id: number;
  readonly copy: UsherCopy;
}

type State =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly event: EventDetail }
  | { readonly status: "failed"; readonly failure: ApiFailure };

export function describeFailure(failure: ApiFailure, copy: UsherCopy): string {
  switch (failure.kind) {
    case "offline":
      return copy.errors.offline;
    case "rate_limited":
      return copy.errors.rateLimited;
    case "unavailable":
      return copy.errors.unavailable;
    case "invalid":
      return copy.errors.invalid;
    case "not_found":
      return copy.detail.notFound;
    case "gone":
      switch (failure.status) {
        case "cancelled":
          return copy.detail.goneCancelled;
        case "ended":
          return copy.detail.goneEnded;
        case "removed_from_source":
          return copy.detail.goneRemoved;
        default:
          return copy.detail.gone;
      }
    default:
      return copy.errors.unknown;
  }
}

export function EventDetailView({ api, id, copy }: EventDetailViewProps) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    api
      .getEvent(id, controller.signal)
      .then((event) => setState({ status: "ready", event }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "failed", failure: failureOf(error) });
      });
    return () => controller.abort();
  }, [api, id]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  const back = (
    <Link href={listHref} underline="hover" className="type-label">
      ← {copy.detail.back}
    </Link>
  );

  if (state.status === "loading") {
    return (
      <article className="flex flex-col gap-stack-lg">
        {back}
        <Text variant="body" tone="muted" role="status">
          {copy.detail.loading}
        </Text>
      </article>
    );
  }

  if (state.status === "failed") {
    const tone = state.failure.kind === "gone" || state.failure.kind === "not_found" ? "info" : "warning";
    return (
      <article className="flex flex-col gap-stack-lg">
        {back}
        <Notice tone={tone}>{describeFailure(state.failure, copy)}</Notice>
      </article>
    );
  }

  const { event } = state;
  const image = safeHttpUrl(event.imageUrl);
  const organizerUrl = safeHttpUrl(event.organizer?.url);
  const sellers = event.sources
    .map((s) => ({ source: s.source, url: safeHttpUrl(s.url) }))
    .filter((s): s is { source: string; url: string } => s.url !== undefined);
  const priceWords = { free: copy.list.free, from: copy.list.from, upTo: copy.list.upTo, noPrice: copy.list.noPrice };

  return (
    <article className="flex flex-col gap-stack-lg">
      {back}
      {image && <EventImage src={image} className="aspect-video w-full rounded-container" />}
      <header className="flex flex-col gap-stack-sm">
        <Text variant="overline" tone="brand">
          {event.category.name}
        </Text>
        <Text variant="title" as="h2" className="text-balance">
          {event.title}
        </Text>
        <Text variant="subheading" as="p" tone="muted">
          {formatWhen(event.startsAt, event.timezone)}
          {event.endsAt && ` · ${copy.detail.ends} ${formatEnd(event.startsAt, event.endsAt, event.timezone)}`}
        </Text>
        <Text variant="label" as="p" tone={event.price?.isFree ? "success" : "default"}>
          {formatPriceRange(event.price, priceWords)}
        </Text>
      </header>

      {sellers.length > 0 && (
        <section aria-label={copy.detail.buy} className="flex flex-col gap-stack-sm">
          <Text variant="overline" tone="muted">
            {copy.detail.buy}
          </Text>
          <ul className="flex flex-wrap gap-stack-sm" role="list">
            {sellers.map((seller) => (
              <li key={seller.url}>
                <a
                  href={seller.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-control-md items-center rounded-control border border-transparent bg-brand-solid px-inset-lg text-sm font-medium text-fg-inverse outline-none transition duration-fast ease-standard hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {copy.detail.buyAt} {seller.source}
                  <span className="sr-only"> {copy.externalLabel}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-stack-sm">
        <Text variant="overline" tone="muted">
          {copy.detail.address}
        </Text>
        {event.isOnline || event.venue === null ? (
          <Text variant="body">{copy.detail.onlineEvent}</Text>
        ) : (
          <Text variant="body" className="whitespace-pre-line">
            {[event.venue.name, event.venue.address].filter((p): p is string => !!p).join("\n")}
          </Text>
        )}
      </section>

      {event.description && (
        <Text variant="body" className="max-w-prose whitespace-pre-line">
          {event.description}
        </Text>
      )}

      {event.priceLots.length > 0 && (
        <section className="flex flex-col gap-stack-sm">
          <Text variant="overline" tone="muted">
            {copy.detail.prices}
          </Text>
          <ul className="flex flex-col gap-stack-sm" role="list">
            {event.priceLots.map((lot, i) => (
              <li key={`${i}-${lot.name}`} className="flex justify-between gap-stack-md border-b border-border py-inset-sm">
                <Text variant="body-sm" as="span">
                  {lot.name}
                </Text>
                <Text variant="numeric" as="span">
                  {formatMoney(lot.amount, lot.currency)}
                </Text>
              </li>
            ))}
          </ul>
        </section>
      )}

      {event.organizer && (
        <section className="flex flex-col gap-stack-sm">
          <Text variant="overline" tone="muted">
            {copy.detail.organizer}
          </Text>
          {organizerUrl ? (
            <Link href={organizerUrl} external externalLabel={copy.externalLabel}>
              {event.organizer.name}
            </Link>
          ) : (
            <Text variant="body">{event.organizer.name}</Text>
          )}
        </section>
      )}

      <Text variant="caption" tone="subtle">
        {copy.detail.updated} {formatDate(event.updatedAt, event.timezone)}
      </Text>
    </article>
  );
}
