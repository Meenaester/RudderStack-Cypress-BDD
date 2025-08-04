@authenticated
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
