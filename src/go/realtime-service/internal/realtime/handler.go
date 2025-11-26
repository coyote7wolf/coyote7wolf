package realtime

import (
	"context"
	"syncCoreAI-realtime-service/api/realtimepb"
	"syncCoreAI-realtime-service/internal/mock"
)

type ServiceDeps struct {
	Redis mock.Redis
	MQ    mock.MQ
	DB    mock.DB
	Auth  mock.Auth
	User  mock.User
}

type Handler struct {
	realtimepb.UnimplementedRealtimeServiceServer
	deps ServiceDeps
}

func NewHandler(deps ServiceDeps) *Handler {
	return &Handler{deps: deps}
}

func (h *Handler) Connect(ctx context.Context, req *realtimepb.ConnectRequest) (*realtimepb.ConnectResponse, error) {
	userID, role, ok := h.deps.User.GetUser(req.Token)
	if !ok || !h.deps.Auth.CheckPermission(req.Token, "", "connect") {
		return &realtimepb.ConnectResponse{Success: false, Message: "unauthorized"}, nil
	}
	// Presence 註冊可寫入 Redis/MQ/DB
	return &realtimepb.ConnectResponse{UserId: userID, Role: role, Success: true, Message: "ok"}, nil
}

func (h *Handler) BroadcastPresence(ctx context.Context, req *realtimepb.PresenceEvent) (*realtimepb.PresenceAck, error) {
	if !h.deps.Auth.CheckPermission("", req.RoomId, "presence") {
		return &realtimepb.PresenceAck{Success: false, Message: "unauthorized"}, nil
	}
	h.deps.Redis.Publish("presence:"+req.RoomId, req.Status)
	return &realtimepb.PresenceAck{Success: true, Message: "ok"}, nil
}

func (h *Handler) SubscribeRoom(req *realtimepb.RoomSubscribeRequest, stream realtimepb.RealtimeService_SubscribeRoomServer) error {
	if !h.deps.Auth.CheckPermission(req.Token, req.RoomId, "subscribe") {
		return nil
	}
	ch := make(chan string)
	h.deps.Redis.Subscribe("room:"+req.RoomId, func(msg string) {
		stream.Send(&realtimepb.RoomEvent{
			RoomId: req.RoomId,
			UserId: "mock-user",
			EventType: "message",
			Payload: msg,
			Timestamp: "2025-01-01T00:00:00Z",
		})
	})
	<-ch // mock: block forever
	return nil
}

func (h *Handler) PushRoomEvent(ctx context.Context, req *realtimepb.RoomEvent) (*realtimepb.EventAck, error) {
	if !h.deps.Auth.CheckPermission("", req.RoomId, "push") {
		return &realtimepb.EventAck{Success: false, Message: "unauthorized"}, nil
	}
	h.deps.Redis.Publish("room:"+req.RoomId, req.Payload)
	h.deps.DB.SaveEvent(req.RoomId, req.Payload)
	return &realtimepb.EventAck{Success: true, Message: "ok"}, nil
}
