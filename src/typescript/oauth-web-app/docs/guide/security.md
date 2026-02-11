# 🔒 Security Best Practices

Security guidelines and best practices for this project.

---

## 📚 Table of Contents

- [Authentication & Authorization](#authentication--authorization)
- [API Security](#api-security)
- [Data Protection](#data-protection)
- [XSS Protection](#xss-protection)
- [CSRF Protection](#csrf-protection)
- [Common Vulnerabilities](#common-vulnerabilities)

---

## Authentication & Authorization

### OAuth Token Management

#### ✅ Secure Token Storage

```typescript
// ✅ Good: Store token in memory (not persistent)
export class AuthService {
  private accessToken: string = "";

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string {
    return this.accessToken;
  }
}

// Or use HttpOnly Cookie (set by server)
// Authorization: Bearer <token>
```

#### ❌ Avoid

```typescript
// ❌ Insecure: localStorage
localStorage.setItem("token", token); // Vulnerable to XSS

// ❌ Insecure: sessionStorage
sessionStorage.setItem("token", token); // Also vulnerable
```

### Token Refresh

```typescript
// ✅ Implement token refresh
export class AuthService {
  private accessToken: string = "";
  private refreshToken: string = "";

  refreshAccessToken(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>("/api/auth/refresh", {
        refreshToken: this.refreshToken,
      })
      .pipe(
        tap((response) => {
          this.accessToken = response.accessToken;
        }),
      );
  }
}
```

### Route Protection

```typescript
// ✅ Use AuthGuard to protect routes
export const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
];

// Implement AuthGuard
@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivateFn {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(["/login"]);
    return false;
  }
}
```

---

## API Security

### Always Use HTTPS

```typescript
// ✅ Always HTTPS
export const environment = {
  apiUrl: "https://api.example.com",
};

// ❌ Never HTTP
// apiUrl: 'http://api.example.com'
```

### Add Authentication Headers

```typescript
// ✅ Add token to requests
@Injectable({
  providedIn: "root",
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req);
  }
}
```

### Secure Error Handling

```typescript
// ✅ Safe error messages
handleError(error: any): void {
  if (error.status === 401) {
    this.router.navigate(['/login']);
  } else if (error.status === 403) {
    console.error('Access denied');
  }

  // Don't expose sensitive info
  const userMessage = 'An error occurred. Please try again.';
  this.showError(userMessage);
}

// ❌ Avoid exposing details
// console.log(error.response.data);
```

---

## Data Protection

### Password Security

#### ✅ Safe Password Practices

```typescript
// ✅ Never store passwords
// Only use during transmission

// ✅ Validate password strength
function validatePassword(password: string): boolean {
  // At least 8 characters
  // One uppercase, one lowercase
  // One digit, one special character
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}
```

#### ❌ Avoid

```typescript
// ❌ Never store passwords
localStorage.setItem("password", password);

// ❌ Never pass in URL
fetch("/api/login?password=" + password);

// ❌ Never log passwords
console.log("Password:", password);
```

### Protect Personal Data

```typescript
// ✅ Only transfer necessary data
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  // Don't include sensitive fields
}

// ✅ Mask sensitive fields when displaying
displayMaskedEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  return `${localPart[0]}****@${domain}`;
}
```

---

## XSS Protection

### Sanitize User Input

```typescript
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

// ✅ Use DomSanitizer
export class UserComponent {
  userInput: string = "";

  constructor(private sanitizer: DomSanitizer) {}

  displayUserInput(): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.userInput) || "";
  }
}
```

### Avoid Dangerous Directives

```html
<!-- ✅ Safe data binding -->
<p>{{ userInput }}</p>
<p [textContent]="userInput"></p>

<!-- ❌ Dangerous: Can execute HTML/JS -->
<p [innerHTML]="userInput"></p>
```

### Content Security Policy

```html
<!-- Add CSP header to index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' trusted-cdn.com;"
/>
```

---

## CSRF Protection

### Implement CSRF Token

```typescript
// ✅ Auto-add CSRF token
@Injectable({
  providedIn: "root",
})
export class CsrfInterceptor implements HttpInterceptor {
  constructor(private csrfTokenService: CsrfTokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== "GET") {
      const token = this.csrfTokenService.getToken();
      if (token) {
        req = req.clone({
          setHeaders: {
            "X-CSRF-Token": token,
          },
        });
      }
    }

    return next.handle(req);
  }
}
```

### Use Proper HTTP Methods

```typescript
// ✅ Use POST/PUT/DELETE for state changes
export class UserService {
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }

  updateUser(id: string, data: any): Observable<User> {
    return this.http.put<User>(`/api/users/${id}`, data);
  }
}

// ❌ Never use GET for state changes
// http.get('/api/users/delete?id=123')
```

---

## Common Vulnerabilities

### 1. Sensitive Data Exposure

```typescript
// ❌ Don't expose sensitive data
const userData = {
  id: "123",
  email: "user@example.com",
  passwordHash: "abc123...", // ❌ Should not include
  creditCard: "4111...", // ❌ Should not include
};

// ✅ Only necessary data
const safeUserData = {
  id: "123",
  email: "user@example.com",
};
```

### 2. Dependency Vulnerabilities

```bash
# ✅ Check for vulnerabilities
npm audit

# ✅ Fix known vulnerabilities
npm audit fix

# ✅ Update dependencies
npm update
```

### 3. Authorization Bypass

```typescript
// ❌ Don't trust client-side validation alone
if (userRole === "admin") {
  showAdminPanel(); // Insecure
}

// ✅ Always verify on server
this.http.get<AdminData>("/api/admin/data").subscribe(
  (data) => showAdminPanel(data),
  (error) => handleUnauthorized(error),
);
```

### 4. Insecure Direct Object Reference

```typescript
// ❌ Unsafe: User can access any profile
// GET /api/users/123/profile

// ✅ Server verifies access permission
export class UserService {
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`/api/users/${userId}/profile`).pipe(
      catchError((error) => {
        if (error.status === 403) {
          console.error("No permission");
        }
        return throwError(() => error);
      }),
    );
  }
}
```

---

## Security Checklist

Before deploying:

- [ ] All API calls use HTTPS
- [ ] All authenticated routes are protected
- [ ] No sensitive data in localStorage
- [ ] User input is sanitized
- [ ] No direct HTML execution
- [ ] CSRF tokens implemented
- [ ] CSP headers configured
- [ ] Dependency vulnerabilities fixed
- [ ] Error messages don't expose details
- [ ] Strong password validation
- [ ] Regular security audits

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security](https://angular.io/guide/security)
- [Web Security](https://cheatsheetseries.owasp.org/)

---

**Next**: [Performance Optimization](./performance.md)
