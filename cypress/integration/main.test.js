beforeEach(() => {
  cy.exec('cd api && NODE_ENV="test" npm run seed');
});

describe("Sign up", () => {
  it("Sign Up", () => {
    cy.visit("/");
    cy.contains("Academe");
    cy.contains("I want to get tutored").click();
    cy.url().should("include", "/signup");
    cy.contains("Sign in with email").click();

    cy.get("#name").type("John Smith").should("have.value", "John Smith");
    cy.get("#email").type("johnsmith@example.com");
    cy.get("#password").type("Password123");
    cy.get("[data-test=basic-info-next]").click();

    cy.get("#yearGroup").select("Year 12").should("have.value", "12");
    cy.get("#school").select("Christ's College");
    cy.get("[data-test=academic] .tagify__input").focus().type("Geo");
    cy.contains("Geography").click();
    cy.get("[data-test=extras] .tagify__input").focus().type("Music{enter}");

    cy.get("[data-test=additional-info-next]").click();

    cy.get("#biography").type(
      "Education is the most important thing in the universe"
    );
    cy.get("#grades").type("https://google.com");
    cy.get("[data-test=verification-next]").click();

    cy.get("#agreement").click();
    cy.contains("Submit").click();

    cy.url().should("include", "/confirm");
  });
});
