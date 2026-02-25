import astro from "eslint-plugin-astro";

export default [
  {
    ignores: ["dist", ".astro", "node_modules"],
  },
  ...astro.configs["flat/recommended"],
  ...astro.configs["flat/jsx-a11y-recommended"],
];
