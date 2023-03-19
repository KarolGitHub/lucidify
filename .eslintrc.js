/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */

module.exports = {
  ignorePatterns: ["node_modules", "dist", "**/*.d.ts"],
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/essential",
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended",
    "prettier",
  ],
  plugins: ["tailwindcss", "prettier"],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 2018,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": "off",
    "max-len": "off",
    "no-shadow": "off",
    "prettier/prettier": [
      "off",
      { singleQuote: true, endOfLine: "auto", trailingComma: "all" },
    ],
    "tailwindcss/no-contradicting-classname": "error",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "vue/multi-word-component-names": "off",
    "vue/no-reserved-component-names": "off",
    "vue/first-attribute-linebreak": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
      ],
      env: {
        mocha: true,
      },
    },
  ],
};
