
# ===== proto 產生 =====
PROTOC_GEN_GO := $(shell which protoc-gen-go)
PROTOC_GEN_GO_GRPC := $(shell which protoc-gen-go-grpc)
PROTO_SRC := api/conflict.proto
PROTO_OUT := api/conflictpb

.PHONY: proto
proto:
	mkdir -p $(PROTO_OUT)
	protoc --go_out=$(PROTO_OUT) --go-grpc_out=$(PROTO_OUT) --go_opt=paths=source_relative --go-grpc_opt=paths=source_relative $(PROTO_SRC)

# ===== 服務啟動 =====
.PHONY: run
run:
	go run ./cmd/main.go

# ===== 單元測試 =====
.PHONY: test
test:
	go test ./...

# ===== smoke 測試 =====
.PHONY: smoke-go
smoke-go:
	go run ./test/smoke_client.go

.PHONY: smoke-auto
smoke-auto:
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

.PHONY: smoke
smoke:
	sh scripts/smoke_grpcurl.sh

# ===== Lint/Format =====
.PHONY: lint
lint:
	@golint ./...

.PHONY: format
format:
	gofmt -w .

# ===== CI/測試用短暫啟動 =====
.PHONY: test-run
test-run:
	@echo "[test-run] Starting service for 10 seconds..."
	( ( make run & ) ; pid=$$!; sleep 10; echo "[test-run] Stopping service (pid: $$pid)..."; kill $$pid 2>/dev/null || true )
	@echo "[test-run] Done."

# ===== coverage =====
.PHONY: coverage
coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -func=coverage.out

# 業務邏輯聚焦 coverage（排除 proto/main/mock）
.PHONY: coverage-core
coverage-core:
	go test -coverprofile=coverage_core.out -coverpkg=./internal/... ./internal/...
	go tool cover -func=coverage_core.out
