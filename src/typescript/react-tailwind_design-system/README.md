# React.js Tailwind CSS Design System

A modern, scalable React design system powered by Tailwind CSS, Storybook, and TypeScript.

---

## ⏱️ Design Token Flow Sequence Diagram (Mermaid)

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

## 🔄 State Machine Diagram (Mermaid)

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

- **React** – UI library for building component-based interfaces
- **TypeScript** – Type-safe JavaScript for scalable development
- **Tailwind CSS** – Utility-first CSS framework for rapid UI styling
- **Storybook** – UI component explorer and documentation tool
- **Vite** – Fast build tool and development server
- **Vitest** – Unit testing framework for Vite projects
- **ESLint & Prettier** – Code linting and formatting
- **pnpm** – Fast, disk space efficient package manager

---

## 🚀 Usage

- Install dependencies

  ```sh
  pnpm install
  ```

- Start Storybook (for component development & preview)

  ```sh
  pnpm storybook
  ```

  Open [http://localhost:6006](http://localhost:6006) in browser.

- Build the library

  ```sh
  pnpm build
  ```

  Output will be in the `dist/` folder.

- Test

  ```sh
  pnpm test
  ```

- Type Checking

  ```sh
  pnpm tsc --noEmit
  ```

- Storybook Preview

  ```sh
  pnpm storybook
  ```

- Build Check

  ```sh
  pnpm build
  ```

- Versioning
  - Versioning follows the [SemVer](https://semver.org/) specification.

## 🧩 Component Group

- Button
  ![Button](img/button.png)
- Dropdown
  ![Dropdown](img/dropdown.png)
- Input
  ![Input](img/input.png)
