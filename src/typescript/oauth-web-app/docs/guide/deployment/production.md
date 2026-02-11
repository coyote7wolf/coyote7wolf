# 🚀 Production Deployment Guide

This guide explains how to build and deploy the React + Next.js application to production. It covers local production build, Docker containerization, and recommended hosting (Vercel, Netlify, Azure, etc.).

---

## Quick Start

```bash
# Navigate to project
cd react-web-template

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Local Production Build

```bash
# Create an optimized production build
npm run build

# Start production server
npm start
```

By default Next.js serves on port `3000`. The build output is managed by Next.js (`.next/` directory) and static assets are in `public/`.

## Additional Troubleshooting & Notes

If you encounter issues specific to Next.js or the build pipeline, use the following checks and commands:

```bash
# Build locally
npm run build

# Start production server
npm start

# Run TypeScript checks
npx tsc --noEmit

# Check port usage (default 3000)
# Update TypeScript

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

If you migrated this repo from an older Angular-based template, archived Angular-era reports are available under `docs/archive/angular-legacy/` for historical reference.
npm install -g typescript@latest

# Check version

tsc --version

# Check project TypeScript

npx tsc --version

````

### ng Command Not Found

```bash
# Install Angular CLI globally
npm install -g @angular/cli@latest

# Or use local CLI
npx ng serve
````

### Build Fails

```bash
# Step 1: Check error message
# Step 2: Review git changes
git status
git diff

# Step 3: Revert changes
git checkout -- .

# Step 4: Reinstall dependencies
rm -rf node_modules
npm install

# Step 5: Try build again
ng build --configuration production
```

### Server Crashes

```bash
# Stop server
Ctrl + C

# Clear cache
npm cache clean --force

# Restart
ng serve
```

---

## 📊 Post-Deployment Monitoring

### Health Checks

Application is healthy if:

✅ `http://localhost:4200/` loads  
✅ No console errors (F12 → Console)  
✅ Styles load and display correctly  
✅ Forms work properly  
✅ Routes respond correctly

### Performance Metrics

Acceptable ranges:

- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### Lighthouse Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:4200 --output-path ./report.html

# Open report
open report.html
```

### Error Tracking

Implement error tracking (example with Sentry):

```typescript
// src/main.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: environment.production ? "production" : "development",
  tracesSampleRate: 1.0,
});
```

### Application Logs

```typescript
// Check browser logs
localStorage.getItem("auth_user"); // User data
console.log("App initialized"); // App status

// Use browser DevTools
// F12 → Console → check for errors
// F12 → Network → check for failed requests
// F12 → Application → check local storage
```

---

## 🔐 Security Checklist

- [ ] HTTPS enabled in production
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Dependencies up-to-date
- [ ] No sensitive data in code
- [ ] API endpoints secured
- [ ] Authentication tokens managed securely
- [ ] Error messages don't expose sensitive info
- [ ] Content Security Policy (CSP) configured

---

## 📋 Deployment Checklist

**Pre-Deployment**:

- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version number bumped

**Build**:

- [ ] Production build successful
- [ ] Bundle size acceptable
- [ ] No build warnings
- [ ] All assets included

**Testing**:

- [ ] Functional tests passed
- [ ] Performance acceptable
- [ ] Mobile testing done
- [ ] Cross-browser testing done

**Deployment**:

- [ ] Environment variables set
- [ ] Database migrations completed
- [ ] Secrets configured
- [ ] Health checks passing

**Post-Deployment**:

- [ ] Application loads
- [ ] All features working
- [ ] Monitoring active
- [ ] Logs accessible

---

## 🔗 Related Resources

| Resource          | Location                                                                           |
| ----------------- | ---------------------------------------------------------------------------------- |
| Quick Start       | [docs/getting-started/quickstart.md](../../getting-started/quickstart.md)          |
| Installation      | [docs/getting-started/installation.md](../../getting-started/installation.md)      |
| OAuth Guide       | [docs/guide/oauth/implementation.md](../oauth/implementation.md)                   |
| Development Guide | [docs/guide/development/environment-setup.md](../development/environment-setup.md) |
| README            | [README.md](../../../README.md)                                                    |

---

**Last Updated**: February 4, 2026  
**Version**: 1.0  
**Status**: ✅ Complete
