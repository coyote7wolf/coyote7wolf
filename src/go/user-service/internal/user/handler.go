package user

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"gin_user_service/internal/mock"
)

type Handler struct {
	DB *mock.MockDB
}

// Get a user by ID
func (h *Handler) GetUser(c *gin.Context) {
	id := c.Param("id")
	h.DB.Mu.RLock()
	user, ok := h.DB.Users[id]
	h.DB.Mu.RUnlock()
	if !ok {
		 c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		 return
	}
	c.JSON(http.StatusOK, user)
}

func NewHandler(db *mock.MockDB) *Handler {
	return &Handler{DB: db}
}

func (h *Handler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/users", h.ListUsers)
	r.POST("/users", h.CreateUser)
	r.GET("/users/:id", h.GetUser)
	r.PUT("/users/:id", h.UpdateUser)
	r.DELETE("/users/:id", h.DeleteUser)
}

func (h *Handler) ListUsers(c *gin.Context) {
	       h.DB.Mu.RLock()
	       defer h.DB.Mu.RUnlock()
	       users := make([]interface{}, 0, len(h.DB.Users))
	       for _, u := range h.DB.Users {
		       users = append(users, u)
	       }
	       c.JSON(http.StatusOK, users)
}

// Generate a unique ID (using timestamp for mock)
func (h *Handler) CreateUser(c *gin.Context) {
	var user interface{}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id := "user-" + fmt.Sprintf("%d", time.Now().UnixNano())
	h.DB.Mu.Lock()
	h.DB.Users[id] = user
	h.DB.Mu.Unlock()
	c.JSON(http.StatusCreated, user)
}

func (h *Handler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user interface{}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Mu.Lock()
	h.DB.Users[id] = user
	h.DB.Mu.Unlock()
	c.JSON(http.StatusOK, user)
}

func (h *Handler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	h.DB.Mu.Lock()
	delete(h.DB.Users, id)
	h.DB.Mu.Unlock()
	c.Status(http.StatusNoContent)
}
