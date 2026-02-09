# ❓ Frequently Asked Questions

Quick answers to common questions about this project.

---

## 📚 Table of Contents

- [Installation & Setup](#installation--setup)
- [Development](#development)
- [Testing](#testing)
- [Internationalization (i18n)](#internationalization-i18n)
- [OAuth Authentication](#oauth-authentication)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### Q: How do I get started with this project?

**A**: Follow these steps:

```bash
# 1. Clone the repository
git clone <repository-url>
cd angular-web-app-template

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Open browser
# Navigate to http://localhost:4200
```

For detailed setup, see [Installation Guide](../getting-started/installation.md).

---

### Q: What Node.js and npm versions are required?

**A**: Check your versions:

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

Update if needed:

- [Node.js Download](https://nodejs.org/)
- `npm install -g npm@latest`

---

### Q: How do I set up environment variables?

**A**: Copy environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set required variables:

```
ANGULAR_APP_API_URL=https://api.example.com
ANGULAR_APP_OAUTH_CLIENT_ID=your_client_id
```

See [Environment Setup Guide](../guide/development/environment-setup.md).

---

## Development

### Q: How do I run the development server?

**A**: Start the development server:

```bash
npm start
```

The app will be available at `http://localhost:4200` with live reloading.

---

### Q: How do I add a new component?

**A**: Follow Angular best practices:

```bash
# Generate component
ng generate component components/my-feature

# Create files
# - my-feature.component.ts
# - my-feature.component.html
# - my-feature.component.css
# - my-feature.component.spec.ts
```

See [Component Structure](../guide/development/project-structure.md#components).

---

### Q: What's the preferred file naming convention?

**A**:

- **Components**: `kebab-case.component.ts` (e.g., `user-card.component.ts`)
- **Services**: `kebab-case.service.ts` (e.g., `auth.service.ts`)
- **Modules/Classes**: `PascalCase` (e.g., `UserService`, `AuthGuard`)
- **Interfaces**: `PascalCase` with `I` prefix optional (e.g., `User`, `IAuthResponse`)
- **Folders**: `kebab-case` (e.g., `auth-service/`, `user-profile/`)

See [Project Structure](../guide/development/project-structure.md).

---

### Q: How do I import modules correctly?

**A**:

```typescript
// ✅ Correct: Absolute paths
import { AuthService } from "@app/services/auth.service";
import { User } from "@app/interfaces/user";

// ❌ Avoid: Relative paths
import { AuthService } from "../../../services/auth.service";
```

Configure `tsconfig.json` for path aliases.

---

## Testing

### Q: How do I run tests?

**A**: Execute test command:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --include='**/login.component.spec.ts'

# Run with coverage
npm test -- --code-coverage
```

---

### Q: What's the minimum code coverage requirement?

**A**: Aim for **80%+ code coverage**:

- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

See [Testing Guide](../guide/development/testing.md).

---

### Q: How do I test async operations?

**A**: Use async utilities:

```typescript
it("should fetch user data", fakeAsync(() => {
  userService.getUser().subscribe((user) => {
    expect(user.name).toBe("John");
  });

  tick(); // Simulate passage of time
  expect(component.user).toBeDefined();
}));
```

See [Testing Guide - Async](../guide/development/testing.md#async-testing).

---

## Internationalization (i18n)

### Q: How do I add a new language?

**A**:

1. Create translation file:

```bash
# Create ar.json for Arabic
touch src/assets/i18n/ar.json
```

2. Add translations:

```json
{
  "WELCOME": "مرحبا",
  "LOGIN": "تسجيل الدخول"
}
```

3. Register in language switcher:

See [i18n Implementation Guide](../guide/i18n/implementation.md).

---

### Q: How do I translate a template?

**A**: Use translation pipe:

```html
<!-- Use i18n pipe -->
<h1>{{ 'WELCOME' | translate }}</h1>
<button>{{ 'LOGIN' | translate }}</button>
```

Or use directive:

```html
<!-- Use i18n directive -->
<h1 i18n="@@welcome">Welcome</h1>
```

---

### Q: How do I handle date/number formatting by language?

**A**: Use Angular pipes:

```html
<!-- Date formatting -->
<p>{{ date | date: 'long' }}</p>

<!-- Currency -->
<p>{{ price | currency: currency }}</p>

<!-- Number -->
<p>{{ value | number: '1.2-2' }}</p>
```

---

## OAuth Authentication

### Q: How do I configure OAuth?

**A**: Set environment variables:

```typescript
// src/environments/environment.ts
export const environment = {
  oauth: {
    google: {
      clientId: "your-client-id.apps.googleusercontent.com",
      scope: "openid email profile",
    },
    github: {
      clientId: "your-github-client-id",
      scope: "user:email",
    },
  },
};
```

See [OAuth Implementation](../guide/oauth/implementation.md).

---

### Q: Why does OAuth callback fail?

**A**: Check these common issues:

1. **Redirect URI mismatch**: Ensure callback URL matches OAuth provider settings

   ```
   Expected: http://localhost:4200/auth-callback
   ```

2. **Client ID incorrect**: Verify client ID in environment variables

3. **CORS issues**: Check if API has CORS enabled for your domain

4. **Token expiration**: Ensure tokens aren't already expired

---

### Q: How do I handle logout?

**A**: Use auth service:

```typescript
// In component
logout(): void {
  this.authService.logout();
  this.router.navigate(['/login']);
}

// In auth service
logout(): void {
  this.clearAuth();
  // Clear OAuth session if needed
}
```

---

## Deployment

### Q: How do I build for production?

**A**: Create optimized build:

```bash
# Build production version
npm run build

# Output: dist/app/

# Verify bundle size
du -sh dist/app/
```

See [Production Deployment](../guide/deployment/production.md).

---

### Q: What environment variables are needed in production?

**A**:

```bash
# Required for production
ANGULAR_APP_API_URL=https://api.production.com
ANGULAR_APP_OAUTH_CLIENT_ID=production_client_id
NODE_ENV=production
```

---

### Q: How do I enable HTTPS?

**A**:

1. Obtain SSL certificate
2. Configure web server (nginx, Apache, etc.)
3. Update OAuth callback URLs to use HTTPS
4. Update API endpoint to HTTPS

---

## Troubleshooting

### Q: Port 4200 is already in use

**A**: Kill process or use different port:

```bash
# Use different port
ng serve --port 4300

# Or kill process (macOS/Linux)
lsof -ti:4200 | xargs kill -9
```

---

### Q: Dependencies installation fails

**A**: Try these solutions:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Q: Build process is slow

**A**: Try these optimizations:

```bash
# Use cache
npm install -g @angular/cli@latest

# Update dependencies
npm update

# Check bundle size
npm run build -- --stats-json
```

---

### Q: Tests fail intermittently

**A**: Common causes:

1. **Timing issues**: Use `fakeAsync` and `tick()`
2. **Flaky HTTP mocks**: Verify mock responses
3. **State isolation**: Reset component state between tests

See [Testing Guide - Debugging](../guide/development/testing.md#debugging-tests).

---

### Q: Browser console shows CORS errors

**A**: Solutions:

```typescript
// 1. Check HttpInterceptor adds proper headers
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + token
}

// 2. Verify API CORS configuration
// 3. Check browser allows credentials
withCredentials: true
```

---

## Need More Help?

- 📖 [Full Documentation](../_index.md)
- 🐛 [Debugging Guide](../troubleshooting/debug-tools.md)
- 🔧 [Development Guide](../guide/development/_overview.md)
- 💬 [Open an Issue](https://github.com/your-repo/issues)

---

**Last Updated**: 2026-02-14
