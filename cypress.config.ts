import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    video: false,
    screenshotOnRunFailure: true,
  },
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
    supportFile: "cypress/support/component.ts",
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
  },
});
