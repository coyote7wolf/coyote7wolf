module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*.spec.ts$|.*.test.ts$",
  // Exclude smoke tests from default "pnpm test" run; they have heavy integration setup.
  // Smoke tests can still be executed via dedicated scripts (test:smoke* in package.json).
  testPathIgnorePatterns: [
    "/device-smoke.test.ts$",
    "/role-smoke.test.ts$",
    "/smoke.test.ts$",
    "/.*-smoke.test.ts$",
  ],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  // Ignore non-source or auxiliary files from coverage to keep metrics meaningful.
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/",
    "/__mocks__/",
    "\\.mock\\.ts$",
    "/device-smoke.test.ts$",
    "/role-smoke.test.ts$",
    "/smoke.test.ts$",
    "/.*-smoke.test.ts$",
    // Ignore bootstrap and pure module wiring files
    "main\\.ts",
    "app\\.module\\.ts",
    // Ignore thin prisma wiring (no business logic). Remove if logic added later.
    "prisma\\.module\\.ts",
    "prisma\\.service\\.ts",
  ],
  // Enforce minimum coverage to prevent regression; tune upward over time.
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    // Optionally stricter target for user domain logic
    // 'modules/user': { statements: 75, branches: 60, functions: 72, lines: 78 },
  },
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};
