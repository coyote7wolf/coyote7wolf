// Package saga provides the Saga interface for workflow coordination.
package saga

// Saga defines the interface for workflow coordination.
type Saga interface {
	// Start begins a saga for the given document and user.
	Start(docID, userID string)
}
