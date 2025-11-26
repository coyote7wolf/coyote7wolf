// Package crdt provides the CRDT interface for conflict-free replicated data types.
package crdt

// CRDT defines the interface for CRDT operations.
type CRDT interface {
	// Merge merges a delta into the document with the given docID.
	Merge(docID, delta string)
}
