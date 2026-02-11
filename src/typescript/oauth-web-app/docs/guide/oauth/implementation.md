# 🔐 OAuth Authentication Implementation

Comprehensive guide to implementing OAuth authentication in your Angular application.

A complete authentication system built with Angular featuring email/password login and OAuth provider simulation (Google, GitHub, Microsoft).

---

## 📋 Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Authentication Flow](#authentication-flow)
5. [Usage Examples](#usage-examples)
6. [Service Details](#service-details)
7. [Route Guards](#route-guards)
8. [Testing Guide](#testing-guide)
9. [Production Notes](#production-notes)

---

## 🎯 Features

- **Email/Password Authentication** - Traditional login with form validation
- **OAuth Simulation** - Mock OAuth flow for Google, GitHub, and Microsoft
- **Session Management** - Persistent login with local storage
- **Route Protection** - Auth guards to protect dashboard
- **Form Validation** - Real-time validation with error messages
- **Responsive Design** - Mobile-friendly UI
- **User Dashboard** - Protected user profile page

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Angular CLI 19+

### Installation

```bash
# Clone the repository
cd angular-web-app-template

# Install dependencies
npm install

# Start development server
ng serve
```

Navigate to `http://localhost:4200/` in your browser.

---

## 📁 Project Structure

```
src/app/
├── components/
│   ├── home/                    # Home page with features overview
│   ├── login/                   # Login page with email & OAuth buttons
│   ├── dashboard/               # Protected user dashboard
│   └── auth-callback/           # OAuth callback handler
├── services/
│   ├── auth.service.ts          # Authentication logic
│   ├── auth.guard.ts            # Route protection guard
│   └── mock-oauth.service.ts    # Mock OAuth provider
├── app.routes.ts                # Application routes
└── app.config.ts                # App configuration
```

---

## 🔐 Authentication Flow

### Email/Password Login

```
1. User enters email and password on login page
   ↓
2. Form validation checks email format and password length
   ↓
3. Auth Service simulates API call (800 ms delay)
   ↓
4. On success, user data stored in local storage
   ↓
5. Redirect to dashboard
```

**Validation Rules**:

- Email: Required + valid format (RFC 5322)
- Password: Minimum 6 characters

### OAuth Simulation

```
1. User clicks OAuth provider button (Google, GitHub, Microsoft)
   ↓
2. Redirects to /auth/callback?provider=<provider>
   ↓
3. Auth Callback Component processes the callback
   ↓
4. Simulates OAuth user data retrieval
   ↓
5. Auth Service stores user and redirects to dashboard
```

---

## 📖 Usage Examples

### Login with Email/Password

```typescript
// In login component
const credentials = {
  email: "user@example.com",
  password: "password123",
  rememberMe: true,
};

this.authService.login(credentials).then((user) => {
  // User logged in successfully
  this.router.navigate(["/dashboard"]);
});
```

### Check Authentication Status

```typescript
// In any component
if (this.authService.isAuthenticated()) {
  // User is logged in
}

// Or use observable
this.authService.isAuthenticated$.subscribe((isAuth) => {
  console.log("User authenticated:", isAuth);
});
```

### Get Current User

```typescript
const user = this.authService.getCurrentUser();
console.log(user.email, user.name, user.provider);
```

### Logout

```typescript
this.authService.logout();
this.router.navigate(["/login"]);
```

### OAuth Login

```typescript
// In login component
const provider = "google"; // "google", "github", or "microsoft"
this.authService.loginWithOAuth(provider);
```

---

## 🛡️ Service Details

### Auth Service (`src/app/services/auth.service.ts`)

#### Features

- User state management with BehaviorSubject
- Persistent login with local storage
- Email validation using regex
- Password validation (minimum 6 characters)
- Mock OAuth provider handling
- Automatic user session recovery on page refresh

#### Key Methods

```typescript
// Login with credentials
login(credentials: LoginCredentials): Promise<User>

// Login with OAuth provider
loginWithOAuth(provider: string): void

// Check if user is authenticated
isAuthenticated(): boolean

// Get current logged-in user
getCurrentUser(): User | null

// Logout user
logout(): void

// Get authentication observable
isAuthenticated$: Observable<boolean>
```

#### Interfaces

```typescript
// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  provider?: "email" | "google" | "github" | "microsoft";
  avatar?: string;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

// OAuth provider interface
export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
}
```

### Mock OAuth Service (`src/app/services/mock-oauth.service.ts`)

Simulates OAuth provider responses:

```typescript
// Simulate OAuth login flow
simulateOAuthLogin(provider: string): Promise<User>

// Get mock provider data
getMockProviderData(provider: string): OAuthProvider
```

---

## 🔌 Route Guards

The application uses functional auth guards to protect the dashboard:

```typescript
// Route guard implementation
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store redirect URL for post-login redirect
  authService.setRedirectUrl(state.url);
  router.navigate(["/login"]);
  return false;
};

// Usage in routes
const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [authGuard],
  },
];
```

---

## 🧪 Testing Guide

### Manual Testing Flow

#### 1. Email/Password Login

```
1. Navigate to http://localhost:4200/login
2. Enter email: testuser@example.com
3. Enter password: password123
4. Click Sign In button
5. Should redirect to /dashboard
6. Should display user profile
```

#### 2. OAuth Login

```
1. Navigate to http://localhost:4200/login
2. Click OAuth provider button (Google, GitHub, or Microsoft)
3. Should redirect to /auth/callback?provider=xxx
4. Wait for 1.5 seconds while OAuth simulates
5. Should redirect to /dashboard
6. Should display user profile with provider info
```

#### 3. Session Persistence

```
1. Login successfully
2. Refresh the page (Ctrl+R)
3. Should remain on /dashboard (not redirect to login)
4. User data should still be visible
```

#### 4. Logout

```
1. Click Logout button
2. Should redirect to /login
3. Session should be cleared
4. Trying to access /dashboard should redirect to /login
```

### Browser Console Checks

```javascript
// Check local storage
localStorage.getItem("auth_user");
// Should return user object:
// {
//   "id": "user_xxxxx",
//   "email": "testuser@example.com",
//   "name": "testuser",
//   "provider": "email",
//   "avatar": "https://..."
// }

// Check authentication observable
// Should see no console errors or warnings
```

### Unit Testing

```typescript
describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it("should login with valid credentials", (done) => {
    const credentials = {
      email: "test@example.com",
      password: "password123",
      rememberMe: false,
    };

    service.login(credentials).then((user) => {
      expect(user).toBeDefined();
      expect(user.email).toBe("test@example.com");
      done();
    });
  });

  it("should authenticate user", () => {
    const isAuth = service.isAuthenticated();
    expect(isAuth).toBeTruthy();
  });

  it("should logout user", () => {
    service.logout();
    expect(service.isAuthenticated()).toBeFalsy();
  });
});
```

---

## 📱 Pages

### Home Page (`/`)

- Landing page with feature overview
- Sign in button for unauthenticated users
- Dashboard link for authenticated users

### Login Page (`/login`)

- Email/password form with real-time validation
- OAuth provider buttons (Google, GitHub, Microsoft)
- Remember me checkbox
- Forgot password link
- Sign up link

### Auth Callback Page (`/auth/callback`)

- Loading spinner during OAuth processing
- Simulates OAuth callback handling
- Auto-redirects to dashboard after processing
- Displays countdown timer (3 seconds)

### Dashboard Page (`/dashboard`)

- Protected route (requires authentication)
- Display user profile information
- Show login provider and avatar
- Logout button

---

## 🎨 Styling

The application uses custom CSS utilities similar to Tailwind CSS:

- Gradient backgrounds
- Responsive grid layouts
- Utility classes for spacing, colors, and sizing
- Hover and focus states for interactive elements

All styles defined in `src/styles.css` and `src/design-tokens.css`.

---

## 🚀 Production Notes

### Security Considerations

⚠️ **This is a demonstration/simulation project**. For production use:

- ✅ Implement real OAuth 2.0 provider integration
- ✅ Use secure backend authentication server
- ✅ Store tokens securely (HTTP-only cookies, not local storage)
- ✅ Implement CSRF protection
- ✅ Use HTTPS only
- ✅ Add rate limiting on login attempts
- ✅ Implement proper password hashing (bcrypt)
- ✅ Add multi-factor authentication (MFA)
- ✅ Implement token refresh strategy
- ✅ Use secure session management

### Environment Configuration

Update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  api: {
    baseUrl: "https://api.example.com",
  },
  oauth: {
    mockOAuth: false, // Disable mock OAuth in production
    googleClientId: "your-google-client-id",
    githubClientId: "your-github-client-id",
    microsoftClientId: "your-microsoft-client-id",
  },
};
```

### Build for Production

```bash
# Build optimized production bundle
ng build --configuration production

# The build artifacts will be stored in the dist/ directory
# Deploy the contents of dist/angular-web-app-template/ to your server
```

---

## 📊 Comparison: Demo vs Production

| Aspect           | Demo (This Project) | Production              |
| ---------------- | ------------------- | ----------------------- |
| Authentication   | Simulated           | Real OAuth 2.0          |
| Token Storage    | Local Storage       | HTTP-only Cookies       |
| Backend          | Client-side only    | Backend server required |
| Security         | Educational         | Enterprise-grade        |
| API Calls        | Mocked delays       | Real API calls          |
| Password Hashing | Client-side         | Server-side bcrypt      |
| HTTPS            | Optional            | Required                |
| CSRF Protection  | Not implemented     | Implemented             |
| Rate Limiting    | Not implemented     | Implemented             |

---

## 🔗 Related Resources

| Resource         | Location                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| Quick Start      | [docs/getting-started/quickstart.md](../../getting-started/quickstart.md) |
| API Reference    | [docs/reference/api/services.md](../../reference/api/services.md)         |
| OAuth Overview   | [docs/guide/oauth/\_overview.md](_overview.md)                            |
| Deployment Guide | [docs/guide/deployment/production.md](../deployment/production.md)        |
| Code Examples    | [src/app/](../../../src/app/)                                             |

---

## ❓ Common Questions

### Q1: Can I use real OAuth providers?

**A**: Yes, this project can be extended to use real OAuth providers. You'll need to:

1. Register your application with OAuth providers (Google, GitHub, Microsoft)
2. Replace mock OAuth service with real provider SDK
3. Implement backend token validation
4. Store tokens securely in HTTP-only cookies

### Q2: How do I change the session timeout?

**A**: Edit `src/app/services/auth.service.ts` and modify the session expiry logic.

### Q3: How do I customize the login form?

**A**: Edit `src/app/components/login/login.component.ts` and `login.component.html`.

### Q4: Can I add more OAuth providers?

**A**: Yes, extend the `OAuthProvider` interface and add new provider buttons to the login form.

### Q5: How do I integrate with a real backend?

**A**: Replace the simulated API calls in `AuthService` with actual HTTP calls to your backend using `HttpClient`.

---

**Last Updated**: February 4, 2026  
**Version**: 1.0  
**Status**: ✅ Complete
