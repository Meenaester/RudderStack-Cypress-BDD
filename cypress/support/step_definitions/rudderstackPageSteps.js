import { Given, When, Then} from"@badeball/cypress-cucumber-preprocessor"; 
Given("the user is logged in to the RudderStack dashboard", () => {
  cy.visit("/");
  cy.get("#text-input-email").type(Cypress.env("RUDDER_EMAIL"));
  cy.get("#text-input-password").type(Cypress.env("RUDDER_PASSWORD"));
  cy.get('.ant-btn-primary').click();
cy.contains("I'll do this later")
      .should('be.visible')
      .click({ force: true });

    cy.url().should("include", "/addmfalater");

    cy.contains("Go to dashboard")
      .should('be.visible')
      .click();
cy.get('.react-joyride__overlay').then(($overlay) => {
  if ($overlay.is(':visible')) {
    cy.get('.react-joyride__overlay').click({ force: true });
  }

    cy.contains('Organization').should('exist');
    // cy.contains('yopmail-zoteiwexazo-6127').should('exist');
    cy.contains('Workspace').should('exist');
    cy.contains('Production').should('exist');
  });
})
When("the user navigates to the {string} page", (menuItem) => {
  cy.contains(menuItem).click();
});

When("the user extracts and stores the Data Plane URL from the top-right corner", () => { 
  cy.get('span.text-ellipsis')
    .should('be.visible')
    .invoke('text')
    .then((dataPlaneURL) => {
      dataPlaneURL = dataPlaneURL.trim();
      expect(dataPlaneURL).to.include("https");
    });
});


When ("the user copies the writeKey from the created HTTP source", () => { 
  cy.contains("Write key").first().then($el => {
    writeKey = $el.text().trim();
    expect(writeKey).to.not.be.empty;
  });
});

When("the user sends a test event using the stored writeKey and Data Plane URL via API", () => {
  const dataPlaneURL = Cypress.env("DATA_PLANE_URL");
  const writeKey = Cypress.env("WRITE_KEY");

  const eventPayload = {
    userId: "cypress-test-user",
    event: "Test Event From Cypress",
    properties: {
      source: "cypress",
      time: new Date().toISOString()
    }
  };

  const encodedKey = btoa(`${writeKey}:`);

  cy.request({
    method: "POST",
    url: `${dataPlaneURL.replace(/\/$/, "")}/v1/track`,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${encodedKey}`
    },
    body: eventPayload
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

When("the user navigates to the Webhook destination page", () => {
  cy.contains("Destinations")
    .should("be.visible")
    .click();

  cy.contains("Webhook-RequestCatcher")
    .should("be.visible")
    .click();
})

Then("the user verifies the count of delivered and failed events under the Events tab", () => {
  cy.contains("Events").click();

  cy.contains("Delivered")
    .should("be.visible")
    .next()
    .invoke("text")
    .then((text) => {
      const delivered = parseInt(text.trim(), 10);
      cy.log(`Delivered events: ${delivered}`);
      expect(delivered).to.not.be.NaN;
      expect(delivered).to.be.greaterThan(0);
    });

  cy.contains("Failed")
    .should("be.visible")
    .next()
    .invoke("text")
    .then((text) => {
      const failed = parseInt(text.trim(), 10);
      cy.log(`Failed events: ${failed}`);
      expect(failed).to.not.be.NaN;
      expect(failed).to.be.at.least(0);
    });
});
