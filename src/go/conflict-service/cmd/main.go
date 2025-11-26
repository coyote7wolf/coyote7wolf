package main

import (
	"log"
	"net"

	conflictpb "conflictcservice/api/conflictpb"
	"conflictcservice/internal/conflict"
	"conflictcservice/internal/mock"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	// DI: 建立 mock 依賴
	crdt := mock.NewMockCRDT()
	auth := &mock.MockAuth{}
	redis := &mock.MockRedis{}
	mq := &mock.MockMQ{}
	deps := conflict.ServiceDeps{
		CRDT:  crdt,
		Auth:  auth,
		Redis: redis,
		MQ:    mq,
	}

	lis, err := net.Listen("tcp", ":3203")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	handler := conflict.NewHandler(deps)
	conflictpb.RegisterConflictServiceServer(grpcServer, handler)
 	// 啟用 gRPC reflection 以支援 grpcurl smoke 測試
 	reflection.Register(grpcServer)
	log.Println("ConflictService gRPC server listening on :3203")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
