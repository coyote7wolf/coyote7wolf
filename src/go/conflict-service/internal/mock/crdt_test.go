package mock

import (
	"testing"
)

func TestMockCRDT_Merge(t *testing.T) {
	crdt := NewMockCRDT()
	merged, resolved := crdt.Merge("doc1", "sec1", "base", "delta", LWW)
	if merged != "delta" || !resolved {
		t.Errorf("Merge failed, got merged=%v, resolved=%v", merged, resolved)
	}
}

func TestMockCRDT_GetConflictStatus(t *testing.T) {
	crdt := NewMockCRDT()
	crdt.Merge("doc2", "sec2", "", "delta2", OT)
	has, id, status := crdt.GetConflictStatus("doc2", "sec2")
	if !has || id == "" || status == "" {
		t.Errorf("GetConflictStatus failed, got has=%v, id=%v, status=%v", has, id, status)
	}
}

func TestMockCRDT_ListConflicts(t *testing.T) {
	crdt := NewMockCRDT()
	crdt.Merge("doc3", "sec3", "", "delta3", VectorClock)
	list := crdt.ListConflicts("doc3")
	if len(list) == 0 {
		t.Errorf("ListConflicts failed, got empty list")
	}
}
