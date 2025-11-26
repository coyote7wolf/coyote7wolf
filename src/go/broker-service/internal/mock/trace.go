package mock

type Trace interface {
	NewTraceID() string
}

type MockTrace struct{}

func (t *MockTrace) NewTraceID() string {
	return "mock-trace-id"
}
