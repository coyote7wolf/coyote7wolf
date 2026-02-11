# Quick Start Guide

## React + Next.js Web App

This is a modern React + Next.js web application with Server-Side Rendering (SSR), React Server Components (RSC), and internationalization (i18n) support.

### What's New?

✨ **No Hydration Jitter (Seamless Rendering)**

- Uses React Server Components to render initial HTML on server
- Client-side state initialized only after hydration
- Smooth page transitions without flashing

🚀 **Performance Optimized**

- SSR for instant first paint
- Automatic code splitting
- Smaller JS bundle than Angular
- Built-in image optimization

🌍 **Multi-Language Support**

- 4 languages: English, Simplified Chinese, Traditional Chinese, Arabic
- RTL (Right-to-Left) support for Arabic
- Server-side translation loading

🔐 **Authentication Ready**

- Email/password login
- OAuth providers (Google, GitHub, Microsoft)
- Protected routes with middleware
- Persistent auth state

### Prerequisites

- Node.js 18.17+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env.local file (copy from .env.example)
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Building for Production

```bash
npm run build
npm start
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Project Structure

```
src/
  app/              # Next.js App Router
  components/       # React components
  lib/              # Utilities and services
  stores/           # Zustand state management
  middleware.ts     # Auth middleware
```

## Key Features

### Authentication

**Login:**

1. Go to http://localhost:3000/login
2. Enter email and password (any valid email, password > 6 chars)
3. Or use OAuth buttons (mock)

**Protected Routes:**

- `/dashboard` - requires authentication
- Middleware redirects to login if not authenticated

### Language Switching

- Click language selector in navbar (🌐)
- Select from: English, Chinese Simplified, Chinese Traditional, Arabic
- Language preference saved in localStorage
- RTL layout applied for Arabic

### Water Hydration Prevention

The app prevents hydration jitter through:

1. **Root Layout** (Server Component)
   - Renders HTML structure on server
   - Passes locale and metadata

2. **Client Layout** (Client Component)
   - Wraps client-interactive content
   - Initializes state after hydration
   - No state reading during initial render

3. **Middleware**
   - Handles auth before page render
   - Prevents redirect loops

**Result:** Initial HTML matches what React expects after hydration - no flashing or re-rendering!

## Testing

### Manual Testing Checklist

- [ ] Home page loads without warnings
- [ ] Login with email/password works
- [ ] OAuth login buttons work
- [ ] Language switching updates UI
- [ ] Logout clears session
- [ ] Dashboard shows user info
- [ ] Protected routes redirect properly
- [ ] Arabic RTL layout looks correct
- [ ] Mobile responsive design

### Browser DevTools Tips

1. Open Console (F12)
2. Look for "hydration" warnings - there should be none!
3. Check Network tab for page load
4. Test RTL in Firefox (more RTL-friendly)

## Troubleshooting

### Page shows loading indefinitely

- Check browser console for errors
- Verify localStorage is enabled
- Clear cache and reload

### Language doesn't change

- Ensure localStorage is enabled
- Check browser console for errors
- Verify translation files exist in `public/locales/`

### Dashboard shows "Loading..."

- Check if authenticated (login first)
- Check browser localStorage for `auth_user`
- Verify auth state in Zustand store

### Hydration warnings

- Check `useEffect` hooks are only reading state after mount
- Verify no direct localStorage access during render
- Check suppressHydrationWarning placement

## API Integration

Currently uses mock authentication. To integrate real API:

1. Update `src/lib/auth.service.ts`
2. Replace mock login/OAuth with real API calls
3. Update `src/middleware.ts` to validate tokens
4. Add environment variables for API endpoints

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Connect to Vercel at vercel.com
# Automatic deployment on push
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

Set these in your deployment platform:

```
NEXT_PUBLIC_APP_NAME=React Web App
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
```

## Performance Metrics

Target metrics:

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

Monitor in Lighthouse (Chrome DevTools).

## Documentation

- [Architecture](./MIGRATION.md) - Deep dive into migration from Angular
- [Next.js Docs](https://nextjs.org)
- [React Docs](https://react.dev)
- [next-i18next Docs](https://next-i18next.com)

## Support

For issues or questions:

1. Check browser console for errors
2. Review MIGRATION.md for architecture
3. Check Next.js docs for framework features

---

**Happy coding! 🚀**
