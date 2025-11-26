package conflict

import (
	"context"
	"testing"

	conflictpb "conflictcservice/api/conflictpb"
	"conflictcservice/internal/mock"
)

// 權限失敗 mock
type denyAuth struct{}

func (a *denyAuth) CheckPermission(userID, docID, section, action string) bool { return false }

func TestHandler_ResolveConflict_PermissionDenied(t *testing.T) {
	h := NewHandler(ServiceDeps{
		CRDT:  mock.NewMockCRDT(),
		Auth:  &denyAuth{},
		Redis: &mock.MockRedis{},
		MQ:    &mock.MockMQ{},
	})
	resp, err := h.ResolveConflict(context.Background(), &conflictpb.ResolveConflictRequest{
		UserId:  "u1",
		DocId:   "d1",
		Section: "s1",
		Delta:   "delta",
		Version: "LWW",
	})
	if err != nil || resp.Resolved || resp.Message != "permission denied" {
		t.Errorf("ResolveConflict 權限失敗未正確處理: err=%v, resp=%+v", err, resp)
	}
}

func TestHandler_GetConflictStatus_PermissionDenied(t *testing.T) {
	h := NewHandler(ServiceDeps{
		CRDT:  mock.NewMockCRDT(),
		Auth:  &denyAuth{},
		Redis: &mock.MockRedis{},
		MQ:    &mock.MockMQ{},
	})
	resp, err := h.GetConflictStatus(context.Background(), &conflictpb.GetConflictStatusRequest{
		UserId:  "u1",
		DocId:   "d2",
		Section: "s2",
	})
	if err != nil || resp.HasConflict || resp.Message != "permission denied" {
		t.Errorf("GetConflictStatus 權限失敗未正確處理: err=%v, resp=%+v", err, resp)
	}
}

func TestHandler_ListConflicts_PermissionDenied(t *testing.T) {
	h := NewHandler(ServiceDeps{
		CRDT:  mock.NewMockCRDT(),
		Auth:  &denyAuth{},
		Redis: &mock.MockRedis{},
		MQ:    &mock.MockMQ{},
	})
	resp, err := h.ListConflicts(context.Background(), &conflictpb.ListConflictsRequest{
		UserId: "u1",
		DocId:  "d3",
	})
	if err != nil || len(resp.Conflicts) != 0 {
		t.Errorf("ListConflicts 權限失敗未正確處理: err=%v, resp=%+v", err, resp)
	}
}

func newTestHandler() *Handler {
	return NewHandler(mockDeps())
}

func mockDeps() ServiceDeps {
	return ServiceDeps{
		CRDT:  mock.NewMockCRDT(),
		Auth:  &mock.MockAuth{},
		Redis: &mock.MockRedis{},
		MQ:    &mock.MockMQ{},
	}
}

func TestHandler_ResolveConflict(t *testing.T) {
	h := newTestHandler()
	resp, err := h.ResolveConflict(context.Background(), &conflictpb.ResolveConflictRequest{
		UserId:  "u1",
		DocId:   "d1",
		Section: "s1",
		Delta:   "delta",
		Version: "LWW",
	})
	if err != nil || !resp.Resolved {
		t.Errorf("ResolveConflict failed: err=%v, resp=%+v", err, resp)
	}
}

func TestHandler_GetConflictStatus(t *testing.T) {
	h := newTestHandler()
	// 先產生一個 conflict
	h.ResolveConflict(context.Background(), &conflictpb.ResolveConflictRequest{
		UserId:  "u1",
		DocId:   "d2",
		Section: "s2",
		Delta:   "delta",
		Version: "LWW",
	})
	resp, err := h.GetConflictStatus(context.Background(), &conflictpb.GetConflictStatusRequest{
		UserId:  "u1",
		DocId:   "d2",
		Section: "s2",
	})
	if err != nil || !resp.HasConflict {
		t.Errorf("GetConflictStatus failed: err=%v, resp=%+v", err, resp)
	}
}

func TestHandler_ListConflicts(t *testing.T) {
	h := newTestHandler()
	h.ResolveConflict(context.Background(), &conflictpb.ResolveConflictRequest{
		UserId:  "u1",
		DocId:   "d3",
		Section: "s3",
		Delta:   "delta",
		Version: "LWW",
	})
	resp, err := h.ListConflicts(context.Background(), &conflictpb.ListConflictsRequest{
		UserId: "u1",
		DocId:  "d3",
	})
	if err != nil || len(resp.Conflicts) == 0 {
		t.Errorf("ListConflicts failed: err=%v, resp=%+v", err, resp)
	}
}
