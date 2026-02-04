# i18n Internationalization Implementation

Complete guide to implementing multi-language support in Angular applications.

---

## Overview

This guide covers:

- i18n setup and configuration
- Translation file structure
- Language switching implementation
- RTL language support
- Best practices

---

## Supported Languages

The application supports the following languages:

| Language Code | Language Name       | Translation File | Status      |
| ------------- | ------------------- | ---------------- | ----------- |
| `en`          | English             | `en.json`        | ✅ Complete |
| `zh-CN`       | Simplified Chinese  | `zh-CN.json`     | ✅ Complete |
| `zh-TW`       | Traditional Chinese | `zh-TW.json`     | ✅ Complete |
| `ar`          | العربية (Arabic)    | `ar.json`        | ✅ Complete |

---

## Core Features

- ✅ Dynamic language switching (no page reload)
- ✅ Asynchronous translation file loading
- ✅ RTL language support (Arabic)
- ✅ Nested translation keys
- ✅ Default language setup
- ✅ Browser language auto-detection

---

## Prerequisites

### System Requirements

```bash
# Node.js version
node >= 18.0.0

# npm version
npm >= 9.0.0

# Angular version
@angular/core >= 19.0.0

# Translation library
@ngx-translate/core >= 17.0.0
@ngx-translate/http-loader >= 17.0.0
```

### Installation

```bash
# Install ngx-translate
npm install @ngx-translate/core @ngx-translate/http-loader

# Verify installation
npm list @ngx-translate/core
```

---

## Project Structure

```
src/
├── assets/
│   └── i18n/                    # Translation file directory
│       ├── en.json              # English translations
│       ├── zh-CN.json           # Simplified Chinese
│       ├── zh-TW.json           # Traditional Chinese
│       └── ar.json              # Arabic translations
├── app/
│   ├── services/
│   │   └── translation.service.ts   # i18n service
│   ├── components/
│   │   └── language-switcher/       # Language selector
│   └── app.config.ts                # App configuration
└── main.ts                      # Application entry
```

---

## Core Concepts

### Translation Module

Provides internationalization features and core functionality.

### Translation Service

Manages language switching, translation loading, and state management.

**Key Methods:**

```typescript
translateService.setDefaultLanguage("en"); // Set default
translateService.use("zh-CN"); // Switch language
translateService.get("key"); // Get translation
translateService.instant("key"); // Sync get
translateService.stream("key"); // Subscribe to changes
```

### Translation Loader

Loads translation data from JSON files.

```typescript
// HTTP Loader - loads from server
new TranslateHttpLoader(httpClient, "./assets/i18n/", ".json");
```

### Translation Key Structure

```json
{
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "register": "Register"
  },
  "common": {
    "welcome": "Welcome",
    "error": "Error"
  }
}
```

---

## Implementation Steps

### Step 1: Create Translation Files

**Location:** `src/assets/i18n/`

**Create `en.json`:**

```json
{
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "register": "Register"
  },
  "common": {
    "welcome": "Welcome",
    "error": "Error"
  },
  "navbar": {
    "home": "Home",
    "about": "About",
    "language": "Language"
  }
}
```

**Create `zh-CN.json`:**

```json
{
  "auth": {
    "login": "登录",
    "logout": "登出",
    "register": "注册"
  },
  "common": {
    "welcome": "欢迎",
    "error": "错误"
  },
  "navbar": {
    "home": "主页",
    "about": "关于",
    "language": "语言"
  }
}
```

### Step 2: Create Translation Service

**Location:** `src/app/services/translation.service.ts`

```typescript
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TranslationService {
  private readonly supportedLanguages = ["en", "zh-CN", "zh-TW", "ar"];
  private readonly defaultLanguage = "en";
  private readonly languageStorageKey = "app-language";

  constructor(private translate: TranslateService) {
    this.initialize();
  }

  /**
   * Initialize internationalization
   */
  private initialize(): void {
    this.translate.addLanguages(this.supportedLanguages);
    this.translate.setDefaultLanguage(this.defaultLanguage);

    const savedLanguage = this.getSavedLanguage();
    const language = this.getSupportedLanguage(savedLanguage);
    this.translate.use(language);
  }

  /**
   * Switch language
   */
  setLanguage(language: string): void {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Unsupported language: ${language}`);
      return;
    }

    this.translate.use(language);
    localStorage.setItem(this.languageStorageKey, language);
    this.updateTextDirection(language);
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.translate.currentLanguage || this.defaultLanguage;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  /**
   * Get translation (async)
   */
  getTranslation(key: string): Promise<string> {
    return this.translate.get(key).toPromise() as Promise<string>;
  }

  /**
   * Get translation (sync)
   */
  getInstantTranslation(key: string): string {
    return this.translate.instant(key);
  }

  /**
   * Subscribe to translation updates
   */
  onLanguageChange(key: string): Observable<string> {
    return this.translate.get(key);
  }

  /**
   * Get saved language
   */
  private getSavedLanguage(): string {
    return localStorage.getItem(this.languageStorageKey) || "";
  }

  /**
   * Get supported language
   */
  private getSupportedLanguage(language: string): string {
    if (this.supportedLanguages.includes(language)) {
      return language;
    }

    const browserLanguage = this.getBrowserLanguage();
    if (this.supportedLanguages.includes(browserLanguage)) {
      return browserLanguage;
    }

    return this.defaultLanguage;
  }

  /**
   * Get browser language
   */
  private getBrowserLanguage(): string {
    return navigator.language.split("-")[0];
  }

  /**
   * Update text direction (RTL/LTR)
   */
  private updateTextDirection(language: string): void {
    const htmlElement = document.documentElement;
    if (language === "ar") {
      htmlElement.setAttribute("dir", "rtl");
      htmlElement.setAttribute("lang", "ar");
    } else {
      htmlElement.setAttribute("dir", "ltr");
      htmlElement.setAttribute("lang", language);
    }
  }
}
```

### Step 3: Configure Application

**Location:** `src/app/app.config.ts`

```typescript
import { ApplicationConfig } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
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
```

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
```

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
    this.translationService.onLanguageChange("navbar.home").subscribe((translation: string) => {
      this.title = translation;
    });

    this.message = this.translationService.getInstantTranslation("common.welcome");
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
      <button *ngFor="let lang of languages" [class.active]="lang === currentLanguage" (click)="switchLanguage(lang)">
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
