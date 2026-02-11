#!/usr/bin/env node

/**
 * Update version in README.md
 * Used by semantic-release npm plugin's prepare step
 */

const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "../package.json");
const readmePath = path.join(__dirname, "../README.md");

try {
  // Read current version from package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const version = packageJson.version;

  // Read README
  let readme = fs.readFileSync(readmePath, "utf-8");

  // Update version in README (match "Current Version: X.X.X")
  readme = readme.replace(
    /Current Version: \d+\.\d+\.\d+/,
    `Current Version: ${version}`,
  );

  // Write updated README
  fs.writeFileSync(readmePath, readme, "utf-8");

  console.log(`✅ Updated README.md version to ${version}`);
} catch (error) {
  console.error("❌ Error updating version:", error.message);
  process.exit(1);
}
