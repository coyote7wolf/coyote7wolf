// Package auth provides the Auth interface for permission checking.
package auth

// Auth defines the interface for permission checking.
type Auth interface {
	// CheckPermission returns true if the user has permission for the document.
	CheckPermission(userID, docID string) bool
}
