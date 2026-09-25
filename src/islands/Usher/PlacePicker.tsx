/* Where to look: a city from the API's registry or the phone's position.
   Geolocation is asked for on a tap, never on load, and the answer is kept
   only by storage.ts. */

import { useState } from "react";
import type { City, Place } from "./api.ts";
import { Button, Text } from "../dsx.ts";
import type { UsherCopy } from "../../copy/usher.ts";
import { clampRadius, defaultRadiusKm, radiusOptions } from "./storage.ts";

export interface PlacePickerProps {
  readonly copy: UsherCopy["place"];
  readonly cities: readonly City[];
  readonly place: Place | null;
  readonly onChange: (place: Place | null) => void;
}

const selectClasses =
  "block w-full min-w-0 appearance-none rounded-control border border-border-strong bg-surface px-inset-md text-base text-fg font-sans h-control-md outline-none focus:outline-2 focus:outline-offset-2 focus:outline-ring";

type Locating = "idle" | "busy" | "denied" | "unavailable";

export function PlacePicker({ copy, cities, place, onChange }: PlacePickerProps) {
  const [locating, setLocating] = useState<Locating>("idle");
  const [editing, setEditing] = useState(false);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setLocating("unavailable");
      return;
    }
    setLocating("busy");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating("idle");
        setEditing(false);
        onChange({
          kind: "near",
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          radiusKm: place?.kind === "near" ? place.radiusKm : defaultRadiusKm,
        });
      },
      (error) => setLocating(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
      { maximumAge: 300_000, timeout: 15_000, enableHighAccuracy: false },
    );
  };

  const chooseCity = (slug: string) => {
    if (!slug) return;
    setEditing(false);
    onChange({ kind: "city", city: slug });
  };

  const current = place?.kind === "city" ? cities.find((c) => c.slug === place.city) : undefined;
  const showChooser = editing || place === null || (place.kind === "city" && current === undefined && cities.length > 0);

  return (
    <section aria-label={copy.label} className="flex flex-col gap-stack-md">
      {!showChooser && place !== null && (
        <div className="flex flex-wrap items-center justify-between gap-stack-md">
          <div className="flex flex-col">
            <Text variant="overline" tone="muted">
              {copy.label}
            </Text>
            <Text variant="subheading" as="span">
              {place.kind === "near" ? copy.nearYou : current ? `${current.name} · ${current.uf}` : place.city}
            </Text>
          </div>
          <div className="flex items-center gap-stack-sm">
            {place.kind === "near" && (
              <label className="flex items-center gap-stack-sm">
                <Text variant="label" as="span" tone="muted">
                  {copy.radius}
                </Text>
                <select
                  className={`${selectClasses} w-auto h-control-sm text-sm`}
                  value={String(clampRadius(place.radiusKm))}
                  onChange={(e) => onChange({ ...place, radiusKm: clampRadius(Number(e.target.value)) })}
                >
                  {radiusOptions.map((km) => (
                    <option key={km} value={km}>
                      {km} km
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              {copy.change}
            </Button>
          </div>
        </div>
      )}
      {showChooser && (
        <div className="flex flex-col gap-stack-md sm:flex-row sm:items-end">
          <label className="flex grow flex-col gap-stack-sm">
            <Text variant="label" as="span">
              {copy.label}
            </Text>
            <select
              className={selectClasses}
              value={place?.kind === "city" ? place.city : ""}
              onChange={(e) => chooseCity(e.target.value)}
            >
              <option value="">{copy.choose}</option>
              {cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name} · {city.uf} ({city.eventsUpcoming} {copy.cityCount})
                </option>
              ))}
            </select>
          </label>
          <Button variant="primary" onClick={locate} loading={locating === "busy"}>
            {locating === "busy" ? copy.locating : copy.nearMe}
          </Button>
        </div>
      )}
      {locating === "denied" && (
        <Text variant="body-sm" tone="warning" role="alert">
          {copy.denied}
        </Text>
      )}
      {locating === "unavailable" && (
        <Text variant="body-sm" tone="warning" role="alert">
          {copy.unavailable}
        </Text>
      )}
    </section>
  );
}
