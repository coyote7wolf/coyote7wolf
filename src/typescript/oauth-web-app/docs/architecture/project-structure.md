\*\*\* End Patch

### OAuth Guide

- **File:** `docs/guide/oauth/implementation.md`
- **Content:** Feature overview, usage examples, API endpoints, security notes
- **Audience:** Feature users and integrators

### i18n Implementation

- **File:** `docs/guide/i18n/implementation.md`
- **Content:** Multi-language setup, translation keys, implementation details
- **Audience:** Developers working with internationalization

### Project Structure

- **File:** `docs/architecture/project-structure.md`
- **Content:** Complete overview, file listing, statistics

## Project Structure

Complete overview of the React + Next.js application structure and components.

---

## 📋 Summary

This repository contains a React 19 + Next.js 15 application with server-side rendering, internationalization, and Tailwind-based styling. Core patterns used:

- Next.js App Router for routing and layouts
- Tailwind CSS for utility-first styling
- i18next (react-i18next) for translations
- Zustand for client state

---

## 🎯 Key Pages & Components

- `src/app/page.tsx` — Home page (landing)
- `src/app/login/page.tsx` — Login page
- `src/app/register/page.tsx` — Registration page
- `src/app/dashboard/page.tsx` — Protected dashboard
- `src/components/navbar/navbar.tsx` — Navigation and language/theme controls
- `src/components/layout/client-layout.tsx` — Client-side initialization and providers

---

## 📁 File Layout (selected)

```
src/
  app/
    layout.tsx
    page.tsx
    login/page.tsx
    register/page.tsx
    dashboard/page.tsx
  components/
    layout/
    navbar/
  lib/
    auth.service.ts
    i18n.ts
    hydration.ts
  stores/
    auth.store.ts
    language.store.ts
public/
  locales/
    en/
    zh-CN/
    zh-TW/
    ar/
```

---

## 🔧 Technology Stack

- **Framework:** React 19 with Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **i18n:** i18next / react-i18next
- **State:** Zustand
- **Build:** Next.js (Webpack/Turbopack)
- **Node:** v18+

---

## 🚀 Getting Started (summary)

```bash
cd react-web-template
npm install
npm run dev
```

Open http://localhost:3000

---

## ✨ Key Features

- Email/password authentication and OAuth simulation
- Server-rendered initial HTML with client-side hydration safeguards
- Language switching with localStorage persistence
- Dark mode with `class` strategy and Tailwind support
- Footer pinned to the bottom via flex layout

---

## Development Notes

- `src/app/layout.tsx` is a server component that injects initial html/lang attributes.
- `src/components/layout/client-layout.tsx` initializes auth and language on mount and gates rendering to prevent hydration mismatches.
- `src/lib/i18n.ts` initializes i18next synchronously from `localStorage` to avoid flicker.

---

## Next Steps & Enhancements

- Integrate real OAuth providers (Google/GitHub/Microsoft)
- Connect to backend API and persistent storage
- Add end-to-end tests and CI pipelines

---

**Status:** Updated for React + Next.js (Feb 2026)

- Database persistence
