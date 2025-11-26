/**
 * Mock WebSocket Service for Real-time Collaboration
 *
 * This service simulates WebSocket connections and real-time events
 * for development and testing purposes.
 */

interface MockWebSocketEventData {
  [key: string]: any
}

type MockWebSocketEventHandler = (data: MockWebSocketEventData) => void

interface MockWebSocketEvents {
  // Document collaboration events
  'document:edit': {
    documentId: string
    userId: string
    operation: {
      type: 'insert' | 'delete' | 'format'
      position: number
      content?: string
      length?: number
      attributes?: Record<string, any>
    }
    timestamp: string
  }

  'document:cursor': {
    documentId: string
    userId: string
    cursor: {
      position: number
      selection?: { start: number; end: number }
    }
    timestamp: string
  }

  'document:typing': {
    documentId: string
    userId: string
    isTyping: boolean
    position?: number
    timestamp: string
  }

  // User presence events
  'user:presence': {
    userId: string
    documentId?: string
    status: 'online' | 'away' | 'offline'
    lastActiveAt: string
  }

  'user:join': {
    userId: string
    documentId: string
    timestamp: string
  }

  'user:leave': {
    userId: string
    documentId: string
    timestamp: string
  }

  // Comment events
  'comment:added': {
    commentId: string
    documentId: string
    userId: string
    content: string
    position?: { start: number; end: number; section?: string }
    timestamp: string
  }

  'comment:updated': {
    commentId: string
    documentId: string
    userId: string
    content: string
    timestamp: string
  }

  'comment:resolved': {
    commentId: string
    documentId: string
    userId: string
    resolved: boolean
    timestamp: string
  }

  // Sync events
  'sync:conflict': {
    documentId: string
    conflictId: string
    type: 'text_overlap' | 'structure_change' | 'format_conflict'
    operations: Array<any>
    timestamp: string
  }

  'sync:resolved': {
    documentId: string
    conflictId: string
    resolution: 'merge' | 'override' | 'manual'
    timestamp: string
  }

  // Document events
  'document:saved': {
    documentId: string
    version: string
    userId: string
    timestamp: string
  }

  'document:shared': {
    documentId: string
    sharedWith: string[]
    sharedBy: string
    permissions: string[]
    timestamp: string
  }
}

class MockWebSocketService {
  private eventHandlers = new Map<string, MockWebSocketEventHandler[]>()
  private connectedUsers = new Set<string>()
  private activeDocuments = new Map<string, Set<string>>() // documentId -> userIds
  private simulationIntervals = new Map<string, NodeJS.Timeout>()
  private isConnected = false

  // Mock user data for simulation
  private mockUsers = [
    {
      id: 'user-001',
      name: '系統管理員',
      avatar:
        'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=ffffff',
    },
    {
      id: 'user-002',
      name: '測試用戶',
      avatar:
        'https://ui-avatars.com/api/?name=User&background=10B981&color=ffffff',
    },
    {
      id: 'user-003',
      name: '文檔編輯者',
      avatar:
        'https://ui-avatars.com/api/?name=Editor&background=F59E0B&color=ffffff',
    },
    {
      id: 'user-004',
      name: '協作者A',
      avatar:
        'https://ui-avatars.com/api/?name=ColA&background=EF4444&color=ffffff',
    },
    {
      id: 'user-005',
      name: '協作者B',
      avatar:
        'https://ui-avatars.com/api/?name=ColB&background=8B5CF6&color=ffffff',
    },
  ]

  constructor() {
    this.startGlobalSimulation()
  }

