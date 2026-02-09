# 📁 Project Structure

Understanding the Angular project directory structure and file organization.

---

## 📚 Table of Contents

- [Root Directory Structure](#root-directory-structure)
- [src Directory Structure](#src-directory-structure)
- [app Directory Structure](#app-directory-structure)
- [Naming Conventions](#naming-conventions)
- [File Types](#file-types)

---

## Root Directory Structure

```
angular-web-app-template/
├── .github/                    # GitHub configuration
│   ├── workflows/              # CI/CD workflows
│   └── ISSUE_TEMPLATE/         # Issue templates
├── .trunk/                     # Code quality tool config
├── docs/                       # 📚 Documentation
│   ├── getting-started/
│   ├── guide/
│   ├── reference/
│   ├── architecture/
│   ├── process/
│   └── troubleshooting/
├── public/                     # Static assets
├── src/                        # 👨‍💻 Source code
├── angular.json                # Angular configuration
├── package.json                # npm dependencies
├── tsconfig.json               # TypeScript config
├── README.md                   # Project homepage
├── CONTRIBUTING.md             # Contribution guide
└── CHANGELOG.md                # Change history
```

### Key Files

| File            | Purpose                             |
| --------------- | ----------------------------------- |
| `angular.json`  | Angular CLI configuration           |
| `package.json`  | npm project config and dependencies |
| `tsconfig.json` | TypeScript compiler config          |
| `README.md`     | Project overview and quick start    |
| `.gitignore`    | Git ignore rules                    |

---

## src Directory Structure

```
src/
├── app/                        # Application code
│   ├── components/             # Reusable components
│   ├── services/               # Service layer
│   ├── models/                 # Data models (optional)
│   ├── app.component.ts        # Root component
│   ├── app.routes.ts           # Route configuration
│   └── app.config.ts           # Application config
├── assets/                     # Static resources
│   └── i18n/                   # Translation files
│       ├── en.json             # English translation
│       ├── zh-CN.json          # Simplified Chinese
│       ├── zh-TW.json          # Traditional Chinese
│       └── ar.json             # Arabic
├── environments/               # Environment configs
│   ├── environment.ts          # Development
│   └── environment.prod.ts     # Production
├── index.html                  # HTML entry point
├── main.ts                     # Application startup
├── styles.css                  # Global styles
└── design-tokens.css           # Design system
```

---

## app Directory Structure

Core application code:

```
src/app/
├── components/                 # Reusable components
│   ├── auth-callback/          # OAuth callback handler
│   ├── dashboard/              # Dashboard component
│   ├── home/                   # Home component
│   ├── login/                  # Login component
│   ├── register/               # Registration component
│   ├── navbar/                 # Navigation bar
│   ├── language-switcher/      # Language switcher
│   └── mock-oauth/             # Mock OAuth (testing)
├── services/                   # Services layer
│   ├── auth.service.ts         # Authentication
│   ├── auth.guard.ts           # Route guard
│   ├── translation.service.ts  # Translation
│   ├── mock-oauth.service.ts   # Mock OAuth
│   └── *.spec.ts               # Unit tests
├── app.component.ts            # Root component logic
├── app.component.html          # Root template
├── app.component.css           # Root styles
├── app.routes.ts               # Route configuration
└── app.config.ts               # App configuration
```

### Component Structure

Each component typically contains:

```
component-name/
├── component-name.component.ts       # Component logic
├── component-name.component.html     # Component template
├── component-name.component.css      # Component styles
└── component-name.component.spec.ts  # Component tests (optional)
```

---

## Naming Conventions

### File Naming

| Type      | Format                        | Example                  |
| --------- | ----------------------------- | ------------------------ |
| Component | `component-name.component.ts` | `login.component.ts`     |
| Service   | `service-name.service.ts`     | `auth.service.ts`        |
| Guard     | `guard-name.guard.ts`         | `auth.guard.ts`          |
| Test      | `file-name.spec.ts`           | `auth.service.spec.ts`   |
| Model     | `model-name.model.ts`         | `user.model.ts`          |
| Directive | `directive-name.directive.ts` | `highlight.directive.ts` |
| Pipe      | `pipe-name.pipe.ts`           | `safe.pipe.ts`           |

**Rule: Use kebab-case (lowercase with hyphens)**

### Class Naming

| Type      | Format            | Example              |
| --------- | ----------------- | -------------------- |
| Component | `<Name>Component` | `LoginComponent`     |
| Service   | `<Name>Service`   | `AuthService`        |
| Guard     | `<Name>Guard`     | `AuthGuard`          |
| Directive | `<Name>Directive` | `HighlightDirective` |
| Pipe      | `<Name>Pipe`      | `SafePipe`           |

**Rule: Use PascalCase (CapitalCaseWords)**

### Property and Method Naming

```typescript
// ✅ Good
class UserService {
  private userCache: Map<string, User>;

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// ❌ Avoid
class UserService {
  private user_cache: Map<string, User>;

  get_user_by_id(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

**Rule: Use camelCase (firstWordLowercase)**

---

## File Types

### TypeScript Files

- **Components**: Component logic
- **Services**: Business logic and API calls
- **Guards**: Route protection
- **Models**: Data type definitions
- **Tests**: Unit tests (`.spec.ts`)

### HTML Files

- Component templates
- Angular directives and data binding

### CSS Files

- Component styles
- Global styles
- Design system tokens

### JSON Files

- `package.json`: npm dependencies
- `tsconfig.json`: TypeScript config
- `angular.json`: Angular config
- Translation files: `en.json`, `zh-CN.json`, etc.

---

## Best Practices

### 1. Single Responsibility

```typescript
// ✅ Good: Single class per file
export class UserService {}

// ❌ Avoid: Multiple unrelated classes
export class UserService {}
export class OrderService {}
```

### 2. File Size

- Component: < 400 lines
- Service: < 600 lines
- If larger, consider splitting

### 3. Folder Structure

```
// ✅ Good: Feature-based organization
feature/
├── dashboard.component.ts
├── dashboard.service.ts
└── dashboard.spec.ts

// ❌ Avoid: Type-based organization
components/
├── dashboard.component.ts
services/
├── dashboard.service.ts
```

### 4. Import Order

```typescript
// 1. Angular core
import { Component } from "@angular/core";

// 2. Angular modules
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

// 3. Third-party libraries
import { Observable } from "rxjs";

// 4. Local modules
import { AuthService } from "../services/auth.service";
import { User } from "../models/user.model";
```

---

## Extending the Project

### Add a Component

```bash
ng generate component components/new-component
# or ng g c components/new-component
```

### Add a Service

```bash
ng generate service services/new-service
# or ng g s services/new-service
```

### Add a Guard

```bash
ng generate guard guards/new-guard
# or ng g g guards/new-guard
```

### Add a Route

Edit `app.routes.ts`:

```typescript
export const routes: Routes = [
  { path: "new-route", component: NewComponent },
  // ...
];
```

---

## Resources

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Development Workflow](./workflow.md)
- [Testing Guide](./testing.md)

---

**Next**: [Development Workflow](./workflow.md)
