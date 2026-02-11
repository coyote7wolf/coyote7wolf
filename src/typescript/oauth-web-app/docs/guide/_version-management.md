# 📌 Version Management & Release Strategy

## Version Structure

This project uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

### Example Versions

- `1.0.0` - Initial release
- `1.1.0` - New features added
- `1.1.1` - Bug fixes
- `2.0.0` - Breaking changes

---

## Where Versions Are Defined

### 1. **package.json** (Source of Truth)

Current version is defined in `package.json`:

```json
{
  "name": "react-web-app-template",
  "version": "1.0.0"
}
```

### 2. **CHANGELOG.md** (Release History)

Records all versions, release dates, and changes:

```markdown
## [1.0.0] - 2026-02-09

### Added

- Feature 1
- Feature 2

### Fixed

- Bug fix 1
```

### 3. **Git Tags** (Version Markers)

Git tags mark specific commits as releases:

```bash
v1.0.0  # Points to the 1.0.0 release commit
v1.1.0  # Points to the 1.1.0 release commit
```

---

## Release Process

### Step 1: Plan Release

Before starting, decide:

- Is this a MAJOR, MINOR, or PATCH release?
- What changes are included?
- When is the release date?

### Step 2: Update Version

```bash
# Update package.json
# Change version from 1.0.0 to 1.1.0 (for example)

npm version minor  # Automatically updates package.json and creates a tag
# or manually edit package.json
```

### Step 3: Update CHANGELOG.md

```markdown
## [Unreleased]

### Planned

- ...

---

## [1.1.0] - 2026-02-15 ← Add today's date in YYYY-MM-DD format

### Added

- ✨ New feature description

### Fixed

- 🐛 Bug fix description

### Changed

- 🔄 Behavior change description
```

### Step 4: Commit Changes

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): bump version to 1.1.0"
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main --tags
```

### Step 5: Create Release on GitHub

Manually create a GitHub Release:

1. Go to Releases page
2. Click "Create a new release"
3. Select tag: `v1.1.0`
4. Title: `v1.1.0` or descriptive title
5. Description: Copy from CHANGELOG.md
6. Publish release

---

## Version Numbering Rules

### MAJOR (X.0.0)

Increment when:

- Breaking changes to API
- Significant architectural changes
- Incompatible with previous version

**Example**: 1.0.0 → 2.0.0

### MINOR (1.X.0)

Increment when:

- New features added
- Backward compatible
- No breaking changes

**Example**: 1.0.0 → 1.1.0

### PATCH (1.0.X)

Increment when:

- Bug fixes only
- No new features
- Backward compatible

**Example**: 1.0.0 → 1.0.1

---

## Release Schedule

### Release Types

| Type      | Frequency | Example                         |
| --------- | --------- | ------------------------------- |
| **PATCH** | Weekly    | Bug fixes, security patches     |
| **MINOR** | Monthly   | New features, improvements      |
| **MAJOR** | Quarterly | Major updates, breaking changes |

### Current Version

**Current**: `1.0.0` (Released: 2026-02-09)

### Next Planned

- **1.1.0** - [Feature features here]
- **1.2.0** - [More features]
- **2.0.0** - [Major redesign] (Q3 2026)

---

## CHANGELOG Format

### Sections Used

```markdown
## [1.1.0] - 2026-02-15

### Added

- ✨ New features

### Changed

- 🔄 Behavior changes

### Fixed

- 🐛 Bug fixes

### Removed

- ❌ Removed features

### Deprecated

- ⚠️ Deprecated features (will be removed next major)

### Security

- 🔐 Security fixes
```

### Writing Good Changelog Entries

✅ **Good**:

```markdown
- Fixed login button not responding on mobile devices
- Added support for Arabic language in RTL mode
- Improved performance by 30% on dashboard component
```

❌ **Bad**:

```markdown
- Fixed stuff
- Updated code
- Improved things
```

---

## Version Queries

### Check Current Version

```bash
# From package.json
cat package.json | grep version

# From npm
npm list | head -1

# Git tag
git describe --tags --abbrev=0
```

### List All Versions

```bash
git tag -l

# output:
# v1.0.0
# v1.1.0
# v1.2.0
```

### View Release History

- Check `CHANGELOG.md` for detailed history
- GitHub Releases tab for official releases
- Git log for commit history: `git log --oneline`

---

## Automation Options

### **Recommended: Automated Version Bumping with semantic-release**

This project is configured with **semantic-release** for:

- Automatically determine version bump based on commits
- Update CHANGELOG.md and package.json
- Create git tags
- Publish releases automatically

See [Automated Release Guide](./_automated-release.md) for:

- How to use semantic-release
- Commit message format (REQUIRED)
- Dry-run testing
- Full automation workflow

**This is the recommended and professional way to manage versions.**

---

## Best Practices

### ✅ Do's

- [x] Keep CHANGELOG.md updated with every release
- [x] Use semantic versioning correctly
- [x] Create git tags for releases
- [x] Include release date in CHANGELOG
- [x] Document breaking changes clearly
- [x] Update package.json before release
- [x] Create GitHub Release notes

### ❌ Don'ts

- [ ] Skip CHANGELOG updates
- [ ] Use non-standard version numbers
- [ ] Release without git tags
- [ ] Forget to document breaking changes
- [ ] Change version without updating CHANGELOG
- [ ] Skip GitHub Releases

---

## Current Release History

| Version | Release Date | Status      |
| ------- | ------------ | ----------- |
| 1.0.0   | 2026-02-09   | ✅ Released |

---

## Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
