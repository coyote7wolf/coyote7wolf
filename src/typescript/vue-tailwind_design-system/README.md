# Vue Tailwind Design System Skeleton

## ⏱️ Design Token Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
autonumber
  participant Designer
  participant DesignToken
  participant Theme
  participant Component
  participant User

  Designer->>DesignToken: Define tokens e.g. color, spacing,
  DesignToken->>Theme: Provide token values
  Theme->>Component: Apply themed tokens
  Component->>User: Render styled UI
  User-->>Component: Interact with UI
  Component-->>Theme: Request updated tokens on theme change
  Theme-->>DesignToken: Fetch new token values
```

---

## 🔄 State Machine Diagram (Mermaid)

```mermaid
%%{init: {"theme":"neutral"}}%%
stateDiagram-v2
  [*] --> Idle
  Idle --> Hovered: Mouse Over
  Hovered --> Active: Mouse Down
  Active --> Disabled: Set Disabled
  Active --> Error: Error Occurred
  Active --> Idle: Mouse Up
  Hovered --> Idle: Mouse Out
  Disabled --> Idle: Enable
  Error --> Idle: Reset/Error Resolved
  Idle: Default state
  Hovered: Highlighted, focus ring
  Active: Pressed, loading, interaction
  Disabled: Not interactive
  Error: Validation or system error
```

---

## ✨ Tech Stack Highlight

- **Language**: TypeScript, JavaScript (ESNext)
- **Framework**: Vue 3.4, Vite 5
- **UI**: Tailwind CSS 3
- **Component Preview**: Storybook 9
- **Testing**: Vitest 1, @vue/test-utils
- **Formatting**: Prettier, ESLint

---

## 🚀 Usage

- **Install dependencies:**

  ```sh
  pnpm install
  ```

- **Start development server:**

  ```sh
  pnpm run dev
  ```

- **Build for production:**

  ```sh
  pnpm run build
  ```

- **Start Storybook:**

  ```sh
  pnpm run storybook
  ```

- **Run all unit tests:**

  ```sh
  pnpm run test
  ```

- **Format code:**

  ```sh
  pnpm run format
  ```

- **Publish to npm:**

  ```sh
  pnpm run publish:lib
  ```
