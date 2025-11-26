package mock

type MQ interface {
	Publish(topic, payload string) error
	Subscribe(topic string, handler func(string)) error
}

type MockMQ struct {
	topics map[string][]func(string)
}

func NewMockMQ() *MockMQ {
	return &MockMQ{topics: make(map[string][]func(string))}
}

func (m *MockMQ) Publish(topic, payload string) error {
	for _, h := range m.topics[topic] {
		h(payload)
	}
	return nil
}

func (m *MockMQ) Subscribe(topic string, handler func(string)) error {
	m.topics[topic] = append(m.topics[topic], handler)
	return nil
}
