package main

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "syncservice/api/eventpb"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	conn, err := grpc.NewClient("localhost:3301", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("conn.Close() error: %v", err)
		}
	}()
	client := pb.NewEventBusClient(conn)

	// 1. PublishEvent
	resp1, err := client.PublishEvent(ctx, &pb.PublishEventRequest{
		Topic:   "test-topic",
		Payload: "hello",
		Token:   "test-token",
	})
	if err != nil || !resp1.Success {
		log.Fatalf("PublishEvent failed: %v", err)
	}
	log.Printf("PublishEvent OK: trace_id=%s", resp1.TraceId)

	// 2. ListTopics
	resp2, err := client.ListTopics(ctx, &pb.ListTopicsRequest{
		Token: "test-token",
	})
	if err != nil || len(resp2.Topics) == 0 {
		log.Fatalf("ListTopics failed: %v", err)
	}
	log.Printf("ListTopics OK: topics=%v", resp2.Topics)

	// 3. SubscribeEvent (smoke, 1 event)
	stream, err := client.SubscribeEvent(ctx, &pb.SubscribeEventRequest{
		Topic: "test-topic",
		Token: "test-token",
	})
	if err != nil {
		log.Fatalf("SubscribeEvent failed: %v", err)
	}
	msg, err := stream.Recv()
	if err != nil {
		log.Fatalf("SubscribeEvent Recv failed: %v", err)
	}
	log.Printf("SubscribeEvent OK: topic=%s, payload=%s", msg.Topic, msg.Payload)

	log.Println("Go gRPC client smoke test completed.")
}
