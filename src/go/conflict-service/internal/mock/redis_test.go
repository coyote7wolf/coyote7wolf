package mock

import "testing"

func TestMockRedis_Publish(t *testing.T) {
	redis := &MockRedis{}
	err := redis.Publish("ch", "msg")
	if err != nil {
		t.Errorf("Publish should return nil, got %v", err)
	}
}
