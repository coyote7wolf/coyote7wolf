# Vector Memory Service

A scalable, multi-backend vector memory service for semantic search, hybrid retrieval, and event-driven AI workflows, built with NestJS and TypeScript.

## 🗂️ Architecture Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  A[Client Web/App] --> B[Gateway Service]
  B --> C[Memory Service]
  B --> D[MQ/Broker]
  C --> E[Elasticsearch]
  C --> F[Milvus]
  C --> G[Orchestrator/Agent]
  D --> C
```

---

## 🔄 Data Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
  autoNumber
  participant Client as Client Web/App
  participant Gateway as Gateway Service
  participant Memory as Memory Service
  participant MQ as MQ/Broker
  participant Orchestrator as Orchestrator/Agent
  participant ES as Elasticsearch
  participant Milvus as Milvus

  Client->>Gateway: API Request, e.g. search, store
  Gateway->>Memory: Forward request
  alt Vector Search or Store
    Memory->>ES: Vector search/store (primary)
    Memory->>Milvus: Vector search/store (optional)
  end
  Memory-->>Gateway: Response
  Gateway-->>Client: Response
  MQ->>Memory: Event memory.upsert/delete
  Orchestrator->>Memory: Semantic query / context
```

---

## ✨ Tech Stack Highlight

- **Language:** TypeScript NestJS, Prisma SQLite
- **Framework:** NestJS 11.1.8, Prisma 5.0.0
- **Vector DB:** Elasticsearch 8.11.0, Milvus, pgvector
- **Messaging:** RabbitMQ
- **Caching:** ioredis, cache-manager, Redis
- **Validation:** class-validator, class-transformer
- **Testing:** Jest, smoke tests
- **API:** REST, OpenAPI Swagger
- **Observability/Tracing:** langfuse

---

## 🚀 Usage

- Install dependencies

  ```sh
  pnpm install
  ```

- Build the project

  ```sh
  pnpm build
  ```

- Development mode (with auto-reload):

  ```sh
  pnpm start:dev
  ```

- Unit tests:

  ```sh
  pnpm test
  ```

- Smoke tests:

  ```sh
  pnpm test:smoke
  ```

- Coverage report:

  ```sh
  pnpm test:cov
  ```

- Watch mode:

  ```sh
  pnpm test:watch
  ```

- Initialize Prisma:

  ```sh
  pnpm prisma:init
  ```

- Run migrations:

  ```sh
  pnpm migrate
  ```

- Open Prisma Studio:

  ```sh
  pnpm studio
  ```

- Generate Prisma Client:

  ```sh
  pnpm prisma:generate
  ```

- Reset database:

  ```sh
  pnpm prisma:reset
  ```

---
