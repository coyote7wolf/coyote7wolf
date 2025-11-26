PROTOC_GEN_GO := $(shell which protoc-gen-go)
PROTOC_GEN_GO_GRPC := $(shell which protoc-gen-go-grpc)
PROTO_SRC := api/event.proto
PROTO_OUT := api/eventpb

.PHONY: proto
proto:
	mkdir -p $(PROTO_OUT)
	protoc --go_out=$(PROTO_OUT) --go-grpc_out=$(PROTO_OUT) --go_opt=paths=source_relative --go-grpc_opt=paths=source_relative $(PROTO_SRC)

.PHONY: run
run:
	@echo "[run] Releasing port 3301 if occupied..."
	-lsof -i :3301 | grep LISTEN | awk '{print $$2}' | xargs kill -9 || true
	go run ./cmd/main.go

.PHONY: test
# 單元測試（不包含 smoke test）
test:
	go test ./internal/... ./api/...


# Go gRPC client smoke test
.PHONY: smoke-go
smoke-go:
	go run ./test/smoke_client.go

# 自動啟動服務並執行 smoke 測試
.PHONY: smoke-auto
smoke-auto:
	@echo "[smoke-auto] Releasing port 3301 if occupied..."
	-lsof -i :3301 | grep LISTEN | awk '{print $$2}' | xargs kill -9 || true
	@echo "[smoke-auto] Starting service in background..."
	( make run & echo $$! > .service_pid )
	sleep 2
	@echo "[smoke-auto] Running Go gRPC client smoke test..."
	-go run ./test/smoke_client.go || (echo "[smoke-auto] Go client smoke test failed" && (kill `cat .service_pid` 2>/dev/null || true) && rm -f .service_pid && exit 1)
	@echo "[smoke-auto] Running grpcurl smoke test..."
	-sh scripts/smoke_grpcurl.sh || (echo "[smoke-auto] grpcurl smoke test failed" && (kill `cat .service_pid` 2>/dev/null || true) && rm -f .service_pid && exit 1)
	@echo "[smoke-auto] Smoke tests completed. Stopping service..."
	-kill `cat .service_pid` 2>/dev/null || true
	rm -f .service_pid
	@echo "[smoke-auto] Done."

# coverage（含產生碼）
.PHONY: coverage
coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -func=coverage.out

# 業務邏輯 coverage（排除 proto/main/mock）
.PHONY: coverage-core
coverage-core:
	go test -coverprofile=coverage_core.out -coverpkg=./internal/... ./internal/...
	go tool cover -func=coverage_core.out

# 格式化所有 Go 檔案
.PHONY: format
format:
	gofmt -w .

# Lint 所有 Go 檔案（優先用 golangci-lint，否則用 go vet）
.PHONY: lint
lint:
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run ./... ; \
	else \
		go vet ./... ; \
	fi
