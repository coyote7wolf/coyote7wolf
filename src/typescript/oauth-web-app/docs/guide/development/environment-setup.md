# Development Environment Setup

Complete guide to configuring your development environment for Angular application development.

---

## Overview

This guide covers:

- IDE and editor setup
- Code standards and conventions
- Development workflow
- Debugging techniques
- Performance optimization
- Common issues and solutions

---

## IDE Setup - VS Code

### Installation

1. Download from [code.visualstudio.com](https://code.visualstudio.com)
2. Install and launch
3. Open the project folder

### Recommended Extensions

Install these extensions for best development experience:

| Extension                | Publisher | Purpose                  |
| ------------------------ | --------- | ------------------------ |
| Angular Language Service | Angular   | Angular template support |
| Prettier                 | esbenp    | Code formatting          |
| ESLint                   | dbaeumer  | Code linting             |
| Thunder Client           | rangav    | REST API testing         |
| Git Lens                 | eamodio   | Git integration          |

**Installation Command:**

```bash
code --install-extension Angular.ng-template
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension rangav.vscode-thunder-client
code --install-extension eamodio.gitlens
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Code Standards

### TypeScript Naming Conventions

```typescript
// Classes and Interfaces: PascalCase
class AuthService { }
interface User { }

// Functions and Variables: camelCase
function handleLogin() { }
let currentUser: User;

// Constants: UPPER_SNAKE_CASE
const API_TIMEOUT = 5000;
const DEFAULT_PROVIDER = 'email';

// Private Properties: _prefix or private keyword
private _authToken: string;
private currentUserSubject: BehaviorSubject<User | null>;

// Observables: $suffix
public currentUser$ = this.currentUserSubject.asObservable();
```

### TypeScript Best Practices

```typescript
// ✅ Good: Use clear types
function login(email: string, password: string): Observable<User> {
  // ...
}

// ❌ Avoid: Use any type
function login(email: any, password: any): any {
  // ...
}

// ✅ Good: Use union types
type OAuthProvider = "email" | "google" | "github" | "microsoft";

// ✅ Good: Use readonly for immutability
interface User {
  readonly id: string;
  readonly email: string;
}

// ✅ Good: Proper error handling
try {
  const user = await authService.login(credentials);
} catch (error) {
  console.error("Login failed:", error);
}
```

### HTML Standards

```html
<!-- ✅ Good: Use async pipe for subscriptions -->
<div *ngIf="currentUser$ | async as user">{{ user.name }}</div>

<!-- ❌ Avoid: Manual subscriptions in template -->
<div *ngIf="currentUser">{{ currentUser.name }}</div>

<!-- ✅ Good: Simple expressions -->
<button (click)="logout()">Logout</button>

<!-- ❌ Avoid: Complex logic in template -->
<button (click)="authService.currentUserSubject.next(null); router.navigate(['/login'])">Logout</button>

<!-- ✅ Good: Responsive design -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### CSS Standards

```css
/* ✅ Good: Utility-based classes */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

/* ✅ Good: Organized into logical groups */

/* Layout */
.flex {
  display: flex;
}

.grid {
  display: grid;
}

/* Spacing */
.p-4 {
  padding: 1rem;
}

.m-2 {
  margin: 0.5rem;
}

/* Colors */
.text-blue-600 {
  color: #2563eb;
}

.bg-white {
  background-color: white;
}
```

---

## Development Workflow

### Create New Component

```bash
# Generate component with Angular CLI
ng generate component components/my-component

# Generate standalone component
ng generate component components/my-component --standalone

# Generate with routing
ng generate component components/my-component --routing
```

### Create New Service

```bash
# Generate service
ng generate service services/my-service

# Generate with provided in root
ng generate service services/my-service --providedIn root
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and test
ng test
ng build

# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push to remote
git push origin feature/new-feature

# 5. Create Pull Request on GitHub
# (Complete in GitHub UI)
```

### Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (not affecting logic)
- `refactor`: Code refactoring
- `test`: Add or modify tests
- `perf`: Performance improvement

**Example:**

```
feat(auth): add Google OAuth login support

Implement OAuth 2.0 flow for Google authentication.
Add handleGoogleOAuth method to AuthService.

Fixes #123
```

---

## Debugging Techniques

### 1. Chrome DevTools Debugging

```typescript
// Add breakpoint in code
debugger;

// Or use console methods
console.log("User:", this.currentUser);
console.warn("Warning:", message);
console.error("Error:", error);
```

### 2. Check RxJS Observables

```typescript
// Use tap operator for debugging
this.authService.currentUser$.pipe(tap((user) => console.log("User changed:", user))).subscribe();

// Check observable completion
observable$.pipe(finalize(() => console.log("Observable completed"))).subscribe();
```

### 3. View localStorage

```javascript
// In browser DevTools console
localStorage.getItem("auth_user");
localStorage.removeItem("auth_user");

// Clear all authentication
localStorage.clear();
```

### 4. Use Angular DevTools

1. Install Chrome Extension: Angular DevTools
2. Open Chrome DevTools
3. Go to Angular tab
4. View Component Tree
5. Inspect Injector

### 5. Trace Route Changes

```typescript
// In component
constructor(private router: Router) {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: any) => {
    console.log('Route changed to:', event.url);
  });
}
```

---

## Performance Optimization

### Change Detection Strategy

```typescript
// ✅ Good: Use OnPush for better performance
@Component({
  selector: "app-user-card",
  templateUrl: "./user-card.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  @Input() user: User;
}
```

### Lazy Loading Routes

```typescript
// In app.routes.ts
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component')
    .then(m => m.AdminComponent)
}
```

### List Performance with trackBy

```typescript
// ✅ Good: Use trackBy to improve list performance
<div *ngFor="let item of items; trackBy: trackByFn">
  {{ item.name }}
</div>

// In component
trackByFn(index: number, item: any): number {
  return item.id;
}
```

### Prevent Memory Leaks

```typescript
// ✅ Good: Use takeUntil to unsubscribe
private destroy$ = new Subject<void>();

ngOnInit() {
  this.authService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => this.user = user);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Preloading Strategy

```typescript
// Use preloading strategy for faster route navigation
import { PreloadAllModules } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ]
})
```

---

## Build and Deployment

### Development Build

```bash
# Start development server
ng serve

