module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ['<rootDir>/src/tests'],

  testMatch: ["**/tests/**/*.test.ts"],

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/app.ts",
    "!src/__tests__/**",
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
moduleNameMapper: {
  "^uuid$": "<rootDir>/src/tests/mocks/uuid.js",
},

};
