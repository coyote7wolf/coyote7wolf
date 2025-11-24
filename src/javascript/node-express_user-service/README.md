# Express.js User Service API

Modern Express.js user service API with clean architecture, DI, validation, logging, and extensible adapters.

## 🗂️ Architecture Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  Client[Client]
  API[Express API Layer]
  DI[DI Container awilix]
  Controller[User Controller]
  Service[User Service]
  Repo[User Repository InMemory]
  Cache[InMemory Redis Cache]
  MQ[InMemory Message Queue]
  Logger[Logger pino]
  Validation[Validation Joi]
  ErrorHandler[Central Error Handler]

  Client -->|HTTP| API
  API --> DI
  DI --> Controller
  Controller --> Validation
  Controller --> Service
  Controller --> ErrorHandler
  Service --> Repo
  Service --> Cache
  Service --> MQ
  Service --> Logger
  Repo -->|CRUD| Service
  Cache --> Service
  MQ --> Service
  ErrorHandler --> API
  Logger --> API
```

## 🔄 Data Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
  autonumber
  participant Client
  participant API as Express API
  participant Controller as Controller
  participant Validation as Joi
  participant Service as Service
  participant Repo as Repository
  participant Cache as Cache
  participant MQ as MQ
  participant Logger
  participant ErrorHandler as Error Handler

  Client->>API: HTTP Request e.g. POST /users
  API->>Controller: Route Handling
  Controller->>Validation: Validate Input
  Validation-->>Controller: Validation Result
  Controller->>Service: Call Business Logic
  Service->>Repo: CRUD Operation
  Service->>Cache: Cache Operation
  Service->>MQ: Publish Event
  Service->>Logger: Log Action
  Service-->>Controller: Result
  Controller->>API: Response
  API->>Client: HTTP Response
  Controller->>ErrorHandler: On Error
  ErrorHandler->>API: Error Response
```

---

## ✨ Tech Stack Highlight

- **Language:** JavaScript ES2022+, Node.js 20
- **Framework:** Express 4
- **Dependency Injection:** awilix
- **Validation:** Joi
- **Logging:** pino
- **Testing:** Jest, Supertest
- **Code Quality:** ESLint, Prettier
- **Coverage:** Jest Coverage
- **Dev Tools:** Nodemon, Makefile
- **Extensible Adapters:** In-memory repo, cache, MQ (extensible)

---

## 🚀 Usage

Install dependencies:

```bash
npm install
```

Development mode (auto-reload):

```bash
npm run dev
```

Start server (production):

```bash
npm start
```

Run tests:

```bash
npm test
```

Test coverage:

```bash
npm run test:coverage
```

Watch tests:

```bash
npm run test:watch
```

Lint:

```bash
npm run lint
```

Auto-fix lint:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```
