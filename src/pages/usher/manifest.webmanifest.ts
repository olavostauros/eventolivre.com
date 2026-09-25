/* Web app manifest for the Usher PWA, built from tokens and copy so no
   colour or sentence is written twice. start_url, scope and id are /usher/
   (CYBERSECURITY.md §4). Icons follow decision 0004: a brand-colour square,
   no glyph, regenerated from public/favicon.svg. */
import type { APIRoute } from "astro";
import { palette } from "@evento-livre/design-system/src/tokens/colors.ts";
import { usherPtBR as copy } from "../../copy/usher.ts";

export const manifest = {
  id: "/usher/",
  name: copy.meta.appName,
  short_name: copy.meta.appName,
  description: copy.meta.description,
  lang: "pt-BR",
  start_url: "/usher/",
  scope: "/usher/",
  display: "standalone",
  orientation: "portrait",
  background_color: palette.neutral[50],
  theme_color: palette.brand[600],
  icons: [
    { src: "/usher/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/usher/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/usher/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
} as const;

export const GET: APIRoute = () =>
  new Response(JSON.stringify(manifest, null, 2), {
    headers: { "content-type": "application/manifest+json; charset=utf-8" },
  });
