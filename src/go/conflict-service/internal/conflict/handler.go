package conflict

import (
	conflictpb "conflictcservice/api/conflictpb"
	"conflictcservice/internal/mock"
	"context"
)

type ServiceDeps struct {
	CRDT  mock.CRDT
	Auth  mock.Auth
	Redis mock.Redis
	MQ    mock.MQ
}

type Handler struct {
	conflictpb.UnimplementedConflictServiceServer
	deps ServiceDeps
}

func NewHandler(deps ServiceDeps) *Handler {
	return &Handler{deps: deps}
}

func (h *Handler) ResolveConflict(ctx context.Context, req *conflictpb.ResolveConflictRequest) (*conflictpb.ResolveConflictResponse, error) {
	if !h.deps.Auth.CheckPermission(req.UserId, req.DocId, req.Section, "resolve") {
		return &conflictpb.ResolveConflictResponse{Resolved: false, Message: "permission denied"}, nil
	}
	merged, resolved := h.deps.CRDT.Merge(req.DocId, req.Section, "", req.Delta, mock.CRDTStrategy(req.Version))
	if resolved {
		h.deps.Redis.Publish("conflict.resolved", req.DocId+":"+req.Section)
		h.deps.MQ.Send("conflict.resolved", req.DocId+":"+req.Section)
	}
	return &conflictpb.ResolveConflictResponse{
		Resolved:      resolved,
		MergedContent: merged,
		ConflictId:    req.DocId + ":" + req.Section,
		Message:       "ok",
	}, nil
}

func (h *Handler) GetConflictStatus(ctx context.Context, req *conflictpb.GetConflictStatusRequest) (*conflictpb.GetConflictStatusResponse, error) {
	if !h.deps.Auth.CheckPermission(req.UserId, req.DocId, req.Section, "status") {
		return &conflictpb.GetConflictStatusResponse{HasConflict: false, Message: "permission denied"}, nil
	}
	has, id, status := h.deps.CRDT.GetConflictStatus(req.DocId, req.Section)
	return &conflictpb.GetConflictStatusResponse{
		HasConflict: has,
		ConflictId:  id,
		Status:      status,
		Message:     "ok",
	}, nil
}

func (h *Handler) ListConflicts(ctx context.Context, req *conflictpb.ListConflictsRequest) (*conflictpb.ListConflictsResponse, error) {
	if !h.deps.Auth.CheckPermission(req.UserId, req.DocId, "", "list") {
		return &conflictpb.ListConflictsResponse{}, nil
	}
	infos := h.deps.CRDT.ListConflicts(req.DocId)
	var result []*conflictpb.ConflictInfo
	for _, info := range infos {
		result = append(result, &conflictpb.ConflictInfo{
			ConflictId: info.ConflictID,
			DocId:      info.DocID,
			Section:    info.Section,
			Status:     info.Status,
			CreatedAt:  info.CreatedAt,
		})
	}
	return &conflictpb.ListConflictsResponse{Conflicts: result}, nil
}
