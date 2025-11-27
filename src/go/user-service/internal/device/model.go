package device

// Device represents a device entity
type Device struct {
    ID        string `json:"id"`
    UserID    string `json:"userId"`
    Name      string `json:"name"`
    Type      string `json:"type"`
    Status    string `json:"status"`
    CreatedAt string `json:"createdAt"`
    UpdatedAt string `json:"updatedAt"`
}