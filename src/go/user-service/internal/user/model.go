package user

// User represents a user entity
type User struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Email     string   `json:"email"`
	RoleID    *string  `json:"roleId"`
	Status    string   `json:"status"`
	CreatedAt string   `json:"createdAt"`
	UpdatedAt string   `json:"updatedAt"`
	Devices   []Device `json:"devices"`
}

// Device is a forward declaration for circular reference
type Device struct {
	ID        string  `json:"id"`
	UserID    string  `json:"userId"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}