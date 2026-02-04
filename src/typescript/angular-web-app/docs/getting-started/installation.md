# Installation Guide

Complete step-by-step installation instructions for the Angular web app template.

---

## Overview

This guide covers:

- System requirements
- Project setup
- Dependency installation
- Running the application locally
- Troubleshooting common issues

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js**: v18+ (LTS recommended)

  ```bash
  node --version  # Should show v18.x.x or higher
  ```

- **npm**: v9+

  ```bash
  npm --version  # Should show v9.x or higher
  ```

- **Angular CLI**: v19+
  ```bash
  npm install -g @angular/cli
  ng version  # Should show v19.x
  ```

### Recommended

- **VS Code**: Latest version
- **Extensions:**
  - Angular Language Service
  - Prettier - Code formatter
  - ESLint
  - Thunder Client or REST Client

---

## Installation Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/angular-web-app-template.git

# Navigate to project directory
cd angular-web-app-template
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list | head -20
```

This installs:

- Angular Core (v19)
- RxJS (v7.8)
- TypeScript (v5.6)
- Angular Router
- Angular Forms
- And other required packages

### Step 3: Verify Environment

```bash
# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: v9.0.0 or higher

# Check Angular CLI version
ng version
# Expected: v19.x.x
```

### Step 4: Start Development Server

```bash
# Start the development server
ng serve --open

# Or without auto-opening browser
ng serve

# Then open browser manually
# Navigate to: http://localhost:4200
```

**Expected Output:**

```
✔ Compiled successfully.
✔ Bundling complete.
Local: http://localhost:4200/
```

### Step 5: Verify Application

1. Browser opens at `http://localhost:4200`
2. Home page displays with "Get Started" button
3. Navigation bar shows language switcher
4. No console errors (press F12 to check)

---

## Project Structure

```
angular-web-app-template/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── home/               # Home page
│   │   │   ├── login/              # Login form
│   │   │   ├── dashboard/          # Protected dashboard
│   │   │   ├── auth-callback/      # OAuth callback
│   │   │   ├── navbar/             # Navigation bar
│   │   │   └── language-switcher/  # Language selector
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Authentication
│   │   │   ├── auth.guard.ts       # Route protection
│   │   │   └── mock-oauth.service.ts  # OAuth simulation
│   │   ├── app.routes.ts           # Routing config
│   │   ├── app.config.ts           # App config
│   │   ├── app.component.ts        # Root component
│   │   └── app.component.html      # Root template
│   ├── assets/
│   │   └── i18n/                   # Translation files
│   │       ├── en.json
│   │       ├── zh-CN.json
│   │       └── ar.json
│   ├── main.ts                     # Application entry
│   ├── index.html                  # Main HTML
│   └── styles.css                  # Global styles
├── angular.json                    # Angular config
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
└── README.md                        # Project README
```

---

## Troubleshooting

### Issue: Node.js or npm not found

**Problem:**

```
command not found: node
```

**Solution:**

1. Download and install from [nodejs.org](https://nodejs.org)
2. Choose LTS version (v18+)
3. Restart terminal after installation
4. Verify: `node --version`

---

### Issue: Port 4200 already in use

**Problem:**

```
Port 4200 is already in use
```

**Solution:**

```bash
# Option 1: Use different port
ng serve --port 4201

# Option 2: Kill process using port 4200
# On macOS/Linux:
lsof -i :4200 | grep LISTEN | awk '{print $2}' | xargs kill -9

# On Windows:
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

---

### Issue: npm install fails

**Problem:**

```
npm ERR! code ERESOLVE
```

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Issue: Angular CLI not found

**Problem:**

```
command not found: ng
```

**Solution:**

```bash
# Install Angular CLI globally
npm install -g @angular/cli

# Or use npx to run locally
npx ng serve
```

---

### Issue: Build fails with TypeScript errors

**Problem:**

```
ng serve shows TypeScript compilation errors
```

**Solution:**

```bash
# Check TypeScript version
npx tsc --version

# Verify tsconfig.json syntax
cat tsconfig.json | head -20

# Clear build cache
rm -rf .angular/cache

# Try again
ng serve
```

---

## Verification Checklist

After installation, verify everything works:

- [ ] `node --version` shows v18+
- [ ] `npm --version` shows v9+
- [ ] `ng version` shows v19+
- [ ] `npm install` completes without errors
- [ ] `ng serve` starts successfully
- [ ] Browser opens at `http://localhost:4200`
- [ ] Home page displays correctly
- [ ] No errors in browser console (F12)
- [ ] Navigation bar shows language switcher
- [ ] "Get Started" button visible

---

## Next Steps

After successful installation:

1. **Explore the Home Page**
   - Click "Get Started" button
   - Review application features
   - Check responsive design

2. **Test Authentication**
   - Click "Sign in" button
   - Try email/password login
   - Try OAuth provider buttons
   - Check session persistence

3. **Review Documentation**
   - Read [Quick Start Guide](./quickstart.md)
   - Check [Architecture Guide](../architecture/system-design.md)
   - Review [API Reference](../reference/api/services.md)

4. **Development**
   - Review [Development Guide](../guide/development/environment-setup.md)
   - Check [OAuth Implementation](../guide/oauth/implementation.md)
   - Explore [i18n Guide](../guide/i18n/implementation.md)

---

## Common Commands

```bash
# Start development server
ng serve

# Build for production
ng build --configuration production

# Run unit tests
ng test

# Run with code coverage
ng test --code-coverage

# Generate new component
ng generate component components/my-component

# Generate new service
ng generate service services/my-service

# Check bundle size
ng build --stats-json
```

---

## Environment Variables

Create `.env` file in project root (if needed):

```bash
# Development environment
NG_BUILD_OPTIMIZER=false
NG_APP_ENV=development

# OAuth config (if using real OAuth)
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
```

---

## Performance Tips

### Initial Setup

```bash
# Install with npm ci (recommended for CI/CD)
npm ci

# Faster installation using npm workspaces
npm install --legacy-peer-deps
```

### Development Server

```bash
# Faster compilation
ng serve --poll=2000

# With source maps disabled
ng serve --source-map=false

# Production mode locally
ng serve --configuration production
```

---

## Related Documentation

- [Quick Start Guide](./quickstart.md) - Fast 5-minute setup
- [Development Guide](../guide/development/environment-setup.md) - Full setup details
- [Troubleshooting](../troubleshooting/common-issues.md) - Common problems and solutions
- [Architecture Guide](../architecture/system-design.md) - System design overview

---

**Last Updated:** February 4, 2026
**Version:** 2.0
**Status:** ✅ Complete
