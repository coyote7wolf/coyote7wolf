package main

import (
	"context"
	"fmt"
	"log"
	"time"

	conflictpb "conflictcservice/api/conflictpb"

	"google.golang.org/grpc"
)

func main() {
	conn, err := grpc.Dial("localhost:3203", grpc.WithInsecure())
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}
	defer conn.Close()
	client := conflictpb.NewConflictServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// ResolveConflict
	resp, err := client.ResolveConflict(ctx, &conflictpb.ResolveConflictRequest{
		UserId:  "u1",
		DocId:   "d1",
		Section: "s1",
		Delta:   "delta-content",
		Version: "LWW",
	})
	if err != nil || !resp.Resolved {
		log.Fatalf("ResolveConflict failed: %v, resp: %+v", err, resp)
	}
	fmt.Println("ResolveConflict OK:", resp)

	// GetConflictStatus
	status, err := client.GetConflictStatus(ctx, &conflictpb.GetConflictStatusRequest{
		UserId:  "u1",
		DocId:   "d1",
		Section: "s1",
	})
	if err != nil || !status.HasConflict {
		log.Fatalf("GetConflictStatus failed: %v, status: %+v", err, status)
	}
	fmt.Println("GetConflictStatus OK:", status)

	// ListConflicts
	list, err := client.ListConflicts(ctx, &conflictpb.ListConflictsRequest{
		UserId: "u1",
		DocId:  "d1",
	})
	if err != nil || len(list.Conflicts) == 0 {
		log.Fatalf("ListConflicts failed: %v, list: %+v", err, list)
	}
	fmt.Println("ListConflicts OK:", list)
}
