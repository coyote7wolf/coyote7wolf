package mock

import "testing"

func TestMockMQ_PublishSubscribe(t *testing.T) {
	mq := NewMockMQ()
	called := false
	topic := "t1"
	payload := "msg"
	traceID := "tid"
       if err := mq.Subscribe(topic, func(p, tid string) {
	       if p == payload && tid == traceID {
		       called = true
	       }
       }); err != nil {
	       t.Fatalf("mq.Subscribe failed: %v", err)
       }
	err := mq.Publish(topic, payload, traceID)
	if err != nil {
		t.Errorf("Publish should return nil")
	}
	if !called {
		t.Errorf("Subscribe handler not called on Publish")
	}
}

func TestMockMQ_ListTopics(t *testing.T) {
	mq := NewMockMQ()
       if err := mq.Subscribe("t1", func(string, string) {}); err != nil {
	       t.Fatalf("mq.Subscribe failed: %v", err)
       }
       if err := mq.Subscribe("t2", func(string, string) {}); err != nil {
	       t.Fatalf("mq.Subscribe failed: %v", err)
       }
	topics := mq.ListTopics()
	if len(topics) != 2 {
		t.Errorf("ListTopics should return all topics, got %v", topics)
	}
}
