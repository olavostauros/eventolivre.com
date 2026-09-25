/* Search, free-only and categories. Chips are buttons with `aria-pressed`,
   so the state is announced and the accent is never the only signal. */

import type { Category } from "./api.ts";
import { Button, Input, Text } from "../dsx.ts";
import type { UsherCopy } from "../../copy/usher.ts";

export interface FilterState {
  readonly q: string;
  readonly free: boolean;
  readonly categories: readonly string[];
}

export const emptyFilters: FilterState = { q: "", free: false, categories: [] };

export interface FiltersProps {
  readonly copy: UsherCopy["filters"];
  readonly categories: readonly Category[];
  readonly value: FilterState;
  readonly onChange: (value: FilterState) => void;
}

function chipClasses(active: boolean): string {
  return active ? "border-accent-500 bg-accent-500/15 text-fg" : "border-border-strong bg-surface text-fg-muted";
}

export function Filters({ copy, categories, value, onChange }: FiltersProps) {
  const toggleCategory = (slug: string) => {
    const has = value.categories.includes(slug);
    const next = has ? value.categories.filter((s) => s !== slug) : [...value.categories, slug].slice(-10);
    onChange({ ...value, categories: next });
  };
  const dirty = value.q !== "" || value.free || value.categories.length > 0;

  return (
    <section aria-label={copy.search} className="flex flex-col gap-stack-md">
      <div className="flex flex-col gap-stack-sm sm:flex-row sm:items-center">
        <label className="grow">
          <span className="sr-only">{copy.search}</span>
          <Input
            type="search"
            placeholder={copy.searchPlaceholder}
            value={value.q}
            maxLength={100}
            autoComplete="off"
            onChange={(e) => onChange({ ...value, q: e.target.value })}
          />
        </label>
        <div className="flex items-center gap-stack-sm">
          <Button
            variant={value.free ? "primary" : "secondary"}
            size="md"
            aria-pressed={value.free}
            onClick={() => onChange({ ...value, free: !value.free })}
          >
            {copy.free}
          </Button>
          {dirty && (
            <Button variant="ghost" size="md" onClick={() => onChange(emptyFilters)}>
              {copy.clear}
            </Button>
          )}
        </div>
      </div>
      {categories.length > 0 && (
        <div className="flex flex-col gap-stack-sm">
          <Text variant="overline" tone="muted">
            {copy.categories}
          </Text>
          <ul className="flex flex-wrap gap-stack-sm" role="list">
            <li>
              <button
                type="button"
                aria-pressed={value.categories.length === 0}
                className={`h-control-sm rounded-full border px-inset-md type-label transition duration-fast ease-standard outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${chipClasses(value.categories.length === 0)}`}
                onClick={() => onChange({ ...value, categories: [] })}
              >
                {copy.allCategories}
              </button>
            </li>
            {categories.map((category) => {
              const active = value.categories.includes(category.slug);
              return (
                <li key={category.slug}>
                  <button
                    type="button"
                    aria-pressed={active}
                    className={`h-control-sm rounded-full border px-inset-md type-label transition duration-fast ease-standard outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${chipClasses(active)}`}
                    onClick={() => toggleCategory(category.slug)}
                  >
                    {category.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
