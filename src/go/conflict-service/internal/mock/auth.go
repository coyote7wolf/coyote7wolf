package mock

type Auth interface {
	CheckPermission(userID, docID, section, action string) bool
}

type MockAuth struct{}

func (a *MockAuth) CheckPermission(userID, docID, section, action string) bool {
	// 總是允許，實際可根據 user/role 模擬
	return true
}
