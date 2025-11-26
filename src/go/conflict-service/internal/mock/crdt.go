package mock

type CRDTStrategy string

const (
	LWW         CRDTStrategy = "LWW"
	OT          CRDTStrategy = "OT"
	VectorClock CRDTStrategy = "VectorClock"
)

type CRDT interface {
	Merge(docID, section, base, delta string, strategy CRDTStrategy) (merged string, resolved bool)
	GetConflictStatus(docID, section string) (hasConflict bool, conflictID, status string)
	ListConflicts(docID string) []ConflictInfo
}

type ConflictInfo struct {
	ConflictID string
	DocID      string
	Section    string
	Status     string
	CreatedAt  string
}

type MockCRDT struct {
	// 可用 map 實作 mock 狀態
	conflicts map[string]ConflictInfo
}

func NewMockCRDT() *MockCRDT {
	return &MockCRDT{conflicts: make(map[string]ConflictInfo)}
}

func (m *MockCRDT) Merge(docID, section, base, delta string, strategy CRDTStrategy) (string, bool) {
	// 模擬合併，直接回傳 delta
	conflictID := docID + ":" + section
	m.conflicts[conflictID] = ConflictInfo{
		ConflictID: conflictID,
		DocID:      docID,
		Section:    section,
		Status:     "resolved",
		CreatedAt:  "2025-01-01T00:00:00Z",
	}
	return delta, true
}

func (m *MockCRDT) GetConflictStatus(docID, section string) (bool, string, string) {
	conflictID := docID + ":" + section
	info, ok := m.conflicts[conflictID]
	return ok, conflictID, info.Status
}

func (m *MockCRDT) ListConflicts(docID string) []ConflictInfo {
	var result []ConflictInfo
	for _, c := range m.conflicts {
		if c.DocID == docID {
			result = append(result, c)
		}
	}
	return result
}
