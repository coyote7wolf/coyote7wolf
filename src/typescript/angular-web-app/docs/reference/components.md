# 🎨 Components Reference

Complete reference for all components in this application.

---

## 📚 Table of Contents

- [Components List](#components-list)
- [Shared Components](#shared-components)
- [Page Components](#page-components)
- [Component Communication](#component-communication)

---

## Components List

| Component                     | Location                        | Description       | Route            |
| ----------------------------- | ------------------------------- | ----------------- | ---------------- |
| **AppComponent**              | `app.component.ts`              | Root component    | -                |
| **HomeComponent**             | `components/home/`              | Home page         | `/`              |
| **LoginComponent**            | `components/login/`             | Login page        | `/login`         |
| **RegisterComponent**         | `components/register/`          | Registration page | `/register`      |
| **DashboardComponent**        | `components/dashboard/`         | Dashboard         | `/dashboard`     |
| **NavbarComponent**           | `components/navbar/`            | Navigation bar    | -                |
| **LanguageSwitcherComponent** | `components/language-switcher/` | Language switcher | -                |
| **AuthCallbackComponent**     | `components/auth-callback/`     | OAuth callback    | `/auth-callback` |

---

## Shared Components

### NavbarComponent

Navigation bar displayed on all pages.

**Location**: `src/app/components/navbar/`

**Features**:

- Display navigation menu
- User authentication status
- User menu (login/logout)
- Language switcher

**Usage**:

```html
<app-navbar></app-navbar>
```

---

### LanguageSwitcherComponent

Allows users to select application language.

**Location**: `src/app/components/language-switcher/`

**Supported Languages**:

- English (en)
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)
- Arabic (ar)

**Usage**:

```html
<app-language-switcher></app-language-switcher>
```

---

## Page Components

### HomeComponent

Welcome page for the application.

**Route**: `/`

**Features**:

- Welcome message
- Application overview
- Quick navigation links

---

### LoginComponent

User login page.

**Route**: `/login`

**Features**:

- Email/password form
- OAuth login options
- Error handling
- Redirect to dashboard

**OAuth Providers**:

- Google
- GitHub
- Microsoft

**Form Validation**:

- Email format validation
- Password required validation
- Display error messages

---

### RegisterComponent

User registration page.

**Route**: `/register`

**Features**:

- Registration form
- Password confirmation
- Email validation
- Auto-login new users

**Form Validation**:

- Email format
- Password strength
- Password matching
- Terms acceptance

---

### DashboardComponent

User dashboard (protected route).

**Route**: `/dashboard`

**Protected**: Yes (AuthGuard)

**Features**:

- Display user information
- Welcome message
- Personalized content

---

### AuthCallbackComponent

Handles OAuth provider callback.

**Route**: `/auth-callback`

**Features**:

- Handle OAuth callback
- Extract authorization code
- Exchange for access token
- Redirect to dashboard

---

## Component Communication

### Parent to Child

Using `@Input()`:

```typescript
// Parent component
@Component({
  selector: "app-parent",
  template: `<app-child [message]="parentMessage"></app-child>`,
})
export class ParentComponent {
  parentMessage = "Hello Child";
}

// Child component
@Component({
  selector: "app-child",
  template: `<p>{{ message }}</p>`,
})
export class ChildComponent {
  @Input() message: string = "";
}
```

### Child to Parent

Using `@Output()`:

```typescript
// Child component
@Component({
  selector: "app-child",
  template: `<button (click)="sendMessage()">Click</button>`,
})
export class ChildComponent {
  @Output() messageEvent = new EventEmitter<string>();

  sendMessage() {
    this.messageEvent.emit("Hello Parent");
  }
}

// Parent component
@Component({
  selector: "app-parent",
  template: `<app-child (messageEvent)="onMessage($event)"></app-child>`,
})
export class ParentComponent {
  onMessage(message: string) {
    console.log(message);
  }
}
```

### Via Service

```typescript
// Shared service
@Injectable({
  providedIn: "root",
})
export class DataService {
  private dataSubject = new Subject<string>();
  data$ = this.dataSubject.asObservable();

  sendData(data: string) {
    this.dataSubject.next(data);
  }
}

// Component 1
export class Component1 {
  constructor(private dataService: DataService) {}

  sendData() {
    this.dataService.sendData("Hello Component2");
  }
}

// Component 2
export class Component2 {
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.data$.subscribe((data) => {
      console.log(data);
    });
  }
}
```

---

## Lifecycle Hooks

Common Angular lifecycle hooks:

| Hook                    | Purpose                      |
| ----------------------- | ---------------------------- |
| `ngOnInit`              | Initialize component         |
| `ngOnChanges`           | Detect input changes         |
| `ngDoCheck`             | Custom change detection      |
| `ngAfterContentInit`    | After content initialization |
| `ngAfterContentChecked` | After content check          |
| `ngAfterViewInit`       | After view initialization    |
| `ngAfterViewChecked`    | After view check             |
| `ngOnDestroy`           | Cleanup before destroy       |

**Example**:

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  ngOnInit() {
    // Initialize
    this.subscription = this.dataService.data$.subscribe((data) => {
      // Handle data
    });
  }

  ngOnDestroy() {
    // Cleanup
    this.subscription.unsubscribe();
  }
}
```

---

## Directives and Pipes

### Common Directives

```html
<!-- Conditional rendering -->
<div *ngIf="isLoggedIn">Welcome</div>

<!-- Loop rendering -->
<li *ngFor="let item of items">{{ item }}</li>

<!-- Style binding -->
<div [ngClass]="{ 'active': isActive }">Content</div>
<div [ngStyle]="{ 'color': textColor }">Content</div>

<!-- Two-way binding -->
<input [(ngModel)]="username" />
```

### Common Pipes

```html
<!-- Date formatting -->
{{ date | date: 'short' }}

<!-- Case conversion -->
{{ text | uppercase }} {{ text | lowercase }}

<!-- Number formatting -->
{{ number | number: '1.0-2' }}

<!-- Currency -->
{{ price | currency: 'USD' }}

<!-- JSON -->
{{ object | json }}
```

---

## Resources

- [Angular Components Documentation](https://angular.io/guide/component-overview)
- [Service Reference](./api/services.md)
- [Project Structure](../guide/development/project-structure.md)

---

**Next**: [Services Reference](./api/services.md)
