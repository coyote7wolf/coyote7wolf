PROTOC_GEN_GO := $(shell which protoc-gen-go)
PROTOC_GEN_GO_GRPC := $(shell which protoc-gen-go-grpc)
PROTOC := $(shell which protoc)

.PHONY: all proto run test smoke lint format clean

all: proto build

proto:
	@if [ ! -x "$(PROTOC)" ]; then echo "protoc not found"; exit 1; fi
	@if [ ! -x "$(PROTOC_GEN_GO)" ]; then echo "protoc-gen-go not found"; exit 1; fi
	@if [ ! -x "$(PROTOC_GEN_GO_GRPC)" ]; then echo "protoc-gen-go-grpc not found"; exit 1; fi
	$(PROTOC) --go_out=paths=source_relative:./api --go-grpc_out=paths=source_relative:./api -I ./api ./api/realtime.proto

build:
	go build -o bin/realtime-server ./cmd/main.go

run:
	go run ./cmd/main.go

test:
	go test ./...

smoke:
	go run ./test/smoke_client.go

lint:
	golangci-lint run ./...

format:
	gofmt -w .

clean:
	rm -rf bin
	rm -f ./api/*.pb.go
