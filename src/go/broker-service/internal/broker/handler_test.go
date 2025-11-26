package broker

import (
	"context"
	"testing"

	"google.golang.org/grpc/metadata"

	"syncservice/api/eventpb"
	"syncservice/internal/mock"
)

type mockAuth struct{}

func (a *mockAuth) CheckPermission(token, topic, action string) bool { return true }

type mockTrace struct{}

func (t *mockTrace) NewTraceID() string { return "mock-trace-id" }

// mockStream 用於測試 SubscribeEvent
type mockStream struct {
	sent []*eventpb.EventEnvelope
	ctx  context.Context
}

func (m *mockStream) Send(e *eventpb.EventEnvelope) error {
	m.sent = append(m.sent, e)
	return nil
}
func (m *mockStream) Context() context.Context        { return m.ctx }
func (m *mockStream) SendMsg(interface{}) error       { return nil }
func (m *mockStream) RecvMsg(interface{}) error       { return nil }
func (m *mockStream) SendHeader(md metadata.MD) error { return nil }
func (m *mockStream) SetHeader(md metadata.MD) error  { return nil }
func (m *mockStream) SetTrailer(md metadata.MD)       {}

func TestSubscribeEvent_Success(t *testing.T) {
	mq := mock.NewMockMQ()
	redis := &mock.MockRedis{}
	db := mock.NewMockDB()
	h := NewHandler(ServiceDeps{
		MQ:    mq,
		Redis: redis,
		DB:    db,
		Auth:  &mockAuth{},
		Trace: &mockTrace{},
	})
	stream := &mockStream{ctx: context.Background()}
	req := &eventpb.SubscribeEventRequest{
		Topic: "test-topic",
		Token: "valid-token",
	}
	err := h.SubscribeEvent(req, stream)
	if err != nil {
		t.Fatalf("SubscribeEvent error: %v", err)
	}
	if len(stream.sent) != 1 {
		t.Fatalf("expected 1 event, got %d", len(stream.sent))
	}
	got := stream.sent[0]
	if got.Topic != "test-topic" || got.Payload != "mock-payload" {
		t.Errorf("unexpected event: %+v", got)
	}
}

func TestPublishEvent_Success(t *testing.T) {
	mq := mock.NewMockMQ()
	redis := &mock.MockRedis{}
	db := mock.NewMockDB()
	h := NewHandler(ServiceDeps{
		MQ:    mq,
		Redis: redis,
		DB:    db,
		Auth:  &mockAuth{},
		Trace: &mockTrace{},
	})
	req := &eventpb.PublishEventRequest{
		Topic:   "test-topic",
		Payload: "hello",
		Token:   "valid-token",
	}
	resp, err := h.PublishEvent(context.Background(), req)
	if err != nil {
		t.Fatalf("PublishEvent error: %v", err)
	}
	if !resp.Success {
		t.Fatalf("PublishEvent not success: %v", resp.Message)
	}
	if resp.TraceId != "mock-trace-id" {
		t.Fatalf("unexpected trace id: %v", resp.TraceId)
	}
}

func TestListTopics_Success(t *testing.T) {
	mq := mock.NewMockMQ()
       if err := mq.Subscribe("topic1", func(string, string) {}); err != nil {
	       t.Fatalf("mq.Subscribe failed: %v", err)
       }
	h := NewHandler(ServiceDeps{
		MQ:    mq,
		Redis: &mock.MockRedis{},
		DB:    mock.NewMockDB(),
		Auth:  &mockAuth{},
		Trace: &mockTrace{},
	})
	req := &eventpb.ListTopicsRequest{Token: "valid-token"}
	resp, err := h.ListTopics(context.Background(), req)
	if err != nil {
		t.Fatalf("ListTopics error: %v", err)
	}
	if len(resp.Topics) == 0 {
		t.Fatalf("ListTopics should return topics")
	}
}

func TestListTopics_Empty(t *testing.T) {
	mq := mock.NewMockMQ()
	h := NewHandler(ServiceDeps{
		MQ:    mq,
		Redis: &mock.MockRedis{},
		DB:    mock.NewMockDB(),
		Auth:  &mockAuth{},
		Trace: &mockTrace{},
	})
	req := &eventpb.ListTopicsRequest{Token: "valid-token"}
	resp, err := h.ListTopics(context.Background(), req)
	if err != nil {
		t.Fatalf("ListTopics error: %v", err)
	}
	if len(resp.Topics) == 0 {
		t.Fatalf("ListTopics should return default topic")
	}
}