  // Connection management
  connect(userId: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.isConnected = true
        this.connectedUsers.add(userId)

        // Emit connection event
        this.emit('user:presence', {
          userId,
          status: 'online',
          lastActiveAt: new Date().toISOString(),
        })

        console.log(`[MockWebSocket] User ${userId} connected`)
        resolve()
      }, 100) // Simulate connection delay
    })
  }

  disconnect(userId: string): void {
    this.isConnected = false
    this.connectedUsers.delete(userId)

    // Clean up user from all documents
    this.activeDocuments.forEach((users, documentId) => {
      if (users.has(userId)) {
        users.delete(userId)
        this.emit('user:leave', {
          userId,
          documentId,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Emit disconnection event
    this.emit('user:presence', {
      userId,
      status: 'offline',
      lastActiveAt: new Date().toISOString(),
    })

    console.log(`[MockWebSocket] User ${userId} disconnected`)
  }

  // Document collaboration
  joinDocument(userId: string, documentId: string): void {
    if (!this.activeDocuments.has(documentId)) {
      this.activeDocuments.set(documentId, new Set())
    }

    this.activeDocuments.get(documentId)!.add(userId)

    this.emit('user:join', {
      userId,
      documentId,
      timestamp: new Date().toISOString(),
    })

    // Start document-specific simulations
    this.startDocumentSimulation(documentId)

    console.log(`[MockWebSocket] User ${userId} joined document ${documentId}`)
  }

  leaveDocument(userId: string, documentId: string): void {
    const users = this.activeDocuments.get(documentId)
    if (users) {
      users.delete(userId)
      if (users.size === 0) {
        this.stopDocumentSimulation(documentId)
        this.activeDocuments.delete(documentId)
      }
    }

    this.emit('user:leave', {
      userId,
      documentId,
      timestamp: new Date().toISOString(),
    })

    console.log(`[MockWebSocket] User ${userId} left document ${documentId}`)
  }

  // Event handling
  on<K extends keyof MockWebSocketEvents>(
    event: K,
    handler: (data: MockWebSocketEvents[K]) => void
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler as MockWebSocketEventHandler)
  }

  off<K extends keyof MockWebSocketEvents>(
    event: K,
    handler: (data: MockWebSocketEvents[K]) => void
  ): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler as MockWebSocketEventHandler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit<K extends keyof MockWebSocketEvents>(
    event: K,
    data: MockWebSocketEvents[K]
  ): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(
            `[MockWebSocket] Error in event handler for ${event}:`,
            error
          )
        }
      })
    }
  }

  // Simulate real-time events
  private startGlobalSimulation(): void {
    // Simulate random user presence changes
    setInterval(
      () => {
        if (this.mockUsers.length > 0) {
          const randomUser =
            this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)]
          if (randomUser) {
            const status =
              Math.random() > 0.3
                ? 'online'
                : Math.random() > 0.5
                  ? 'away'
                  : 'offline'

            this.emit('user:presence', {
              userId: randomUser.id,
              status,
              lastActiveAt: new Date().toISOString(),
            })
          }
        }
      },
      15000 + Math.random() * 10000
    ) // 15-25 seconds
  }

  private startDocumentSimulation(documentId: string): void {
    if (this.simulationIntervals.has(documentId)) {
      return // Already running
    }

    // Simulate typing indicators
    const typingInterval = setInterval(
      () => {
        const users = Array.from(this.activeDocuments.get(documentId) || [])
        if (users.length > 0) {
          const randomUser = users[Math.floor(Math.random() * users.length)]
          if (randomUser) {
            const isTyping = Math.random() > 0.7

            this.emit('document:typing', {
              documentId,
              userId: randomUser,
              isTyping,
              position: Math.floor(Math.random() * 1000),
              timestamp: new Date().toISOString(),
            })
          }
        }
      },
      2000 + Math.random() * 3000
    )

    // Simulate cursor movements
    const cursorInterval = setInterval(
      () => {
        const users = Array.from(this.activeDocuments.get(documentId) || [])
        if (users.length > 0) {
          const randomUser = users[Math.floor(Math.random() * users.length)]
          if (randomUser) {
            const position = Math.floor(Math.random() * 1000)
            const selection =
              Math.random() > 0.8
                ? {
                    start: position,
                    end: position + Math.floor(Math.random() * 20) + 1,
                  }
                : undefined

            this.emit('document:cursor', {
              documentId,
              userId: randomUser,
              cursor: { position, ...(selection && { selection }) },
              timestamp: new Date().toISOString(),
            })
          }
        }
      },
      1000 + Math.random() * 2000
    )

    // Simulate occasional edits
    const editInterval = setInterval(
      () => {
        const users = Array.from(this.activeDocuments.get(documentId) || [])
        if (users.length > 0 && Math.random() > 0.8) {
          const randomUser = users[Math.floor(Math.random() * users.length)]
          if (randomUser) {
            const operations = [
              { type: 'insert', content: '新增的文字 ' },
              { type: 'delete', length: 5 },
              { type: 'format', attributes: { bold: true } },
            ]
            const operation =
              operations[Math.floor(Math.random() * operations.length)]

            this.emit('document:edit', {
              documentId,
              userId: randomUser,
              operation: {
                ...operation,
                position: Math.floor(Math.random() * 1000),
              } as any,
              timestamp: new Date().toISOString(),
            })
          }
        }
      },
      10000 + Math.random() * 20000
    )

    // Simulate comments
    const commentInterval = setInterval(
      () => {
        const users = Array.from(this.activeDocuments.get(documentId) || [])
        if (users.length > 0 && Math.random() > 0.9) {
          const randomUser = users[Math.floor(Math.random() * users.length)]
          const comments = [
            '這個地方需要更詳細說明',
            '建議添加一些例子',
            '這個觀點很好！',
            '可以考慮另一種做法',
            '需要確認這個數據是否正確',
          ]
          const comment = comments[Math.floor(Math.random() * comments.length)]

          if (randomUser && comment) {
            this.emit('comment:added', {
              commentId: `comment-${Date.now()}`,
              documentId,
              userId: randomUser,
              content: comment,
              position: {
                start: Math.floor(Math.random() * 800),
                end: Math.floor(Math.random() * 100) + 800,
              },
              timestamp: new Date().toISOString(),
            })
          }
        }
      },
      30000 + Math.random() * 60000
    )

    // Store intervals for cleanup
    this.simulationIntervals.set(documentId, typingInterval)
    this.simulationIntervals.set(`${documentId}:cursor`, cursorInterval)
    this.simulationIntervals.set(`${documentId}:edit`, editInterval)
    this.simulationIntervals.set(`${documentId}:comment`, commentInterval)
  }

  private stopDocumentSimulation(documentId: string): void {
    const intervals = [
      documentId,
      `${documentId}:cursor`,
      `${documentId}:edit`,
      `${documentId}:comment`,
    ]

    intervals.forEach(key => {
      const interval = this.simulationIntervals.get(key)
      if (interval) {
        clearInterval(interval)
        this.simulationIntervals.delete(key)
      }
    })
  }

  // Manual event triggers (for testing)
  simulateEdit(documentId: string, userId: string, operation: any): void {
    this.emit('document:edit', {
      documentId,
      userId,
      operation,
      timestamp: new Date().toISOString(),
    })
  }

  simulateConflict(
    documentId: string,
    conflictType: 'text_overlap' | 'structure_change' | 'format_conflict'
  ): void {
    this.emit('sync:conflict', {
      documentId,
      conflictId: `conflict-${Date.now()}`,
      type: conflictType,
      operations: [],
      timestamp: new Date().toISOString(),
    })
  }

  simulateComment(
    documentId: string,
    userId: string,
    content: string,
    position?: any
  ): void {
    this.emit('comment:added', {
      commentId: `comment-${Date.now()}`,
      documentId,
      userId,
      content,
      position,
      timestamp: new Date().toISOString(),
    })
  }

  // Utility methods
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers)
  }

  getDocumentUsers(documentId: string): string[] {
    return Array.from(this.activeDocuments.get(documentId) || [])
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }

  isUserInDocument(userId: string, documentId: string): boolean {
    const users = this.activeDocuments.get(documentId)
    return users ? users.has(userId) : false
  }

  // Cleanup
  destroy(): void {
    // Clear all intervals
    this.simulationIntervals.forEach(interval => clearInterval(interval))
    this.simulationIntervals.clear()

    // Clear all handlers
    this.eventHandlers.clear()

    // Clear user data
    this.connectedUsers.clear()
    this.activeDocuments.clear()

    this.isConnected = false

    console.log('[MockWebSocket] Service destroyed')
  }
}

// Export singleton instance
export const mockWebSocketService = new MockWebSocketService()

// Export types
export type {
  MockWebSocketEvents,
  MockWebSocketEventData,
  MockWebSocketEventHandler,
}

export default mockWebSocketService
