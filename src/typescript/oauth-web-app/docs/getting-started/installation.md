# Installation Guide

Step-by-step installation instructions for the React + Next.js template.

## Requirements

- Node.js 18+ and npm (or yarn)

## Install

```bash
# Clone repo
git clone <repo-url>
cd react-web-template

# Install dependencies
npm install

# Run development server
npm run dev
```

This project uses Next.js (App Router), Tailwind CSS for styling, i18next for localization, and Zustand for lightweight state.

---

## Overview

This guide covers:

- System requirements
- Project setup
- Dependency installation
- Running the application locally
- Troubleshooting common issues

---

````markdown
# Installation Guide

Complete step-by-step installation instructions for the React + Next.js web app.

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

### Recommended

- **VS Code**: Latest version
- **Extensions:**
  - ESLint
  - Prettier - Code formatter
  - Tailwind CSS IntelliSense

---

## Installation Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/react-web-template.git

# Navigate to project directory
cd react-web-template
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

This project includes:

- React
- Next.js (App Router)
- Tailwind CSS
- i18next / next-i18next
- Zustand

### Step 3: Verify Environment

```bash
# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: v9.0.0 or higher
```

### Step 4: Start Development Server

```bash
npm run dev
```

This starts the Next.js dev server on `http://localhost:3000` by default.

**Expected Output:**

```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 5: Verify Application

1. Browser opens at `http://localhost:3000`
2. Home page displays with "Get Started" or primary CTA
3. Navigation bar shows language switcher
4. No console errors (press F12 to check)

---

## Project Structure

```
react-web-template/
├── src/
│   ├── app/                # Next.js App Router (layouts/pages)
│   ├── components/         # React components
│   ├── lib/                # Utilities and services
│   ├── stores/             # Zustand stores
│   └── public/locales/     # Translation files
├── package.json
├── tailwind.config.ts
├── postcss.config.cjs
└── README.md
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

### Issue: Dev server port occupied

**Problem:**

```
Port 3000 is already in use
```

**Solution:**

```bash
# Use different port
PORT=3001 npm run dev

# Or kill process using the port
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
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

### Issue: Build fails with TypeScript errors

**Problem:**

```
npm run build shows TypeScript compilation errors
```

**Solution:**

```bash
# Check TypeScript version
npx tsc --version

# Verify tsconfig.json syntax
cat tsconfig.json | head -20

# Try again
npm run build
```

---

## Verification Checklist

After installation, verify everything works:

- [ ] `node --version` shows v18+
- [ ] `npm --version` shows v9+
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts successfully
- [ ] Browser opens at `http://localhost:3000`
- [ ] Home page displays correctly
- [ ] No errors in browser console (F12)
- [ ] Language switcher works

---

## Next Steps

After successful installation:

1. **Explore the Home Page**

- Click primary CTA
- Review application features
- Check responsive design

2. **Test Authentication**

- Try email/password login
- Try OAuth provider buttons (mock)
- Check session persistence

3. **Review Documentation**

- Read [Quick Start Guide](./quickstart.md)
- Check [Architecture Guide](../architecture/system-design.md)
- Review [API Reference](../reference/api/services.md)

4. **Development**

- Review [Development Guide](../guide/development/environment-setup.md)
- Check [OAuth Implementation](../guide/oauth/implementation.md)
- Explore [i18n Guide](../guide/i18n/_overview.md)

---

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run unit tests
npm test

# Analyze bundle
npm run build && npx webpack-bundle-analyzer .next/stats.json
```

---

## Environment Variables

Create `.env.local` file in project root (if needed):

```bash
# Development environment
NEXT_PUBLIC_API_URL=http://localhost:4000

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

# Use pnpm for faster installs (optional)
pnpm install
```

### Development Server

```bash
# Start dev server with custom port
PORT=3001 npm run dev
```

---

## Related Documentation

- [Quick Start Guide](./quickstart.md) - Fast 3-minute setup
- [Development Guide](../guide/development/environment-setup.md) - Full setup details
- [Troubleshooting](../troubleshooting/common-issues.md) - Common problems and solutions
- [Architecture Guide](../architecture/system-design.md) - System design overview
````

ng test
