# 🐛 Debugging Tools & Guide

Complete debugging guide for development and troubleshooting.

---

## 📚 Table of Contents

- [Browser DevTools](#browser-devtools)
- [Angular DevTools](#angular-devtools)
- [VS Code Debugging](#vs-code-debugging)
- [Network Debugging](#network-debugging)
- [Component Debugging](#component-debugging)
- [Service Debugging](#service-debugging)

---

## Browser DevTools

### Elements Inspector

```
Ctrl+Shift+C (Windows/Linux)
Cmd+Option+C (macOS)
```

**Use for**:

- Inspect HTML structure
- Check CSS styles
- Verify event listeners
- Test style changes live

**Tips**:

- Right-click element → "Inspect"
- Edit HTML directly in DevTools
- Toggle CSS classes on/off
- Simulate hover/focus states

---

### Console

```
Ctrl+Shift+J (Windows/Linux)
Cmd+Option+J (macOS)
```

**Debugging commands**:

```javascript
// Log component instance
ng.getComponent(document.querySelector("app-root"));

// Get service instance
ng.probe(document.querySelector("app-root")).injector.get(AuthService);

// Monitor function calls
monitorEvents(element, "click");

// Evaluate expressions
document.querySelectorAll("button").length;
```

---

### Network Tab

```
Ctrl+Shift+N (Windows/Linux)
Cmd+Option+I → Network (macOS)
```

**Check**:

- API response status
- Response time
- Request headers
- Response body
- CORS issues

**Filter requests**:

- Click "Filter" → type `api`
- Right-click request → "Copy as cURL"
- Replay request

---

### Application/Storage Tab

```
Ctrl+Shift+I → Application (Windows/Linux)
Cmd+Option+I → Application (macOS)
```

**Check**:

- localStorage/sessionStorage
- Cookies
- Cache Storage
- IndexedDB

**Debug OAuth**:

```javascript
// Check stored token
localStorage.getItem("auth_token");

// Check cookie
document.cookie;
```

---

### Performance Tab

```
Ctrl+Shift+I → Performance (Windows/Linux)
Cmd+Option+I → Performance (macOS)
```

**Profile application**:

1. Click record button
2. Interact with app
3. Stop recording
4. Analyze flame chart

---

## Angular DevTools

### Installation

```bash
# Install Angular DevTools extension
# Chrome: https://chrome.google.com/webstore/
# Search: "Angular DevTools"
```

### Using Angular DevTools

**Access**: Press `Ctrl+Shift+I` → "Angular"

**Features**:

```
1. Component Tree
   - View component hierarchy
   - Inspect component properties
   - Check change detection status

2. Directive Explorer
   - Find directives in use
   - Inspect directive properties

3. Profiler
   - Record component render times
   - Identify performance bottlenecks

4. Router Tree
   - View active route
   - Debug routing issues
```

**Example - Inspect Component**:

```typescript
// In Angular DevTools:
// 1. Click component in tree
// 2. View properties in right panel
// 3. Edit property values
// 4. See changes in real-time
```

---

## VS Code Debugging

### Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### Debug Session

```
1. F5 (or Debug → Start Debugging)
2. Chrome opens with debugger
3. Set breakpoints in VS Code
4. Interact with app
5. Inspect variables in debug panel
```

### Breakpoint Types

```typescript
// Line breakpoint
|> function debugMe() {  // Click gutter to set breakpoint
    console.log('test');
}

// Conditional breakpoint
|> if (count > 5) {  // Right-click breakpoint → Edit → Add condition
    console.log('Too many!');
}

// Logpoint
|> const result = x + y;  // Right-click → Add logpoint
   // Message: "Result: {result}"
```

---

## Network Debugging

### Monitor API Calls

```typescript
// Add logging interceptor
@Injectable({
  providedIn: "root",
})
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`HTTP: ${req.method} ${req.url}`);

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          console.log(`Response: ${event.status}`, event.body);
        }
      }),
      catchError((error) => {
        console.error(`HTTP Error: ${error.status}`, error);
        return throwError(() => error);
      }),
    );
  }
}
```

### Debug CORS Issues

```bash
# Check CORS headers
curl -I https://api.example.com/data \
  -H "Origin: http://localhost:4200"

# Look for:
# Access-Control-Allow-Origin: http://localhost:4200
# Access-Control-Allow-Methods: GET, POST, PUT
# Access-Control-Allow-Headers: Content-Type
```

### cURL Testing

```bash
# Test API endpoint
curl -X GET https://api.example.com/data \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json"

# View response headers
curl -i https://api.example.com/data
```

---

## Component Debugging

### Debug Change Detection

```typescript
import { ChangeDetectorRef } from "@angular/core";

export class MyComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cdr.detach(); // Stop auto-detection

    // ... manual updates ...

    this.cdr.detectChanges(); // Trigger detection
  }
}
```

### Debug Data Binding

```typescript
// Add debugging output
@Component({
  template: `
    <input [(ngModel)]="name" />
    {{ debugValue | json }}
  `,
})
export class DebugComponent {
  name = "";

  get debugValue() {
    console.log("Binding evaluated, name:", this.name);
    return { name: this.name };
  }
}
```

### Debug Component Lifecycle

```typescript
export class DebugComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any;

  ngOnChanges(changes: SimpleChanges) {
    console.log("ngOnChanges:", changes);
  }

  ngOnInit() {
    console.log("ngOnInit");
  }

  ngOnDestroy() {
    console.log("ngOnDestroy");
  }
}
```

---

## Service Debugging

### Debug HTTP Service

```typescript
@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: string) {
    const url = `/api/users/${id}`;
    console.log(`Fetching user: ${url}`);

    return this.http.get<User>(url).pipe(
      tap((user) => console.log("Received user:", user)),
      catchError((error) => {
        console.error("Error fetching user:", error);
        return throwError(() => error);
      }),
    );
  }
}
```

### Debug Subject/Observable

```typescript
// Create debugging subject
private userSubject = new BehaviorSubject<User | null>(null);
public user$ = this.userSubject.asObservable().pipe(
  tap(user => console.log('User subject changed:', user)),
  shareReplay(1)
);

// Subscribe with logging
this.user$.subscribe(user => {
  console.log('User subscription:', user);
});
```

---

## Debugging Checklist

When debugging an issue:

- [ ] Check browser console for errors
- [ ] Review Network tab for failed requests
- [ ] Verify HTTP status codes
- [ ] Check CORS headers
- [ ] Inspect component properties in Angular DevTools
- [ ] Review change detection strategy
- [ ] Check service subscriptions
- [ ] Verify environment variables
- [ ] Test with `npm test` to check test failures
- [ ] Review Git history for recent changes

---

## Common Debug Scenarios

### "White screen of death"

```bash
# 1. Open DevTools Console
# 2. Look for JavaScript errors
# 3. Check Network tab for 404 errors
# 4. Try hard refresh: Ctrl+Shift+R
```

### Component not rendering

```typescript
// 1. Check if component is imported
// 2. Verify *ngIf conditions
// 3. Check template syntax
// 4. Use [hidden] instead of *ngIf for debugging

<div [hidden]="!condition">Debug: {{ condition }}</div>
```

### Data not updating

```typescript
// 1. Check if using OnPush change detection
// 2. Verify data is being mutated (for non-OnPush)
// 3. Call markForCheck() manually
// 4. Check subscription unsubscribe timing
```

---

## Resources

- [Chrome DevTools Docs](https://developer.chrome.com/docs/devtools/)
- [Angular Debugging](https://angular.io/guide/debugging)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

---

**Next**: [FAQ](./faq.md)
