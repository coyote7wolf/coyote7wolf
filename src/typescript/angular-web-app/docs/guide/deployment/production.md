# 🚀 Production Deployment Guide

Complete guide to building, testing, and deploying your Angular application to production.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Running the Application](#running-the-application)
3. [Environment Configuration](#environment-configuration)
4. [Build Commands](#build-commands)
5. [Pre-Deployment Testing](#pre-deployment-testing)
6. [Production Build](#production-build)
7. [Docker Deployment](#docker-deployment)
8. [Cloud Deployment](#cloud-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Post-Deployment Monitoring](#post-deployment-monitoring)

---

## 🚀 Quick Start

### Development Environment

```bash
# Navigate to project directory
cd /Users/jackallin/Documents/self/repo/github/angular-web-app-template

# Install dependencies (one-time only)
npm install

# Start development server
ng serve
# or
npm start

# Open browser
http://localhost:4200
```

---

## 🏃 Running the Application

### Option 1: Development Server (Recommended for Development)

```bash
ng serve
# or
npm start
```

**Features**:

- ✅ Hot reload (changes auto-refresh)
- ✅ Source maps for debugging
- ✅ Faster rebuilds
- ✅ Development optimizations

**Access**: http://localhost:4200

### Option 2: Production Build

```bash
ng build --configuration production
# or
npm run build
```

**Output Directory**: `dist/angular-web-app-template/`

**Features**:

- ✅ Optimized bundle size
- ✅ Tree-shaking
- ✅ Minification
- ✅ Production optimizations

### Option 3: Build and Serve

```bash
# Build production bundle
ng build --configuration production

# Serve locally
npx http-server dist/angular-web-app-template/
```

**Access**: http://localhost:8080

---

## 🔧 Environment Configuration

### Development Environment

**File**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  api: {
    baseUrl: "http://localhost:4200",
  },
  session: {
    mockOAuth: true,
  },
};
```

### Production Environment

**File**: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  api: {
    baseUrl: "https://api.example.com",
  },
  session: {
    mockOAuth: false,
  },
};
```

---

## 📦 Build Commands

| Command                               | Purpose                       |
| ------------------------------------- | ----------------------------- |
| `ng serve`                            | Start dev server on port 4200 |
| `ng serve --port 4201`                | Start on custom port          |
| `ng build`                            | Build to dist folder          |
| `ng build --configuration production` | Production build              |
| `ng test`                             | Run unit tests                |
| `ng lint`                             | Check code quality            |
| `npm install`                         | Install dependencies          |
| `npm update`                          | Update packages               |

---

## ✅ Pre-Deployment Testing

### Build Verification

```bash
# 1. Clear any previous builds
rm -rf dist/

# 2. Build production bundle
ng build --configuration production

# 3. Check for errors
# Should see: "✔ Optimization complete"

# 4. Verify bundle size
ls -lh dist/angular-web-app-template/
```

### Unit Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --include='**/auth.service.spec.ts'

# Generate coverage report
npm test -- --code-coverage

# Watch mode (re-run on changes)
npm test -- --watch
```

### Functional Testing Checklist

- [ ] Run `ng build --configuration production` successfully
- [ ] No TypeScript errors
- [ ] All components render correctly
- [ ] Login form validation works
- [ ] OAuth buttons redirect properly
- [ ] Dashboard loads after login
- [ ] Route guards protect dashboard
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Responsive design works on mobile

### Manual Testing Workflow

```bash
# Start development server
ng serve

# Test each route
# http://localhost:4200/           # Home page
# http://localhost:4200/login      # Login page
# http://localhost:4200/dashboard  # Dashboard (protected)

# Test login with sample credentials
# Email: testuser@example.com
# Password: password123

# Test OAuth
# Click provider button
# Should redirect to /auth/callback?provider=xxx
# Should auto-redirect to /dashboard after 1.5 seconds

# Test session persistence
# Refresh page (Ctrl+R)
# Should remain on /dashboard

# Test logout
# Click Logout button
# Should redirect to /login page
```

### Browser Dev Tools Checks

```javascript
// Open browser console (F12 → Console)

// Check local storage for user data
localStorage.getItem("auth_user");
// Should return:
// {
//   "id": "user_xxxxx",
//   "email": "testuser@example.com",
//   "name": "testuser",
//   "provider": "email",
//   "avatar": "https://..."
// }

// Check for console errors
// Should see NO error messages

// Check styles loaded correctly
// Should see CSS applied to all components

// Check responsive design
// Open DevTools (F12)
// Toggle device toolbar (Ctrl+Shift+M)
// Resize window to test mobile view
```

---

## 🏭 Production Build

### Build Steps

```bash
# Step 1: Clean previous builds
rm -rf dist/

# Step 2: Install dependencies (if updated)
npm install

# Step 3: Build production bundle
ng build --configuration production

# Step 4: Verify build success
echo "Build completed successfully!"

# Step 5: Check output directory
ls -lh dist/angular-web-app-template/
```

### Build Output Structure

```
dist/angular-web-app-template/
├── index.html                  # Main entry point
├── styles.css                  # Global styles
├── main.js                     # Main bundle
├── runtime.js                  # Angular runtime
├── polyfills.js               # Browser polyfills
├── vendor.js                  # Third-party libraries
└── assets/
    ├── i18n/                  # Translation files
    │   ├── en.json
    │   ├── zh-CN.json
    │   ├── zh-TW.json
    │   └── ar.json
    └── images/                # Static images
```

### Bundle Size Analysis

```bash
# Generate bundle analysis
ng build --configuration production --stats-json

# Analyze with webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/angular-web-app-template/stats.json
```

---

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /app/dist ./dist
EXPOSE 4200
CMD ["http-server", "dist/angular-web-app-template/", "-p", "4200"]
```

### Build and Run Docker

```bash
# Build Docker image
docker build -t angular-web-app:latest .

# Run container
docker run -p 4200:4200 angular-web-app:latest

# Access application
# http://localhost:4200
```

### Docker Compose (Optional)

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "4200:4200"
    environment:
      - NODE_ENV=production
    volumes:
      - ./dist:/app/dist
```

---

## ☁️ Cloud Deployment

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build application
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist/angular-web-app-template
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

### GitHub Pages

```bash
# Build for GitHub Pages
ng build --configuration production --base-href="/angular-web-app-template/"

# Install angular-cli-ghpages
npm install -g angular-cli-ghpages

# Deploy
ngh --dir=dist/angular-web-app-template
```

### AWS S3 + CloudFront

```bash
# Build application
npm run build

# Sync to S3
aws s3 sync dist/angular-web-app-template/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Deploy
firebase deploy
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Use different port
ng serve --port 4201

# Or kill process using port
lsof -i :4200
kill -9 <PID>
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### TypeScript Errors

```bash
# Update TypeScript
npm install -g typescript@latest

# Check version
tsc --version

# Check project TypeScript
npx tsc --version
```

### ng Command Not Found

```bash
# Install Angular CLI globally
npm install -g @angular/cli@latest

# Or use local CLI
npx ng serve
```

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
