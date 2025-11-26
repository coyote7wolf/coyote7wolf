#!/usr/bin/env node

/**
 * Mock Data Seeding Script
 *
 * This script populates the JSON Server with comprehensive test data
 * for development and testing purposes. It creates realistic data
 * relationships and supports different seeding modes.
 *
 * Usage:
 *   npm run seed-data              // Full seed with default data
 *   npm run seed-data -- --reset   // Reset and seed fresh data
 *   npm run seed-data -- --minimal // Minimal seed for performance testing
 */

const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  dbPath: path.join(__dirname, '../src/mocks/db.json'),
  backupPath: path.join(__dirname, '../src/mocks/db.backup.json'),
  templatesPath: path.join(__dirname, '../src/mocks/data/templates.json'),
  activitiesPath: path.join(__dirname, '../src/mocks/data/activities.json'),
  settingsPath: path.join(__dirname, '../src/mocks/data/settings.json'),
}

// Utility functions
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString()
  const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

const readJsonFile = filePath => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    log(`Failed to read ${filePath}: ${error.message}`, 'error')
    return null
  }
}

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log(`Failed to write ${filePath}: ${error.message}`, 'error')
    return false
  }
}

// Data generators
const generateUsers = (count = 10) => {
  const users = []
  const firstNames = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Edward',
    'Fiona',
    'George',
    'Helen',
    'Ivan',
    'Julia',
  ]
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
  ]
  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Design',
    'HR',
    'Finance',
  ]

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@synccoreai.com`

    users.push({
      id: `user_${i + 1}`,
      email,
      name: `${firstName} ${lastName}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      role: i === 0 ? 'admin' : Math.random() > 0.7 ? 'editor' : 'viewer',
      department: departments[Math.floor(Math.random() * departments.length)],
      isOnline: Math.random() > 0.3,
      lastSeen: new Date(
        Date.now() - Math.random() * 24 * 60 * 60 * 1000
      ).toISOString(),
      preferences: {
        theme: Math.random() > 0.5 ? 'dark' : 'light',
        language: 'zh-TW',
        notifications: {
          email: true,
          push: Math.random() > 0.3,
          mentions: true,
        },
      },
      createdAt: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return users
}

