package mock

type User interface {
	GetUser(token string) (userID, role string, ok bool)
}

type MockUser struct{}

func (u *MockUser) GetUser(token string) (string, string, bool) {
	return "mock-user", "editor", true
}
