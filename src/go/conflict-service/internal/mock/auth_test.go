package mock

import "testing"

func TestMockAuth_CheckPermission(t *testing.T) {
	auth := &MockAuth{}
	if !auth.CheckPermission("u1", "d1", "s1", "resolve") {
		t.Error("CheckPermission should always return true in mock")
	}
}
