package main

import (
	"log"
	"net"

	pb "syncservice/api/eventpb"
	"syncservice/internal/broker"
	"syncservice/internal/mock"

	"google.golang.org/grpc/reflection"

	"google.golang.org/grpc"
)

func main() {
	// DI: 建立 mock 依賴
	mq := mock.NewMockMQ()
	redis := &mock.MockRedis{}
	db := mock.NewMockDB()
	auth := &mock.MockAuth{}
	trace := &mock.MockTrace{}
	deps := broker.ServiceDeps{
		MQ:    mq,
		Redis: redis,
		DB:    db,
		Auth:  auth,
		Trace: trace,
	}

	lis, err := net.Listen("tcp", ":3301")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	handler := broker.NewHandler(deps)
	pb.RegisterEventBusServer(grpcServer, handler)
	// 啟用 reflection 讓 grpcurl 可查詢服務
	reflection.Register(grpcServer)
	log.Println("BrokerService gRPC server listening on :3301")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
