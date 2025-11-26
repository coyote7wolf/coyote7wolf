package mock

import (
	"strconv"
	"sync"
)

// 全域 mock 狀態
var (
	docDeltas   = make(map[string][]string)
	docVersions = make(map[string][]string)
	sagaLog     = make([]string, 0)
	mqEvents    = make([]string, 0)
)
var mu sync.Mutex

type MockRepo struct{}

func (m *MockRepo) GetVersions(docId string) []string {
	mu.Lock()
	defer mu.Unlock()
	return append([]string{}, docVersions[docId]...)
}

type MockSaga struct{}

func (m *MockSaga) Start(docId, userId string) {
	mu.Lock()
	defer mu.Unlock()
	sagaLog = append(sagaLog, "SagaStart:"+docId+":"+userId)
}

type MockCRDT struct{}

func (m *MockCRDT) Merge(docId, delta string) {
	mu.Lock()
	defer mu.Unlock()
	docDeltas[docId] = append(docDeltas[docId], delta)
	// 每次 merge 產生新版本
	ver := "v" + strconv.Itoa(len(docDeltas[docId]))
	docVersions[docId] = append(docVersions[docId], ver)
}

type MockAuth struct{}

func (m *MockAuth) CheckPermission(userId, docId string) bool { return true }

type MockRedis struct{}

func (m *MockRedis) SaveDelta(docId, delta string) {
	mu.Lock()
	defer mu.Unlock()
	docDeltas[docId] = append(docDeltas[docId], delta)
}

type MockMQ struct{}

func (m *MockMQ) Publish(topic, docId string) {
	mu.Lock()
	defer mu.Unlock()
	mqEvents = append(mqEvents, topic+":"+docId)
}

// 測試/驗證用：導出 mock 狀態
func GetMockState() (map[string][]string, map[string][]string, []string, []string) {
	return docDeltas, docVersions, sagaLog, mqEvents
}
