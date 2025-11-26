/**
 * Mock API Server Middleware
 *
 * This middleware adds custom logic to json-server for authentication,
 * response formatting, and other API behaviors.
 */

const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// Mock JWT secret
const JWT_SECRET = 'mock-jwt-secret-for-development'

// Helper functions
const generateToken = user => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex')
}

const verifyToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

const findUserByCredentials = (db, email, password) => {
  return db.get('users').find({ email, password }).value()
}

const findUserById = (db, id) => {
  return db.get('users').find({ id }).value()
}

const createAuthSession = (db, user) => {
  const token = generateToken(user)
  const refreshToken = generateRefreshToken()
  const session = {
    id: `session-${Date.now()}`,
    userId: user.id,
    token,
    refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    deviceInfo: {
      userAgent: 'Mock User Agent',
      ip: '127.0.0.1',
      location: 'Mock Location',
    },
  }

  // Add session to auth collection
  db.get('auth').push(session).write()

  return { token, refreshToken, session }
}

// Middleware function
module.exports = (req, res, next) => {
  const db = req.app.db

  // CORS headers
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,PATCH,OPTIONS'
  )
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  )

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }

  // Authentication endpoints
  if (req.path === '/auth/login' && req.method === 'POST') {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_PASSWORD_REQUIRED',
        message: '請提供電子郵件和密碼',
      })
    }

    const user = findUserByCredentials(db, email, password)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '電子郵件或密碼錯誤',
      })
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: '帳號已被停用，請聯繫管理員',
      })
    }

    const { token, refreshToken } = createAuthSession(db, user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
      message: '登入成功',
    })
  }

  // Register endpoint
  if (req.path === '/auth/register' && req.method === 'POST') {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'REQUIRED_FIELDS_MISSING',
        message: '請填寫所有必要欄位',
      })
    }

    // Check if user already exists
    const existingUser = db.get('users').find({ email }).value()
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: '此電子郵件已被註冊',
      })
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password, // In real app, this should be hashed
      name,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=ffffff`,
      status: 'active',
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        language: 'zh-TW',
        notifications: true,
      },
      profile: {
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ')[1] || '',
        phone: '',
        company: '',
        position: '',
        bio: '',
      },
    }

    db.get('users').push(newUser).write()

    const { token, refreshToken } = createAuthSession(db, newUser)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
      message: '註冊成功',
    })
  }

  // Logout endpoint
  if (req.path === '/auth/logout' && req.method === 'POST') {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      // Remove session from database
      db.get('auth').remove({ token }).write()
    }

    return res.json({
      success: true,
      message: '登出成功',
    })
  }

  // Protected routes middleware
  const protectedPaths = [
    '/users',
    '/documents',
    '/notifications',
    '/ai',
    '/sync',
    '/presence',
  ]
  const isProtectedPath = protectedPaths.some(path => req.path.startsWith(path))

  if (isProtectedPath) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'NO_TOKEN',
        message: '未提供認證令牌',
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: '無效的認證令牌',
      })
    }

    // Add user info to request
    req.user = decoded
  }

  // Handle specific API endpoints with custom logic

  // Document collaboration endpoints
  if (
    req.path.match(/^\/documents\/([^/]+)\/collaborators$/) &&
    req.method === 'POST'
  ) {
    const documentId = req.path.split('/')[2]
    const { userId, role = 'viewer', permissions = [] } = req.body

    const document = db.get('documents').find({ id: documentId }).value()
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'DOCUMENT_NOT_FOUND',
        message: '文檔不存在',
      })
    }

    // Add collaborator
    if (!document.collaborators.includes(userId)) {
      document.collaborators.push(userId)
      db.get('documents').find({ id: documentId }).assign(document).write()
    }

    return res.json({
      success: true,
      data: { documentId, userId, role, permissions },
      message: '協作者添加成功',
    })
  }

  // AI suggestions endpoints
  if (req.path === '/ai/grammar-check' && req.method === 'POST') {
    const { text, language = 'zh-TW' } = req.body

    // Mock grammar suggestions
    const suggestions = [
      {
        type: 'grammar',
        position: Math.floor(Math.random() * text.length),
        original: '這個功能很好用',
        correction: '此功能相當實用',
        rule: 'formal_language',
        confidence: 0.88,
      },
      {
        type: 'style',
        position: Math.floor(Math.random() * text.length),
        original: '我們會做這個',
        correction: '我們將執行此項目',
        rule: 'professional_tone',
        confidence: 0.75,
      },
    ]

    return res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, Math.floor(Math.random() * 3) + 1),
        language,
        processedAt: new Date().toISOString(),
      },
    })
  }

  if (req.path === '/ai/translate' && req.method === 'POST') {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body

    // Mock translation responses
    const translations = {
      en: 'This is a mock translation to English.',
      ja: 'これは英語への模擬翻訳です。',
      ko: '이것은 영어로의 모의 번역입니다.',
      'zh-CN': '这是一个模拟的英语翻译。',
    }

    return res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translations[targetLanguage] || translations['en'],
        sourceLanguage: sourceLanguage === 'auto' ? 'zh-TW' : sourceLanguage,
        targetLanguage,
        confidence: 0.95,
      },
    })
  }

  if (req.path === '/ai/summarize' && req.method === 'POST') {
    const { text, maxLength = 100 } = req.body

    return res.json({
      success: true,
      data: {
        summary: '這是一個關於文檔內容的智能摘要，涵蓋了主要觀點和關鍵信息。',
        originalLength: text.length,
        summaryLength: 42,
        compression: 0.75,
        keyPoints: [
          '主要討論了專案的核心目標',
          '涵蓋了技術架構的重要決策',
          '提供了實施時程的詳細規劃',
        ],
      },
    })
  }

  // Presence simulation endpoints
  if (req.path === '/presence/update' && req.method === 'POST') {
    const { documentId, status, cursor, isTyping } = req.body
    const userId = req.user.id

    // Update or create presence
    const existingPresence = db
      .get('presence')
      .find({ documentId, userId })
      .value()

    if (existingPresence) {
      db.get('presence')
        .find({ documentId, userId })
        .assign({
          status,
          cursor,
          isTyping,
          lastActiveAt: new Date().toISOString(),
        })
        .write()
    } else {
      db.get('presence')
        .push({
          id: `presence-${Date.now()}`,
          documentId,
          userId,
          status,
          cursor,
          isTyping,
          lastActiveAt: new Date().toISOString(),
          sessionId: `session-${Date.now()}`,
        })
        .write()
    }

    return res.json({
      success: true,
      data: { documentId, userId, status, cursor, isTyping },
    })
  }

  // Analytics endpoints
  if (req.path === '/analytics/user-activity' && req.method === 'GET') {
    const mockActivity = {
      totalSessions: 156,
      averageSessionDuration: 2400000, // 40 minutes
      documentsCreated: 23,
      documentsEdited: 67,
      collaborationSessions: 34,
      aiSuggestionsUsed: 89,
      weeklyActivity: [
        { day: '週一', sessions: 22, duration: 45 },
        { day: '週二', sessions: 18, duration: 38 },
        { day: '週三', sessions: 25, duration: 52 },
        { day: '週四', sessions: 20, duration: 41 },
        { day: '週五', sessions: 28, duration: 48 },
        { day: '週六', sessions: 12, duration: 25 },
        { day: '週日', sessions: 8, duration: 18 },
      ],
    }

    return res.json({
      success: true,
      data: mockActivity,
    })
  }

  // Template usage endpoint
  if (req.path.match(/^\/templates\/([^/]+)\/use$/) && req.method === 'POST') {
    const templateId = req.path.split('/')[2]

    // Increment usage count
    const template = db.get('templates').find({ id: templateId }).value()
    if (template) {
      db.get('templates')
        .find({ id: templateId })
        .assign({ usage: template.usage + 1 })
        .write()
    }

    return res.json({
      success: true,
      data: { templateId, usageCount: template ? template.usage + 1 : 1 },
    })
  }

  // Document search with enhanced filtering
  if (req.path === '/documents/search' && req.method === 'GET') {
    const { q, type, author, tags, status, limit = 10, offset = 0 } = req.query
    let documents = db.get('documents').value()

    // Apply filters
    if (q) {
      documents = documents.filter(
        doc =>
          doc.title.toLowerCase().includes(q.toLowerCase()) ||
          doc.content.toLowerCase().includes(q.toLowerCase())
      )
    }

    if (type) {
      documents = documents.filter(doc => doc.type === type)
    }

    if (author) {
      documents = documents.filter(doc => doc.authorId === author)
    }

    if (tags) {
      const tagArray = tags.split(',')
      documents = documents.filter(doc =>
        tagArray.some(tag => doc.tags.includes(tag))
      )
    }

    if (status) {
      documents = documents.filter(doc => doc.status === status)
    }

    // Pagination
    const total = documents.length
    const paginatedDocs = documents.slice(offset, offset + parseInt(limit))

    return res.json({
      success: true,
      data: {
        documents: paginatedDocs,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + parseInt(limit) < total,
        },
      },
    })
  }

  // Bulk document operations
  if (req.path === '/documents/bulk-action' && req.method === 'POST') {
    const { action, documentIds, data = {} } = req.body
    const results = []

    for (const docId of documentIds) {
      const document = db.get('documents').find({ id: docId }).value()
      if (!document) {
        results.push({ id: docId, success: false, error: 'DOCUMENT_NOT_FOUND' })
        continue
      }

      switch (action) {
        case 'delete':
          db.get('documents').remove({ id: docId }).write()
          results.push({ id: docId, success: true, action: 'deleted' })
          break

        case 'update_status':
          db.get('documents')
            .find({ id: docId })
            .assign({
              status: data.status,
              updatedAt: new Date().toISOString(),
            })
            .write()
          results.push({
            id: docId,
            success: true,
            action: 'status_updated',
            newStatus: data.status,
          })
          break

        case 'add_tags':
          const existingTags = document.tags || []
          const newTags = [...new Set([...existingTags, ...data.tags])]
          db.get('documents')
            .find({ id: docId })
            .assign({ tags: newTags, updatedAt: new Date().toISOString() })
            .write()
          results.push({
            id: docId,
            success: true,
            action: 'tags_added',
            newTags,
          })
          break

        default:
          results.push({ id: docId, success: false, error: 'INVALID_ACTION' })
      }
    }

    return res.json({
      success: true,
      data: {
        action,
        results,
        summary: {
          total: documentIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
        },
      },
    })
  }

  // Format response for all API calls
  if (
    req.path.startsWith('/api/') ||
    req.path.startsWith('/users') ||
    req.path.startsWith('/documents') ||
    req.path.startsWith('/workspaces') ||
    req.path.startsWith('/comments') ||
    req.path.startsWith('/versions') ||
    req.path.startsWith('/templates') ||
    req.path.startsWith('/ai') ||
    req.path.startsWith('/sync') ||
    req.path.startsWith('/presence') ||
    req.path.startsWith('/analytics')
  ) {
    const originalSend = res.json
    res.json = function (data) {
      // If it's already formatted, don't wrap it again
      if (data && typeof data === 'object' && 'success' in data) {
        return originalSend.call(this, data)
      }

      // Format the response
      const formattedResponse = {
        success: true,
        data: data,
        timestamp: new Date().toISOString(),
      }

      return originalSend.call(this, formattedResponse)
    }
  }

  next()
}
