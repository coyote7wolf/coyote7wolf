# ⚡ Performance Optimization

Performance optimization guide for this application.

---

## 📚 Table of Contents

- [Build Optimization](#build-optimization)
- [Runtime Performance](#runtime-performance)
- [Lazy Loading](#lazy-loading)
- [Change Detection](#change-detection)
- [Performance Monitoring](#performance-monitoring)

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
