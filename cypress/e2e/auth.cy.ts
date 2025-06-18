describe("Authentication", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display login form", () => {
    cy.get('[data-test="login-form"]').should("exist");
    cy.get('[data-test="email-input"]').should("exist");
    cy.get('[data-test="password-input"]').should("exist");
    cy.get('[data-test="login-button"]').should("exist");
  });

  it("should show error with invalid credentials", () => {
    cy.get('[data-test="email-input"]').type("invalid@email.com");
    cy.get('[data-test="password-input"]').type("wrongpassword");
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="error-message"]').should("be.visible");
  });

  it("should successfully log in with valid credentials", () => {
    cy.get('[data-test="email-input"]').type(Cypress.env("TEST_USER_EMAIL"));
    cy.get('[data-test="password-input"]').type(
      Cypress.env("TEST_USER_PASSWORD"),
    );
    cy.get('[data-test="login-button"]').click();
    cy.url().should("include", "/dashboard");
  });
});
