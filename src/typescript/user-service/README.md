# User Service

User management microservice built with NestJS, TypeScript, and Prisma, supporting multiple database backends and robust testing.

## 🗂️ Architecture Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  Client[Client]
  API[REST API NestJS]
  Auth[Auth Middleware]
  UserController[User Controller]
  DeviceController[Device Controller]
  RoleController[Role Controller]
  UserService[User Service]
  DeviceService[Device Service]
  RoleService[Role Service]
  PrismaService[Prisma Service]
  RealDB[PostgreSQL]
  RedisDB[Redis]

  Client --> API
  API --> Auth
  Auth --> UserController
  Auth --> DeviceController
  Auth --> RoleController
  UserController --> UserService
  DeviceController --> DeviceService
  RoleController --> RoleService
  UserService --> PrismaService
  DeviceService --> PrismaService
  RoleService --> PrismaService
  PrismaService --> RealDB
  UserService --> RedisDB
  DeviceService --> RedisDB
  RoleService --> RedisDB
```

## 🔄 Data Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
  autoNumber
  participant Client
  participant API as REST API
  participant Auth as Auth Middleware
  participant Controller as User, Device, Role Controller
  participant Service as User, Device, Role Service
  participant Prisma as Prisma Service
  participant DB as DB

  Client->>API: Send HTTP request
  API->>Auth: Authenticate request
  Auth->>Controller: Forward to Controller
  Controller->>Service: Call business logic
  Service->>Prisma: Query or update data
  Prisma->>DB: Access database
  DB-->>Prisma: Return data
  Prisma-->>Service: Return result
  Service-->>Controller: Return response
  Controller-->>API: Return response
  API-->>Client: Return HTTP response
```

## ✨ Tech Stack Highlight

- **Language**: TypeScript 5
- **Framework**: NestJS 10
- **ORM**: Prisma 5
- **Database**: PostgreSQL, Redis, Mock DB
- **Testing**: Jest

## 🚀 Usage

- **Install dependencies**

  ```sh
  pnpm install
  ```

- **Production:**

  ```sh
  pnpm run start
  ```

- **Development (real DB):**

  ```sh
  pnpm run start:dev
  ```

- **Development (mock DB):**

  ```sh
  pnpm run start:dev-mock
  ```

- **Development (Redis DB):**

  ```sh
  pnpm run start:dev-redis-db
  ```

- **All tests:**

  ```sh
  pnpm run test
  ```

- **Coverage:**

  ```sh
  pnpm run test:cov
  ```

- **Smoke tests:**

  ```sh
  pnpm run test:smoke
  ```

- **User smoke tests:**

  ```sh
  pnpm run test:smoke:user
  ```

- **Role smoke tests:**

  ```sh
  pnpm run test:smoke:role
  ```

- **Device smoke tests:**

  ```sh
  pnpm run test:smoke:device
  ```

- **Init Prisma:**

  ```sh
  pnpm run prisma:init
  ```

- **Generate Prisma client:**

  ```sh
  pnpm run prisma:generate
  ```

- **Migrate DB (dev):**

  ```sh
  pnpm run prisma:migrate:dev
  ```

- **Open Prisma Studio:**

  ```sh
  pnpm run prisma:studio
  ```
