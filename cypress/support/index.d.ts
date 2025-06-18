/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login with test credentials
     * @example cy.login()
     */
    login(): Chainable<void>;
  }
}
