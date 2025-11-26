# AI Orchestrator Service

A TypeScript/NestJS microservice for orchestrating multi-model AI workflows, event-driven context flows, and RLHF feedback collection with Langchain, Langfuse, and Redis Stream integration.

## 🗂️ Architecture Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  ClientWeb[Client Web/App]
  Gateway[Gateway Service]
  Orchestrator[Orchestrator Service]
  MQ[MQ/Broker]
  AgentLLMMemory[Agent/LLM/Memory]
  RedisStream[Redis Stream]

  ClientWeb --> Gateway
  Gateway --> Orchestrator
  Gateway <--> MQ
  Orchestrator --> AgentLLMMemory
  Orchestrator --> RedisStream
  MQ --> Orchestrator
```

---

## 🔄 Data Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
autonumber
  participant Client as Client Web/App
  participant Gateway as Gateway Service
  participant Orchestrator as Orchestrator Service
  participant MQ as MQ/Broker
  participant Worker as Orchestrator-Worker
  participant Redis as Redis Stream

  Client->>Gateway: API Request
  Gateway->>Orchestrator: Forward request
  Gateway->>MQ: Publish event
  MQ->>Worker: Event dispatch
  Worker->>Redis: Write context event
  Orchestrator->>AgentLLMMemory: Call Agent/LLM/Memory
```

---

## ✨ Tech Stack Highlight

- **Language**: TypeScript 5.x
- **Framework**: NestJS 11.1.8
- **Key Libraries**: Langchain v0.1+, Langfuse, Prisma 5.x
- **Database**: SQLite (via Prisma ORM)
- **Message Queue**: Redis Stream

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