const generateWorkspaces = (users, count = 5) => {
  const workspaces = []
  const workspaceNames = [
    'AI Research Project',
    'Mobile App Development',
    'Marketing Campaign 2024',
    'Product Documentation',
    'Engineering Standards',
  ]

  for (let i = 0; i < count; i++) {
    const ownerId =
      users[Math.floor(Math.random() * Math.min(3, users.length))].id
    const memberCount = Math.floor(Math.random() * 8) + 3
    const members = users
      .sort(() => 0.5 - Math.random())
      .slice(0, memberCount)
      .map(user => ({
        userId: user.id,
        role:
          user.id === ownerId
            ? 'owner'
            : Math.random() > 0.7
              ? 'admin'
              : 'member',
        joinedAt: new Date(
          Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }))

    workspaces.push({
      id: `workspace_${i + 1}`,
      name: workspaceNames[i] || `Workspace ${i + 1}`,
      description: `Collaborative workspace for ${workspaceNames[i]?.toLowerCase() || 'team projects'}`,
      ownerId,
      members,
      settings: {
        isPublic: Math.random() > 0.7,
        allowGuests: Math.random() > 0.5,
        defaultPermissions: 'read',
        integrations: {
          slack: Math.random() > 0.6,
          teams: Math.random() > 0.7,
          github: Math.random() > 0.5,
        },
      },
      stats: {
        documentCount: Math.floor(Math.random() * 50) + 5,
        memberCount: members.length,
        activityCount: Math.floor(Math.random() * 200) + 20,
      },
      createdAt: new Date(
        Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return workspaces
}

const generateDocuments = (users, workspaces, count = 25) => {
  const documents = []
  const documentTypes = [
    'text',
    'presentation',
    'spreadsheet',
    'note',
    'template',
  ]
  const titles = [
    'Project Requirements Document',
    'API Documentation',
    'User Research Findings',
    'Marketing Strategy 2024',
    'Technical Architecture Overview',
    'Meeting Notes - Sprint Planning',
    'Design System Guidelines',
    'Performance Optimization Plan',
    'Security Audit Report',
    'Customer Feedback Analysis',
  ]

  for (let i = 0; i < count; i++) {
    const authorId = users[Math.floor(Math.random() * users.length)].id
    const workspaceId =
      workspaces[Math.floor(Math.random() * workspaces.length)].id
    const title =
      titles[Math.floor(Math.random() * titles.length)] || `Document ${i + 1}`

    documents.push({
      id: `doc_${i + 1}`,
      title: `${title} ${i > 9 ? i + 1 : ''}`,
      content: generateDocumentContent(title),
      type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
      authorId,
      workspaceId,
      collaborators: generateCollaborators(users, authorId),
      tags: generateTags(),
      status:
        Math.random() > 0.8
          ? 'archived'
          : Math.random() > 0.9
            ? 'draft'
            : 'published',
      isPublic: Math.random() > 0.7,
      permissions: {
        read: ['all'],
        write: [authorId],
        admin: [authorId],
      },
      metadata: {
        wordCount: Math.floor(Math.random() * 5000) + 100,
        readTime: Math.floor(Math.random() * 20) + 1,
        version: `1.${Math.floor(Math.random() * 10)}`,
        language: 'zh-TW',
      },
      createdAt: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastViewedAt: new Date(
        Date.now() - Math.random() * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
  }

  return documents
}

const generateDocumentContent = title => {
  const templates = {
    'Project Requirements Document':
      '# 專案需求文件\n\n## 概述\n本文件詳細說明專案的功能需求、技術規格及實作細節。\n\n## 功能需求\n1. 用戶認證系統\n2. 文件協作平台\n3. 即時通訊功能\n\n## 技術規格\n- 前端：Next.js 14\n- 後端：Node.js with TypeScript\n- 數據庫：PostgreSQL\n\n## 時程規劃\n第一階段：基礎架構建置\n第二階段：核心功能開發\n第三階段：測試與部署',
    'API Documentation':
      '# API 文件\n\n## 認證 API\n\n### POST /api/auth/login\n登入端點\n\n**請求格式：**\n```json\n{\n  "email": "user@example.com",\n  "password": "password"\n}\n```\n\n**回應格式：**\n```json\n{\n  "token": "jwt_token",\n  "user": {\n    "id": "user_id",\n    "email": "user@example.com"\n  }\n}\n```',
    default:
      '# 文件標題\n\n## 簡介\n這是一份示範文件，包含了基本的內容結構。\n\n## 內容\n文件的主要內容在這裡，包括：\n- 重點項目一\n- 重點項目二\n- 重點項目三\n\n## 結論\n總結文件的重點內容。',
  }

  return templates[title] || templates['default']
}

const generateCollaborators = (users, excludeId) => {
  const collaboratorCount = Math.floor(Math.random() * 4)
  return users
    .filter(user => user.id !== excludeId)
    .sort(() => 0.5 - Math.random())
    .slice(0, collaboratorCount)
    .map(user => ({
      userId: user.id,
      role: Math.random() > 0.7 ? 'editor' : 'viewer',
      addedAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }))
}

const generateTags = () => {
  const allTags = [
    '重要',
    '緊急',
    '草稿',
    '已完成',
    '進行中',
    '待審查',
    '技術',
    '設計',
    '行銷',
    '產品',
  ]
  const tagCount = Math.floor(Math.random() * 4)
  return allTags.sort(() => 0.5 - Math.random()).slice(0, tagCount)
}

// Main seeding function
const seedDatabase = async (mode = 'full') => {
  log('Starting database seeding process...', 'info')

  // Parse command line arguments
  const args = process.argv.slice(2)
  const shouldReset = args.includes('--reset')
  const isMinimal = args.includes('--minimal')

  if (shouldReset) {
    log('Reset mode enabled - backing up existing data', 'info')
    const existingData = readJsonFile(CONFIG.dbPath)
    if (existingData) {
      writeJsonFile(CONFIG.backupPath, existingData)
      log('Backup created successfully', 'success')
    }
  }

  // Generate data based on mode
  const userCount = isMinimal ? 5 : 15
  const workspaceCount = isMinimal ? 2 : 6
  const documentCount = isMinimal ? 10 : 30

  log(`Generating data in ${isMinimal ? 'minimal' : 'full'} mode...`, 'info')

  const users = generateUsers(userCount)
  const workspaces = generateWorkspaces(users, workspaceCount)
  const documents = generateDocuments(users, workspaces, documentCount)

  // Load existing additional data
  const templates = readJsonFile(CONFIG.templatesPath) || []
  const activities = readJsonFile(CONFIG.activitiesPath) || []
  const settings = readJsonFile(CONFIG.settingsPath) || {}

  // Generate additional entities
  const notifications = generateNotifications(users, documents, 20)
  const comments = generateComments(users, documents, 50)
  const versions = generateVersions(documents, users, 30)
  const presence = generatePresenceData(users, documents, 15)
  const analytics = generateAnalytics(users, documents, workspaces)

  // Construct final database
  const database = {
    users,
    workspaces,
    documents,
    templates,
    activities,
    notifications,
    comments,
    versions,
    presence,
    analytics,
    settings,
    auth: generateAuthTokens(users),
    ai_suggestions: generateAISuggestions(documents, 25),
    metadata: {
      version: '1.0.0',
      lastSeeded: new Date().toISOString(),
      mode: isMinimal ? 'minimal' : 'full',
      counts: {
        users: users.length,
        workspaces: workspaces.length,
        documents: documents.length,
        templates: templates.length,
        activities: activities.length,
        notifications: notifications.length,
        comments: comments.length,
        versions: versions.length,
      },
    },
  }

  // Write to database file
  const success = writeJsonFile(CONFIG.dbPath, database)

  if (success) {
    log('Database seeding completed successfully!', 'success')
    log(
      `Generated: ${users.length} users, ${workspaces.length} workspaces, ${documents.length} documents`,
      'info'
    )
    log('JSON Server can now be started with comprehensive test data', 'info')
  } else {
    log('Failed to write database file', 'error')
    process.exit(1)
  }
}

// Additional data generators
const generateNotifications = (users, documents, count) => {
  const notifications = []
  const types = ['comment', 'mention', 'share', 'update', 'system']

  for (let i = 0; i < count; i++) {
    const userId = users[Math.floor(Math.random() * users.length)].id
    const document = documents[Math.floor(Math.random() * documents.length)]
    const type = types[Math.floor(Math.random() * types.length)]

    notifications.push({
      id: `notif_${i + 1}`,
      userId,
      type,
      title: generateNotificationTitle(type, document.title),
      message: generateNotificationMessage(type, document.title),
      resourceId: document.id,
      resourceType: 'document',
      read: Math.random() > 0.6,
      createdAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
  }

  return notifications
}

const generateNotificationTitle = (type, docTitle) => {
  const titles = {
    comment: `新評論：${docTitle}`,
    mention: `有人提及您：${docTitle}`,
    share: `文件已分享：${docTitle}`,
    update: `文件已更新：${docTitle}`,
    system: '系統通知',
  }
  return titles[type] || '通知'
}

const generateNotificationMessage = (type, docTitle) => {
  const messages = {
    comment: `您的文件「${docTitle}」收到新評論`,
    mention: `您在文件「${docTitle}」中被提及`,
    share: `文件「${docTitle}」已與您分享`,
    update: `文件「${docTitle}」有新的更新`,
    system: '系統維護通知',
  }
  return messages[type] || '您有新的通知'
}

const generateComments = (users, documents, count) => {
  const comments = []
  const sampleComments = [
    '這個部分需要更詳細的說明',
    '建議增加一些實例',
    '內容很完整，感謝分享',
    '有幾個地方需要修正',
    '這個方案很不錯',
  ]

  for (let i = 0; i < count; i++) {
    const authorId = users[Math.floor(Math.random() * users.length)].id
    const documentId =
      documents[Math.floor(Math.random() * documents.length)].id

    comments.push({
      id: `comment_${i + 1}`,
      documentId,
      authorId,
      content:
        sampleComments[Math.floor(Math.random() * sampleComments.length)],
      position: {
        line: Math.floor(Math.random() * 50) + 1,
        character: Math.floor(Math.random() * 80),
      },
      resolved: Math.random() > 0.7,
      replies: [],
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
  }

  return comments
}

const generateVersions = (documents, users, count) => {
  const versions = []

  for (let i = 0; i < count; i++) {
    const document = documents[Math.floor(Math.random() * documents.length)]
    const authorId = users[Math.floor(Math.random() * users.length)].id

    versions.push({
      id: `version_${i + 1}`,
      documentId: document.id,
      version: `1.${Math.floor(Math.random() * 10)}`,
      authorId,
      changes: `Version ${i + 1} updates`,
      summary: '文件內容更新',
      size: Math.floor(Math.random() * 1000) + 100,
      createdAt: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
  }

  return versions
}

const generatePresenceData = (users, documents, count) => {
  const presence = []

  for (let i = 0; i < count; i++) {
    const userId = users[Math.floor(Math.random() * users.length)].id
    const documentId =
      documents[Math.floor(Math.random() * documents.length)].id

    presence.push({
      id: `presence_${i + 1}`,
      userId,
      documentId,
      isActive: Math.random() > 0.5,
      cursor: {
        line: Math.floor(Math.random() * 100),
        character: Math.floor(Math.random() * 80),
      },
      selection: null,
      lastActivity: new Date(
        Date.now() - Math.random() * 60 * 60 * 1000
      ).toISOString(),
    })
  }

  return presence
}

const generateAnalytics = (users, documents, workspaces) => {
  return {
    overview: {
      totalUsers: users.length,
      totalDocuments: documents.length,
      totalWorkspaces: workspaces.length,
      activeUsers: users.filter(u => u.isOnline).length,
      documentsCreatedToday: Math.floor(Math.random() * 10),
      collaborationsToday: Math.floor(Math.random() * 25),
    },
    usage: {
      dailyActiveUsers: Math.floor(users.length * 0.7),
      weeklyActiveUsers: Math.floor(users.length * 0.9),
      monthlyActiveUsers: users.length,
      avgSessionDuration: Math.floor(Math.random() * 120) + 30,
      avgDocumentsPerUser: Math.floor(documents.length / users.length),
    },
    performance: {
      avgLoadTime: Math.random() * 2 + 0.5,
      avgSyncTime: Math.random() * 1 + 0.2,
      uptime: 99.9,
      errorRate: Math.random() * 0.1,
    },
  }
}

const generateAuthTokens = users => {
  return users.slice(0, 5).map((user, index) => ({
    id: `token_${index + 1}`,
    userId: user.id,
    token: `mock_jwt_token_${user.id}`,
    refreshToken: `mock_refresh_token_${user.id}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  }))
}

const generateAISuggestions = (documents, count) => {
  const suggestions = []
  const types = ['grammar', 'style', 'content', 'structure', 'translation']
  const sampleSuggestions = [
    '建議調整段落結構以提高可讀性',
    '可以增加更多技術細節',
    '建議使用更正式的語調',
    '這個部分可以加入圖表說明',
    '建議重新組織內容順序',
  ]

  for (let i = 0; i < count; i++) {
    const documentId =
      documents[Math.floor(Math.random() * documents.length)].id
    const type = types[Math.floor(Math.random() * types.length)]

    suggestions.push({
      id: `ai_suggestion_${i + 1}`,
      documentId,
      type,
      suggestion:
        sampleSuggestions[Math.floor(Math.random() * sampleSuggestions.length)],
      confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      position: {
        line: Math.floor(Math.random() * 50) + 1,
        character: Math.floor(Math.random() * 80),
      },
      applied: Math.random() > 0.7,
      createdAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
  }

  return suggestions
}

// Run the seeding process
if (require.main === module) {
  seedDatabase()
    .then(() => {
      log('Seeding process completed successfully!', 'success')
      process.exit(0)
    })
    .catch(error => {
      log(`Seeding process failed: ${error.message}`, 'error')
      process.exit(1)
    })
}

module.exports = { seedDatabase, CONFIG }
