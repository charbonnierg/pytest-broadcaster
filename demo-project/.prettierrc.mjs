// .prettierrc.mjs
/** @type {import("prettier").Config} */
export default {
  importOrder: [
    "^@layouts/(.*)$",
    "^@styles/(.*)$",
    "^@components/(.*)$",
    "^@lib/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  printWidth: 89,
  tabWidth: 2,
  trailingComma: "all",
  singleQuote: false,
  semi: false,
  plugins: ["prettier-plugin-astro", "@trivago/prettier-plugin-sort-imports"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
}
