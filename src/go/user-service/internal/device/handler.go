package device

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
	r.GET("/devices", h.ListDevices)
	r.POST("/devices", h.CreateDevice)
	r.GET("/devices/:id", h.GetDevice)
	r.PUT("/devices/:id", h.UpdateDevice)
	r.DELETE("/devices/:id", h.DeleteDevice)
}

func (h *Handler) ListDevices(c *gin.Context) {
	h.DB.Mu.RLock()
	defer h.DB.Mu.RUnlock()
	devices := make([]interface{}, 0, len(h.DB.Devices))
	for _, d := range h.DB.Devices {
		devices = append(devices, d)
	}
	c.JSON(http.StatusOK, devices)
}

func (h *Handler) CreateDevice(c *gin.Context) {
	var device interface{}
	if err := c.ShouldBindJSON(&device); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id := "device-" + fmt.Sprintf("%d", time.Now().UnixNano())
	h.DB.Mu.Lock()
	h.DB.Devices[id] = device
	h.DB.Mu.Unlock()
	c.JSON(http.StatusCreated, device)
}

func (h *Handler) GetDevice(c *gin.Context) {
	id := c.Param("id")
	h.DB.Mu.RLock()
	device, ok := h.DB.Devices[id]
	h.DB.Mu.RUnlock()
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, device)
}

func (h *Handler) UpdateDevice(c *gin.Context) {
	id := c.Param("id")
	var device interface{}
	if err := c.ShouldBindJSON(&device); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Mu.Lock()
	h.DB.Devices[id] = device
	h.DB.Mu.Unlock()
	c.JSON(http.StatusOK, device)
}

func (h *Handler) DeleteDevice(c *gin.Context) {
	id := c.Param("id")
	h.DB.Mu.Lock()
	delete(h.DB.Devices, id)
	h.DB.Mu.Unlock()
	c.Status(http.StatusNoContent)
}
