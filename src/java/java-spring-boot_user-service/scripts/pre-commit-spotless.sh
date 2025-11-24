#!/usr/bin/env bash
# Git pre-commit hook to run Spotless and prevent commit if formatting or license issues exist.
# Install: cp scripts/pre-commit-spotless.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -euo pipefail

echo "[pre-commit] Running Spotless check..."
./mvnw -q spotless:apply > /dev/null 2>&1 || {
  echo "[pre-commit] Spotless apply failed." >&2
  exit 1
}

# Re-stage changed files after formatting
if ! git diff --cached --quiet; then
  echo "[pre-commit] Re-staging formatted files..."
  git add .
fi

echo "[pre-commit] Spotless formatting applied successfully."
