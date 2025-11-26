# AI Agent Service

A TypeScript/NestJS microservice for executing AI agent tasks, managing multi-step reasoning, and integrating Langchain, Langfuse, and RLHF with event-driven workflows and message queues.

## 🗂️ Architecture Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  ClientWeb[Client Web/App]
  Gateway[Gateway/Orchestrator]
  AgentService[Agent Service]
  MQ[MQ/Broker]
  LLM[LLM/Memory/DocSvc]
  Redis[Redis/RabbitMQ]

  ClientWeb --> Gateway
  Gateway <--> AgentService
  Gateway <--> MQ
  AgentService --> LLM
  AgentService --> Redis
  MQ --> AgentService
```

---

## 🔄 Data Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
autonumber
  participant Client as Client Web/App
  participant Gateway as Gateway/Orchestrator
  participant Agent as Agent Service
  participant MQ as MQ/Broker
  participant Worker as Agent-Service-Worker
  participant LLM as LLM/Memory Service

  Client->>Gateway: API Request
  Gateway->>Agent: Forward task
  Gateway->>MQ: Publish agent task event
  MQ->>Worker: Dispatch agent task
  Worker->>LLM: Call LLM/Memory
  Agent->>LLM: Query/Store result
```

---

## ✨ Tech Stack Highlight

- **Language**: TypeScript 5.x
- **Framework**: NestJS 10.x
- **Key Libraries**: Langchain v0.1+, Langfuse, Prisma 5.x
- **Database**: SQLite (via Prisma ORM)
- **Message Queue**: Redis, RabbitMQ

---

## 🚀 Usage

- **Install dependencies:**

  ```sh
  pnpm install
  ```

- **Build the project:**

  ```sh
  pnpm run build
  ```

- **Start the service:**

  ```sh
  pnpm start
  ```

- **Start in development mode (auto-reload):**

  ```sh
  pnpm run start:dev
  ```

- **Run all unit tests:**

  ```sh
  pnpm test
  ```

- **Watch mode for tests:**

  ```sh
  pnpm test:watch
  ```

- **Run smoke tests:**

  ```sh
  pnpm run test:smoke
  ```

- **Coverage report:**

  ```sh
  pnpm test:cov
  ```
