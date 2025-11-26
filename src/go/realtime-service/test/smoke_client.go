package main

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "syncCoreAI-realtime-service/api/realtimepb"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	conn, err := grpc.DialContext(ctx, "localhost:3302", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("conn.Close() error: %v", err)
		}
	}()
	client := pb.NewRealtimeServiceClient(conn)

	// 1. Connect
	resp1, err := client.Connect(ctx, &pb.ConnectRequest{
		Token:    "test-token",
		DeviceId: "dev1",
	})
	if err != nil || !resp1.Success {
		log.Fatalf("Connect failed: %v", err)
	}
	log.Printf("Connect OK: user_id=%s, role=%s", resp1.UserId, resp1.Role)

	// 2. BroadcastPresence
	resp2, err := client.BroadcastPresence(ctx, &pb.PresenceEvent{
		UserId:   resp1.UserId,
		Status:   "online",
		RoomId:   "r1",
		DeviceId: "dev1",
	})
	if err != nil || !resp2.Success {
		log.Fatalf("BroadcastPresence failed: %v", err)
	}
	log.Printf("BroadcastPresence OK")

	// 3. PushRoomEvent
	resp3, err := client.PushRoomEvent(ctx, &pb.RoomEvent{
		RoomId:    "r1",
		UserId:    resp1.UserId,
		EventType: "message",
		Payload:   "hello",
		Timestamp: "2025-01-01T00:00:00Z",
	})
	if err != nil || !resp3.Success {
		log.Fatalf("PushRoomEvent failed: %v", err)
	}
	log.Printf("PushRoomEvent OK")

	// 4. SubscribeRoom (smoke, 1 event)
	stream, err := client.SubscribeRoom(ctx, &pb.RoomSubscribeRequest{
		Token:  "test-token",
		RoomId: "r1",
	})
	if err != nil {
		log.Fatalf("SubscribeRoom failed: %v", err)
	}
	msg, err := stream.Recv()
	if err != nil {
		log.Fatalf("SubscribeRoom Recv failed: %v", err)
	}
	log.Printf("SubscribeRoom OK: event_type=%s, payload=%s", msg.EventType, msg.Payload)

	log.Println("Go gRPC client smoke test completed.")
}
