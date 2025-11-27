package mock

import (
	"sync"
)

// MockDB is a mock database for users, roles, and devices
type MockDB struct {
    Users   map[string]interface{}
    Roles   map[string]interface{}
    Devices map[string]interface{}
    Mu      sync.RWMutex
}

// NewMockDB creates a new mock database instance
func NewMockDB() *MockDB {
    return &MockDB{
        Users:   make(map[string]interface{}),
        Roles:   make(map[string]interface{}),
        Devices: make(map[string]interface{}),
    }
}