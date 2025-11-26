module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/**/*.d.ts"],
  testMatch: ["<rootDir>/test/**/*.spec.ts", "<rootDir>/test/**/*.test.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/test/elasticsearch.integration.spec.ts",
    "<rootDir>/test/elasticsearch.benchmark.ts",
  ],
  testTimeout: 10000,
};
