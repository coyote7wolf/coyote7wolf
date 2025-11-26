package mock

type Auth interface {
	CheckPermission(token, topic, action string) bool
}

type MockAuth struct{}

func (a *MockAuth) CheckPermission(token, topic, action string) bool {
	// 總是允許，實際可根據 token/topic/action 模擬
	return true
}
