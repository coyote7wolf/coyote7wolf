\*\*\* End Patch
});
fixture.detectChanges();
expect(component.loginForm.valid).toBeTruthy();
});
});

```

---

## Troubleshooting

### Issue 1: Application Cannot Start

**Symptom:**

```

ng serve failed, showing compile error

````

**Solution Steps:**

```bash
# 1. Check dependencies
npm install

# 2. Clear cache
rm -rf node_modules/.cache
# Troubleshooting Guide

## Overview

This document provides solutions and diagnostic steps for common issues encountered when developing and testing the React + Next.js template.

---

## Table of Contents

1. [Manual Testing](#manual-testing)
2. [Automated Testing](#automated-testing)
3. [Common Errors & Fixes](#common-errors--fixes)
4. [Debugging Tips](#debugging-tips)
5. [Performance Diagnosis](#performance-diagnosis)

---

## Manual Testing

### Test Case 1: Email/Password Login

**Prerequisites:** Application running at `http://localhost:3000`

**Testing Steps:**

1. Navigate to `/login`

```text
Visit: http://localhost:3000/login
````

2. Input valid authentication credentials

```text
Email: user@example.com
Password: password123
```

3. Click "Sign in" button and observe behavior.

4. Verify login result

```text
Expected: Redirected to /dashboard
Expected: User information displayed
Expected: User avatar displayed
```

**Troubleshooting:**

- If not redirected, open browser console and network tab to inspect API calls.
- Verify the auth API URL in `NEXT_PUBLIC_API_URL` and that the backend is reachable.
- Check `localStorage` keys used by the auth store (`auth_user`, etc.).

---

### Test Case 2: OAuth Process

**Testing Steps:**

1. Click an OAuth provider button (Google/GitHub/etc.).
2. Verify redirect to the OAuth flow or mock callback route (`/api/auth/callback` or `/auth/callback`).
3. Ensure the callback handler sets the session and redirects to `/dashboard`.

**Troubleshooting:**

- If redirect loops, check the callback handler logic and returned query parameters.
- Verify any proxy or environment variables used for OAuth callback URLs.

---

## Automated Testing

### Unit & Integration Tests (Jest + React Testing Library)

```bash
# Run all tests
npm test

# Run specific tests
npm test -- -t "Login"

# Run with coverage
npm test -- --coverage
```

Example (React Testing Library):

```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from 'app/login/page';

test('shows login form and can submit', async () => {
  render(<LoginPage />);
  userEvent.type(screen.getByLabelText(/email/i), 'testuser@example.com');
  userEvent.type(screen.getByLabelText(/password/i), 'password123');
  userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  // Assert redirect or API call mocked behavior
});
```

For store/hooks testing, use `renderHook` from `@testing-library/react-hooks` or the built-in utilities for React Testing Library.

---

## Common Errors & Fixes

### Error: "Cannot find module 'react'" or similar

```
Error: Cannot find module 'react'
```

Fix:

```bash
npm install
npm install react react-dom next
```

### Error: TypeScript compilation failures

Run:

```bash
npx tsc --noEmit
```

Fix common issues by checking `tsconfig.json` paths, React types (`@types/react`), and that imports use the correct paths.

### Error: Tailwind styles not applied

Check:

- `src/app/globals.css` is imported in `app/layout.tsx`
- `tailwind.config.js` includes the correct `content` globs (e.g., `src/**/*.{ts,tsx,js,jsx}`)
- Rebuild dev server after changing Tailwind config

### Error: i18n translations missing or language flash

Check:

- Files exist under `public/locales/<lang>/common.json`
- `src/lib/i18n.ts` initializes `i18next` and reads `localStorage` synchronously
- The `ClientLayout` component gates rendering until language initialization completes

---

## Debugging Tips

- Use browser DevTools (Console, Network) to inspect failed network calls and JS errors.
- Add temporary logs in `src/lib/i18n.ts`, `src/stores/*`, and `src/lib/auth.ts` to trace state changes.
- For CSS issues, inspect computed styles and ensure Tailwind utility classes are present in the DOM.
- For hydration issues, look for warnings in the browser console and ensure server-rendered HTML matches client state (language, theme).

---

## Performance Diagnosis

- Use Lighthouse or `next build && npx next-start` with profiling to measure FCP, LCP, and CLS.
- Analyze bundle size with `next build` output and `@next/bundle-analyzer` if configured.

---

If you want, I can now: (A) finish converting other doc files that still mention Angular, (B) move remaining Angular-era docs to `docs/archive/angular-legacy/`, or (C) create a summary report of files changed so far. Which would you like next?

```typescript
// ✅ Correct: Functional guard
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(["/login"]);
};

// In route
canActivate: [authGuard]; // ✅ Note: Not [AuthGuard]
```

---

## Performance Diagnosis

### Check Application Bundle Size

```bash
# View bundle size
ng build --stats-json

# Analyze bundle
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/angular-web-app-template/stats.json
```

### Chrome Dev Tools Performance Analysis

```
1. Open Dev Tools (F12)
2. Go to Performance tab
3. Click Record
4. Execute operations (login, navigate, etc.)
5. Stop Record
6. View frame rate and execution time
```

### Check for Memory Leaks

```javascript
// In Dev Tools
// 1. Open Memory tab
// 2. Take heap snapshot
// 3. Execute operations multiple times
// 4. Take another snapshot
// 5. Compare differences - should see similar size
// If constantly growing → possible memory leak

// Common causes
// ✅ Use takeUntil to unsubscribe
// ✅ Clean up in ngOnDestroy
// ✅ Avoid subscribing in component without cleanup
```

### Runtime Performance Optimization

```bash
# Enable production mode compilation
ng build --configuration production

# Enable preloading
ng build --preload-modules

# Check coverage
ng build --code-coverage
```

---

## Related Resources

- [Angular Debugging Guide](https://angular.io/guide/debugging)
- [Chrome Dev Tools Documentation](https://developer.chrome.com/docs/devtools)
- [RxJS Debug](https://rxjs.dev/guide/operators)
- [TypeScript Troubleshooting](https://www.typescriptlang.org/docs/handbook/troubleshooting.html)

---

**Last Updated:** February 4, 2026
**Version:** 2.0
**Status:** ✅ Complete
