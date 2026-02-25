// @ts-check
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://isbatab.ir",

  build: {
    inlineStylesheets: "always",
  },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],

  adapter: cloudflare(),
});