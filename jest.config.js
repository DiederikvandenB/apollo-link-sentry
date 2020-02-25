// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // All imported modules in your tests should be mocked automatically
  // automock: false,

  // Automatically clear mock calls and instances between every test
  clearMocks: false,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'tests/coverage',

  // An array of regexp pattern strings used to skip coverage collection
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // An array of regexp pattern strings used to skip coverage collection
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // A list of reporter names that Jest uses when writing coverage reports
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],

  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: undefined,

  // Automatically reset mock state between every test
  // resetMocks: false,

  // Automatically restore mock state between every test
  // restoreMocks: false,

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // Use this configuration option to add custom reporters to Jest
  reporters: ['jest-spec-reporter'],

  // The root directory that Jest should scan for tests and modules within
  // rootDir: './tests',

  // Adds a location field to test results
  // testLocationInResults: false,

  // The glob patterns Jest uses to detect test files
  // testMatch: [
  //   "**/__tests__/**/*.[jt]s?(x)",
  //   "**/?(*.)+(spec|test).[tj]s?(x)"
  // ],

  // A map from regular expressions to paths to transformers
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
};
