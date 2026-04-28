/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config & { braceStyle: string }}
 */
const config = {
  trailingComma: "all",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  printWidth: 120,
  plugins: ["prettier-plugin-brace-style"],
  braceStyle: "stroustrup",
};

export default config;
