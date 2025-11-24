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

- Layout: pattern
- Component:

#### Homepage RTL i18n

#### Login / Signup Page

- Layout: pattern
- Component:

#### Product Listing Page

- Layout: pattern
- Component:

### Design System

#### Component

#### Token

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
