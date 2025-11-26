package main

import (
	"log"
	"net"

	"google.golang.org/grpc"

	"syncservice/api"
	"syncservice/internal/sync"
)

func main() {
	lis, err := net.Listen("tcp", ":3202")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	// DI: 注入 mock 依賴
	handler := sync.NewSyncHandler(
		sync.NewMockRepo(),
		sync.NewMockSaga(),
		sync.NewMockCRDT(),
		sync.NewMockAuth(),
		sync.NewMockRedis(),
		sync.NewMockMQ(),
	)
	api.RegisterSyncServiceServer(grpcServer, handler)
	log.Println("syncCoreAI-sync-service running on :3202")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
