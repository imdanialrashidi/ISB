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
    sitemap({
      filter: (page) => {
        // /blog/ is intentionally kept out of the index until real articles
        // exist: the current post is demo content and the blog index is
        // noindexed (BaseLayout noIndex prop). Remove this entry when the
        // first real article is published.
        if (page.startsWith("https://isbatab.ir/blog/")) return false;
        return true;
      },
    }),
  ],

  adapter: cloudflare(),
});