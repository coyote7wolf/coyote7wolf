package sync

import (
	"context"
	"syncservice/api"
	"testing"
)

func TestSyncDelta(t *testing.T) {
	h := NewSyncHandler(NewMockRepo(), NewMockSaga(), NewMockCRDT(), NewMockAuth(), NewMockRedis(), NewMockMQ())
	resp, err := h.SyncDelta(context.Background(), &api.SyncDeltaRequest{UserId: "u1", DocId: "d1", Delta: "patch1"})
	if err != nil || !resp.Success {
		t.Fatalf("SyncDelta failed: %v", err)
	}
}

func TestGetVersions(t *testing.T) {
	h := NewSyncHandler(NewMockRepo(), NewMockSaga(), NewMockCRDT(), NewMockAuth(), NewMockRedis(), NewMockMQ())
	resp, err := h.GetVersions(context.Background(), &api.GetVersionsRequest{UserId: "u1", DocId: "d1"})
	if err != nil || len(resp.VersionIds) == 0 {
		t.Fatalf("GetVersions failed: %v", err)
	}
}

func TestReplay(t *testing.T) {
	h := NewSyncHandler(NewMockRepo(), NewMockSaga(), NewMockCRDT(), NewMockAuth(), NewMockRedis(), NewMockMQ())
	resp, err := h.Replay(context.Background(), &api.ReplayRequest{UserId: "u1", DocId: "d1", Deltas: []string{"p1", "p2"}})
	if err != nil || !resp.Success {
		t.Fatalf("Replay failed: %v", err)
	}
}

func TestGetStatus(t *testing.T) {
	h := NewSyncHandler(NewMockRepo(), NewMockSaga(), NewMockCRDT(), NewMockAuth(), NewMockRedis(), NewMockMQ())
	resp, err := h.GetStatus(context.Background(), &api.GetStatusRequest{UserId: "u1", DocId: "d1"})
	if err != nil || resp.Status == "" {
		t.Fatalf("GetStatus failed: %v", err)
	}
}
