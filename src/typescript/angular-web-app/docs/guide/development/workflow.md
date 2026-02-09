# 🔄 Development Workflow

Daily development process and best practices.

---

## 📚 Table of Contents

- [Setting Up Your Workspace](#setting-up-your-workspace)
- [Basic Development Flow](#basic-development-flow)
- [Feature Development Steps](#feature-development-steps)
- [Code Review](#code-review)
- [Common Commands](#common-commands)

---

## Setting Up Your Workspace

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/angular-web-app-template.git
cd angular-web-app-template
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm start
```

Application will open at `http://localhost:4200/`

### 4. Open in Editor

```bash
# VS Code
code .
```

---

## Basic Development Flow

### Daily Development Cycle

```
1. Fetch latest code from main branch
2. Create feature branch
3. Implement feature
4. Test functionality
5. Commit code
6. Submit Pull Request
7. Wait for review and merge
```

### Detailed Steps

#### Step 1: Update main Branch

```bash
git checkout main
git pull upstream main
```

#### Step 2: Create Feature Branch

```bash
git checkout -b feature/new-feature-name
```

**Branch Naming Convention:**

- Feature: `feature/feature-description`
- Fix: `fix/bug-description`
- Documentation: `docs/doc-description`
- Example: `feature/add-oauth-logout`, `fix/translation-bug`

#### Step 3: Start Development

```bash
# 1. Implement feature
# Edit files...

# 2. Save and test
npm start

# 3. Test in browser
# Visit http://localhost:4200/
```

#### Step 4: Run Tests

```bash
npm test

# Or run specific tests
npm test -- --include='**/auth.service.spec.ts'
```

#### Step 5: Commit Code

```bash
# Check changes
git status

# Add files
git add .

# Commit (follow Conventional Commits)
git commit -m "feat(auth): add logout functionality"
```

#### Step 6: Push Branch

```bash
git push origin feature/new-feature-name
```

#### Step 7: Create Pull Request

1. Visit GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR description
5. Click "Create Pull Request"

---

## Feature Development Steps

### Complete Feature Development Example

Let's implement a "User Profile Page" feature:

#### Step 1: Create Issue

Create a GitHub Issue describing the feature requirements.

#### Step 2: Create Branch and Component

```bash
git checkout -b feature/user-profile-page
ng generate component components/user-profile
```

#### Step 3: Implement Component

Edit `user-profile.component.ts`:

```typescript
import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { User } from "../../models/user.model";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.user = this.authService.getCurrentUser();
  }
}
```

Edit `user-profile.component.html`:

```html
<div class="profile-container" *ngIf="user">
  <h1>{{ user.name }}</h1>
  <p>{{ user.email }}</p>
  <img [src]="user.avatar" alt="Avatar" />
</div>
```

Edit `user-profile.component.css`:

```css
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
```

#### Step 4: Add Route

Edit `app.routes.ts`:

```typescript
import { UserProfileComponent } from "./components/user-profile/user-profile.component";

export const routes: Routes = [
  // ... other routes
  {
    path: "profile",
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
];
```

#### Step 5: Write Tests

Create `user-profile.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UserProfileComponent } from "./user-profile.component";
import { AuthService } from "../../services/auth.service";

describe("UserProfileComponent", () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj("AuthService", ["getCurrentUser"]);

    await TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load user profile on init", () => {
    const mockUser = { id: "1", name: "John", email: "john@example.com" };
    authService.getCurrentUser.and.returnValue(mockUser);

    fixture.detectChanges();

    expect(component.user).toEqual(mockUser);
  });
});
```

#### Step 6: Update Translations

Edit `src/assets/i18n/en.json`:

```json
{
  "profile": {
    "title": "User Profile"
  }
}
```

#### Step 7: Test Feature

```bash
npm start
npm test
```

#### Step 8: Commit and Push

```bash
git add .
git commit -m "feat(profile): add user profile page"
git push origin feature/user-profile-page
```

#### Step 9: Create PR

Create Pull Request on GitHub.

---

## Code Review

### When Submitting PR

1. **Clear title**: Describe what you did
2. **Detailed description**: Explain why
3. **Reference issue**: Link related issue
4. **Screenshots**: Provide visual proof (if UI changes)
5. **Test verification**: Confirm tests pass

### PR Description Template

```markdown
## Description

What does this PR do?

## Related Issue

Closes #123

## Change Type

- [x] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing Checklist

- [x] Local tests pass
- [x] Added new tests
- [x] Existing tests still pass
- [x] Code style check passes

## Documentation

- [x] Updated relevant docs
- [ ] Added API docs
```

### Handling Feedback

1. Read all comments
2. Respond to questions
3. Make required changes
4. Push updates: `git push origin feature/your-feature`
5. Mark as resolved
6. Request re-review if major changes

---

## Common Commands

### Git Commands

```bash
git branch                      # List branches
git branch -a                   # List all branches
git checkout branch-name        # Switch branch
git checkout -b new-branch      # Create and switch
git status                      # Show changes
git diff                        # Show detailed changes
git add .                       # Add all changes
git add file-name              # Add specific file
git commit -m "message"         # Commit
git push origin branch-name     # Push
git pull upstream main          # Pull from upstream
git log                         # Show commit history
git reset --hard HEAD           # Discard all changes
```

### npm Commands

```bash
npm install                     # Install dependencies
npm start                       # Start dev server
npm run build                   # Build for production
npm test                        # Run tests
npm test -- --code-coverage    # Coverage report
npm run lint                    # Run linter
npm run format                  # Format code
```

### Angular CLI Commands

```bash
ng generate component components/new-component
ng g c components/new-component                # Short form
ng generate service services/new-service
ng g s services/new-service                    # Short form
ng generate guard guards/new-guard
ng g d directives/new-directive                # Directive
ng g p pipes/new-pipe                          # Pipe
```

---

## Best Practices

### ✅ Do

1. **Fetch main frequently**

   ```bash
   git pull upstream main
   ```

2. **Write clear commit messages**

   ```bash
   git commit -m "feat(auth): add token refresh"
   ```

3. **Test before committing**

   ```bash
   npm test
   ```

4. **Keep branches updated**

   ```bash
   git rebase upstream/main
   ```

5. **Make small, focused commits**
   - One commit = one feature
   - Avoid mixing features

### ❌ Don't

1. **Commit directly to main**
   - Always use feature branches

2. **Ignore test failures**
   - Ensure all tests pass

3. **Write vague commit messages**

   ```bash
   # ❌ Bad
   git commit -m "fix stuff"

   # ✅ Good
   git commit -m "fix(router): handle null parameters"
   ```

4. **Work alone for too long**
   - Update frequently from main

5. **Commit incomplete code**
   - Ensure feature is complete and tested

---

## Troubleshooting

### Branch Conflicts

```bash
git fetch upstream
git rebase upstream/main

# Resolve conflicts in files
# Then continue
git rebase --continue
```

### Accidental Commit

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Need to Switch Branch

```bash
# Save current work
git stash

# Switch branch
git checkout other-branch

# Restore work
git checkout original-branch
git stash pop
```

---

## Resources

- [Contributing Guide](../../CONTRIBUTING.md)
- [Testing Guide](./testing.md)
- [Project Structure](./project-structure.md)
- [Git Documentation](https://git-scm.com/doc)
- [Angular CLI](https://angular.io/cli)

---

**Next**: [Testing Guide](./testing.md)
