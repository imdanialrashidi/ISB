import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "var(--color-bg)",
          primary: "var(--color-primary)",
          accent: "var(--color-accent)",
          text: "var(--color-text)",
          muted: "var(--color-muted)",
          border: "var(--color-border)",
          surface: "var(--color-surface)",
        },
      },
      fontFamily: {
        sans: ["Vazirmatn", "Vazir", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -18px rgba(12, 23, 40, 0.42)",
      },
    },
  },
  plugins: [],
};

export default config;
