package main

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	api "syncservice/api"
)

func main() {
   ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
   defer cancel()
   //nolint:staticcheck // grpc.DialContext 在 1.x 仍為主流安全用法
   conn, err := grpc.DialContext(ctx, "localhost:3202", grpc.WithTransportCredentials(insecure.NewCredentials()))
   if err != nil {
      log.Fatalf("did not connect: %v", err)
   }
   defer func() {
      if err := conn.Close(); err != nil {
         log.Printf("conn.Close() error: %v", err)
      }
   }()
   client := api.NewSyncServiceClient(conn)

   // 1. SyncDelta
   resp1, err := client.SyncDelta(ctx, &api.SyncDeltaRequest{UserId: "u1", DocId: "d1", Delta: "patch1"})
   if err != nil || !resp1.Success {
	   log.Fatalf("SyncDelta failed: %v", err)
   }
   log.Printf("SyncDelta OK: version=%s", resp1.VersionId)

   // 2. GetVersions
   resp2, err := client.GetVersions(ctx, &api.GetVersionsRequest{UserId: "u1", DocId: "d1"})
   if err != nil || len(resp2.VersionIds) == 0 {
	   log.Fatalf("GetVersions failed: %v", err)
   }
   log.Printf("GetVersions OK: versions=%v", resp2.VersionIds)

   // 3. Replay
   resp3, err := client.Replay(ctx, &api.ReplayRequest{UserId: "u1", DocId: "d1", Deltas: []string{"p1", "p2"}})
   if err != nil || !resp3.Success {
	   log.Fatalf("Replay failed: %v", err)
   }
   log.Printf("Replay OK")

   // 4. GetStatus
   resp4, err := client.GetStatus(ctx, &api.GetStatusRequest{UserId: "u1", DocId: "d1"})
   if err != nil || resp4.Status == "" {
	   log.Fatalf("GetStatus failed: %v", err)
   }
   log.Printf("GetStatus OK: status=%s", resp4.Status)

   log.Println("Go gRPC client smoke test completed.")
}
