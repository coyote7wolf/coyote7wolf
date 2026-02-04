# Troubleshooting Guide

## Overview

This document provides solutions for common issues encountered when developing and testing the Angular web app template.

---

## Table of Contents

1. [Manual Testing](#manual-testing)
2. [Automated Testing](#automated-testing)
3. [Troubleshooting](#troubleshooting)
4. [Common Errors](#common-errors)
5. [Performance Diagnosis](#performance-diagnosis)

---

## Manual Testing

### Test Case 1: Email/Password Login

**Prerequisites:** Application running at `http://localhost:4200`

**Testing Steps:**

1. Navigate to `/login`

   ```
   Visit: http://localhost:4200/login
   ```

2. Input valid authentication credentials

   ```
   Email: user@example.com
   Password: password123
   ```

3. Click "Sign in" button

   ```
   Observe: Loading status should display
   ```

4. Verify login result
   ```
   Expected: Redirected to /dashboard
   Expected: User information displayed
   Expected: User avatar displayed ✅
   ```

**Expected Result:** ✅ PASS

**Troubleshooting:**

```
❌ If not redirected to /dashboard:
   - Check route configuration
   - Check if AuthService.login() is returning
   - Check router injection

❌ If error message displays:
   - Check email format
   - Check password length (minimum 6 characters)
   - Check localStorage
```

---

### Test Case 2: Form Validation

**Prerequisites:** On login page

**Scenario A: Invalid Email**

```
1. Input: invalid-email
2. Trigger: Blur event
3. Expected: Display "Please enter a valid email address"
```

**Scenario B: Short Password**

```
1. Input: 12345 (5 characters)
2. Trigger: Blur event
3. Expected: Display password error message
```

**Scenario C: Empty Fields**

```
1. Don't input email
2. Don't input password
3. Click Submit
4. Expected: "Sign in" button disabled
5. Expected: Display required field errors
```

**Expected Result:** ✅ PASS

---

### Test Case 3: OAuth Process

**Prerequisites:** On login page

**Testing Steps:**

1. Choose OAuth provider

   ```
   Click one of:
   - "Sign in with Google"
   - "Sign in with GitHub"
   - "Sign in with Microsoft"
   ```

2. Observe redirect

   ```
   Expected: Navigate to /auth/callback?provider=google (or other)
   Expected: Display loading indicator
   ```

3. Wait for mock OAuth process

   ```
   Expected: Delay approximately 1.5 seconds
   Expected: Auto-generate mock user
   ```

4. Verify login completion
   ```
   Expected: Redirected to /dashboard
   Expected: Display OAuth provider information
   Expected: User avatar reflects provider
   ```

**Expected Result:** ✅ PASS

**Avatar Verification:**

```
Google: avataaars style
GitHub: avataaars style
Microsoft: avataaars style
```

---

### Test Case 4: Session Persistence

**Prerequisites:** Logged in to dashboard

**Testing Steps:**

1. Refresh page

   ```
   Press: Ctrl+R (or Cmd+R)
   Expected: Still on /dashboard
   Expected: User information preserved
   ```

2. Close browser tab

   ```
   Completely close tab
   ```

3. Reopen application

   ```
   Visit: http://localhost:4200
   Expected: Check localStorage
   ```

4. Verify session restoration
   ```
   Expected: If localStorage contains user, auto-login
   ```

**Expected Result:** ✅ PASS

**localStorage Check:**

```javascript
// In browser Dev Tools console
localStorage.getItem("auth_user");
// Should return something like:
// {
//   "id": "user_1234567890",
//   "email": "user@example.com",
//   "name": "user",
//   "provider": "email",
//   "avatar": "https://..."
// }
```

---

### Test Case 5: Route Protection

**Prerequisites:** Logged out (localStorage empty)

**Testing Steps:**

1. Clear authentication

   ```javascript
   // In Dev Tools console
   localStorage.removeItem("auth_user");
   ```

2. Try to access protected route

   ```
   Visit: http://localhost:4200/dashboard
   ```

3. Verify redirect

   ```
   Expected: Auto-redirect to /login
   Expected: URL changes to http://localhost:4200/login
   ```

4. Verify home page access
   ```
   Visit: http://localhost:4200
   Expected: Can access (no guard)
   ```

**Expected Result:** ✅ PASS

---

### Test Case 6: Logout Feature

**Prerequisites:** Logged in to dashboard

**Testing Steps:**

1. Click logout button

   ```
   Position: Dashboard top navigation
   ```

2. Verify logout

   ```
   Expected: Redirect to /login
   Expected: localStorage cleared
   Expected: User data disappeared
   ```

3. Check localStorage
   ```javascript
   localStorage.getItem("auth_user");
   // Should return null
   ```

**Expected Result:** ✅ PASS

---

## Automated Testing

### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev @angular/core @angular/common/testing

# Run tests
ng test

# Run tests with coverage
ng test --code-coverage
```

### Auth Service Testing Example

```typescript
import { TestBed } from "@angular/core/testing";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  describe("login", () => {
    it("should login with valid credentials", (done) => {
      service
        .login({
          email: "user@example.com",
          password: "password123",
        })
        .subscribe(() => {
          expect(service.isAuthenticated()).toBe(true);
          expect(service.getCurrentUser()?.email).toBe("user@example.com");
          done();
        });
    });

    it("should throw error with invalid email", () => {
      expect(() => {
        service
          .login({
            email: "invalid-email",
            password: "password123",
          })
          .subscribe();
      }).toThrowError("Invalid email format");
    });

    it("should throw error with short password", () => {
      expect(() => {
        service
          .login({
            email: "user@example.com",
            password: "short",
          })
          .subscribe();
      }).toThrowError("Password must be at least 6 characters");
    });
  });

  describe("logout", () => {
    it("should logout and clear state", (done) => {
      // First login
      service
        .login({
          email: "user@example.com",
          password: "password123",
        })
        .subscribe(() => {
          // Then logout
          service.logout();
          expect(service.isAuthenticated()).toBe(false);
          expect(service.getCurrentUser()).toBeNull();
          expect(localStorage.getItem("auth_user")).toBeNull();
          done();
        });
    });
  });

  describe("isAuthenticated", () => {
    it("should return false for unauthenticated user", () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it("should return true after login", (done) => {
      service
        .login({
          email: "user@example.com",
          password: "password123",
        })
        .subscribe(() => {
          expect(service.isAuthenticated()).toBe(true);
          done();
        });
    });
  });
});
```

### Login Component Testing Example

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LoginComponent } from "./login.component";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj("AuthService", ["login"]);
    const routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have invalid form on init", () => {
    fixture.detectChanges();
    expect(component.loginForm.valid).toBeFalsy();
  });

  it("should enable submit button with valid form", () => {
    component.loginForm.patchValue({
      email: "user@example.com",
      password: "password123",
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
```

**Solution Steps:**

```bash
# 1. Check dependencies
npm install

# 2. Clear cache
rm -rf node_modules/.cache
ng cache clean

# 3. Reinstall
npm install

# 4. Try again
ng serve
```

---

### Issue 2: Cannot Login

**Symptom:**

```
After inputting credentials, submit button shows no response
```

**Debug Steps:**

```typescript
// In Dev Tools console
// 1. Check if AuthService exists
const authService = angular.probe(document.querySelector("app-root")).injector.get("AuthService");
console.log("AuthService:", authService);

// 2. Manually try login
authService
  .login({
    email: "user@example.com",
    password: "password123",
  })
  .subscribe(
    () => console.log("Login success"),
    (error) => console.error("Login error:", error),
  );

// 3. Check form status
console.log("Form valid:", authService.loginForm.valid);
console.log("Form errors:", authService.loginForm.errors);
```

**Common Causes:**

- Form validation failed → Check email and password format
- Service not injected → Check dependency injection
- Route configuration error → Check app.routes.ts

---

### Issue 3: Logout Still Shows User Info

**Symptom:**

```
After clicking logout, user data still visible
```

**Debug Steps:**

```javascript
// In Dev Tools
// 1. Check localStorage
console.log(localStorage.getItem("auth_user"));

// 2. Check behavior subject
// Navigate to Angular Dev Tools → Component Tree
// Find Dashboard Component
// Check currentUser$ value

// 3. Manually clear
localStorage.removeItem("auth_user");
localStorage.removeItem("auth_remember");
window.location.reload();
```

**Common Causes:**

- Observable not properly subscribed
- Component subscription not cleaned up
- localStorage not cleared

---

### Issue 4: OAuth Callback Infinite Loop

**Symptom:**

```
After clicking OAuth button, page keeps redirecting
```

**Debug Steps:**

```typescript
// In auth-callback.component.ts, add logging
export class AuthCallbackComponent implements OnInit {
  ngOnInit() {
    console.log("Auth Callback init");
    console.log("URL params:", this.route.snapshot.queryParams);

    this.route.queryParams.subscribe((params) => {
      const provider = params["provider"];
      console.log("Provider:", provider);

      if (!provider) {
        console.error("No provider in query params");
        this.router.navigate(["/login"]);
        return;
      }

      // Handle callback
      this.handleCallback(provider);
    });
  }
}
```

**Common Causes:**

- URL parameter missing → Check query parameter
- Route configuration error → Check `/auth/callback` route
- handleCallback infinite recursion → Check redirect logic

---

### Issue 5: localStorage Cannot Be Accessed

**Symptom:**

```
localStorage cannot save or read data
```

**Possible Causes:**

```javascript
// 1. Private/Incognito Mode
// Solution: Test in normal mode

// 2. Different domain
console.log(window.location.origin);
// Ensure all operations on same domain

// 3. Storage quota exceeded
try {
  localStorage.setItem("test", "value");
} catch (e) {
  if (e.name === "QuotaExceededError") {
    console.error("Storage quota exceeded");
    // Clear old data
    localStorage.clear();
  }
}

// 4. Cross-origin issues
// Ensure application runs from same domain
```

---

## Common Errors

### Error 1: "Cannot find module '@angular/core'"

```
Error: Cannot find module '@angular/core'
```

**Solution:**

```bash
npm install
npm install @angular/core
ng serve
```

---

### Error 2: "Property 'currentUser' does not exist on type 'Observable<User>'"

```
TS2339: Property 'currentUser' does not exist on type 'Observable<User>'
```

**Cause:** Trying to directly access Observable property

**Solution:**

```typescript
// ❌ Wrong
this.user = this.authService.currentUser$.name;

// ✅ Correct
this.authService.currentUser$.subscribe(user => {
  this.user = user?.name;
});

// ✅ In template with async pipe
<div *ngIf="authService.currentUser$ | async as user">
  {{ user.name }}
</div>
```

---

### Error 3: "Route not found" Error

```
NG04002: Cannot match any routes. URL Segment: 'dashboard'
```

**Cause:** Route not properly configured

**Solution:**

```typescript
// Check app.routes.ts
export const routes: Routes = [
  {
    path: "dashboard", // ✅ Must be defined
    component: DashboardComponent,
    canActivate: [authGuard],
  },
];
```

---

### Error 4: "AuthGuard is not a function"

```
Error: AuthGuard is not a function
```

**Cause:** Guard not properly defined

**Solution:**

```typescript
// ✅ Correct: Functional guard
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(["/login"]);
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
