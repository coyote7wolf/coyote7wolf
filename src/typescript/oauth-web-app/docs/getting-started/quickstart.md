# Quick Start Guide

Get the React + Next.js web app running in 3 minutes!

## ⚡ TL;DR (Fastest Way to Start)

```bash
cd /Users/jackallin/Documents/self/repo/github/react-web-template
npm install
npm run dev

# Open http://localhost:3000/
```

✅ **Application started!** Open the URL above and click "Get Started" to log in.

---

## Prerequisites

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js) or Yarn/PNPM

## Quick Start Setup

### Step 1: Navigate to Project Directory

```bash
cd /Users/jackallin/Documents/self/repo/github/react-web-template
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

This starts the Next.js dev server on `http://localhost:3000` by default.

### Step 4: Open Browser

Open: **http://localhost:3000/**

✅ Complete! Application has started

---

## Local Testing Steps

### ✅ Test 1: Email Login

1. Click "Get Started" on homepage
2. Enter email: `testuser@example.com`
3. Enter password: `password123` (minimum 6 characters)
4. Click "Sign in"
5. ✅ Should redirect to Dashboard

### ✅ Test 2: OAuth Providers (Google, GitHub, Microsoft)

1. Click any OAuth provider button
2. Mock OAuth callback process
3. ✅ Auto-login and redirect to Dashboard

### ✅ Test 3: Session Persistence

1. Login with any method
2. Refresh page (Cmd+R or Ctrl+R)
3. ✅ Still logged in - session has been saved

### ✅ Test 4: Route Protection

```javascript
// Open Dev Tools Console (Cmd+Option+J or F12)
localStorage.removeItem("auth_user");

// Then visit:
// http://localhost:3000/dashboard

// ✅ Should redirect to login page
```

### ✅ Test 5: Responsive Design

1. Open Dev Tools (F12)
2. Toggle device toolbar to simulate mobile
3. ✅ Layout and spacing adjust correctly across breakpoints

---

## Pages You Will See

### 1. Home Page (`/`)

- Welcome screen with feature overview
- "Get Started" button to login
- "Dashboard" button if already logged in

### 2. Login Page (`/login`)

- Email/password form
- OAuth provider buttons (Google, GitHub, Microsoft)
- Form validation errors

### 3. Dashboard (`/dashboard`)

- Protected route (requires login)
- Display user profile
- Logout button

---

## Common Commands

| Command         | Purpose                           |
| --------------- | --------------------------------- |
| `npm run dev`   | Start dev server (localhost:3000) |
| `npm run build` | Build for production              |
| `npm start`     | Start production server           |
| `npm install`   | Install dependencies              |
| `npm run lint`  | Run linter                        |

---

## Troubleshooting

### Dev server port occupied

```bash
PORT=3001 npm run dev
```

### Module Not Found Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Browser Cache

Open Dev Tools → Network → Disable cache

### Reset Application State

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## Key Files to Edit

| File                               | Purpose                |
| ---------------------------------- | ---------------------- |
| `src/app/layout.tsx`               | Root layout and meta   |
| `src/components/navbar/navbar.tsx` | Navigation             |
| `src/app/login/page.tsx`           | Login page             |
| `src/lib/auth.service.ts`          | Authentication service |

---

## Environment Configuration

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

---

## Project Structure (overview)

```
src/
  app/              # Next.js App Router (pages and layouts)
  components/       # React components
  lib/              # Utilities and services
  stores/           # Zustand state management
  public/locales/   # Translation files
```

---

## What's Included

- React + Next.js App Router
- Tailwind CSS utility-first styling
- i18next / next-i18next for translations
- Zustand for lightweight state
- OAuth simulation and email/password auth

---

## IDE Setup

### VS Code Extensions (Recommended)

- **ESLint** - Linting
- **Prettier** - Formatting
- **Tailwind CSS IntelliSense** - Tailwind classes

---

## Performance Tips

1. Use browser DevTools: Performance & Network tabs
2. Analyze bundle with `next build` and tools like `webpack-bundle-analyzer`

---

## Need Help?

1. Check browser console and terminal output for errors
2. Use VS Code debugger for client code
3. See project documentation in `/docs`

---

## Next Steps

1. Explore components under `src/components`
2. Customize styling in `src/app/globals.css`
3. Add pages under `src/app`

---

## Complete Documentation

- 📖 [Installation Guide](./installation.md)
- 🌍 [i18n Guide](../guide/i18n/_overview.md)
- 🔐 [OAuth Guide](../guide/oauth/_overview.md)

---

## Ready to Go! 🎉

Start the app:

```bash
npm install && npm run dev
```

Open: **http://localhost:3000/**

```
---
```
