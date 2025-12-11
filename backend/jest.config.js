export default {
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};
