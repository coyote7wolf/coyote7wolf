// Package redis provides the Redis interface for Redis operations.
package redis

// Redis defines the interface for Redis operations.
type Redis interface {
	// SaveDelta saves a delta for the document with the given docID.
	SaveDelta(docID, delta string)
}
