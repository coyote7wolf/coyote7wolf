package mock

import "sync"

// MockQueue is a simple thread-safe FIFO queue for strings
type MockQueue struct {
	queue []string
	mu    sync.Mutex
}

// NewMockQueue creates a new empty queue
func NewMockQueue() *MockQueue {
	return &MockQueue{queue: make([]string, 0)}
}

// Enqueue adds a message to the end of the queue
func (q *MockQueue) Enqueue(msg string) {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.queue = append(q.queue, msg)
}

// Dequeue removes and returns the message at the front of the queue
func (q *MockQueue) Dequeue() (string, bool) {
	q.mu.Lock()
	defer q.mu.Unlock()
	if len(q.queue) == 0 {
		return "", false
	}
	msg := q.queue[0]
	q.queue = q.queue[1:]
	return msg, true
}