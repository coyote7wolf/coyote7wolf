package main

import (
	"log"
	"net"

	"google.golang.org/grpc"

	"syncCoreAI-realtime-service/internal/mock"
	realtime "syncCoreAI-realtime-service/internal/realtime"

	// "github.com/gorilla/websocket" // 可擴充 WebSocket
	// "github.com/googollee/go-socket.io" // 可擴充 Socket.IO
	"syncCoreAI-realtime-service/api/realtimepb"
)

func main() {
	// DI: 注入 mock 依賴
	deps := realtime.ServiceDeps{
		Redis: mock.NewMockRedis(),
		MQ:    mock.NewMockMQ(),
		DB:    mock.NewMockDB(),
		Auth:  &mock.MockAuth{},
		User:  &mock.MockUser{},
	}
	handler := realtime.NewHandler(deps)

	grpcServer := grpc.NewServer()
	realtimepb.RegisterRealtimeServiceServer(grpcServer, handler)

	lis, err := net.Listen("tcp", ":3302")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	log.Println("gRPC server listening on :3302")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
