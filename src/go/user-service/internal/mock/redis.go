package mock

import "sync"

type MockRedis struct {
	cache map[string]string
	mu    sync.RWMutex
}

func NewMockRedis() *MockRedis {
	return &MockRedis{cache: make(map[string]string)}
}

func (r *MockRedis) Set(key, value string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.cache[key] = value
}

func (r *MockRedis) Get(key string) (string, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	val, ok := r.cache[key]
	return val, ok
}
