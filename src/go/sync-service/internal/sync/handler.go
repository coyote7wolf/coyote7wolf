package sync

import (
	context "context"

	"syncservice/api"
	"syncservice/internal/mock"
)

// DI struct

type SyncHandler struct {
	api.UnimplementedSyncServiceServer
	repo  Repo
	saga  Saga
	crdt  CRDT
	auth  Auth
	redis Redis
	mq    MQ
}

func NewSyncHandler(repo Repo, saga Saga, crdt CRDT, auth Auth, redis Redis, mq MQ) *SyncHandler {
	return &SyncHandler{
		UnimplementedSyncServiceServer: api.UnimplementedSyncServiceServer{},
		repo:                           repo,
		saga:                           saga,
		crdt:                           crdt,
		auth:                           auth,
		redis:                          redis,
		mq:                             mq,
	}
}

// 實作 api.SyncServiceServer
func (h *SyncHandler) SyncDelta(ctx context.Context, req *api.SyncDeltaRequest) (*api.SyncDeltaResponse, error) {
	if !h.auth.CheckPermission(req.UserId, req.DocId) {
		return &api.SyncDeltaResponse{Success: false, VersionId: ""}, nil
	}
	h.redis.SaveDelta(req.DocId, req.Delta)
	h.saga.Start(req.DocId, req.UserId)
	h.crdt.Merge(req.DocId, req.Delta)
	h.mq.Publish("document.updated", req.DocId)
	return &api.SyncDeltaResponse{Success: true, VersionId: "v1-mock"}, nil
}

func (h *SyncHandler) GetVersions(ctx context.Context, req *api.GetVersionsRequest) (*api.GetVersionsResponse, error) {
	if !h.auth.CheckPermission(req.UserId, req.DocId) {
		return &api.GetVersionsResponse{}, nil
	}
	return &api.GetVersionsResponse{VersionIds: h.repo.GetVersions(req.DocId)}, nil
}

func (h *SyncHandler) Replay(ctx context.Context, req *api.ReplayRequest) (*api.ReplayResponse, error) {
	if !h.auth.CheckPermission(req.UserId, req.DocId) {
		return &api.ReplayResponse{Success: false}, nil
	}
	for _, d := range req.Deltas {
		h.redis.SaveDelta(req.DocId, d)
		h.crdt.Merge(req.DocId, d)
	}
	h.saga.Start(req.DocId, req.UserId)
	return &api.ReplayResponse{Success: true}, nil
}

func (h *SyncHandler) GetStatus(ctx context.Context, req *api.GetStatusRequest) (*api.GetStatusResponse, error) {
	if !h.auth.CheckPermission(req.UserId, req.DocId) {
		return &api.GetStatusResponse{Status: "unauthorized"}, nil
	}
	return &api.GetStatusResponse{Status: "ok-mock"}, nil
}

// interface 定義

// Repo defines the interface for version repository.
type Repo interface {
	// GetVersions returns the versions for the given docID.
	GetVersions(docID string) []string
}

// Saga defines the interface for workflow coordination.
type Saga interface {
	// Start begins a saga for the given document and user.
	Start(docID, userID string)
}

// CRDT defines the interface for CRDT operations.
type CRDT interface {
	// Merge merges a delta into the document with the given docID.
	Merge(docID, delta string)
}
type Auth interface {
	CheckPermission(userId, docId string) bool
}
type Redis interface {
	SaveDelta(docId, delta string)
}
type MQ interface {
	Publish(topic, docId string)
}

// mock 實作
func NewMockRepo() Repo   { return &mock.MockRepo{} }
func NewMockSaga() Saga   { return &mock.MockSaga{} }
func NewMockCRDT() CRDT   { return &mock.MockCRDT{} }
func NewMockAuth() Auth   { return &mock.MockAuth{} }
func NewMockRedis() Redis { return &mock.MockRedis{} }
func NewMockMQ() MQ       { return &mock.MockMQ{} }