# Watch mode build
ng build --watch
```

### Production Build

```bash
# Optimized production build
ng build --configuration production

# Generate bundle size report
ng build --stats-json
webpack-bundle-analyzer dist/angular-web-app-template/stats.json
```

### Check Build Size

```bash
# Analyze bundle size
ng build --stats-json --configuration production

# View source maps
ng build --source-map=true
```

---

## Common Development Issues

### Issue 1: Reset Authentication in Development

```typescript
// In browser DevTools console
localStorage.removeItem("auth_user");
window.location.reload();
```

### Issue 2: Modify OAuth Delay

```typescript
// In src/app/services/mock-oauth.service.ts
private OAUTH_DELAY = 1500;  // Modify delay in milliseconds
```

### Issue 3: Add New OAuth Provider

```typescript
// 1. Add to User interface
type OAuthProvider = 'email' | 'google' | 'github' | 'microsoft' | 'linkedin';

// 2. Add to Mock OAuth Service
case 'linkedin':
  return {
    ...baseUser,
    provider: 'linkedin',
    avatar: 'https://api.dicebear.com/7.x/linkedin/...'
  };

// 3. Add button to Login Component
<button (click)="loginWithOAuth('linkedin')">
  Sign in with LinkedIn
</button>
```

### Issue 4: Disable Route Protection Temporarily

```typescript
// In app.routes.ts
{
  path: 'public-page',
  component: PublicComponent
  // Note: No canActivate: [authGuard]
}
```

### Issue 5: Check Compilation Errors

```bash
# Check TypeScript compilation
ng build --configuration development

# View detailed error information
ng build --verbose
```

---

## FAQs

**Q: How to use environment variables?**

A: Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
};
```

**Q: How to test API calls?**

A: Use Thunder Client or Postman to test endpoints before implementation.

**Q: How to debug in VS Code?**

A: Add `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

**Q: How to improve build speed?**

A: Use ng serve instead of ng build during development, and consider using the --poll flag for watch mode.

---

## Related Documentation

- [Installation Guide](../../getting-started/installation.md) - Setup instructions
- [Quick Start](../../getting-started/quickstart.md) - Fast start guide
- [Troubleshooting](../../troubleshooting/common-issues.md) - Problem solving
- [API Reference](../../reference/api/services.md) - Service documentation

---

**Last Updated:** February 4, 2026
**Version:** 2.0
**Status:** ✅ Complete
