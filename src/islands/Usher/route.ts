/* In-app navigation is the URL hash, so the back button and a shared link
   both work without a second page: `/usher/` is the list, `/usher/#/evento/48213`
   is one event. The id is an integer from the API; anything else is the list. */

export type Route = { readonly view: "list" } | { readonly view: "event"; readonly id: number };

export function parseRoute(hash: string): Route {
  const match = /^#\/evento\/(\d{1,12})\/?$/.exec(hash);
  if (!match) return { view: "list" };
  return { view: "event", id: Number.parseInt(match[1] ?? "0", 10) };
}

export function eventHref(id: number): string {
  return `#/evento/${Math.trunc(id)}`;
}

export const listHref = "#/";
