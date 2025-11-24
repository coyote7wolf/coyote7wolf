# User Management CRUD API (Versioned: v1)

Spring Boot 3 user management API featuring clean architecture, OpenAPI documentation, modular adapters, and comprehensive test coverage.

## 🗂️ Architecture Diagram

```mermaid
flowchart TD
  subgraph API[REST API Layer]
    userController[UserController]
  end
  subgraph Service[Service Layer]
    userService[UserService]
  end
  subgraph Adapter[Adapters]
    userRepository[UserRepository]
    userCache[UserCache]
    userEventPublisher[UserEventPublisher]
  end
  subgraph Domain[Domain Model]
    userModel[User Model]
  end
  subgraph Common[Common/Config]
    globalExceptionHandler[GlobalExceptionHandler]
    openApiConfig[OpenApiConfig]
  end
  userController --> userService
  userService --> userRepository
  userService --> userCache
  userService --> userEventPublisher
  userService --> userModel
  userController --> globalExceptionHandler
  userController --> openApiConfig
```

---

## 🔄 Data Flow Sequence Diagram

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant API as UserController
  participant Service as UserService
  participant Repo as UserRepository
  participant Cache as UserCache
  participant Event as UserEventPublisher
  participant Model as UserModel
  participant Exception as GlobalExceptionHandler

  Client->>API: HTTP Request (CRUD)
  API->>Service: Validate & delegate
  Service->>Cache: Check/Update cache (if needed)
  Service->>Repo: Query/Update DB
  Repo-->>Service: User data
  Cache-->>Service: Cached data (if hit)
  Service->>Event: Publish event (if needed)
  Service-->>API: UserResponse / Error
  API-->>Client: HTTP Response
  API->>Exception: (on error) Handle exception
  Exception-->>Client: ErrorResponse
```

---

### 🛠️ Tech Stack Highlight

- **Language:** Java 21
- **Framework:** Spring Boot 3
- **Web:** spring-boot-starter-web, spring-boot-starter-validation
- **API Docs:** springdoc-openapi (Swagger UI)
- **Testing:** JUnit 5, Mockito, AssertJ
- **Code Quality:** Spotless (Google Java Style)
- **Coverage:** JaCoCo
- **Build Tool:** Maven
- **Profiles:** application.properties, application-dev.properties, application-test.properties
- **Extensible Adapters:** In-memory repository, cache, event publisher (extensible to JPA, Redis, MQ)
- **Dev Tools:** Makefile, pre-commit hook (Spotless)

---

## 🚀 Usage

### Build the project

```bash
./mvnw clean verify
```

### Run the application (default profile)

```bash
./mvnw spring-boot:run
```

### Run with development profile

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Run unit tests

```bash
./mvnw test
```

### Open Swagger UI

```bash
http://localhost:8080/swagger-ui/index.html
```

### Health check

```bash
curl -s http://localhost:8080/actuator/health | jq
```
