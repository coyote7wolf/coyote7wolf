package mock

type DB interface {
	SaveEvent(roomID, payload string) error
	GetEvents(roomID string) []string
}

type MockDB struct {
	store map[string][]string
}

func NewMockDB() *MockDB {
	return &MockDB{store: make(map[string][]string)}
}

func (db *MockDB) SaveEvent(roomID, payload string) error {
	db.store[roomID] = append(db.store[roomID], payload)
	return nil
}

func (db *MockDB) GetEvents(roomID string) []string {
	return db.store[roomID]
}
