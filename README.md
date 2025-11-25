# Code Portfolio

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
        A[Page Request] --> B[Server Fetch Data using API]
        B --> C[Render HTML]
    end

    subgraph CSR[CSR]
        C --> D[Client Hydration]
        D --> E[UI Component Mount]
    end

    subgraph DataFetch[Data Fetch]
        D --> F[Fetch Data using axios or fetch or React Query or SWR]
        F --> G[Update Client Cache]
    end

    subgraph State[Client State Management]
        G --> H[Update Zustand or Redux Store]
        H --> E
    end

```

---

## Typescript

- [React.js Tailwind CSS Design System](src/typescript/react-tailwind_design-system/)

## Go

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
