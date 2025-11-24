# C# .NET 9 Web API Skeleton / 範例骨架 (.NET 9)

A minimal ASP.NET Core 9 Web API starter with a health check endpoint only + Swagger (Development). 沒有 CRUD, 先提供最基本的骨架與啟動說明。

## Features / 功能

- .NET 9 Minimal API style
- Health endpoint: `GET /health`
- Versioned Users CRUD: `GET /api/v1/users`, `POST /api/v1/users`, `GET /api/v1/users/{id}`, `PUT /api/v1/users/{id}`, `DELETE /api/v1/users/{id}` (in-memory repository/cache/MQ mocks)
- Environment-based configuration (`appsettings*.json`)
- Ready to extend with Swagger / EF Core / Logging providers
- Swagger UI available in Development at `/swagger`

## Getting Started / 快速開始

### 1. Prerequisites / 先決條件

- Install .NET 9 SDK: <https://dotnet.microsoft.com/download>
- (Optional) IDE: VS Code + C# Dev Kit / Rider / Visual Studio

確認版本:

```bash
dotnet --version
```

### 2. Restore & Build / 還原與建置

```bash
dotnet restore
dotnet build
```

### 3. Run / 執行

```bash
dotnet run --project src/WebApi/WebApi.csproj
```

啟動後預設網址 (launchSettings 未被忽略時):

- <http://localhost:5088/health>
- <https://localhost:7088/health>

若 `.gitignore` 有忽略 `launchSettings.json`，則實際 Port 可能不同，執行時會在主控台輸出。自行查看輸出或指定 URL：

```bash
ASPNETCORE_URLS=http://localhost:5000 dotnet run --project src/WebApi/WebApi.csproj
```

### 4. Test Health Endpoint / 測試健康檢查

```bash
curl -s http://localhost:5088/health | jq
```

輸出應包含 `status` 與 `timestamp`。

### 5. Swagger

Development 環境自動啟用：

- Open: `http://localhost:5088/swagger`
  若你指定自訂 URL，替換對應 port。

### 6. Run Tests / 執行測試

```bash
dotnet test
```

測試內容：

- `HealthEndpointTests` 確認 `/health` 回傳 200 並包含 `status=Healthy`。
- `UserServiceTests` 驗證服務層 CRUD 與事件發布。
- `UserEndpointsTests` Smoke Test API CRUD 流程。

產生涵蓋率報告 (coverlet collector 已加入)：

```bash
dotnet test -p:CollectCoverage=true -p:CoverletOutputFormat=opencover
```

輸出 `coverage.opencover.xml` 可供分析工具 (如 ReportGenerator) 使用。

快速檢視 (需安裝 reportgenerator)：

```bash
dotnet tool install -g dotnet-reportgenerator-globaltool # 一次性
reportgenerator -reports:**/coverage.opencover.xml -targetdir:coveragereport
open coveragereport/index.html
```

## Users API 使用方式 / Users API Usage

### Create User

```bash
curl -s -X POST http://localhost:5088/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","displayName":"Alice"}' | jq
```

### List Users

```bash
curl -s http://localhost:5088/api/v1/users | jq
```

### Get User

```bash
USER_ID=<paste-id>
curl -s http://localhost:5088/api/v1/users/$USER_ID | jq
```

### Update User

```bash
curl -s -X PUT http://localhost:5088/api/v1/users/$USER_ID \
  -H 'Content-Type: application/json' \
  -d '{"displayName":"Alice Updated"}' | jq
```

### Delete User

```bash
curl -i -X DELETE http://localhost:5088/api/v1/users/$USER_ID
```

### Error Example

```bash
curl -s -X POST http://localhost:5088/api/v1/users -H 'Content-Type: application/json' -d '{"email":"bad","displayName":""}' | jq
```

回傳 `400` 與錯誤訊息。

## Project Structure / 專案結構

```text
src/
  WebApi/
    Program.cs
    WebApi.csproj
    appsettings.json
    appsettings.Development.json
```

## Next Steps / 下一步建議

- Add domain folders (e.g., `Modules/Users`)
- Introduce DTOs & validation (FluentValidation)
- Add persistence (EF Core, Dapper, etc.)
- Add unit tests project (`tests/`)
- Integrate Swagger & API versioning
- Add CI (GitHub Actions) & code analyzers
- Add Dockerfile & container build
- Implement CRUD sample (e.g., Todos)

## Makefile 快速指令

若偏好 Make：

```bash
make help              # 列出指令
make restore           # 還原套件
make build             # 建置
make run               # 啟動服務 (預設組態/port)
make run-port PORT=5000 # 指定 port
make test              # 執行測試
make coverage          # 執行測試並產生 coverage.opencover.xml
make coverage-report   # 生成 HTML 覆蓋率報告 (需 reportgenerator)
make clean             # 清除建置/覆蓋率輸出
```

## License

MIT (add a `LICENSE` file if needed)

---

Feel free to extend. 歡迎擴充！
