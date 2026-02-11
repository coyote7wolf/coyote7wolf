# 🤖 Automated Release Guide

This project is configured with **semantic-release** and **standard-changelog** for automated versioning and CHANGELOG generation.

## How It Works

### Before (Manual)

```bash
# Manual steps needed
1. Update package.json version
2. Update CHANGELOG.md with changes
3. Commit and push
4. Create git tag v1.1.0
5. Create GitHub Release
```

### After (Automated)

```bash
# Just commit with proper message format
git commit -m "feat(auth): add OAuth Google support"
# → semantic-release automatically:
#   ✅ Analyzes commit messages
#   ✅ Determines version bump (PATCH/MINOR/MAJOR)
#   ✅ Updates package.json version
#   ✅ Generates CHANGELOG.md
#   ✅ Creates git tag v1.1.0
#   ✅ Creates GitHub Release
```

---

## Commit Message Format

**IMPORTANT**: Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type Mapping → Version Bump

| Commit Type       | Example                            | Version Bump              |
| ----------------- | ---------------------------------- | ------------------------- |
| `feat`            | `feat(auth): add OAuth`            | **MINOR** (1.0.0 → 1.1.0) |
| `fix`             | `fix(button): resolve click issue` | **PATCH** (1.0.0 → 1.0.1) |
| `BREAKING CHANGE` | `feat!: redesign API`              | **MAJOR** (1.0.0 → 2.0.0) |
| `chore`           | `chore: update deps`               | _(no release)_            |
| `docs`            | `docs: update README`              | _(no release)_            |

### Examples

```bash
# Will trigger MINOR release
git commit -m "feat(i18n): add Japanese language support"

# Will trigger PATCH release
git commit -m "fix(dashboard): resolve layout bug on mobile"

# Will trigger MAJOR release (breaking change)
git commit -m "feat(api)!: change authentication endpoint"

# Will NOT trigger release
git commit -m "chore: update dependencies"
```

---

## Usage

### 1. Test Dry Run (Recommended)

Before actual release, test what would happen:

```bash
npm run release:dry-run
```

**Output shows:**

```
✓ Analyzing commits with conventional-changelog
✓ Would release NEW version bumped from 1.0.0 to 1.1.0
✓ CHANGELOG.md would be generated
✓ v1.1.0 tag would be created
✓ GitHub Release would be published
```

### 2. Actual Release

```bash
npm run release
```

This will:

- ✅ Bump version in package.json
- ✅ Generate/update CHANGELOG.md
- ✅ Create git tag (e.g., v1.1.0)
- ✅ Create GitHub Release
- ✅ Push everything to GitHub (requires GitHub token)

### 3. Manual Changelog (Optional)

If you want to generate changelog manually:

```bash
npm run changelog
```

---

## Setup Requirements

### Environment Variable (for GitHub)

For full automation, provide GitHub token:

```bash
# Create .env.local
GITHUB_TOKEN=your_github_token_here

# Or set as environment variable
export GITHUB_TOKEN=your_github_token_here
```

### GitHub Actions Integration (Optional)

Add to `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Configuration Files

### .releaserc.json

Controls semantic-release behavior:

- Release branches (main, develop)
- Plugins used (changelog, npm, git, GitHub)
- Release rules

### .changelogrc.js

Controls changelog format:

- Preset: `angular` (Angular commit style)
- Custom templates (optional)

---

## Rollback if Needed

If something goes wrong:

```bash
# List git tags
git tag -l

# Remove local tag
git tag -d v1.1.0

# Remove remote tag
git push origin --delete v1.1.0

# Revert package.json
git revert HEAD
```

---

## Best Practices

### ✅ Do's

- [x] Always use conventional commit format
- [x] Run `npm run release:dry-run` first
- [x] Make sure CI/CD passes before release
- [x] Use descriptive commit messages
- [x] Keep CHANGELOG.md human-readable

### ❌ Don'ts

- [ ] Don't manually edit CHANGELOG version headers (let semantic-release do it)
- [ ] Don't run multiple releases simultaneously
- [ ] Don't force-push to main branch
- [ ] Don't mix with manual version bumps

---

## Troubleshooting

### Release not triggering?

Check:

1. Commit format: `feat(scope): message` (not `feat : message`)
2. Branch: must push to `main` or `develop`
3. No conflicting changes
4. GitHub token exists (if using)

### CHANGELOG not generated?

```bash
# Manually regenerate
npm run changelog
git add CHANGELOG.md
git commit -m "chore: update changelog"
```

### Wrong version bumped?

Check commit types in git log:

```bash
git log --oneline main~5..main
```

---

## Comparison: Manual vs Automated

### Manual Versioning ❌

```bash
# 5 manual steps
vi package.json                    # Edit version
vi CHANGELOG.md                    # Add changes
git add package.json CHANGELOG.md
git commit -m "chore: release 1.1.0"
git tag -a v1.1.0 -m "Release 1.1.0"
git push origin main --tags
# Create GitHub Release manually
```

### Automated Versioning ✅

```bash
# 1 command (semantic-release handles everything)
npm run release

# Or with CI/CD: push to main → automatic release
git commit -m "feat(auth): add OAuth"
git push origin main
# → GitHub Actions triggers npm run release automatically
```

---

## Learn More

- [Semantic Release Documentation](https://github.com/semantic-release/semantic-release)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Standard Changelog](https://github.com/conventional-changelog/standard-changelog)
- [Version Management Guide](./docs/guide/_version-management.md)
