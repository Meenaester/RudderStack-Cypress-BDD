const reporter = require('cucumber-html-reporter')
const fs = require('fs');

const options = {
  theme: 'bootstrap',
  jsonDir: './cypress/cucumber-json',
  output: 'cypress/report/cucumber_report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  chart: true,
  video: false,
  metadata: {
    "Test Environment": "STAGING",
    "Browser": "Chrome  109.0.2840.98",
    "Platform": "Windows 11",
    "Parallel": "Scenarios",
    "Executed": "Remote",
    "Author": "Meena Selvaraj"
  }
};

reporter.generate(options);
