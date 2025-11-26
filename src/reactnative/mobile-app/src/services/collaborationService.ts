import {io, Socket} from 'socket.io-client'
import {MOCK_CONFIG} from '../utils/constants'

export interface CollaborationEvent {
  type: 'document-update' | 'cursor-update' | 'user-join' | 'user-leave'
  documentId: string
  userId: string
  data: any
  timestamp: number
}

export interface CursorPosition {
  userId: string
  userName: string
  position: number
  selection?: {start: number; end: number}
  color: string
}

export interface DocumentOperation {
  type: 'insert' | 'delete' | 'replace'
  position: number
  content?: string
  length?: number
  userId: string
  timestamp: number
}

class CollaborationService {
  private socket: Socket | null = null
  private isConnected = false
  private currentDocumentId: string | null = null
  private eventHandlers: Map<string, Function[]> = new Map()
  private mockMode = MOCK_CONFIG.enableMockWebSocket

  constructor() {
    if (this.mockMode) {
      this.initMockSocket()
    }
  }

  // Mock WebSocket for development
  private initMockSocket() {
    // Simulate WebSocket events with setTimeout
    console.log('CollaborationService: Mock mode enabled')
  }

  async connect(serverUrl?: string): Promise<boolean> {
    if (this.mockMode) {
      return this.mockConnect()
    }

    try {
      this.socket = io(serverUrl || 'ws://localhost:3001', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        console.log('WebSocket connected')
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
        console.log('WebSocket disconnected')
      })

      this.socket.on('document-update', this.handleDocumentUpdate.bind(this))
      this.socket.on('cursor-update', this.handleCursorUpdate.bind(this))
      this.socket.on('user-join', this.handleUserJoin.bind(this))
      this.socket.on('user-leave', this.handleUserLeave.bind(this))

      return new Promise(resolve => {
        this.socket?.on('connect', () => resolve(true))
        this.socket?.on('connect_error', () => resolve(false))
      })
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      return false
    }
  }

  private async mockConnect(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500))
    this.isConnected = true
    console.log('Mock WebSocket connected')

    // Simulate other users joining
    setTimeout(() => {
      this.simulateUserJoin('user-2', 'Alice Chen')
      this.simulateUserJoin('user-3', 'Bob Wang')
    }, 2000)

    return true
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.currentDocumentId = null
  }

  async joinDocument(documentId: string): Promise<boolean> {
    this.currentDocumentId = documentId

    if (this.mockMode) {
      return this.mockJoinDocument(documentId)
    }

    if (!this.socket || !this.isConnected) {
      return false
    }

    return new Promise(resolve => {
      this.socket?.emit('join-document', {documentId}, (response: any) => {
        resolve(response.success || false)
      })
    })
  }

  private async mockJoinDocument(documentId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200))
    console.log(`Mock: Joined document ${documentId}`)

    // Simulate periodic updates from other users
    this.startMockCollaboration(documentId)
    return true
  }

  leaveDocument() {
    if (this.mockMode) {
      console.log(`Mock: Left document ${this.currentDocumentId}`)
      this.currentDocumentId = null
      return
    }

    if (this.socket && this.currentDocumentId) {
      this.socket.emit('leave-document', {
        documentId: this.currentDocumentId,
      })
    }
    this.currentDocumentId = null
  }

  sendOperation(operation: DocumentOperation) {
    if (this.mockMode) {
      this.mockSendOperation(operation)
      return
    }

    if (this.socket && this.currentDocumentId) {
      this.socket.emit('document-operation', {
        documentId: this.currentDocumentId,
        operation,
      })
    }
  }

  private mockSendOperation(operation: DocumentOperation) {
    console.log('Mock: Sent operation', operation)

    // Simulate conflict resolution
    setTimeout(() => {
      if (Math.random() > 0.8) {
        // 20% chance of conflict
        this.handleConflict(operation)
      }
    }, 100)
  }

  sendCursorUpdate(position: number, selection?: {start: number; end: number}) {
    const cursorData = {
      userId: 'current-user',
      userName: 'You',
      position,
      selection,
      color: '#2196F3',
      timestamp: Date.now(),
    }

    if (this.mockMode) {
      console.log('Mock: Cursor update', cursorData)
      return
    }

    if (this.socket && this.currentDocumentId) {
      this.socket.emit('cursor-update', {
        documentId: this.currentDocumentId,
        cursor: cursorData,
      })
    }
  }

  // Event handlers
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)?.push(handler)
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  private handleDocumentUpdate(data: any) {
    console.log('Document update received:', data)
    this.emit('document-update', data)
  }

  private handleCursorUpdate(data: any) {
    console.log('Cursor update received:', data)
    this.emit('cursor-update', data)
  }

  private handleUserJoin(data: any) {
    console.log('User joined:', data)
    this.emit('user-join', data)
  }

  private handleUserLeave(data: any) {
    console.log('User left:', data)
    this.emit('user-leave', data)
  }

  private handleConflict(operation: DocumentOperation) {
    console.log('Conflict detected, resolving...', operation)
    // Simple conflict resolution: last write wins
    this.emit('conflict-resolved', {
      originalOperation: operation,
      resolvedOperation: operation,
      strategy: 'last-write-wins',
    })
  }

  // Mock collaboration simulation
  private startMockCollaboration(documentId: string) {
    const mockUsers = [
      {id: 'user-2', name: 'Alice Chen', color: '#4CAF50'},
      {id: 'user-3', name: 'Bob Wang', color: '#FF9800'},
    ]

    // Simulate random edits from other users
    const simulateEdit = () => {
      if (this.currentDocumentId !== documentId) {
        return
      }

      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
      const operations = ['insert', 'delete', 'replace'] as const
      const operation =
        operations[Math.floor(Math.random() * operations.length)]

      const mockOperation: DocumentOperation = {
        type: operation,
        position: Math.floor(Math.random() * 1000),
        content: operation === 'insert' ? 'Mock edit content ' : undefined,
        length:
          operation === 'delete'
            ? Math.floor(Math.random() * 10) + 1
            : undefined,
        userId: user.id,
        timestamp: Date.now(),
      }

      this.emit('document-update', {
        documentId,
        operation: mockOperation,
        user: {
          id: user.id,
          name: user.name,
          color: user.color,
        },
      })

      // Schedule next edit
      setTimeout(simulateEdit, Math.random() * 10000 + 5000) // 5-15 seconds
    }

    // Simulate cursor movements
    const simulateCursor = () => {
      if (this.currentDocumentId !== documentId) {
        return
      }

      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
      const cursor: CursorPosition = {
        userId: user.id,
        userName: user.name,
        position: Math.floor(Math.random() * 1000),
        color: user.color,
      }

      this.emit('cursor-update', {
        documentId,
        cursor,
      })

      setTimeout(simulateCursor, Math.random() * 3000 + 2000) // 2-5 seconds
    }

    // Start simulations
    setTimeout(simulateEdit, 3000)
    setTimeout(simulateCursor, 1000)
  }

  private simulateUserJoin(userId: string, userName: string) {
    this.emit('user-join', {
      userId,
      userName,
      timestamp: Date.now(),
    })
  }

  // Utility methods
  isDocumentJoined(): boolean {
    return this.currentDocumentId !== null
  }

  getCurrentDocumentId(): string | null {
    return this.currentDocumentId
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

export const collaborationService = new CollaborationService()
