package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"gin_user_service/internal/device"
	"gin_user_service/internal/mock"
	"gin_user_service/internal/role"
	"gin_user_service/internal/user"
)

func main() {
	r := gin.Default()

	// 初始化 mock DB
	db := mock.NewMockDB()

	// Register user, role, device routes
	userHandler := user.NewHandler(db)
	roleHandler := role.NewHandler(db)
	deviceHandler := device.NewHandler(db)
	api := r.Group("/api")
	userHandler.RegisterRoutes(api)
	roleHandler.RegisterRoutes(api)
	deviceHandler.RegisterRoutes(api)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	r.Run() // listen and serve on 0.0.0.0:8080
}
