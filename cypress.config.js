const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const allureWriter = require("@shelex/cypress-allure-plugin/writer");
dotenv.config({ path: `.env.${process.env.ENV || 'dev'}` });

module.exports = defineConfig({
  //  reporterOptions: {
  //   reporterEnabled: 'cucumber',
  //   ReporterOptions: {
  //     jsonFile: 'cucumber-json',
  //     output: 'cypress/report/cucumber_report.html',
  //     screenshotsFolder: 'cypress/screenshot',
  //     video: false,
  //     overwrite: false,
  //     html: true,
  //     json: true,
  //   },
  // },
  e2e: {
     baseUrl: process.env.RUDDER_BASE_URL,
    setupNodeEvents(on, config) {
      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );
       preprocessor.addCucumberPreprocessorPlugin(on, config);

      allureWriter(on, config); // ✅ writes results to allure-results

      return config;
    },
    specPattern: "**/*.feature",

    pageLoadTimeout: 60000,
    defaultCommandTimeout: 30000,
   cucumber: {
      json: {
        enabled: true,
        output: "cypress/cucumber-json"
      }
    },
    env: {
      RUDDER_EMAIL: process.env.RUDDER_EMAIL,
      RUDDER_PASSWORD: process.env.RUDDER_PASSWORD,
      DATA_PLANE_URL: process.env.DATA_PLANE_URL,
      WRITE_KEY: process.env.WRITE_KEY,
      WEBHOOK_URL: process.env.WEBHOOK_URL,
      
    }
  },
});
