# 🏗️ Component Architecture

Guide to the container/presentational component architecture used in this project.

---

## 📚 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Container Components](#container-components)
- [Presentational Components](#presentational-components)
- [Feature Structure](#feature-structure)
- [Best Practices](#best-practices)
- [Testing Strategy](#testing-strategy)

---

## Architecture Overview

The project uses the **Container/Presentational (Smart/Dumb)** component pattern:

```
Container Component (Smart)
    ↓
    ├── Fetches data from services
    ├── Manages state
    ├── Handles side effects
    └── Passes data to Presentational Component
         ↓
    Presentational Component (Dumb)
         ├── Receives @Input properties
         ├── Emits @Output events
         ├── Renders pure UI
         └── No service dependencies
```

### Benefits

✅ **Single Responsibility**: Each component has one reason to change  
✅ **Testability**: Easy to test logic and UI separately  
✅ **Reusability**: Presentational components can be reused  
✅ **Maintainability**: Clear separation of concerns  
✅ **Scalability**: Easier to extend and modify

---

## Container Components

### Purpose

Container components are **Smart** components that:

- Own and manage component state
- Fetch data from services
- Handle business logic
- Dispatch actions/commands
- Rarely have templates (template is simple data passing)

### Example: LoginContainerComponent

**File:** `src/app/components/login/login-container.component.ts`

```typescript
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { LoginFormComponent } from "./login-form.component";

@Component({
  selector: "app-login-container",
  standalone: true,
  imports: [LoginFormComponent],
  template: ` <app-login-form [loginForm]="loginForm" [isLoading]="isLoading" [generalError]="generalError" [rememberMe]="rememberMe" (loginSubmit)="handleLogin()" (oauthLogin)="handleOAuthLogin($event)" (emailChange)="onEmailChange()" (rememberMeChange)="onRememberMeChange($event)"></app-login-form> `,
})
export class LoginContainerComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  generalError = "";
  rememberMe = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  // Initialization Logic
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  // Business Logic
  async handleLogin(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.generalError = "";

    try {
      const formData = this.loginForm.value;
      await this.authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe: this.rememberMe,
      });

      // Navigation
      this.router.navigate(["/dashboard"]);
    } catch (error: any) {
      this.generalError = error.message || "Login failed";
    } finally {
      this.isLoading = false;
    }
  }

  async handleOAuthLogin(provider: "google" | "github" | "microsoft"): Promise<void> {
    // OAuth logic
  }

  onEmailChange(): void {
    // Email validation logic
  }

  onRememberMeChange(checked: boolean): void {
    this.rememberMe = checked;
  }
}
```

### Key Characteristics

- ✅ **Minimal Template**: Only passes data to presentational component
- ✅ **Service Dependencies**: Injects services for data and actions
- ✅ **State Management**: Owns all component state
- ✅ **Side Effects**: Handles async operations and navigation
- ✅ **Event Handlers**: Implements all event handlers
- ✅ **Logic**: Contains all business logic

---

## Presentational Components

### Purpose

Presentational components are **Dumb** components that:

- Receive data via @Input
- Emit events via @Output
- Are completely reusable
- Have no service dependencies
- Are easy to test

### Example: LoginFormComponent

**File:** `src/app/components/login/login-form.component.ts`

```typescript
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, NavbarComponent],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginFormComponent {
  // Inputs: Receive data from parent container
  @Input() loginForm!: FormGroup;
  @Input() isLoading = false;
  @Input() generalError = "";
  @Input() rememberMe = false;

  // Outputs: Emit events to parent container
  @Output() loginSubmit = new EventEmitter<void>();
  @Output() oauthLogin = new EventEmitter<"google" | "github" | "microsoft">();
  @Output() emailChange = new EventEmitter<void>();
  @Output() rememberMeChange = new EventEmitter<boolean>();

  // Computed Properties (helpers only)
  get email() {
    return this.loginForm.get("email");
  }

  get password() {
    return this.loginForm.get("password");
  }

  // Event Handlers: Delegate to parent
  onEmailChange(): void {
    if (this.email?.hasError("email") || this.email?.hasError("required")) {
      // Keep error
    } else {
      this.email?.setErrors(null);
    }
    this.emailChange.emit();
  }

  handleLogin(): void {
    if (this.loginForm.invalid) return;
    this.loginSubmit.emit();
  }

  handleOAuthLogin(provider: "google" | "github" | "microsoft"): void {
    this.oauthLogin.emit(provider);
  }

  onRememberMeChange(checked: boolean): void {
    this.rememberMe = checked;
    this.rememberMeChange.emit(checked);
  }
}
```

### Key Characteristics

- ✅ **Input Properties**: Receives all data via @Input
- ✅ **Output Events**: Emits all events via @Output
- ✅ **No Services**: No service injections (except rarely TranslateModule)
- ✅ **Reusable**: Can be used in multiple contexts
- ✅ **Testable**: Pure functions, no side effects
- ✅ **Template**: Complex HTML for layout and styling

---

## Feature Structure

### Project Layout

```
src/app/components/
├── login/
│   ├── login-container.component.ts    ← Smart Component
│   ├── login-form.component.ts         ← Dumb Component
│   ├── login.component.html            ← Shared Template
│   ├── login.component.css             ← Shared Styles
│   └── login.component.spec.ts         ← Tests
├── register/
│   ├── register-container.component.ts
│   ├── register-form.component.ts
│   ├── register.component.html
│   ├── register.component.css
│   └── register.component.spec.ts
├── dashboard/
│   ├── dashboard-container.component.ts
│   ├── dashboard-view.component.ts
│   ├── dashboard.component.html
│   ├── dashboard.component.css
│   └── dashboard.component.spec.ts
└── ...
```

### File Organization

```
Feature Folder/
├── [feature]-container.component.ts  (Smart)
├── [feature]-form.component.ts       (Dumb)
├── [feature].component.html          (Shared Template)
├── [feature].component.css           (Shared Styles)
├── [feature].component.spec.ts       (Tests)
└── index.ts                          (Barrel export)
```

---

## Best Practices

### ✅ Do

1. **Keep Presentational Components Pure**

   ```typescript
   // Good: Pure presentational component
   @Component({...})
   export class UserListComponent {
     @Input() users!: User[];
     @Output() userSelected = new EventEmitter<User>();
   }
   ```

2. **Use Strict Input/Output Contracts**

   ```typescript
   @Input() user!: User;           // This is required
   @Input() isLoading = false;     // This has a default
   @Output() submitted = new EventEmitter<FormData>();
   ```

3. **Delegate Logic to Container**

   ```typescript
   // In presentational component
   onSubmit(): void {
     this.submitted.emit(this.formData);
   }
   ```

4. **Use Change Detection Strategy OnPush**
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush,
   })
   export class UserListComponent {}
   ```

### ❌ Don't

1. **Don't Inject Services in Presentational Components**

   ```typescript
   // Bad
   export class LoginFormComponent {
     constructor(private authService: AuthService) {} // ❌
   }
   ```

2. **Don't Manage Complex State in Presentational Components**

   ```typescript
   // Bad
   export class UserListComponent {
     users: User[] = []; // State should be in container ❌
   }
   ```

3. **Don't Make API Calls in Presentational Components**

   ```typescript
   // Bad
   ngOnInit() {
     this.http.get('/api/users').subscribe(...);  // ❌
   }
   ```

4. **Don't Use Two-Way Binding for All Data**
   ```typescript
   // Bad
   [(@ngModel)]="email"  // Use @Input/@Output pattern ❌
   ```

---

## Testing Strategy

### Container Component Testing

```typescript
describe("LoginContainerComponent", () => {
  let component: LoginContainerComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj("AuthService", ["login"]);
    router = jasmine.createSpyObj("Router", ["navigate"]);

    TestBed.configureTestingModule({
      imports: [LoginContainerComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    component = TestBed.createComponent(LoginContainerComponent).componentInstance;
  });

  it("should call authService.login on handleLogin", async () => {
    component.loginForm.patchValue({
      email: "test@example.com",
      password: "password123",
    });

    authService.login.and.returnValue(Promise.resolve());

    await component.handleLogin();

    expect(authService.login).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(["/dashboard"]);
  });
});
```

### Presentational Component Testing

```typescript
describe("LoginFormComponent", () => {
  let component: LoginFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginFormComponent],
    });

    component = TestBed.createComponent(LoginFormComponent).componentInstance;
  });

  it("should emit loginSubmit event when form is valid", () => {
    spyOn(component.loginSubmit, "emit");

    component.loginForm = new FormGroup({
      email: new FormControl("test@example.com"),
      password: new FormControl("password123"),
    });

    component.handleLogin();

    expect(component.loginSubmit.emit).toHaveBeenCalled();
  });

  it("should not emit loginSubmit when form is invalid", () => {
    spyOn(component.loginSubmit, "emit");

    component.loginForm = new FormGroup({
      email: new FormControl(""),
      password: new FormControl(""),
    });

    component.handleLogin();

    expect(component.loginSubmit.emit).not.toHaveBeenCalled();
  });
});
```

---

## Migration Guide

### Converting Old Component to Container + Presentational

**Before:**

```typescript
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  // Everything mixed together
  loginForm!: FormGroup;
  isLoading = false;
  generalError = "";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  async handleLogin(): Promise<void> {
    // Logic mixed with component
  }
}
```

**After:**

```typescript
// 1. Create Container Component
@Component({
  selector: "app-login-container",
  standalone: true,
  imports: [LoginFormComponent],
  template: `<app-login-form ...></app-login-form>`,
})
export class LoginContainerComponent {
  /* Logic */
}

// 2. Create Presentational Component
@Component({
  selector: "app-login-form",
  standalone: true,
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginFormComponent {
  /* Pure UI */
}

// 3. Update Routes
export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./login-container.component").then((m) => m.LoginContainerComponent),
  },
];
```

---

## Resources

- [Smart vs Dumb Components](https://angular.io/guide/styleguide#style-05-03)
- [Angular Component Architecture](https://angular.io/guide/component-interaction)
- [Testing Angular Components](https://angular.io/guide/testing)
