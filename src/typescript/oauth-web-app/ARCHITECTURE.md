# System Architecture

## Application Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Client                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Initial Page Load:                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Browser receives HTML from server (SSR)               │   │
│  │ 2. HTML includes:                                        │   │
│  │    - Correct language context                            │   │
│  │    - Home content structure                              │   │
│  │    - Navbar structure                                    │   │
│  │ 3. Browser renders HTML immediately (FCP)               │   │
│  │ 4. JavaScript loads (React bundle ~42KB)                │   │
│  │ 5. React hydrates page (no re-render!)                  │   │
│  │ 6. Interactive features enabled                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  React Components:                                               │
│  ├── RootLayout (Server Component)                               │
│  │   └── ClientLayout (Client Component)                         │
│  │       ├── Navbar                                              │
│  │       │   ├── Logo                                            │
│  │       │   ├── Navigation Links                                │
│  │       │   └── LanguageSwitcher                                │
│  │       └── Page Content (dynamic)                              │
│  │           ├── HomePage                                        │
│  │           ├── LoginPage                                       │
│  │           ├── RegisterPage                                    │
│  │           ├── DashboardPage (protected)                       │
│  │           └── AuthCallbackPage                                │
│  │                                                               │
│  State Management (Zustand):                                     │
│  ├── useAuthStore                                                │
│  │   ├── user: User | null                                       │
│  │   └── isAuthenticated: boolean                                │
│  └── useLanguageStore                                            │
│      └── language: string                                        │
│                                                                   │
│  Storage:                                                        │
│  ├── localStorage:                                               │
│  │   ├── auth_user (JSON)                                        │
│  │   ├── auth_remember (boolean)                                 │
│  │   └── app_language (string)                                   │
│  └── Cookie:                                                     │
│      └── auth_user (for middleware)                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                     HTTP Request/Response
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Server                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Request Handling:                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Next.js Server receives request                          │   │
│  │ ↓                                                        │   │
│  │ Middleware (middleware.ts)                               │   │
│  │   - Check auth_user cookie                               │   │
│  │   - Protect routes (/dashboard)                          │   │
│  │   - Redirect if needed                                   │   │
│  │ ↓                                                        │   │
│  │ Route Handler (App Router)                               │   │
│  │   - /       → RootLayout + HomePage                      │   │
│  │   - /login  → RootLayout + LoginPage                     │   │
│  │   - /dashboard → RootLayout + DashboardPage              │   │
│  │ ↓                                                        │   │
│  │ React Server Components (RSC) render                      │   │
│  │   - All markup generated on server                        │   │
│  │   - Language context injected                             │   │
│  │ ↓                                                        │   │
│  │ HTML sent to client                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  2. File System Structure:                                       │
│  ├── src/app/                  (App Router)                      │
│  │   ├── layout.tsx            (Root RSC)                        │
│  │   ├── page.tsx              (Home page RSC)                   │
│  │   ├── login/page.tsx        (Login page RSC)                  │
│  │   ├── register/page.tsx     (Register page RSC)               │
│  │   ├── dashboard/page.tsx    (Dashboard page RSC)              │
│  │   ├── auth/callback/page.tsx (Callback handler)               │
│  │   ├── api/example/route.ts  (API route example)               │
│  │   └── globals.css                                             │
│  │                                                               │
│  └── src/components/           (React Components)                │
│      ├── layout/client-layout.tsx   (Client Component)           │
│      ├── pages/               (Page-level components)            │
│      │   ├── home.tsx                                            │
│      │   ├── login.tsx                                           │
│      │   ├── register.tsx                                        │
│      │   ├── dashboard.tsx                                       │
│      │   └── auth-callback.tsx                                   │
│      └── navbar/              (Navigation components)            │
│          ├── navbar.tsx                                          │
│          └── language-switcher.tsx                               │
│                                                                   │
│  3. Services & Utilities:                                        │
│  ├── src/lib/                                                    │
│  │   ├── auth.service.ts      (Auth business logic)              │
│  │   ├── i18n.utils.ts        (i18n utilities)                   │
│  │   ├── hydration.ts         (Anti-jitter utilities)            │
│  │   └── config.ts            (Configuration)                    │
│  │                                                               │
│  └── src/stores/              (Zustand stores)                   │
│      ├── auth.store.ts         (Auth state)                      │
│      └── language.store.ts     (Language state)                  │
│                                                                   │
│  4. Middleware:                                                  │
│  └── src/middleware.ts         (Route protection)                │
│      - Checks authentication                                     │
│      - Protects /dashboard                                       │
│      - Redirects unauthenticated users                           │
│                                                                   │
│  5. Configuration:                                               │
│  ├── next.config.ts            (Next.js config)                  │
│  ├── next-i18next.config.js    (i18n config)                     │
│  ├── tsconfig.json             (TypeScript config)               │
│  └── package.json              (Dependencies)                    │
│                                                                   │
│  6. Static Assets:                                               │
│  ├── public/locales/           (i18n translation files)          │
│  │   ├── en/common.json                                          │
│  │   ├── zh-CN/common.json                                       │
│  │   ├── zh-TW/common.json                                       │
│  │   └── ar/common.json                                          │
│  └── public/                   (Static files)                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User Input (Login Page)
    ↓
