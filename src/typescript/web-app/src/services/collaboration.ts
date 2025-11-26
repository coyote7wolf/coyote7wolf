/**
 * Real-time Collaboration Service
 * Client-side WebSocket manager for collaborative editing features
 */

import { EventEmitter } from 'events'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  color?: string
}

export interface CursorPosition {
  position: number
  selection?: [number, number]
  user: User
}

export interface TextOperation {
  type: 'insert' | 'delete' | 'replace'
  position?: number
  start?: number
  length?: number
  text?: string
  newContent?: string
}

export interface Comment {
  id: string
  content: string
  position: number
  selection?: [number, number]
  author: User
  createdAt: number
  resolved: boolean
  resolvedBy?: User
  resolvedAt?: number
  replies?: Comment[]
}

export interface DocumentState {
  content: string
  version: number
  lastModified: number
}

export interface Participant {
  id: string
  name: string
  email: string
  avatar?: string
  color?: string
  isOnline: boolean
  status?: 'active' | 'idle' | 'away'
  activity?: string
  lastSeen: number
}

export class CollaborationService extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectInterval: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private connectionId: string | null = null
  private currentUser: User | null = null
  private currentDocumentId: string | null = null
  private isReconnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(private wsUrl: string = 'ws://localhost:3302') {
    super()
    this.setMaxListeners(100) // Increase listener limit for multiple components
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl)

        this.ws.onopen = () => {
          console.log('[Collaboration] Connected to WebSocket server')
          this.isReconnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = event => {
          try {
            const message = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('[Collaboration] Failed to parse message:', error)
          }
        }

        this.ws.onclose = event => {
          console.log(
            '[Collaboration] WebSocket connection closed:',
            event.code,
            event.reason
          )
          this.stopHeartbeat()
          this.emit('disconnected', event)

          if (!this.isReconnecting && event.code !== 1000) {
            this.attemptReconnect()
          }
        }

        this.ws.onerror = error => {
          console.error('[Collaboration] WebSocket error:', error)
          this.emit('error', error)
          reject(error)
        }
      } catch (error) {
        console.error(
          '[Collaboration] Failed to create WebSocket connection:',
          error
        )
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isReconnecting = false
    this.stopReconnecting()
    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting')
      this.ws = null
    }

    this.emit('disconnected')
  }

  /**
   * Join a document for collaboration
   */
  async joinDocument(documentId: string, user: User): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect()
    }

    this.currentUser = user
    this.currentDocumentId = documentId

    this.send({
      type: 'join_document',
      payload: { documentId, user },
    })
  }

  /**
   * Leave the current document
   */
  leaveDocument(): void {
    if (this.currentDocumentId) {
      this.send({
        type: 'leave_document',
        payload: { documentId: this.currentDocumentId },
      })

      this.currentDocumentId = null
      this.currentUser = null
    }
  }

  /**
   * Send a text operation to other collaborators
   */
  sendTextOperation(operation: TextOperation, version: number): void {
    if (!this.currentDocumentId) {
      console.warn('[Collaboration] Cannot send operation: not in a document')
      return
    }

    this.send({
      type: 'text_operation',
      payload: {
        documentId: this.currentDocumentId,
        operation,
        version,
      },
    })
  }

  /**
   * Update cursor position
   */
  updateCursor(position: number, selection?: [number, number]): void {
    if (!this.currentDocumentId) return

    this.send({
      type: 'cursor_update',
      payload: {
        documentId: this.currentDocumentId,
        position,
        selection,
      },
    })
  }

  /**
   * Start typing indicator
   */
  startTyping(): void {
    if (!this.currentDocumentId) return

    this.send({
      type: 'typing_start',
      payload: { documentId: this.currentDocumentId },
    })
  }

  /**
   * Stop typing indicator
   */
  stopTyping(): void {
    if (!this.currentDocumentId) return

    this.send({
      type: 'typing_stop',
      payload: { documentId: this.currentDocumentId },
    })
  }

  /**
   * Update user presence
   */
  updatePresence(status: 'active' | 'idle' | 'away', activity?: string): void {
    if (!this.currentDocumentId) return

    this.send({
      type: 'presence_update',
      payload: {
        documentId: this.currentDocumentId,
        status,
        activity,
      },
    })
  }

  /**
   * Add a comment
   */
  addComment(
    comment: Omit<Comment, 'id' | 'author' | 'createdAt' | 'resolved'>
  ): void {
    if (!this.currentDocumentId) return

    this.send({
      type: 'comment_add',
      payload: {
        documentId: this.currentDocumentId,
        comment,
      },
    })
  }

  /**
   * Resolve a comment
   */
  resolveComment(commentId: string): void {
    if (!this.currentDocumentId) return

    this.send({
      type: 'comment_resolve',
      payload: {
        documentId: this.currentDocumentId,
        commentId,
      },
    })
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Get current document ID
   */
  getCurrentDocumentId(): string | null {
    return this.currentDocumentId
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser
  }

  private handleMessage(message: any): void {
    const { type, payload } = message

    switch (type) {
      case 'connection_established':
        this.connectionId = payload.connectionId
        this.emit('connection_established', payload)
        break

      case 'document_state':
        this.emit('document_state', payload)
        break

      case 'user_joined':
        this.emit('user_joined', payload)
        break

      case 'user_left':
        this.emit('user_left', payload)
        break

      case 'text_operation':
        this.emit('text_operation', payload)
        break

      case 'operation_ack':
        this.emit('operation_ack', payload)
        break

      case 'cursor_update':
        this.emit('cursor_update', payload)
        break

      case 'typing_start':
        this.emit('typing_start', payload)
        break

      case 'typing_stop':
        this.emit('typing_stop', payload)
        break

      case 'presence_update':
        this.emit('presence_update', payload)
        break

      case 'comment_added':
        this.emit('comment_added', payload)
        break

      case 'comment_resolved':
        this.emit('comment_resolved', payload)
        break

      case 'error':
        console.error('[Collaboration] Server error:', payload.error)
        this.emit('server_error', payload.error)
        break

      default:
        console.warn('[Collaboration] Unknown message type:', type)
    }
  }

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn(
        '[Collaboration] Cannot send message: WebSocket not connected'
      )
    }
  }

  private attemptReconnect(): void {
    if (
      this.isReconnecting ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++

    console.log(
      `[Collaboration] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    )

    this.reconnectInterval = setTimeout(async () => {
      try {
        await this.connect()

        // Rejoin document if we were in one
        if (this.currentDocumentId && this.currentUser) {
          await this.joinDocument(this.currentDocumentId, this.currentUser)
        }
      } catch (error) {
        console.error('[Collaboration] Reconnection failed:', error)

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectDelay *= 2 // Exponential backoff
          this.attemptReconnect()
        } else {
          this.emit('reconnection_failed')
        }
      }
    }, this.reconnectDelay)
  }

  private stopReconnecting(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval)
      this.reconnectInterval = null
    }
    this.isReconnecting = false
    this.reconnectAttempts = 0
    this.reconnectDelay = 1000
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send ping if available (for Node.js ws implementation)
        if (typeof (this.ws as any).ping === 'function') {
          ;(this.ws as any).ping()
        }
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}

// Singleton instance
export const collaborationService = new CollaborationService(
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3302'
)

// Types are already exported above
