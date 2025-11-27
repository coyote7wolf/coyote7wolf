![Badge](https://hitscounter.dev/api/hit?url=https%3A%2F%2Fgithub.com%2Fcoyote7wolf&label=&icon=stickies-fill&color=%23052c65&message=&style=flat&tz=UTC)

# Code Portfolio

- [Full-Stack Highlights](#full-stack-highlights)
- [Backend Highlights](#backend-highlights)
- [Frontend Highlights](#frontend-highlights)
- [Typescript](#typescript)
- [Go](#go)
- [Python](#python)
- [C#](#c)
- [Kotlin](#kotlin)
- [Java](#java)
- [JavaScript](#javascript)
- [React Native](#react-native)

## Full-Stack Highlights

### OAuth 2.0 Flow

![OAuth 2.0 Flow](img/fullstack/OAuth2-Flow.drawio.png)

- State: Stateless
- Token Type: Access Token (JWT/Opaque/session ID)

### Password Cookie Session Flow

![Password Cookie Session Flow](img/fullstack/Password-Cookie-Session-Flow.drawio.png)

- State: Stateful
- Token Type: Session ID

### JWT Token Flow

![JWT Token Flow](img/fullstack/JWT-Token-Flow.drawio.png)

- State: Stateless
- Token Type: JWT

### AI Productization Flow

![AI Productization Flow](img/fullstack/AI-Productization-Flow.drawio.png)

## Backend Highlights

### Serverless Lambda API Architecture

![Serverless Lambda API Architecture](img/backend/Serverless-API.png)

### ECS & EKS API with Redis Cache Architecture

![ECS & EKS API with Redis Cache Architecture](img/backend/ECS-EKS-Redis-Cache.drawio.png)

### EDA with Saga and CRDT on SQS

![EDA with Saga and CRDT on SQS](img/backend/EDA-Saga-CRDT-SQS.drawio.png)

## Frontend Highlights

### Page Layouts

#### Homepage

- Component: Header, Hero, Card, Footer
- Features: LTR, English, Light Theme
  ![Homepage LTR](img/frontend/homepage-ltr.png)

#### Homepage RTL i18n

- Component: Header, Hero, Card, Footer
- Features: RTL, Arabic, Light Theme
  ![Homepage RTL i18n](img/frontend/homepage-rtl-i18n.png)

#### Signup Page

- Component: Header, Toolbar, Card, Footer
- Features: LTR, Chinese, Dark Theme
  ![Signup Page Dark Theme](img/frontend/signup-page-dark-theme.png)

#### Product Listing Page

- Component: Header, Toolbar, Sidebar, Product card, Pagination, Footer
- Features: LTR, Japanese, High Contrast Theme
  ![Product Listing Page High Contrast Theme](img/frontend/product-listing-page-high-contrast-theme.png)

#### 3D Product Showcase Page

- Component: Header, Description, ThreeCanvas, Footer
- Features: three.js 3D interactive scene
  ![3D Product Showcase Page](img/frontend/3d-product-showcase.png)

### Design System

#### Component

- Button
  ![tailwind-design-button](img/frontend/tailwind-design-button.png)

- Alert
  ![tailwind-design-alert](img/frontend/tailwind-design-alert.png)

- Breadcrumb
  ![tailwind-design-breadcrumb](img/frontend/tailwind-design-breadcrumb.png)

#### Token

![tailwind-design-token](img/frontend/tailwind-design-token.png)

### Data Flow

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  subgraph SSR[SSR]
    A[1 Browser → Server: Page Request]
    A --> B[2 Server: Call API to get data]
    B --> C[3 Server: Render HTML]
  end

  subgraph CSR[CSR]
    C --> D[4 Browser: Attach JS, enable interactivity]
    D --> E1[5 Browser: Render component in DOM]
  end

  subgraph DataFetch[Data Fetch]
    D --> F[6 Browser: Fetch Data via axios/fetch/React Query/SWR]
    F --> G[7 Browser: Store fetched data in Cache]
  end

  subgraph State[State Management]
    G --> H[8 Browser: Update Zustand/Redux Store]
    H --> E2[9 Browser: UI re-render - component in DOM]
  end
```

---

## Typescript

- [React.js Tailwind CSS Design System](src/typescript/react-tailwind_design-system/)
- [React.js Tailwind CSS Web App](src/typescript/web-app/)
- [Vue.js Tailwind CSS Design System](src/typescript/vue-tailwind_design-system/)
- [Vue.js Tailwind CSS Dashboard App](src/typescript/dashboard-web-app/)
- [Nest.js User Service](src/typescript/user-service/)
- [Nest.js Vector Memory Service](src/typescript/vector-memory-service/)
- [Nest.js AI Agent Service](src/typescript/ai-agent-service/)
- [Nest.js AI Orchestrator Service](src/typescript/ai-orchestrator-service/)
- [Nest.js LLM Adapter Service](src/typescript/llm-adapter-service/)

## Go

- [gRPC Sync Service](src/go/sync-service/)
- [gRPC Broker Service](src/go/broker-service/)
- [gRPC Config Service](src/go/config-service/)
- [gRPC Real-time Service](src/go/realtime-service/)

## Python

- [FastAPI Edge LLM Inference](src/python/fastapi_edge-llm-infer/)

## C#

- [C# .NET User Service](src/csharp/csharp-dotnet_user-service/)

## Kotlin

- [Kotlin Spring Boot User Service](src/kotlin/kotlin-spring-boot_user-service/)

## Java

- [Java Spring Boot User Service](src/java/java-spring-boot_user-service/)

## JavaScript

- [Express.js User Service](src/javascript/node-express_user-service/)

## React Native

- [React Native Mobile App](src/reactnative/mobile-app)
- [React Native Mobile Design System](src/reactnative/react-native_design-system/)
