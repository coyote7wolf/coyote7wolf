package mock

type Redis interface {
	Publish(channel, message string) error
}

type MockRedis struct{}

func (r *MockRedis) Publish(channel, message string) error {
	// 模擬發佈事件
	return nil
}
