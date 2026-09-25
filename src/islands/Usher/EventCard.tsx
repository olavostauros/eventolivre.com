/* One row of the list. Every string is API data rendered as text; the image
   URL passes safeHttpUrl or there is no image. The whole card is one link
   into the app's hash route. */

import type { EventItem } from "./api.ts";
import { Text } from "../dsx.ts";
import { EventImage } from "./EventImage.tsx";
import type { UsherCopy } from "../../copy/usher.ts";
import { formatDistance, formatPriceRange, formatVenue, formatWhen, safeHttpUrl } from "./format.ts";
import { eventHref } from "./route.ts";

export interface EventCardProps {
  readonly event: EventItem;
  readonly copy: UsherCopy["list"];
}

export function EventCard({ event, copy }: EventCardProps) {
  const image = safeHttpUrl(event.imageUrl);
  const venue = event.isOnline ? copy.online : formatVenue(event.venue);
  const extraSessions = event.sessions - 1;
  const priceWords = { free: copy.free, from: copy.from, upTo: copy.upTo, noPrice: copy.noPrice };

  return (
    <li className="list-none">
      <a
        href={eventHref(event.id)}
        className="flex gap-stack-md rounded-container border border-border bg-surface p-inset-md elevation-1 outline-none transition duration-fast ease-standard hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <EventImage src={image} className="size-20 shrink-0 rounded-control" />
        <div className="flex min-w-0 grow flex-col gap-stack-sm">
          <Text variant="caption" tone="brand" as="span">
            {formatWhen(event.startsAt, event.timezone)}
            {extraSessions > 0 && ` · ${copy.moreSessions.replace("{n}", String(extraSessions))}`}
          </Text>
          <Text variant="subheading" as="h3" className="font-display text-balance">
            {event.title}
          </Text>
          {venue && (
            <Text variant="body-sm" tone="muted" as="span" truncate>
              {venue}
              {event.distanceM !== null && ` · ${formatDistance(event.distanceM)} ${copy.away}`}
            </Text>
          )}
          <div className="flex flex-wrap items-center gap-stack-sm">
            <Text variant="label" as="span" tone={event.price?.isFree ? "success" : "default"}>
              {formatPriceRange(event.price, priceWords)}
            </Text>
            <Text variant="caption" as="span" tone="subtle">
              {event.category.name}
            </Text>
          </div>
        </div>
      </a>
    </li>
  );
}
