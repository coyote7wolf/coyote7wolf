# System Design Guide

React + Next.js application system architecture and design patterns.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Architecture Design](#architecture-design)
3. [Data Flow](#data-flow)
4. [Modules and Dependencies](#modules-and-dependencies)
5. [Design Patterns](#design-patterns)
6. [Best Practices](#best-practices)

---

## Project Structure

```
react-web-template/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (theme, html lang)
│   │   ├── page.tsx              # Home page
│   │   ├── register/             # Registration page
│   │   ├── login/                # Login page
│   │   ├── dashboard/            # Protected dashboard (server + client components)
│   │   └── api/                  # Route handlers (Edge / Serverless)
│   ├── components/               # Shared UI components (Navbar, Footer)
│   ├── lib/                      # Utilities and i18n init
│   ├── stores/                   # Zustand stores
│   ├── styles/                   # Tailwind and global CSS entry
│   └── assets/                   # Static resources
├── next.config.ts                # Next.js configuration
├── postcss.config.cjs           # PostCSS + Tailwind config
├── tailwind.config.js           # Tailwind configuration
├── package.json                  # Dependencies & scripts
└── README.md                     # Project explanation
```

---

## Architecture Design

### Layered Architecture

```
┌─────────────────────────────────────────┐
│ Component Layer (Components)            │
│ ┌──────────────────────────────────┐   │
│ │ Home Component                  │   │
│ │ Login Component                 │   │
│ │ Dashboard Component             │   │
│ │ Auth Callback Component         │   │
│ └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ Service Layer (Business Logic)          │
│ ┌──────────────────────────────────┐   │
│ │ Auth Service                    │   │
│ │ Auth Guard                      │   │
│ │ Mock OAuth Service              │   │
│ └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ Data Layer (State Management)           │
│ ┌──────────────────────────────────┐   │
│ │ Local Storage                   │   │
│ │ RxJS Behavior Subjects          │   │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Data Flow

### 1. Email/Password Login Process

```
┌─────────────────────────────────────────────┐
│ Login Component                             │
│ User Input: email, password                 │
└────────────────┬────────────────────────────┘
                 │ handleLogin()
                 ↓
┌─────────────────────────────────────────────┐
│ Auth Service.login()                        │
│ 1. Validate FormData                        │
│ 2. Mock API call (800 ms delay)             │
│ 3. Generate User object                     │
└────────────────┬────────────────────────────┘
                 │ Success
                 ↓
┌─────────────────────────────────────────────┐
│ Behavior Subject Status Update              │
│ currentUserSubject.next(user)               │
│ isAuthenticatedSubject.next(true)           │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ↓            ↓            ↓
localStorage Router.navigate Router Updates
  Storage    /dashboard   All Subscribers
```

### 2. OAuth Process

```
┌─────────────────────────────────────────────┐
│ Login Component                             │
│ User Click: "Sign in with Google"           │
└────────────────┬────────────────────────────┘
                 │ loginWithOAuth(provider)
                 ↓
┌─────────────────────────────────────────────┐
│ Router.navigate(['/auth/callback'],         │
│   {queryParams: {provider}})                │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│ Auth Callback Component Initialize          │
│ 1. Parse URL parameter (provider)           │
│ 2. Show loading status (1.5 seconds)        │
│ 3. Call Mock OAuth Service                  │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│ Mock OAuth Service.generateMockUser()       │
│ Generate Mock OAuth User Data               │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│ Auth Service.handleOAuthCallback(user)      │
│ 1. Update currentUserSubject                │
│ 2. Update isAuthenticatedSubject            │
│ 3. Save to localStorage                     │
└────────────────┬────────────────────────────┘
                 │
                 ↓
         Router.navigate(['/dashboard'])
             ✅ Auto Login Complete
```

### 3. Session Recovery Process

```
┌──────────────────────────────────────────────┐
│ Application Initialize (app.component.ts)    │
│ Page refresh or revisit                      │
└────────────────┬─────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────┐
│ Auth Service.initializeAuthState()           │
│ 1. Read localStorage['auth_user']            │
│ 2. Check if data is valid                    │
└────────────────┬─────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ↓                 ↓
    Has Data         No Data
        │                 │
    Restore User    Remain Unauthenticated
   Update Subject      Status
```

---

## Modules and Dependencies

### Core Dependencies

```json
{
  "react": "^19.0.0",
  "next": "^15.0.0",
  "tailwindcss": "^4.0.0",
  "postcss": "^8.0.0",
  "i18next": "^23.0.0",
  "react-i18next": "^12.0.0",
  "zustand": "^4.0.0",
  "typescript": "^5.6.0"
}
```

### Import Structure

**Auth Service Dependencies:**

```typescript
import React from "react";
import { create } from "zustand";
// Core authentication logic typically lives in `lib/` and `stores/` using Zustand and hooks
```

**Login Component Dependencies:**

```typescript
// Use React forms (react-hook-form or Formik) and Next.js App Router for navigation
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
```

**Dashboard Component Dependencies:**

```typescript
// Use shared auth utilities and Next.js App Router for navigation
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/navigation";
```

---

## Design Patterns

### 1. Service Pattern

**Purpose**: Centralize business logic

**Implementation**: Auth Service handles all authentication-related logic

### 2. Guard Pattern

**Purpose**: Protect route access

**Implementation**: Auth Guard checks authentication status

### 3. Observable Pattern

**Purpose**: Reactive state management

**Implementation**: BehaviorSubject publishes status updates

### 4. Delegation Pattern

**Purpose**: Mock OAuth providers

**Implementation**: Mock OAuth Service simulates real OAuth flow

### 5. Single Responsibility Principle (SRP)

Each component has a single responsibility:

- Home Component: Display homepage
- Login Component: Login form
- Dashboard Component: Display user information
- Auth Callback Component: Handle OAuth callback

---

## Best Practices

### 1. Authentication Security

```typescript
// ✅ Good: Use BehaviorSubject
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();

// ❌ Avoid: Directly expose mutable state
public currentUser: User | null = null;
```

### 2. Route Protection

```typescript
// ✅ Good: Use functional guard
export const authGuard: CanActivateFn = (route, state) => {
  return inject(AuthService).isAuthenticated()
    ? true
    : inject(Router).createUrlTree(["/login"]);
};

// In route configuration:
{
  path: "dashboard",
  component: DashboardComponent,
  canActivate: [authGuard],
}
```

### 3. Reactive Forms

```typescript
// ✅ Good: Use reactive forms with validation
this.loginForm = this.formBuilder.group({
  email: ["", [Validators.required, Validators.email]],
  password: ["", [Validators.required, Validators.minLength(6)]],
});

// ❌ Avoid: Template-driven forms for complex validation
```

### 4. Session Management

```typescript
// ✅ Good: Use localStorage for persistence
localStorage.setItem("auth_user", JSON.stringify(user));

// Recovery on app restart
const savedUser = localStorage.getItem("auth_user");
if (savedUser) {
  this.currentUserSubject.next(JSON.parse(savedUser));
}
```

### 5. Error Handling

```typescript
// ✅ Good: Provide detailed error messages
if (credentials.email !== "user@example.com") {
  this.generalError = "Invalid email or password";
}

// ✅ Good: Reset error status
this.generalError = "";
```

### 6. Type Safety

```typescript
// ✅ Good: Define clear interfaces
interface User {
  id: string;
  email: string;
  name: string;
  provider: OAuthProvider;
  avatar: string;
}

type OAuthProvider = "email" | "google" | "github" | "microsoft";
```

### 7. Memory Leak Prevention

```typescript
// ✅ Good: Cancel subscriptions on destroy
private destroy$ = new Subject<void>();

ngOnInit() {
  this.authService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      // ...
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## Component Communication

### Parent-Child Communication

```typescript
// Parent component passes data to child
<app-user-card [user]="currentUser"></app-user-card>

// Child component receives
@Input() user: User;
```

### Service-based Communication

```typescript
// Auth Service provides Observable
public currentUser$ = this.currentUserSubject.asObservable();

// Other components subscribe
this.authService.currentUser$.subscribe(user => {
  this.currentUser = user;
});
```

---

## Environment Configuration

### Development Environment (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:4200",
};
```

### Production Environment (`environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: "https://syncoreai.example.com",
};
```

---

## Future Improvements

### 1. HTTP Integration

- Replace Mock OAuth Service with real HTTP calls
- Add HTTP Interceptor for authentication token

### 2. Enhanced Persistence

- Use IndexedDB for larger data storage
- Implement secure token refresh mechanism

### 3. State Management Upgrade

- Migrate to NgRx for complex state management
- Implement time-travel debugging

### 4. Testing Coverage

- Unit tests for all services
- Integration tests for all components
- E2E tests for complete flows

### 5. Internationalization (i18n)

- Add multi-language support
- Translate all user-facing text

---

## Related Documentation

- [Quick Start Guide](../getting-started/quickstart.md)
- [Installation Guide](../getting-started/installation.md)
- [OAuth Implementation](../guide/oauth/implementation.md)
- [i18n Implementation](../guide/i18n/implementation.md)
