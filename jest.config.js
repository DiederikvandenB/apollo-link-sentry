// https://jestjs.io/docs/configuration

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: false,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/**/*'],

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // Use this configuration option to add custom reporters to Jest
  reporters: ['jest-spec-reporter'],

  // A list of paths to modules that run some code to configure or set up the testing environment
  setupFiles: ['./tests/setup.ts'],

  // A map from regular expressions to paths to transformers
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
};
