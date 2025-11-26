package mock

type MQ interface {
	Publish(topic, payload, traceID string) error
	Subscribe(topic string, handler func(payload, traceID string)) error
	ListTopics() []string
}

type MockMQ struct {
	topics map[string][]func(payload, traceID string)
}

func NewMockMQ() *MockMQ {
	return &MockMQ{topics: make(map[string][]func(payload, traceID string))}
}

func (m *MockMQ) Publish(topic, payload, traceID string) error {
	for _, h := range m.topics[topic] {
		h(payload, traceID)
	}
	return nil
}

func (m *MockMQ) Subscribe(topic string, handler func(payload, traceID string)) error {
	m.topics[topic] = append(m.topics[topic], handler)
	return nil
}

func (m *MockMQ) ListTopics() []string {
	var result []string
	for t := range m.topics {
		result = append(result, t)
	}
	return result
}
