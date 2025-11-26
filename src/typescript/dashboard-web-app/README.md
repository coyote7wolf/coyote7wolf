# syncCoreAI-dashboard-frontend

An enterprise-grade Vue 3 analytics dashboard for real-time collaboration, AI insights, and interactive 3D data visualization.

## 🗺️ User Journey Flow (Mermaid)

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  Login[Login Screen]
  Dashboard[Dashboard View]
  Collaboration[Collaboration View]
  Performance[Performance View]
  AIInsights[AI Insights]
  Workspace3D[3D Workspace]

  Login --> Dashboard
  Dashboard --> Collaboration
  Dashboard --> Performance
  Dashboard --> AIInsights
  Dashboard --> Workspace3D
  Collaboration --> Performance
  Collaboration --> Workspace3D
  Performance --> AIInsights
  AIInsights --> Workspace3D
```

---

## 🎨 INTERACTIVE USER FLOWS (Mermaid)

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  Start[Login Screen]
  MainDash[Dashboard]
  Collab[Collaboration]
  Perf[Performance]
  AI[AI Insights]
  Workspace[3D Workspace]
  Settings[Settings]

  Start --> MainDash
  MainDash --> Collab
  MainDash --> Perf
  MainDash --> AI
  MainDash --> Workspace
  Collab --> Perf
  Collab --> Workspace
  Perf --> AI
  AI --> Workspace
  MainDash --> Settings
  Settings --> MainDash
```

---

## 🎭 FLOATING NAVIGATION (Mermaid)

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  AnyPage[Any Page]
  FloatingBtn[Floating Nav Button]
  NavMenu[Navigation Menu]
  Dashboard[Dashboard]
  Collaboration[Collaboration]
  Performance[Performance]
  AIInsights[AI Insights]
  Workspace3D[3D Workspace]
  Settings[Settings]

  AnyPage --> FloatingBtn
  FloatingBtn --> NavMenu
  NavMenu --> Dashboard
  NavMenu --> Collaboration
  NavMenu --> Performance
  NavMenu --> AIInsights
  NavMenu --> Workspace3D
  NavMenu --> Settings
```

---

## ✨ Tech Stack Highlight

- **Language**: TypeScript 5.x
- **Framework**: Vue 3 + Vite
- **Key Libraries**: D3.js, Three.js, Chart.js, Pinia, Vue Router, Tailwind CSS
- **State Management**: Pinia
- **Styling**: Tailwind CSS

---

## 🚀 Usage

- **Install dependencies:**

  ```sh
  pnpm install
  ```

  - **Build for production:**

  ```sh
  pnpm run build
  ```

- **Build with bundle analyzer:**

  ```sh
  pnpm run build:analyze
  ```

- **Start development server:**

  ```sh
  pnpm run dev
  ```

- **Start with mock API:**

  ```sh
  pnpm run dev:mock-api
  ```

- **Start with mock data only:**

  ```sh
  pnpm run dev:mock-data
  ```

- **Preview production build:**

  ```sh
  pnpm run preview
  ```

- **Run all unit tests:**

  ```sh
  pnpm test
  ```

- **Run E2E tests:**

  ```sh
  pnpm run test:e2e
  ```

- **Coverage report:**

  ```sh
  pnpm run test:coverage
  ```

- **Type check:**

  ```sh
  pnpm run type-check
  ```

- **Lint and fix code:**

  ```sh
  pnpm run lint:fix
  ```

- **Lighthouse performance report:**

  ```sh
  pnpm run lighthouse
  ```

- **Bundle analyzer:**

  ```sh
  pnpm run bundle-analyzer
  ```
