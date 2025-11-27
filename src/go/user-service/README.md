# User Service

A Go microservice for user, device, and role management with mock integrations.

## 🗂️ Architecture Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
  Client[Client]
  API[API Layer]
  UserHandler[user handler]
  UserModel[user model]
  DeviceHandler[device handler]
  DeviceModel[device model]
  RoleHandler[role handler]
  RoleModel[role model]
  MockDB[mock db]
  MockQueue[mock queue]
  MockRedis[mock redis]

  Client --> API
  API --> UserHandler
  API --> DeviceHandler
  API --> RoleHandler
  UserHandler --> UserModel
  DeviceHandler --> DeviceModel
  RoleHandler --> RoleModel
  UserModel --> MockDB
  UserModel --> MockQueue
  UserModel --> MockRedis
  DeviceModel --> MockDB
  DeviceModel --> MockQueue
  DeviceModel --> MockRedis
  RoleModel --> MockDB
  RoleModel --> MockQueue
  RoleModel --> MockRedis
```

## 🔄 Data Flow Sequence Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
  autoNumber
  Client->>API: Send HTTP request
  API->>UserHandler: Route request
  UserHandler->>UserModel: Validate & process data
  UserModel->>MockDB: Store/Retrieve user data
  UserModel->>MockQueue: Publish event
  UserModel->>MockRedis: Cache user data
  UserHandler-->>API: Return response
  API-->>Client: Respond with result
```

## ✨ Technology Overview

- **Language:** Go 1.21
- **API Layer:** net/http
- **Project Structure:** Clean architecture (handler, model, mock)
- **Testing:** go test (unit tests)
- **Mocking:** Custom mock implementations (db, queue, redis)
- **Dependency Management:** Go Modules (go.mod)
- **Code Formatting:** go fmt
- **Linting:** golint

## 🚀 Usage

- **Install dependencies:**

  ```sh
  go mod tidy
  ```

- **Run the service:**

  ```sh
  go run ./cmd/main.go
  ```

- **Run all unit tests:**

  ```sh
  go test ./...
  ```

- **Run smoke test:**

  ```sh
  go run ./test/smoke_client.go
  ```

- **Format code:**

  ```sh
  go fmt ./...
  ```

- **Lint code:**

  ```sh
  golint ./...
  ```
