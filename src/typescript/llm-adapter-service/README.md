# llm-adapter-service

A modular, multi-provider LLM adapter service for unified AI inference, event-driven flows, and RLHF feedback, built with NestJS and TypeScript.

## 🗂️ Architecture Diagram and

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  ClientWeb[Client Web/App]
  APIGateway[API Gateway]
  AuthService[Auth Service]
  LLMAdapter[LLM-Adapter-Service]
  MQBroker[MQ/Broker Service]
  EventStream[Event Stream]
  LLMProviders[LLM Providers: Local, OpenAI, Claude]
  Orchestrator[Orchestrator-Service / Agent]
  MemoryService[Memory-Service / Vector DB]

  ClientWeb --> APIGateway
  APIGateway --> AuthService
  AuthService --> LLMAdapter
  LLMAdapter --> LLMProviders
  LLMAdapter --> MQBroker
  LLMAdapter --> EventStream
  LLMAdapter --> Orchestrator
  Orchestrator --> MemoryService
```

---

## 🔄 Data Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%sequenceDiagram
autonumber
  participant Client
  participant Gateway as Gateway-Service
  participant Adapter as LLM-Adapter-Service
  participant Provider as LLM Provider
  participant Response
  participant Orchestrator
  participant Broker as Broker-Service
  participant Worker as LLM-Adapter-Service Worker
  participant Memory as Memory-Service/Orchestrator

  %% Synchronous API Flow
  Client->>Gateway: Request (chat/completion/embedding)
  Gateway->>Adapter: Forward request
  Adapter->>Provider: Select LLM Provider
  Provider->>Response: Generate result
  Response->>Client: Return result

  %% Asynchronous MQ Flow
  Orchestrator->>Broker: Publish llm.flow.event
  Broker->>Worker: Consume event
  Worker->>Provider: Process event
  Provider->>Broker: Publish llm.provider.result
  Broker->>Memory: Consume result
```

---

## ✨ Tech Stack Highlight

- **Language**: TypeScript (Node.js)
- **Framework**: NestJS 11.1.8
- **ORM**: Prisma 5.0.0
- **Database**: SQLite (default, via Prisma)
- **Message Queue**: RabbitMQ (EDA/Broker)
- **Testing**: Jest 29.x, ts-jest
- **Package Manager**: pnpm
- **Dev Tools**: Makefile, Prisma Studio

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

- **Start in development mode:**

  ```sh
  pnpm run dev
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
