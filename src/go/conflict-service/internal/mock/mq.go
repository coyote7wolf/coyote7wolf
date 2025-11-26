package mock

type MQ interface {
	Send(topic, message string) error
}

type MockMQ struct{}

func (m *MockMQ) Send(topic, message string) error {
	// 模擬 MQ 發送
	return nil
}
