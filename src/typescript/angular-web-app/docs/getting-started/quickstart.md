# Quick Start Guide

Get the Angular OAuth simulation app running in 3 minutes!

## ⚡ TL;DR (Fastest Way to Start)

```bash
cd /Users/jackallin/Documents/self/repo/github/angular-web-app-template
npm install && npm start

# Browser will open automatically: http://localhost:4200/
```

✅ **Application started!** Click "Get Started" to login

---

## Prerequisites

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js)
- **Angular CLI**: v19 ([Install globally](https://angular.dev/cli))

## Quick Start Setup

### Step 1: Navigate to Project Directory

```bash
cd /Users/jackallin/Documents/self/repo/github/angular-web-app-template
```

### Step 2: Install Dependencies

```bash
npm install
```

Expected output:

```
added 948 packages
```

### Step 3: Start Development Server

Choose one of the following commands:

```bash
ng serve
```

Or:

```bash
npm start
```

Or specify a custom port (if 4200 is already in use):

```bash
ng serve --port 4201
```

### Step 4: Open Browser

Automatically opens: **http://localhost:4200/**

Or manually visit: **http://localhost:4200/**

✅ Complete! Application has started

---

## Local Testing Steps

### ✅ Test 1: Email Login

1. Click "Get Started" on homepage
2. Enter email: testuser@example.com
3. Enter password: password123 (minimum 6 characters)
4. Click "Sign in"
5. ✅ Should redirect to Dashboard

**Valid credentials:**

- Email: Any valid email format (e.g., `user@example.com`)
- Password: Minimum 6 characters

---

### ✅ Test 2: OAuth Providers (Google, GitHub, Microsoft)

1. Click any OAuth provider button
2. Mock OAuth callback process
3. ✅ Auto-login and redirect to Dashboard

---

### ✅ Test 3: Session Persistence

1. Login with any method
2. Refresh page (Cmd+R or Ctrl+R)
3. ✅ Still logged in - session has been saved

---

### ✅ Test 4: Route Protection

```javascript
// Open Dev Tools Console (Cmd+Option+J or F12)
// Execute:
localStorage.removeItem("auth_user");

// Then visit:
// http://localhost:4200/dashboard

// ✅ Should redirect to login page
```

---

### ✅ Test 5: Responsive Design

1. Open Dev Tools (F12)
2. Press Cmd+Shift+M to toggle mobile device mode
3. ✅ All cards and buttons have correct padding on each screen size
   - Mobile: 24px padding
   - Tablet: 32px padding
   - Desktop: 40px padding

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

| Command       | Purpose                           |
| ------------- | --------------------------------- |
| `ng serve`    | Start dev server (localhost:4200) |
| `ng build`    | Build for production              |
| `ng test`     | Run unit tests                    |
| `ng lint`     | Check code quality                |
| `npm install` | Install dependencies              |
| `npm update`  | Update packages                   |

---

## Troubleshooting

### Port 4200 Already in Use

```bash
ng serve --port 4201
```

### Module Not Found Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Browser Cache

Open Dev Tools → Settings → Network → Disable cache

### Reset Application State

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## Key Files to Edit

| File                                          | Purpose                |
| --------------------------------------------- | ---------------------- |
| `src/app/components/login/login.component.ts` | Login logic            |
| `src/app/services/auth.service.ts`            | Authentication service |
| `src/styles.css`                              | Global styles          |
| `src/app/app.routes.ts`                       | Application routes     |

---

## Environment Configuration

### Development

```bash
ng serve
# Uses environment.ts
```

### Production

```bash
ng build --configuration production
# Uses environment.prod.ts
```

---

## Project Structure

```
src/app/
├── components/       # UI Components
│   ├── home/        # Landing page
│   ├── login/       # Login form
│   ├── dashboard/   # User dashboard
│   └── auth-callback/ # OAuth callback
├── services/        # Business Logic
│   ├── auth.service.ts
│   ├── auth.guard.ts
│   └── mock-oauth.service.ts
├── app.routes.ts    # Routing
└── app.config.ts    # Configuration
```

---

## What's Included

✅ Standalone components (modern Angular)
✅ Reactive Forms with validation
✅ Route guards and protection
✅ OAuth simulation (Google, GitHub, Microsoft)
✅ Session management
✅ Responsive design
✅ RxJS observables
✅ TypeScript strict mode

---

## IDE Setup

### VS Code Extensions (Recommended)

- **Angular.ng-template** - Angular template support
- **esbenp.prettier-vscode** - Code formatter
- **dbaeumer.vscode-eslint** - ESLint integration

### Keyboard Shortcuts

- `Cmd/Ctrl + Shift + P` → Command Palette
- `Cmd/Ctrl + P` → Quick File Open
- `Cmd/Ctrl + G` → Go to Line
- `Cmd/Ctrl + /` → Comment Line

---

## Performance Tips

1. **Use Chrome Dev Tools**
   - Performance tab
   - Network tab
   - Application tab

2. **Bundle Analysis**

```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/angular-web-app-template/stats.json
```

3. **Source Maps**

```bash
ng serve --source-map
```

---

## Need Help?

1. **Check Errors**
   - Look in browser console (Dev Tools → Console)
   - Check terminal output

2. **Debug in VS Code**
   - Set breakpoints in code
   - Use VS Code Debugger

3. **Documentation**
   - [Angular.dev](https://angular.dev)
   - [MDN Web Docs](https://developer.mozilla.org)

---

## Next Steps

1. **Explore Components** - Read `src/app/components/login/login.component.ts`
2. **Customize Styling** - Edit `src/styles.css` for global styles
3. **Add Features** - Create new components with `ng generate component name`
4. **Production Deployment** - See [Production Deployment Guide](../guide/deployment/production.md)

---

## Complete Documentation

- 📖 [Installation Guide](./installation.md)
- 🌍 [i18n Implementation Guide](../guide/i18n/implementation.md)
- 🔐 [OAuth Implementation Guide](../guide/oauth/implementation.md)
- 📚 [Angular Documentation](https://angular.dev)

---

## Ready to Go! 🎉

Your Angular OAuth Simulation app is ready to run. Happy coding!

```bash
npm install && npm start
```

Then open: **http://localhost:4200/**

---

**Questions?** See the [Complete Documentation](../_index.md) for detailed guides.
