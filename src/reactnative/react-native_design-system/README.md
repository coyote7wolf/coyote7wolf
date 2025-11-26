# React Native Design System Skeleton

An extensible design system for React Native, providing reusable UI components and consistent theming for cross-platform mobile apps.

---

## 🧬 Design Token Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
autonumber
 participant Designer
 participant DesignToken
 participant Theme
 participant Component
 participant User

 Designer->>DesignToken: Define tokens (color, spacing, etc.)
 DesignToken->>Theme: Provide token values
 Theme->>Component: Apply themed tokens
 Component->>User: Render styled UI
 User-->>Component: Interact with UI
 Component-->>Theme: Request updated tokens (on theme change)
 Theme-->>DesignToken: Fetch new token values
```

---

## 🔄 State Machine Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
stateDiagram-v2
 [*] --> Idle
 Idle --> Editing: Edit
 Editing --> Saving: Save
 Saving --> Idle: Save Success
 Saving --> Error: Save Failed
 Editing --> Idle: Cancel
 Error --> Editing: Retry
 Idle: Default state
 Editing: User modifies token
 Saving: Persisting changes
 Error: Save error
```

---

## ✨ Tech Stack Highlight

- **Language**: JavaScript (ESNext)
- **Framework**: React Native 0.82
- **Component Preview**: Storybook 8
- **Theming**: Custom theme tokens (TypeScript)

---

## 🚀 Usage

- **Install dependencies:**

  ```sh
  pnpm install
  ```

- **Start Storybook (component preview):**

  ```sh
  pnpm storybook
  ```

  Open [http://localhost:6016](http://localhost:6016) in browser.
