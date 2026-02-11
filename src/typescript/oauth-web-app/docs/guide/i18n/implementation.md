# i18n Implementation (React + Next.js)

This document describes how internationalization is implemented in this React + Next.js project using `i18next` and `react-i18next`. It explains the file layout, initialization strategy (synchronous localStorage detection to avoid flicker), language switching, and RTL support.

---

## Overview

This guide covers:

- Folder layout for translations
- How `i18next` is initialized in `src/lib/i18n.ts`
- Language switcher behavior and localStorage persistence
- RTL handling and `dir` attribute updates
- Best practices to avoid hydration mismatches

---

## File layout

Translations live under `public/locales/<lang>/` using the JSON namespace structure expected by `react-i18next`.

```
public/locales/
  en/common.json
  zh-CN/common.json
  zh-TW/common.json
  ar/common.json
```

Use the `common` namespace for shared UI strings (`common.home`, `common.login`, etc.).

---

## Initialization approach

This project initializes `i18next` from `src/lib/i18n.ts`. Key points:

- The initial language is read synchronously from `localStorage.getItem('app_language')` when running in the browser. If missing, it falls back to `en`.
- The code sets `document.documentElement.lang` and `document.documentElement.dir` early to avoid SSR/client mismatches.
- The `ClientLayout` component delays rendering interactive UI until language initialization completes to prevent hydration flicker.

Example (high-level):

```ts
// src/lib/i18n.ts
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "../../public/locales/en/common.json";

const resources = { en: { common: enCommon } /* ... */ };

const detectLanguageSync = () => {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("app_language");
  if (stored) {
    document.documentElement.lang = stored;
    document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
  }
  return stored || "en";
};

i18next
  .use(initReactI18next)
  .init({ resources, lng: detectLanguageSync(), fallbackLng: "en" });
export default i18next;
```

---

## Language switching (best practices)

When the user selects a language:

1. Persist the choice to `localStorage.setItem('app_language', lang)`.
2. Update `document.documentElement.lang` and `dir` immediately.
3. Call `i18n.changeLanguage(lang)` and await it so translations are loaded before updating visible state.
4. Only then update any client-side language store (e.g., Zustand) so components re-render with the new strings.

Example (in `LanguageSwitcher`):

```tsx
const handleLanguageChange = async (lang: string) => {
  if (typeof window !== "undefined") localStorage.setItem("app_language", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  await i18n.changeLanguage(lang);
  setLanguageStore(lang);
};
```

---

## Avoiding hydration mismatch

Hydration mismatches commonly occur when the server-rendered HTML uses a different language or `dir` value than the client. Mitigations used in this repo:

- Initialize `i18n` synchronously where possible and set `lang`/`dir` on `document.documentElement` early in a script injected by the server layout (`src/app/layout.tsx`).
- Gate rendering of client components that show translated strings until language initialization is complete (see `ClientLayout`).
- Avoid accessing `localStorage` during server render; guard it under `typeof window !== 'undefined'`.

---

## RTL support

- For RTL languages (like `ar`), set `document.documentElement.dir = 'rtl'` and add any Tailwind configs to support RTL if needed.
- Ensure layout components use `flex` and logical CSS properties so they adapt to direction changes.

---

## Namespaces and keys

Keep strings organized by namespace. Example `public/locales/en/common.json`:

```json
{
  "common": {
    "home": "Home",
    "login": "Login",
    "register": "Register"
  }
}
```

Use `useTranslation('common')` in components to access keys.

---

## Troubleshooting

- If strings flash in a wrong language on first load, verify that the inline server script (in `layout.tsx`) sets `document.documentElement.lang` based on `localStorage` before the client hydrates.
- If `i18n.changeLanguage` is slow, ensure translation JSON files are reachable under `public/locales/` and not blocked by routing or asset config.

---

## Summary

This project uses a synchronous localStorage-first i18n strategy + gated client rendering to provide a flicker-free language switching experience on Next.js. For additional integration examples, see `src/lib/i18n.ts`, `src/components/navbar/language-switcher.tsx`, and `src/components/layout/client-layout.tsx`.

## Step 3: Configure Application

In Next.js, ensure i18n is initialized early and that the server-rendered HTML sets `lang`/`dir` before client hydration. Typically this is done by:

- Adding a small inline script in `src/app/layout.tsx` (server layout) that reads `localStorage` and sets `document.documentElement.lang` / `dir`.
- Initializing `i18next` in `src/lib/i18n.ts` (client import) and importing it from client components that need translations.

Example inline script in `app/layout.tsx` (server):

```tsx
// In app/layout.tsx (server component)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const inline = `try{const l=localStorage.getItem('app_language'); if(l){document.documentElement.lang=l; document.documentElement.dir=(l==='ar'?'rtl':'ltr');}}catch(e){}`;
  return (
    <html>
      <head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: inline }} />
        {children}
      </body>
    </html>
  );
}
```

No Angular-style providers or `ApplicationConfig` are required in a Next.js app; configuration happens via the Next.js files and environment variables.
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";

