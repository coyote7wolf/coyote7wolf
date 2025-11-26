package mock

import "testing"

func TestMockAuth_CheckPermission(t *testing.T) {
	auth := &MockAuth{}
	if !auth.CheckPermission("token", "topic", "action") {
		t.Error("CheckPermission should always return true in mock")
	}
}

func TestMockTrace_NewTraceID(t *testing.T) {
	trace := &MockTrace{}
	id := trace.NewTraceID()
	if id != "mock-trace-id" {
		t.Errorf("unexpected trace id: %v", id)
	}
}

func TestMockRedis_Publish(t *testing.T) {
	redis := &MockRedis{}
	err := redis.Publish("ch", "msg")
	if err != nil {
		t.Errorf("Publish should always return nil in mock")
	}
}

func TestMockDB_SaveAndGetEvents(t *testing.T) {
	db := NewMockDB()
	err := db.SaveEvent("topic", "payload", "trace")
	if err != nil {
		t.Errorf("SaveEvent should return nil")
	}
	events := db.GetEvents("topic")
	if len(events) != 1 || events[0] != "payload" {
		t.Errorf("GetEvents should return saved payload")
	}
}
