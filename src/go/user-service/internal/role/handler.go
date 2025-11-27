package role

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

func NewHandler(db *mock.MockDB) *Handler {
	return &Handler{DB: db}
}

func (h *Handler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/roles", h.ListRoles)
	r.POST("/roles", h.CreateRole)
	r.GET("/roles/:id", h.GetRole)
	r.PUT("/roles/:id", h.UpdateRole)
	r.DELETE("/roles/:id", h.DeleteRole)
}

func (h *Handler) ListRoles(c *gin.Context) {
	h.DB.Mu.RLock()
	defer h.DB.Mu.RUnlock()
	roles := make([]interface{}, 0, len(h.DB.Roles))
	for _, u := range h.DB.Roles {
		roles = append(roles, u)
	}
	c.JSON(http.StatusOK, roles)
}

func (h *Handler) CreateRole(c *gin.Context) {
       var role interface{}
       if err := c.ShouldBindJSON(&role); err != nil {
	       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	       return
       }
       // Generate a unique ID (using timestamp for mock)
       id := "role-" + fmt.Sprintf("%d", time.Now().UnixNano())
       h.DB.Mu.Lock()
       h.DB.Roles[id] = role
       h.DB.Mu.Unlock()
       c.JSON(http.StatusCreated, role)
}

func (h *Handler) GetRole(c *gin.Context) {
	id := c.Param("id")
	h.DB.Mu.RLock()
	role, ok := h.DB.Roles[id]
	h.DB.Mu.RUnlock()
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, role)
}

func (h *Handler) UpdateRole(c *gin.Context) {
	id := c.Param("id")
	var role interface{}
	if err := c.ShouldBindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Mu.Lock()
	h.DB.Roles[id] = role
	h.DB.Mu.Unlock()
	c.JSON(http.StatusOK, role)
}

func (h *Handler) DeleteRole(c *gin.Context) {
	id := c.Param("id")
	h.DB.Mu.Lock()
	delete(h.DB.Roles, id)
	h.DB.Mu.Unlock()
	c.Status(http.StatusNoContent)
}