// Translate Loader Factory
export function translateLoaderFactory(http: HttpClient): TranslateLoader {
return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

export const appConfig: ApplicationConfig = {
providers: [
provideHttpClient(),
...(TranslateModule.forRoot({
loader: {
provide: TranslateLoader,
useFactory: translateLoaderFactory,
deps: [HttpClient],
},
defaultLanguage: "en",
}).providers || []),
],
};

````

### Step 4: Use in Components

**Method 1: Using Translate Pipe (Recommended)**

```typescript
import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: "app-example",
  template: `
    <h1>{{ "navbar.home" | translate }}</h1>
    <p>{{ "common.welcome" | translate }}</p>
  `,
  standalone: true,
  imports: [TranslateModule],
})
export class ExampleComponent {}
````

**Method 2: Using Translation Service**

```typescript
import { Component, OnInit } from "@angular/core";
import { TranslationService } from "./services/translation.service";

@Component({
  selector: "app-example",
  template: `
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  `,
})
export class ExampleComponent implements OnInit {
  title = "";
  message = "";

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.translationService
      .onLanguageChange("navbar.home")
      .subscribe((translation: string) => {
        this.title = translation;
      });

    this.message =
      this.translationService.getInstantTranslation("common.welcome");
  }
}
```

**Method 3: Language Switcher Component**

```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslationService } from "../services/translation.service";

@Component({
  selector: "app-language-switcher",
  template: `
    <div class="language-switcher">
      <button
        *ngFor="let lang of languages"
        [class.active]="lang === currentLanguage"
        (click)="switchLanguage(lang)"
      >
        {{ lang }}
      </button>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .language-switcher {
        display: flex;
        gap: 8px;
      }
      button {
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      button.active {
        background-color: #007bff;
        color: white;
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  languages: string[] = [];
  currentLanguage = "";

  constructor(private translationService: TranslationService) {
    this.languages = translationService.getSupportedLanguages();
    this.currentLanguage = translationService.getCurrentLanguage();
  }

  switchLanguage(language: string): void {
    this.translationService.setLanguage(language);
    this.currentLanguage = language;
  }
}
```

---

## Translation Management

### File Structure Best Practices

```json
{
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password",
      "errors": {
        "invalidEmail": "Invalid email format",
        "weakPassword": "Password too weak"
      }
    }
  },
  "common": {
    "buttons": {
      "submit": "Submit",
      "cancel": "Cancel"
    },
    "errors": {
      "general": "An error occurred",
      "network": "Network error"
    }
  }
}
```

### Adding New Language

1. Create translation file in `src/assets/i18n/`
2. Copy existing structure and translate
3. Update Translation Service
4. Add to supported languages list
5. Update documentation

---

## Advanced Features

### Translation with Parameters

**In JSON:**

```json
{
  "messages": {
    "welcome": "Welcome {{name}}"
  }
}
```

**In Component:**

```typescript
// In template
<p>{{ 'messages.welcome' | translate: { name: userName } }}</p>

// In component
this.translate.get('messages.welcome', { name: this.userName })
  .subscribe(result => console.log(result));
```

### RTL Language Support

```typescript
export class AppComponent implements OnInit {
  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.translationService.onLanguageChange("any-key").subscribe(() => {
      this.updateDirection();
    });
  }

  private updateDirection(): void {
    const lang = this.translationService.getCurrentLanguage();
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
  }
}
```

---

## Best Practices

### Key Naming Conventions

```
✅ Good: auth.login.title, errors.validation.email
❌ Bad: key1, key2, translation, text
```

### Performance Tips

```typescript
// Avoid: Translating in loops
<div *ngFor="let item of items">
  {{ item.key | translate }}  // Bad performance
</div>

// Better: Pre-translate
<div *ngFor="let item of translatedItems">
  {{ item.label }}  // Better performance
</div>
```

### Testing Translations

```typescript
it("should set language", () => {
  translationService.setLanguage("zh-CN");
  expect(translationService.getCurrentLanguage()).toBe("zh-CN");
});

it("should support all languages", () => {
  const languages = translationService.getSupportedLanguages();
  expect(languages).toContain("en");
  expect(languages).toContain("ar");
});
```

---

## Common Issues

### Issue 1: Translation File Not Loading

**Problem:** "Translation file not found" error

**Solution:**

1. Verify file path in `angular.json`
2. Check `TranslateHttpLoader` configuration
3. Verify translation files exist

### Issue 2: Component Not Updating After Language Switch

**Problem:** Some components don't update when language changes

**Solution:**

```typescript
// Use translate pipe instead of instant
<h1>{{ 'title' | translate }}</h1>

// Or subscribe to changes
this.translationService.onLanguageChange('title')
  .subscribe(text => this.title = text);
```

### Issue 3: RTL Not Working

**Problem:** Arabic text displays as LTR

**Solution:**

```typescript
// Ensure TextDirection is updated
private updateTextDirection(language: string): void {
  const dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
}
```

---

## Related Documentation

- [Professional Standards](../../metadata/professional-standards.md)
- [Quick Start](../../getting-started/quickstart.md)
- [API Reference](../../reference/api/services.md)

---

**Last Updated:** February 4, 2026
**Version:** 2.0
**Status:** ✅ Complete