handleSubmit()
    ↓
AuthService.login(credentials)
    ↓
Validate email & password
    ↓
Create mock user
    ↓
Store in localStorage (auth_user)
    ↓
Store cookie (auth_user) → sent to middleware
    ↓
Update Zustand store (useAuthStore)
    ↓
useRouter.push('/dashboard')
    ↓
Middleware validates cookie
    ↓
Dashboard page renders
    ↓
Show user information
```

### Language Switch Flow

```
User clicks language dropdown
    ↓
LanguageSwitcher detects selection
    ↓
handleLanguageChange(newLang)
    ↓
setLanguage(newLang) → Zustand store
    ↓
i18n.changeLanguage(newLang)
    ↓
Save to localStorage (app_language)
    ↓
Update HTML dir attribute (RTL for Arabic)
    ↓
Update translations in real-time
    ↓
No page reload needed (CSR)
```

### Page Rendering Flow (SSR)

```
Browser requests page
    ↓
Next.js Server receives request
    ↓
Middleware checks auth
    ↓
App Router matches route
    ↓
RootLayout (RSC) renders
    - Generates <html> and <body>
    - Passes ClientLayout wrapper
    ↓
Page Component (RSC) renders
    - Generates page content
    - Injects language context
    ↓
ClientLayout (CC) wraps content
    - Initializes in useEffect
    - No state read during SSR
    ↓
Next.js generates HTML string
    ↓
Send HTML to browser
    ↓
Browser renders HTML (FCP achieved!)
    ↓
JavaScript bundle loads
    ↓
React hydrates page
    ↓
Interactive features enabled
```

## Water Hydration (抖動) Prevention

### Problem Flow (Angular)

```
Browser loads empty page
    ↓
Shows blank white screen
    ↓
JavaScript downloads and parses (2-4 seconds)
    ↓
Angular initializes
    ↓
Components render
    ↓
Page becomes visible (visible to user! JITTER!)
    ↓
Auth state loads from localStorage
    ↓
Page re-renders with user data
    ↓
User sees flash/flicker
```

### Solution Flow (React + Next.js)

```
HTML Request
    ↓
Server renders complete HTML
    - RootLayout (RSC)
    - PageContent (RSC)
    - Navbar structure
    - Correct language
    ↓
Browser receives HTML
    ↓
Display HTML immediately (FCP!)
    ↓
JavaScript loads silently
    ↓
React hydrates page
    - useEffect() loads auth state
    - useEffect() loads language
    - State matches HTML (no mismatch!)
    ↓
Interactive features enabled
    ↓
