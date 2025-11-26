# Realtime Service

A real-time gRPC service for presence, room events, and push notifications, enabling collaborative features for distributed applications in Go.

## 🗂️ Architecture Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TD
 Client[Client]
 GRPCServer[gRPC Realtime Service]
 Presence[Presence Engine]
 Room[Room Event Engine]
 MQ[Message Queue PubSub]
 Redis[Redis Cache State]
 DB[Database]

 Client -->|gRPC| GRPCServer
 GRPCServer --> Presence
 GRPCServer --> Room
 Presence --> MQ
 Room --> MQ
 Presence --> Redis
 Room --> Redis
 Presence --> DB
 Room --> DB
 MQ --> Presence
 MQ --> Room
 Redis --> Presence
 Redis --> Room
 DB --> Presence
 DB --> Room
```

---

## 🔄 Data Flow Sequence Diagram (Mermaid)

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
autonumber
 participant Client
 participant GRPCServer as gRPC Realtime Service
 participant Presence
 participant Room
 participant MQ as Message Queue
 participant Redis
 participant DB as Database

 Client->>GRPCServer: Connect / Push Event (gRPC)
 GRPCServer->>Presence: Register/Update presence
 GRPCServer->>Room: Push/Subscribe room event
 Presence->>MQ: Publish presence event
 Room->>MQ: Publish room event
 MQ-->>Presence: Ack / Event received
 MQ-->>Room: Ack / Event received
 Presence->>Redis: Update cache/state
 Room->>Redis: Update cache/state
 Presence->>DB: Persist presence
 Room->>DB: Persist event
 Presence-->>GRPCServer: Presence response
 Room-->>GRPCServer: Room response
 GRPCServer-->>Client: Return result
```

---

## ✨ Tech Stack Highlight

- **Language**: Go 1.x
- **Framework**: gRPC, Protobuf
- **Build Tool**: Make
- **Testing**: go test

---

## 🚀 Usage

- **Install dependencies:**

```sh
go mod tidy
```

- **Generate gRPC code from proto:**

```sh
make proto
```

- **Run the service:**

```sh
make run
# or
go run ./cmd/main.go
```

- **Run all unit tests:**

```sh
make test
# or
go test ./...
```

- **Run smoke test:**

```sh
make smoke
# or
go run ./test/smoke_client.go
```

- **Format code:**

```sh
make format
```

- **Lint code:**

```sh
make lint
```
