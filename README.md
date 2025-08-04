# RudderStack Event Flow Automation (Cypress + Cucumber BDD)

[![Cypress Tests](https://github.com/Meenaester/RudderStack-Cypress-BDD/actions/workflows/cypress.yml/badge.svg)](https://github.com/Meenaester/RudderStack-Cypress-BDD/actions/workflows/cypress.yml)

This repository provides an automated solution to validate **end-to-end event delivery** in RudderStack.  
It uses **Cypress v12 with Cucumber BDD** to combine UI and API flows, ensuring that events created via HTTP Sources are successfully delivered to Webhook Destinations.  
The framework also generates **professional HTML reports** and runs on **GitHub Actions (daily)** to simulate production‑like CI/CD.

---

## 📑 Table of Contents
- [Overview](#overview)
- [Manual Workspace Setup](#manual-workspace-setup)
- [Automation Setup](#automation-setup)
- [Feature File](#feature-file)
- [Step Definitions](#step-definitions)
- [Cypress Config](#cypress-config)
- [API Endpoints](#api-endpoints)
- [Troubleshooting & Challenges](#troubleshooting--challenges)
- [CI/CD Workflow](#cicd-workflow)
- [Validation Guide](#validation-guide)
- [Screenshots](#screenshots)
- [Contribution](#contribution)
- [License](#license)
- [Contact](#contact)

---

## 🔎 Overview
The automation covers the **full RudderStack event lifecycle**:

1. **Login** to the RudderStack Dashboard  
2. **Create** and configure an HTTP Source  
3. **Send** a track event using RudderStack API  
4. **Validate** delivery of the event in a Webhook Destination  
5. **Generate** HTML & JSON reports for review  

**Tech Stack**:
- Cypress v12  
- Cucumber BDD Preprocessor  
- ESBuild for fast bundling  
- dotenv for environment configs  
- GitHub Actions for CI/CD  

---

## 🧑‍💻 Manual Workspace Setup

1. **Create RudderStack Account**  
   - Sign up at [RudderStack Cloud](https://app.rudderstack.com)  
   - Use a business/temp email (not Gmail)  
   - Choose Rudder Cloud option  

2. **Create an HTTP Source**  
   - Go to **Connections → Sources → Add Source**  
   - Select **HTTP**, name it (e.g., `Cypress-HTTP-Source`)  
   - Copy the **Write Key**  

3. **Create a Webhook Destination**  
   - Go to **Connections → Destinations → Add Destination**  
   - Select **Webhook**  
   - Use [RequestCatcher](https://requestcatcher.com) for the webhook URL  
   - Save the destination  

4. **Gather Credentials**  
   - Data Plane URL  
   - Write Key  
   - Webhook URL  

---

## ⚙️ Automation Setup

### Project Structure
CyBDD-master/
├── cypress/
│ ├── e2e/
│ │ └── Rudderstack.feature
│ ├── support/
│ │ └── step_definitions/
│ │ └── rudderstackSteps.js
│ ├── cucumber-json/
│ └── report/
├── docs/screenshots/
├── .env.dev
├── cypress.config.js
├── generate-cucumber-report.js
├── package.json
└── README.md

perl
Copy
Edit

### Install Dependencies
```bash
npm install
Configure Environment
Create .env.dev:

env
Copy
Edit
RUDDER_EMAIL=your_email@domain.com
RUDDER_PASSWORD=your_password
RUDDER_BASE_URL=https://app.rudderstack.com
DATA_PLANE_URL=https://<your-dataplane>
WRITE_KEY=your_write_key
WEBHOOK_URL=https://<requestcatcher>.requestcatcher.com/test
📜 Feature File
cypress/e2e/Rudderstack.feature

gherkin
Copy
Edit
Feature: RudderStack Event Flow Automation

  Background:
    Given the user is logged in to the RudderStack dashboard

  Scenario: Send an event to HTTP source and verify delivery in Webhook
    When the user navigates to the "Connections" page
    And the user extracts and stores the Data Plane URL from the top-right corner
    And the user copies the writeKey from the created HTTP source
    When the user sends a test event using the stored writeKey and Data Plane URL via API
    When the user navigates to the Webhook destination page
    Then the user verifies the count of delivered and failed events under the Events tab
🔧 Step Definitions
cypress/support/step_definitions/rudderstackSteps.js

javascript
Copy
Edit
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";


Given("the user is logged in to the RudderStack dashboard", () => {
  cy.visit("/");
  cy.get("#text-input-email").type(Cypress.env("RUDDER_EMAIL"));
  cy.get("#text-input-password").type(Cypress.env("RUDDER_PASSWORD"));
  cy.get('.ant-btn-primary').click();
  cy.contains("I'll do this later").click({ force: true });
  cy.contains("Go to dashboard").click();
});

When("the user navigates to the {string} page", (menuItem) => {
  cy.contains(menuItem).click();
});

When("the user extracts and stores the Data Plane URL from the top-right corner", () => {
  cy.get('span.text-ellipsis').invoke('text').then((url) => {
    expect(url.trim()).to.include("https");
  });
});

When("the user copies the writeKey from the created HTTP source", () => {
  cy.contains("Write key").first().then($el => {
    writeKey = $el.text().trim();
    expect(writeKey).to.not.be.empty;
  });
});

When("the user sends a test event using the stored writeKey and Data Plane URL via API", () => {
  const eventPayload = {
    userId: "cypress-test-user",
    event: "Test Event From Cypress",
    properties: { source: "cypress", time: new Date().toISOString() }
  };
  const encodedKey = btoa(`${writeKey}:`);

  cy.request({
    method: "POST",
    url: `${Cypress.env("DATA_PLANE_URL")}/v1/track`,
    headers: { "Content-Type": "application/json", "Authorization": `Basic ${encodedKey}` },
    body: eventPayload
  }).its("status").should("eq", 200);
});

Then("the user verifies the count of delivered and failed events under the Events tab", () => {
  cy.contains("Events").click();
  cy.contains("Delivered").next().invoke("text").then((text) => {
    expect(parseInt(text.trim(), 10)).to.be.greaterThan(0);
  });
});
⚙️ Cypress Config
cypress.config.js

javascript
Copy
Edit
const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const dotenv = require("dotenv");

dotenv.config({ path: `.env.${process.env.ENV || 'dev'}` });

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  e2e: {
    baseUrl: process.env.RUDDER_BASE_URL,
    setupNodeEvents(on, config) {
      on("file:preprocessor", createBundler({
        plugins: [createEsbuildPlugin.default(config)],
      }));
      preprocessor.addCucumberPreprocessorPlugin(on, config);
      return config;
    },
    specPattern: "**/*.feature",
    pageLoadTimeout: 60000,
    defaultCommandTimeout: 30000,
    env: process.env
  },
});
📡 API Endpoints
Track Event
POST {DATA_PLANE_URL}/v1/track

Headers:

http
Copy
Edit
Content-Type: application/json
Authorization: Basic <base64(writeKey:)>
Payload:

json
Copy
Edit
{
  "userId": "cypress-test-user",
  "event": "Test Event From Cypress",
  "properties": {
    "source": "cypress",
    "time": "2025-08-03T12:34:56.000Z"
  }
}
🐞 Troubleshooting & Challenges
1. Authentication Errors
Issue: 401 Unauthorized when sending events.

Fix: Ensure WriteKey is Base64‑encoded for Basic Auth.

2. Invalid API Requests
Issue: 400 Bad Request due to malformed payload.

Fix: Match RudderStack Track API schema and set Content-Type: application/json.

3. Pop-ups Blocking Login
Issue: Onboarding modals (e.g., “I’ll do this later”).

Fix: Add conditional Cypress clicks to skip pop-ups.

4. Event Delivery Delays
Issue: Events don’t appear immediately in the Webhook destination.

Fix: Add a short wait or polling before validation.

5. GitHub Actions Secrets
Issue: Tests fail in CI due to missing environment variables.

Fix: Store all credentials in GitHub Secrets and reference them in the workflow.

🔄 CI/CD Workflow
.github/workflows/cypress.yml

yaml
Copy
Edit
name: Cypress Tests

on:
  schedule:
    - cron: "0 2 * * *" # daily at 2AM UTC
  workflow_dispatch:

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run cypress:run:dev
        env:
          RUDDER_EMAIL: ${{ secrets.RUDDER_EMAIL }}
          RUDDER_PASSWORD: ${{ secrets.RUDDER_PASSWORD }}
          RUDDER_BASE_URL: ${{ secrets.RUDDER_BASE_URL }}
          DATA_PLANE_URL: ${{ secrets.DATA_PLANE_URL }}
          WRITE_KEY: ${{ secrets.WRITE_KEY }}
          WEBHOOK_URL: ${{ secrets.WEBHOOK_URL }}
✅ Validation Guide
Clone repo & install:

bash
Copy
Edit
git clone https://github.com/Meenaester/CyBDD-master.git
cd CyBDD-master
npm install
Configure .env.dev with valid RudderStack creds

Run tests:

bash
Copy
Edit
npm run cypress:run:dev
Verify:

Delivered events > 0

Failed events ≥ 0

HTML report generated

🖼 Screenshots
(Located in /docs/screenshots/)

HTTP Source Setup

Webhook Destination

Cypress Test Run

HTML Report

🤝 Contribution
Fork repo → create feature branch → submit PR

Follow BDD (Gherkin) format

Ensure Cypress tests pass locally



📬 Contact
Pandimeena Selvaraj
GitHub: Meenaester
