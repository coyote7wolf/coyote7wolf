# Go gRPC client smoke test
.PHONY: smoke-go
smoke-go:
	go run ./test/smoke_client.go
## 自動啟動服務並執行 smoke 測試，結束後自動關閉服務
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
# Lint all Go files
.PHONY: lint
lint:
	@golint ./...
# Format all Go files
.PHONY: format
format:
	gofmt -w .
# Run the service for 10 seconds for test/CI
.PHONY: test-run
test-run:
	@echo "[test-run] Starting service for 10 seconds..."
	( ( make run & ) ; pid=$$!; sleep 10; echo "[test-run] Stopping service (pid: $$pid)..."; kill $$pid 2>/dev/null || true )
	@echo "[test-run] Done."
# Makefile for syncCoreAI-sync-service

run:
	go run ./cmd/main.go

test:
	go test ./...

smoke:
	sh scripts/smoke_grpcurl.sh

coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -func=coverage.out

# 業務邏輯聚焦 coverage（排除 proto/main/mock）
.PHONY: coverage-core
coverage-core:
	go test -coverprofile=coverage_core.out -coverpkg=./internal/... ./internal/...
	go tool cover -func=coverage_core.out
