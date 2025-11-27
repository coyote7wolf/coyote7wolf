package user

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/tj/assert"

	"gin_user_service/internal/mock"
)

func setupUserRouter() (*gin.Engine, *mock.MockDB) {
    gin.SetMode(gin.TestMode)
    db := mock.NewMockDB()
    r := gin.Default()
    h := NewHandler(db)
    h.RegisterRoutes(r.Group("/api"))
    return r, db
}

func TestCreateUser(t *testing.T) {
    r, db := setupUserRouter()
    user := map[string]interface{}{
        "name":  "testuser",
        "email": "test@example.com",
    }
    body, _ := json.Marshal(user)
    w := httptest.NewRecorder()
    req, _ := http.NewRequest("POST", "/api/users", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)
    assert.Equal(t, 201, w.Code)
    assert.NotEmpty(t, db.Users)
}

func TestListUsers(t *testing.T) {
    r, db := setupUserRouter()
    db.Users["u1"] = map[string]interface{}{"name": "A", "email": "a@b.com"}
    w := httptest.NewRecorder()
    req, _ := http.NewRequest("GET", "/api/users", nil)
    r.ServeHTTP(w, req)
    assert.Equal(t, 200, w.Code)
    var users []interface{}
    json.Unmarshal(w.Body.Bytes(), &users)
    assert.NotEmpty(t, users)
}