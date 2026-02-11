# 🎯 Issue Management

## Issue Types

### 🐛 Bug Reports

Use when you find something that doesn't work as expected.

**Template:**

```markdown
## Description

Clear description of the bug

## Steps to Reproduce

1. ...
2. ...

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS, Browser, Node version, etc.
```

### ✨ Feature Requests

Suggest new functionality or improvements.

**Template:**

```markdown
## Feature Description

What feature would you like?

## Problem Statement

What problem does it solve?

## Proposed Solution

How should it work?

## Alternative Solutions

Any other approaches?
```

### 📖 Documentation Issues

Report documentation problems or suggest improvements.

**Template:**

```markdown
## Documentation Issue

What's the problem?

## Location

Link to the documentation

## Suggested Improvement

How should it be improved?
```

## Issue Labels

Labels help organize and prioritize work:

| Label              | Purpose                    |
| ------------------ | -------------------------- |
| `bug`              | Something isn't working    |
| `enhancement`      | New feature or improvement |
| `documentation`    | Documentation update       |
| `good-first-issue` | Good for newcomers         |
| `help-wanted`      | Extra help needed          |
| `high-priority`    | Urgent issues              |
| `low-priority`     | Can wait                   |
| `blocked`          | Waiting on something else  |
| `duplicate`        | Already reported           |
| `wontfix`          | Won't be addressed         |

## Issue Workflow

```
┌─────────────┐
│  Reported   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Triaged    │  (Labeled, prioritized)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  In Review  │  (Assigned, solution planned)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ In Progress │  (Being worked on)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ In PR       │  (Solution in pull request)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Closed     │  (Fixed or resolved)
└─────────────┘
```

## Best Practices for Opening Issues

### ✅ Do's

- [x] Search existing issues before opening a new one
- [x] Use issue templates provided
- [x] Be clear and specific
- [x] Include environment details
- [x] Add screenshots or error logs
- [x] Follow the code of conduct

### ❌ Don'ts

- [ ] Duplicate existing issues
- [ ] Use vague titles or descriptions
- [ ] Report security vulnerabilities publicly (see SECURITY.md)
- [ ] Include sensitive information
- [ ] Be disrespectful in discussions

## Issue Discussions

### Code of Conduct

All participants must follow our [Code of Conduct](../../CODE_OF_CONDUCT.md):

- Use inclusive language
- Respect different viewpoints
- Accept constructive criticism
- Focus on what's best for the community

### Getting Help

Questions? Don't open an issue:

- Check [Troubleshooting Guide](./troubleshooting/_overview.md)
- Check [FAQ](../../docs/troubleshooting/faq.md)
- Use GitHub Discussions (if enabled)

## Triage Process

### For Maintainers

1. **Review** - Read and understand the issue
2. **Clarify** - Ask for more information if needed
3. **Categorize** - Add appropriate labels
4. **Prioritize** - Set priority level
5. **Assign** - Assign to appropriate team member
6. **Track** - Add to project board/milestone

## Linking Issues

### Closing Issues with PRs

Reference the issue in your PR description:

```markdown
Closes #123
Fixes #456
Resolves #789
```

When the PR is merged, the issue automatically closes.

### Related Issues

Link related issues:

```markdown
Related to #123
Blocked by #456
Depends on #789
```

## Reporting Security Issues

⚠️ **Do NOT** report security vulnerabilities as public issues.

See [SECURITY.md](../../SECURITY.md) for responsible disclosure.
