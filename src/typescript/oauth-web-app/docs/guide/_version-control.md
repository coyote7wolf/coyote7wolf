# 📌 Version Control & Git Workflow

## 🔄 Git Workflow

This project follows a feature branch workflow with semantic versioning.

### Branch Naming Convention

```
feature/description          # New features
fix/description              # Bug fixes
docs/description             # Documentation updates
refactor/description         # Code refactoring
perf/description             # Performance improvements
test/description             # Test additions
chore/description            # Project maintenance
```

**Example:**

```bash
git checkout -b feature/oauth-google-integration
git checkout -b fix/dashboard-layout-issue
git checkout -b docs/add-i18n-guide
```

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, dependencies, etc.

**Examples:**

```bash
git commit -m "feat(auth): add Google OAuth integration"
git commit -m "fix(i18n): resolve missing Arabic translations"
git commit -m "docs(api): update endpoint documentation"
git commit -m "perf(dashboard): optimize component rendering"
```

## 🔃 Pull Request Process

### Before Creating a PR

1. Create a feature branch from `main` or `develop`
2. Implement your changes
3. Add or update tests
4. Update documentation if needed
5. Run checks locally:
   ```bash
   npm run type-check    # TypeScript check
   npm run lint          # ESLint check
   npm run build         # Build check
   npm test              # Run tests
   ```

### Creating a Pull Request

1. Push your branch to GitHub
2. Create a PR from your branch to `main` or `develop`
3. Fill in the PR template completely
4. Request review from maintainers
5. Address all feedback from reviewers
6. Ensure all CI checks pass

### PR Guidelines

- Keep PRs focused and reasonably sized
- Link related issues in the PR description
- Provide clear context for changes
- Include screenshots for UI changes
- Update CHANGELOG.md for notable changes

## 📊 Version Management

### Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH (e.g., 1.2.3)
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Process

1. Update `package.json` version
2. Update `CHANGELOG.md` with all changes
3. Create a git tag: `git tag v1.2.3`
4. Push tag to remote: `git push origin v1.2.3`
5. GitHub Actions automatically creates a release

## 🔍 Code Review Standards

### What Reviewers Check

- ✅ Code quality and style consistency
- ✅ Test coverage and passing tests
- ✅ Documentation updates
- ✅ No performance regressions
- ✅ TypeScript type safety
- ✅ Accessibility best practices

### Review Checklist

Before approving a PR:

- [ ] Code follows project style guide
- [ ] Tests are added/updated with good coverage
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] All CI checks pass
- [ ] Commits follow conventional format

## 🔐 Protected Branches

### Main Branch (`main`)

- Stable, production-ready code
- All PRs require review approval
- All CI checks must pass
- Deployable at any time

### Develop Branch (`develop`)

- Latest development changes
- All PRs require review approval
- All CI checks must pass
- Testing ground for new features

## 📝 CHANGELOG Management

CHANGELOG.md is **automatically generated** by semantic-release.

**Do not manually edit CHANGELOG.md** - it's updated automatically when you release.

See [Version Management](./docs/guide/_version-management.md) for release process.

## 📌 Version Management

See [Version Management Guide](./_version-management.md) for:

- How to release new versions
- Semantic versioning rules
- Release process with semantic-release
- CHANGELOG format

## 🛠️ Common Git Commands

```bash
# Sync with remote
git fetch origin
git pull origin main

# Create and switch to feature branch
git checkout -b feature/description

# Stage changes
git add .

# Commit with message
git commit -m "feat(scope): description"

# Push to remote
git push origin feature/description

# Update with main (before creating PR)
git fetch origin
git rebase origin/main

# View commit history
git log --oneline --graph --all

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Clean up local branches
git branch -d feature/description
```

## 📖 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
