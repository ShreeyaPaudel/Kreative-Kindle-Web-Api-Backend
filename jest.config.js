module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  testMatch: ["**/src/tests/**/*.test.ts"],

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/app.ts",
  ],

  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],

  moduleNameMapper: {
    "^uuid$": "<rootDir>/src/tests/mocks/uuid.js",
  },
};