# API Reference - Services

## Overview

This document provides comprehensive API reference for all available services in the Angular web app template.

---

## Table of Contents

1. [Auth Service](#auth-service)
2. [Auth Guard](#auth-guard)
3. [Mock OAuth Service](#mock-oauth-service)
4. [Data Interfaces](#data-interfaces)
5. [Route Configuration](#route-configuration)

---

## Auth Service

### Description

Core authentication service that handles user login, logout, session management, and authentication state tracking.

### Location

`src/app/services/auth.service.ts`

### Import

```typescript
import { AuthService } from './services/auth.service';

// In component or service
constructor(private authService: AuthService) { }
```

---

### Properties

#### `currentUser$: Observable<User | null>`

**Description:** Observable stream of the currently logged-in user

**Type:** `Observable<User | null>`

**Usage:**

```typescript
this.authService.currentUser$.subscribe(user => {
  if (user) {
    console.log('User:', user.email);
  }
});

// Or in template with async pipe
<div *ngIf="authService.currentUser$ | async as user">
  {{ user.name }}
</div>
```

**Emits when:**

- User successfully logs in
- OAuth callback completes
- Application initializes and restores session

---

#### `isAuthenticated$: Observable<boolean>`

**Description:** Observable stream of authentication status

**Type:** `Observable<boolean>`

**Values:**

- `true` - User is authenticated
- `false` - User is not authenticated

**Usage:**

```typescript
this.authService.isAuthenticated$.subscribe(isAuth => {
  console.log('Is authenticated:', isAuth);
});

// In template
<button *ngIf="!(authService.isAuthenticated$ | async)">
  Sign In
</button>
```

---

### Methods

#### `login(credentials: LoginCredentials): Observable<void>`

**Description:** Authenticate user with email and password

**Parameters:**

| Parameter     | Type               | Description                          |
| ------------- | ------------------ | ------------------------------------ |
| `credentials` | `LoginCredentials` | Object containing email and password |

**LoginCredentials Interface:**

```typescript
interface LoginCredentials {
  email: string; // User email address
  password: string; // User password
}
```

**Returns:** `Observable<void>`

**Errors:**

- Throws `Error` if email or password is invalid

**Side Effects:**

- Updates `currentUser` subject
- Updates `isAuthenticated` subject
- Saves user to `localStorage`
- Navigates to `/dashboard`

**Example:**

```typescript
this.authService
  .login({
    email: "user@example.com",
    password: "password123",
  })
  .subscribe(
    () => console.log("Login successful"),
    (error) => console.error("Login failed:", error),
  );
```

**Implementation Details:**

```typescript
login(credentials: LoginCredentials): Observable<void> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(credentials.email)) {
    throw new Error('Invalid email format');
  }

  // Validate password length
  if (credentials.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Mock API delay (800ms)
  return from(new Promise(resolve => {
    setTimeout(() => {
      // Create user object
      const user: User = {
        id: `user_${Date.now()}`,
        email: credentials.email,
        name: credentials.email.split('@')[0],
        provider: 'email',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`
      };

      // Update state
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      this.saveToLocalStorage(user);
      resolve(undefined);
    }, 800);
  }));
}
```

---

#### `logout(): void`

**Description:** Log out the current user and clear session

**Parameters:** None

**Returns:** `void`

**Side Effects:**

- Clears `currentUser` subject
- Sets `isAuthenticated` subject to `false`
- Clears `localStorage`
- Navigates to `/login`

**Example:**

```typescript
logout() {
  this.authService.logout();
  // User will be redirected to /login
}
```

**Implementation Details:**

```typescript
logout(): void {
  this.currentUserSubject.next(null);
  this.isAuthenticatedSubject.next(false);
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_remember');
  this.router.navigate(['/login']);
}
```

---

#### `handleOAuthCallback(provider: OAuthProvider, user: User): Observable<void>`

**Description:** Handle OAuth provider callback

**Parameters:**

| Parameter  | Type            | Description                                          |
| ---------- | --------------- | ---------------------------------------------------- |
| `provider` | `OAuthProvider` | OAuth provider ('google' \| 'github' \| 'microsoft') |
| `user`     | `User`          | Mock OAuth user object                               |

**Returns:** `Observable<void>`

**Side Effects:**

- Updates user status
- Saves to localStorage
- Navigates to `/dashboard`

**Example:**

```typescript
const oauthUser: User = {
  id: "google_abc123",
  email: "user@gmail.com",
  name: "John Doe",
  provider: "google",
  avatar: "https://...",
};

