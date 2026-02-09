# 🤝 Contributing Guide

Thank you for your interest in this project! This guide will help you contribute effectively.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Contribution Process](#contribution-process)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)

---

## Code of Conduct

This project adheres to the open source community code of conduct. Any disrespectful behavior is unacceptable.

**We expect all contributors to:**

- Use inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism
- Focus on community best interests
- Show empathy toward others

---

## Getting Started

### 1. Fork the Project

1. Navigate to the GitHub repository
2. Click "Fork" in the top right corner
3. Create a copy in your account

### 2. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/angular-web-app-template.git
cd angular-web-app-template
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/ORIGINAL_REPO/angular-web-app-template.git
```

### 4. Setup Development Environment

```bash
npm install
npm start
```

See [Development Setup](./docs/guide/development/environment-setup.md) for details.

---

## Contribution Process

### Step 1: Create an Issue

Before coding:

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** describing your feature/bug
3. **Wait for feedback** from maintainers

### Step 2: Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**

- Feature: `feature/feature-name`
- Bug fix: `fix/bug-name`
- Documentation: `docs/doc-name`
- Test: `test/test-name`

### Step 3: Implement Feature

Follow the [Code Style](#code-style) guidelines.

### Step 4: Commit Code

Follow [Commit Guidelines](#commit-guidelines).

### Step 5: Write/Update Tests

- All new features must have tests
- Bug fixes should include tests to prevent regression
- Target 80%+ test coverage

See [Testing Guidelines](#testing-guidelines).

### Step 6: Update Documentation

- Update relevant documentation for new/modified features
- Follow [Documentation Guidelines](#documentation-guidelines)

### Step 7: Submit Pull Request

1. **Push your branch**

```bash
git push origin feature/your-feature-name
```

2. **Create PR on GitHub** with:
   - Clear description
   - Related issue reference
   - Test checklist
   - Screenshots (if applicable)

3. **Wait for review** and address feedback

4. **Merge** once approved

---

## Code Style

### TypeScript

```typescript
// ✅ Good example
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// ❌ Avoid
export class userService {
  constructor(http: HttpClient) {
    this.http = http;
  }

  getUser(id) {
    return this.http.get(`/api/users/${id}`);
  }
}
```

**Rules:**

1. **Naming Conventions**
   - Classes: PascalCase (`UserService`)
   - Functions: camelCase (`getUserData`)
   - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
   - Files: kebab-case (`user-service.ts`)

2. **Type Annotations**
   - All function parameters must have types
   - All function return values must have types
   - Avoid using `any`

3. **Comments**
   - Comment complex logic
   - Add JSDoc for public methods
   - Don't comment obvious code

4. **File Structure**
   ```
   // Imports
   import { ... } from '@angular/core';
   
   // Type definitions
   interface/type ...
   
   // Constants
   const ...
   
   // Main class
   export class ...
   ```

### HTML and CSS

```html
<!-- ✅ Good example -->
<div class="user-card">
  <h2>{{ user.name }}</h2>
  <p>{{ user.email }}</p>
</div>

<!-- ❌ Avoid -->
<DIV>
  <H2>{{ user.name }}</H2>
  <P>{{ user.email }}</P>
</DIV>
```

---

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no functional change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Tests
- `chore`: Dependency updates, tools, etc.

**Examples:**

```bash
git commit -m "feat(auth): add OAuth token refresh"
git commit -m "fix(i18n): correct Arabic translation"
git commit -m "docs: update installation guide"
```

---

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --include='**/auth.service.spec.ts'

# Generate coverage report
npm test -- --code-coverage
```

### Writing Tests

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
it('should calculate sum correctly', () => {
  // Arrange
  const a = 2, b = 3;

  // Act
  const result = service.add(a, b);

  // Assert
  expect(result).toBe(5);
});
```

**Best Practices:**

1. One test per feature
2. Clear test names
3. Use beforeEach/afterEach for setup
4. Test edge cases
5. Maintain 80%+ coverage

See [Testing Guide](./docs/guide/development/testing.md) for details.

---

## Documentation Guidelines

### When Adding Features

1. Update README (if major feature)
2. Update relevant guides in `/docs/guide/`
3. Add API documentation in `/docs/reference/`
4. Update feature list

### Documentation Format

Follow existing documentation style:

```markdown
# Title

Brief description

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Detailed content

### Code Example

\`\`\`typescript
// code
\`\`\`

## Section 2

More content
```

---

## Resources

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

## Questions?

- Check [FAQ](./docs/troubleshooting/faq.md)
- Create a GitHub Issue
- Contact project maintainers

---

**Thank you for contributing!** 🎉
