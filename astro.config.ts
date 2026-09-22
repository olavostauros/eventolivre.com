import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

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
  vite: {
    plugins: [tailwindcss()],
  },
});