this.authService.handleOAuthCallback("google", oauthUser).subscribe(() => {
  console.log("OAuth login successful");
});
```

---

#### `isAuthenticated(): boolean`

**Description:** Synchronously check if user is authenticated

**Parameters:** None

**Returns:** `boolean` - true if authenticated, false otherwise

**Usage:**

```typescript
if (this.authService.isAuthenticated()) {
  // User is authenticated, allow access
} else {
  // Redirect to login
  this.router.navigate(["/login"]);
}
```

---

#### `getCurrentUser(): User | null`

**Description:** Synchronously get the current user

**Parameters:** None

**Returns:** `User | null` - Current user or null

**Usage:**

```typescript
const user = this.authService.getCurrentUser();
if (user) {
  console.log("Current user:", user.email);
}
```

---

#### `initializeAuthState(): void`

**Description:** Initialize authentication state (called on application startup)

**Parameters:** None

**Returns:** `void`

**Process:**

1. Read saved user from `localStorage`
2. If exists, restore user session
3. If not, set as unauthenticated

**When Called:**

- In `AppComponent` `ngOnInit`

**Example:**

```typescript
// app.component.ts
ngOnInit() {
  this.authService.initializeAuthState();
}
```

---

### Private Methods

#### `saveToLocalStorage(user: User): void`

**Description:** Save user to localStorage

**Parameters:** `user: User`

**Storage Structure:**

```json
{
  "auth_user": {
    "id": "user_1234567890",
    "email": "user@example.com",
    "name": "user",
    "provider": "email",
    "avatar": "https://..."
  },
  "auth_remember": "true"
}
```

---

#### `loadFromLocalStorage(): User | null`

**Description:** Load user from localStorage

**Returns:** `User | null`

**Logic:**

```typescript
const savedUser = localStorage.getItem("auth_user");
if (savedUser) {
  try {
    return JSON.parse(savedUser);
  } catch (e) {
    return null;
  }
}
return null;
```

---

## Auth Guard

### Description

Functional route guard that protects routes requiring authentication.

### Location

`src/app/services/auth.guard.ts`

---

### Function Signature

```typescript
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    return router.createUrlTree(["/login"]);
  }
};
```

### Usage

**In Route Configuration:**

```typescript
// app.routes.ts
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
},
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard]
}
```

### Behavior

| Scenario                                      | Result                  |
| --------------------------------------------- | ----------------------- |
| Authenticated user accesses protected route   | ✅ Allow access         |
| Unauthenticated user accesses protected route | ❌ Redirect to `/login` |

### Example

```typescript
// User is authenticated, accessing /dashboard
// authService.isAuthenticated() = true → authGuard returns true → Allow navigation to DashboardComponent ✅

// User is unauthenticated, accessing /dashboard
// authService.isAuthenticated() = false → authGuard returns router.createUrlTree(['/login']) → Redirect to LoginComponent ✅
```

---

## Mock OAuth Service

### Description

Mock OAuth provider service for development and testing.

### Location

`src/app/services/mock-oauth.service.ts`

---

### Methods

#### `generateMockUser(provider: OAuthProvider): User`

**Description:** Generate mock user based on OAuth provider

**Parameters:**

| Parameter  | Type            | Description                                          |
| ---------- | --------------- | ---------------------------------------------------- |
| `provider` | `OAuthProvider` | OAuth provider ('google' \| 'github' \| 'microsoft') |

**Returns:** `User`

**Usage:**

```typescript
const googleUser = mockOAuthService.generateMockUser("google");
console.log(googleUser);
// {
//   id: 'google_xyz789',
//   email: 'john.doe@gmail.com',
//   name: 'John Doe',
//   provider: 'google',
//   avatar: 'https://api.dicebear.com/7.x/google/...'
// }
```

**Provider-Specific Data:**

| Provider  | Email Example          | Avatar API               |
| --------- | ---------------------- | ------------------------ |
| google    | john.doe@gmail.com     | dicebear google style    |
| github    | jane.smith@github.com  | dicebear github style    |
| microsoft | bob.wilson@outlook.com | dicebear microsoft style |

---

#### `simulateCallback(provider: OAuthProvider, delayMs?: number): Observable<User>`

**Description:** Simulate OAuth callback with delay and return user

**Parameters:**

| Parameter  | Type            | Default | Description           |
| ---------- | --------------- | ------- | --------------------- |
| `provider` | `OAuthProvider` | -       | OAuth provider        |
| `delayMs`  | `number`        | 1500    | Delay in milliseconds |

**Returns:** `Observable<User>`

**Usage:**

```typescript
// Use default delay (1500ms)
mockOAuthService.simulateCallback("google").subscribe((user) => {
  console.log("OAuth user:", user);
});