NO VISIBLE JITTER! ✅
```

## Component Types

### Server Components (RSC)

```typescript
// src/app/layout.tsx
export default async function RootLayout({ children }) {
  // Runs on server only
  // Can fetch data without waterfall
  // No JavaScript sent to client
  return (
    <html>
      <ClientLayout>
        {children}
      </ClientLayout>
    </html>
  );
}
```

**Benefits:**

- Keep secrets safe (API keys)
- Direct database access
- Rendered on server
- No JavaScript for this component
- Faster page loads

### Client Components

```typescript
// src/components/navbar/language-switcher.tsx
"use client";

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  // Runs in browser
  // Can use hooks
  // Can read localStorage
  // Can respond to events
}
```

**Benefits:**

- Interactivity with hooks
- Event listeners
- Browser APIs
- State management
- Real-time updates

## State Management Architecture

```
Zustand Stores (Client-side)
    ├── useAuthStore
    │   ├── user: User | null
    │   ├── isAuthenticated: boolean
    │   ├── setUser(user)
    │   └── logout()
    └── useLanguageStore
        ├── language: string
        └── setLanguage(lang)

Initialized in:
    └── ClientLayout.useEffect()
        ├── localStorage.getItem('auth_user')
        ├── localStorage.getItem('app_language')
        └── Update Zustand stores

Used in:
    ├── LoginPage
    │   └── setUser() after login
    ├── DashboardPage
    │   └── Display user info
    ├── LanguageSwitcher
    │   └── Update language
    └── NavBar
        └── Show/hide auth links
```

## Request/Response Cycle

### Initial Page Load

```
1. Browser makes request: GET /

2. Next.js Server:
   - Middleware checks auth cookie
   - Routes to RootLayout + HomePage
   - Renders components to HTML
   - Sends response with HTML + JS bundle

3. Browser:
   - Receives HTML (17KB)
   - Parses and displays HTML
   - Loads JavaScript (42KB)
   - React hydrates page
   - Initializes state in useEffect
   - Page becomes interactive
```

### After Hydration

```
1. User clicks Login

2. LoginPage (Client Component):
   - Collects form input
   - Calls AuthService.login()

3. AuthService:
   - Validates credentials
   - Creates user object
   - Stores in localStorage

4. LoginPage:
   - setUser() → Zustand store
   - Sets cookie → sent with next request
   - router.push('/dashboard')

5. Next.js:
   - Middleware validates cookie
   - Routes to DashboardPage
   - Renders page HTML

6. DashboardPage:
   - Reads user from Zustand store
   - Displays user information
```

## Performance Optimizations

```
┌─────────────────────────────────────────┐
│    Performance Optimization Layers      │
├─────────────────────────────────────────┤
│ 1. Server-Side Rendering (SSR)          │
│    → Faster FCP, SEO benefit             │
│ 2. React Server Components (RSC)        │
│    → Less JavaScript to client           │
│ 3. Code Splitting (Automatic)           │
│    → Load code per route                 │
│ 4. Image Optimization (Built-in)        │
│    → Responsive images                   │
│ 5. CSS Modules                          │
│    → Scoped CSS, no conflicts            │
│ 6. Cache Headers                        │
│    → Immutable assets cached             │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
Local Development
└── npm run dev
    └── Next.js dev server (localhost:3000)

Production Build
└── npm run build
    └── .next/ folder generated
        ├── Static pages (.html)
        ├── JavaScript bundles
        ├── Images optimized
        └── Source maps

Production Runtime
└── npm start
    └── Node.js server
        ├── Middleware runs
        ├── RSC rendering
        ├── API routes
        └── Static file serving

Cloud Deployment (Vercel/AWS/Docker)
└── Automatic scaling
    ├── Edge functions (middleware)
    ├── Serverless functions (API)
    └── Static CDN (assets)
```

---

## Summary

This architecture provides:

✅ **No Hydration Jitter** - RSC + SSR  
✅ **Fast Page Loads** - Server rendering  
✅ **Small Bundle** - React 42KB vs Angular 250KB+  
✅ **Smooth Interactions** - Client components with hooks  
✅ **Easy State Management** - Zustand simplicity  
✅ **Multi-language Support** - next-i18next with SSR  
✅ **Secure Auth** - Middleware protection  
✅ **Scalable** - Works on any platform
