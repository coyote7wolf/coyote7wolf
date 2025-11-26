package mock

type Redis interface {
	Publish(channel, message string) error
	Subscribe(channel string, handler func(string)) error
}

type MockRedis struct {
	channels map[string][]func(string)
}

func NewMockRedis() *MockRedis {
	return &MockRedis{channels: make(map[string][]func(string))}
}

func (r *MockRedis) Publish(channel, message string) error {
	for _, h := range r.channels[channel] {
		h(message)
	}
	return nil
}

func (r *MockRedis) Subscribe(channel string, handler func(string)) error {
	r.channels[channel] = append(r.channels[channel], handler)
	return nil
}
