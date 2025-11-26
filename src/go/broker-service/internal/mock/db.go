package mock

type DB interface {
	SaveEvent(topic, payload, traceID string) error
	GetEvents(topic string) []string
}

type MockDB struct {
	store map[string][]string
}

func NewMockDB() *MockDB {
	return &MockDB{store: make(map[string][]string)}
}

func (db *MockDB) SaveEvent(topic, payload, traceID string) error {
	db.store[topic] = append(db.store[topic], payload)
	return nil
}

func (db *MockDB) GetEvents(topic string) []string {
	return db.store[topic]
}
