# ⚡ Performance Optimization

Performance optimization guide for this application.

---

## 📚 Table of Contents

- [Build Optimization](#build-optimization)
- [Lazy Loading Implementation](#lazy-loading-implementation)
- [Code Splitting](#code-splitting)
- [Container/Presentational Components](#containerpresentational-components)
- [Runtime Performance](#runtime-performance)
- [Change Detection](#change-detection)
- [Performance Monitoring](#performance-monitoring)

---

## Lazy Loading Implementation

### Overview

Lazy loading defers the loading of route components until they are needed, reducing initial bundle size and improving page load performance.

### Current Implementation

All major routes are lazy-loaded in the application:

```typescript
// src/app/app.routes.ts
export const routes: Routes = [
  {
    path: "",
    component: HomeComponent, // Eagerly loaded (small component)
  },
  {
    path: "login",
    loadComponent: () => import("./components/login/login-container.component").then((m) => m.LoginContainerComponent),
  },
  {
    path: "register",
    loadComponent: () => import("./components/register/register-container.component").then((m) => m.RegisterContainerComponent),
  },
  {
    path: "dashboard",
    loadComponent: () => import("./components/dashboard/dashboard-container.component").then((m) => m.DashboardContainerComponent),
    canActivate: [authGuard],
  },
];
```

### Bundle Metrics

✅ **Initial Bundle:** 82.78 kB

- main.js: 52.58 kB
- styles.css: 15.66 kB
- Utilities: ~14.54 kB

✅ **Lazy Chunks (Loaded on Demand):**

| Route      | Component                   | Size     |
| ---------- | --------------------------- | -------- |
| /login     | LoginContainerComponent     | 44.82 kB |
| /register  | RegisterContainerComponent  | 38.47 kB |
| /dashboard | DashboardContainerComponent | 22.35 kB |

### Benefits

- ✅ Reduced initial page load time
- ✅ Only load code users actually need
- ✅ Better performance on slow networks
- ✅ Improved FCP (First Contentful Paint)
- ✅ Improved TTI (Time to Interactive)

---

## Container/Presentational Components

### Pattern Overview

The Container/Presentational (Smart/Dumb) component pattern separates business logic from UI rendering for better maintainability and testability.

### Components in This Project

#### Login Feature

- **login-container.component.ts** (Smart/Container)
  - Manages form state and validation
  - Handles login API calls
  - Manages navigation
  - No template HTML
- **login-form.component.ts** (Dumb/Presentational)
  - Pure UI rendering
  - Receives form via @Input
  - Emits events via @Output
  - Reusable in other contexts

#### Register Feature

- **register-container.component.ts** (Smart)
  - Form validation logic
  - Registration API calls
  - State management
- **register-form.component.ts** (Dumb)
  - Pure form UI
  - Input/Output bindings
  - Reusable component

#### Dashboard Feature

- **dashboard-container.component.ts** (Smart)
  - Fetch user data
  - Handle logout
  - Manage navigation
- **dashboard-view.component.ts** (Dumb)
  - Display user information
  - UI rendering only
  - Pure presentation

### Container vs Presentational

| Aspect       | Container             | Presentational          |
| ------------ | --------------------- | ----------------------- |
| Purpose      | Business logic & data | UI rendering            |
| State        | Manages               | Receives via @Input     |
| Side Effects | Handles               | None                    |
| Services     | Injects               | May use TranslateModule |
| Testability  | Unit tests            | Visual/snapshot tests   |
| Reusability  | Not reusable          | Highly reusable         |

### Example: Login Feature

**Container Component:**

```typescript
export class LoginContainerComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  async handleLogin(): Promise<void> {
    // Business logic
    const formData = this.loginForm.value;
    await this.authService.login(formData);
    this.router.navigate(["/dashboard"]);
  }
}
```

**Presentational Component:**

```typescript
export class LoginFormComponent {
  @Input() loginForm!: FormGroup;
  @Input() isLoading = false;
  @Output() loginSubmit = new EventEmitter<void>();

  handleLogin(): void {
    if (this.loginForm.invalid) return;
    this.loginSubmit.emit();
  }
}
```

### Benefits

- ✅ Separation of concerns
- ✅ Reusable UI components
- ✅ Easier unit testing
- ✅ Better code organization
- ✅ Clearer responsibility

---

## Build Optimization

### Code Splitting

```typescript
// ✅ Lazy load feature modules
export const routes: Routes = [
  {
    path: "admin",
    loadComponent: () => import("./admin/admin.component").then((m) => m.AdminComponent),
  },
];
```

### Production Build

```bash
# Build optimized production version
ng build --configuration production

# Check bundle size
npm run build -- --stats-json
```

### Preloading Strategy

```typescript
// ✅ Preload certain routes
export const routes: Routes = [
  {
    path: "dashboard",
    loadComponent: () => import("./dashboard/dashboard.component").then((m) => m.DashboardComponent),
    data: { preload: true },
  },
];

// Configure preloading
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules))],
};
```

---

## Runtime Performance

### Optimize Change Detection

```typescript
// ✅ Use OnPush strategy
@Component({
  selector: 'app-user-list',
  template: `<user-item *ngFor="let user of users"></user-item>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  @Input() users: User[] = [];
}

// ✅ Use immutable data
addUser(user: User): void {
  this.users = [...this.users, user];
}

// ❌ Avoid mutating data
// this.users.push(user);
```

### Unsubscribe Properly

```typescript
// ✅ Use takeUntil
export class UserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userService
      .getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ✅ Or use async pipe
@Component({
  template: `<p>{{ user$ | async | json }}</p>`,
})
export class UserComponent {
  user$ = this.userService.getUser();
}
```

### Event Delegation

```typescript
// ❌ Inefficient: Listener for each item
@Component({
  template: `
    <li *ngFor="let item of items">
      <button (click)="deleteItem(item.id)">Delete</button>
    </li>
  `,
})
export class ItemListComponent {
  items = new Array(1000).fill(null);
}

// ✅ Efficient: Event delegation
@Component({
  template: `
    <ul (click)="onListClick($event)">
      <li *ngFor="let item of items" [data-id]="item.id">
        {{ item.name }}
        <button data-action="delete">Delete</button>
      </li>
    </ul>
  `,
})
export class ItemListComponent {
  items = new Array(1000).fill(null);

  onListClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.dataset["action"] === "delete") {
      const id = target.closest("li")?.dataset["id"];
      this.deleteItem(id);
    }
  }
}
```

### Virtual Scrolling

```typescript
// ✅ Handle large lists efficiently
import { ScrollingModule } from "@angular/cdk/scrolling";

@Component({
  selector: "app-large-list",
  template: `
    <cdk-virtual-scroll-viewport itemSize="50">
      <div *cdkVirtualFor="let item of items">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
})
export class LargeListComponent {
  items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));
}
```

---

## Lazy Loading

### Route-Level Lazy Loading

```typescript
// ✅ Lazy load entire feature
export const routes: Routes = [
  {
    path: "admin",
    loadComponent: () => import("./admin/admin.component").then((m) => m.AdminComponent),
  },
];
```

### Conditional Lazy Loading

```typescript
// ✅ Load based on conditions
export class DashboardComponent implements OnInit {
  showAdvancedFeatures$ = this.userService.isAdmin$;

  ngOnInit(): void {
    this.userService.isAdmin$
      .pipe(
        switchMap((isAdmin) => {
          if (isAdmin) {
            return import("./admin-panel/admin-panel.component").then((m) => m.AdminPanelComponent);
          }
          return of(null);
        }),
      )
      .subscribe();
  }

  constructor(private userService: UserService) {}
}
```

---

## Change Detection

### Check Current Strategy

```typescript
import { ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-user-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  @Input() user: User | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdr.markForCheck();
  }
}
```

---

## Performance Monitoring

### Web Vitals

```typescript
// ✅ Monitor Core Web Vitals
import { getCLS, getFID, getLCP } from "web-vitals";

export function initWebVitals(): void {
  getCLS((metric) => console.log("CLS:", metric.value));
  getFID((metric) => console.log("FID:", metric.value));
  getLCP((metric) => console.log("LCP:", metric.value));
}
```

### Performance Audits

```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://example.com

# Build and audit
ng build --configuration production
lighthouse ./dist/app/index.html
```

---

## Performance Checklist

Before deployment:

- [ ] Enable Lazy Loading
- [ ] Use OnPush change detection
- [ ] Unsubscribe or use async pipe
- [ ] Use virtual scrolling for large lists
- [ ] Optimize bundle size (< 500KB gzip)
- [ ] Enable Gzip compression
- [ ] Enable tree shaking
- [ ] Remove unused code
- [ ] Optimize images
- [ ] Monitor Web Vitals

---

## Resources

- [Angular Performance](https://angular.io/guide/performance-best-practices)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Next**: [Contributing Guide](../../CONTRIBUTING.md)
