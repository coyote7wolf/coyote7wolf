/**
 * JSON Server Configuration
 *
 * This file configures json-server to provide a mock API backend
 * with authentication, proper routing, and response formatting.
 */

const jsonServer = require('json-server')
const middleware = require('./middleware')
const path = require('path')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, '../data'))
const middlewares = jsonServer.defaults()

// Use default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Custom middleware for authentication and response formatting
server.use(middleware)

// Use default router
server.use('/api/v1', router)

// Start server
const port = process.env.MOCK_API_PORT || 3100
server.listen(port, () => {
  console.log(`Mock API Server is running on http://localhost:${port}`)
  console.log('Available endpoints:')
  console.log('- POST /api/v1/auth/login')
  console.log('- POST /api/v1/auth/register')
  console.log('- POST /api/v1/auth/logout')
  console.log('- GET  /api/v1/users')
  console.log('- GET  /api/v1/documents')
  console.log('- GET  /api/v1/notifications')
})

module.exports = server
