package mock

import "testing"

func TestMockMQ_Send(t *testing.T) {
	mq := &MockMQ{}
	err := mq.Send("topic", "msg")
	if err != nil {
		t.Errorf("Send should return nil, got %v", err)
	}
}
