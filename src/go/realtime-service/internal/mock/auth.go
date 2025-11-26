package mock

type Auth interface {
	CheckPermission(token, roomID, action string) bool
}

type MockAuth struct{}

func (a *MockAuth) CheckPermission(token, roomID, action string) bool {
	return true // always allow for mock
}
