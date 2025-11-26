module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/**/*.d.ts"],
  testMatch: ["<rootDir>/test/**/*.spec.ts", "<rootDir>/test/**/*.test.ts"],
};
