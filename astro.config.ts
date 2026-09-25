import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  site: "https://eventolivre.com",
  output: "static",
  trailingSlash: "always",
  integrations: [react()],
  i18n: {
    defaultLocale: "pt-BR",
    locales: ["pt-BR", "en"],
    routing: { prefixDefaultLocale: false },
  },
  env: {
    /* The only configuration the Usher PWA carries (CYBERSECURITY.md §4).
       Unset means the PWA is not open: /usher/ builds as a holding page with
       no client bundle, no manifest and no service worker (decision 0006).
       Set it only to the public URL the owner announces, never to a
       development address. An empty value counts as unset (GitHub Actions
       passes an unset repository variable as ""), so the URL check is in
       src/pages/usher/index.astro, not here. */
    schema: {
      PUBLIC_USHER_API_URL: envField.string({ context: "client", access: "public", optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