// Custom delay
mockOAuthService.simulateCallback("github", 2000).subscribe((user) => {
  authService.handleOAuthCallback("github", user).subscribe(() => {
    console.log("OAuth login complete");
  });
});
```

---

## Data Interfaces

### User Interface

**Definition:**

```typescript
interface User {
  id: string; // Unique user ID
  email: string; // Email address
  name: string; // Display name
  provider: OAuthProvider; // Authentication provider
  avatar: string; // Avatar URL
}
```

**Example:**

```typescript
const user: User = {
  id: "user_1234567890",
  email: "john@example.com",
  name: "John Doe",
  provider: "google",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john@example.com",
};
```

---

### LoginCredentials Interface

**Definition:**

```typescript
interface LoginCredentials {
  email: string; // Email address
  password: string; // Password
}
```

**Validation Rules:**

- Email: Must match RFC 5322 email format
- Password: Minimum 6 characters

**Example:**

```typescript
const credentials: LoginCredentials = {
  email: "user@example.com",
  password: "securePassword123",
};
```

---

### OAuthProvider Type

**Definition:**

```typescript
type OAuthProvider = "email" | "google" | "github" | "microsoft";
```

**Values:**

| Value         | Description                   |
| ------------- | ----------------------------- |
| `'email'`     | Email/password authentication |
| `'google'`    | Google OAuth 2.0              |
| `'github'`    | GitHub OAuth                  |
| `'microsoft'` | Microsoft Azure OAuth         |

---

## Route Configuration

### Location

`src/app/app.routes.ts`

### Route List

```typescript
export const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: "auth/callback",
    component: AuthCallbackComponent,
  },
  {
    path: "**",
    redirectTo: "",
  },
];
```

### Route Details

#### `/` (Home Page)

- **Component:** `HomeComponent`
- **Access Control:** Public
- **Purpose:** Showcase application features
- **Navigation:**
  ```typescript
  this.router.navigate(["/"]);
  ```

---

#### `/login` (Login Page)

- **Component:** `LoginComponent`
- **Access Control:** Public
- **Purpose:** User login or OAuth provider selection
- **Navigation:**
  ```typescript
  this.router.navigate(["/login"]);
  ```

---

#### `/dashboard` (Dashboard)

- **Component:** `DashboardComponent`
- **Access Control:** Protected (requires authentication)
- **Guard:** `authGuard`
- **Purpose:** Display user information and protected content
- **Navigation:**
  ```typescript
  this.router.navigate(["/dashboard"]);
  ```
- **If Unauthenticated:** Automatically redirects to `/login`

---

#### `/auth/callback` (OAuth Callback)

- **Component:** `AuthCallbackComponent`
- **Access Control:** Public
- **Purpose:** Handle OAuth provider callback
- **URL Parameter:** `provider` (query parameter)
- **Example URL:** `/auth/callback?provider=google`
- **Navigation:**
  ```typescript
  this.router.navigate(["/auth/callback"], {
    queryParams: { provider: "google" },
  });
  ```

---

#### `**` (Wildcard)

- **Purpose:** Redirect all unmatched routes to home page

---

## Complete Type Exports

```typescript
// services/auth.service.ts
export interface User {
  id: string;
  email: string;
  name: string;
  provider: OAuthProvider;
  avatar: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type OAuthProvider = "email" | "google" | "github" | "microsoft";

export class AuthService {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;

  login(credentials: LoginCredentials): Observable<void>;
  logout(): void;
  handleOAuthCallback(provider: OAuthProvider, user: User): Observable<void>;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
}
```

---

## Common Usage Examples

### Login Process

```typescript
// In component
constructor(
  private authService: AuthService,
  private router: Router
) { }

login(email: string, password: string) {
  this.authService.login({ email, password })
    .subscribe(
      () => {
        console.log('Login successful');
        // Router will automatically navigate to /dashboard
      },
      (error) => {
        console.error('Login failed:', error.message);
      }
    );
}
```

### Check Authentication Status

```typescript
// Synchronous check
if (this.authService.isAuthenticated()) {
  // User is authenticated
}

// Asynchronous check
this.authService.isAuthenticated$.subscribe((isAuth) => {
  if (isAuth) {
    // User is authenticated
  }
});
```

### Get Current User

```typescript
// Synchronous
const user = this.authService.getCurrentUser();

// Asynchronous
this.authService.currentUser$.subscribe((user) => {
  if (user) {
    console.log(`Welcome, ${user.name}!`);
  }
});
```

---

## Related Documentation

- [Quick Start](../../getting-started/quickstart.md)
- [Architecture Guide](../../architecture/system-design.md)
- [Development Guide](../../guide/development/environment-setup.md)
- [OAuth Implementation](../../guide/oauth/implementation.md)

---

**Last Updated:** February 4, 2026
**Version:** 2.0
**Status:** ✅ Complete
