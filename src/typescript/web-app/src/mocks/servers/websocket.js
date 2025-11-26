/**
 * Mock WebSocket Server for Real-time Collaboration
 * Simulates live editing, user presence, and collaborative features
 */

const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')

class MockWebSocketServer {
  constructor(port = 3302) {
    this.port = port
    this.wss = null
    this.rooms = new Map() // documentId -> Set of connections
    this.users = new Map() // connectionId -> user info
    this.documentStates = new Map() // documentId -> document state
    this.cursors = new Map() // documentId -> Map(userId -> cursor position)
    this.typingUsers = new Map() // documentId -> Set of typing users
  }

  start() {
    this.wss = new WebSocket.Server({ port: this.port })

    this.wss.on('connection', ws => {
      const connectionId = uuidv4()
      ws.connectionId = connectionId

      console.log(`[WebSocket] Client connected: ${connectionId}`)

      ws.on('message', message => {
        try {
          const data = JSON.parse(message.toString())
          this.handleMessage(ws, data)
        } catch (error) {
          console.error('[WebSocket] Invalid message format:', error)
          this.sendError(ws, 'Invalid message format')
        }
      })

      ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected: ${connectionId}`)
        this.handleDisconnection(ws)
      })

      ws.on('error', error => {
        console.error(
          `[WebSocket] Connection error for ${connectionId}:`,
          error
        )
      })

      // Send welcome message
      this.send(ws, {
        type: 'connection_established',
        connectionId,
        timestamp: Date.now(),
      })
    })

    console.log(`[WebSocket] Mock server started on port ${this.port}`)

    // Start cleanup interval
    this.startCleanupInterval()
  }

  handleMessage(ws, data) {
    const { type, payload } = data

    switch (type) {
      case 'join_document':
        this.handleJoinDocument(ws, payload)
        break

      case 'leave_document':
        this.handleLeaveDocument(ws, payload)
        break

      case 'text_operation':
        this.handleTextOperation(ws, payload)
        break

      case 'cursor_update':
        this.handleCursorUpdate(ws, payload)
        break

      case 'typing_start':
        this.handleTypingStart(ws, payload)
        break

      case 'typing_stop':
        this.handleTypingStop(ws, payload)
        break

      case 'presence_update':
        this.handlePresenceUpdate(ws, payload)
        break

      case 'comment_add':
        this.handleCommentAdd(ws, payload)
        break

      case 'comment_resolve':
        this.handleCommentResolve(ws, payload)
        break

      case 'create_workspace':
        this.handleCreateWorkspace(ws, payload)
        break

      case 'invite_member':
        this.handleInviteMember(ws, payload)
        break

      case 'update_member_role':
        this.handleUpdateMemberRole(ws, payload)
        break

      case 'grant_permission':
        this.handleGrantPermission(ws, payload)
        break

      case 'revoke_permission':
        this.handleRevokePermission(ws, payload)
        break

      case 'add_comment':
        this.handleAddCommentNew(ws, payload)
        break

      case 'reply_comment':
        this.handleReplyComment(ws, payload)
        break

      case 'resolve_comment':
        this.handleResolveComment(ws, payload)
        break

      case 'add_reaction':
        this.handleAddReaction(ws, payload)
        break

      case 'remove_reaction':
        this.handleRemoveReaction(ws, payload)
        break

      default:
        console.warn(`[WebSocket] Unknown message type: ${type}`)
        this.sendError(ws, `Unknown message type: ${type}`)
    }
  }

  handleJoinDocument(ws, payload) {
    const { documentId, user } = payload

    if (!documentId || !user) {
      return this.sendError(ws, 'Missing documentId or user info')
    }

    // Store user info
    this.users.set(ws.connectionId, { ...user, documentId })

    // Add to room
    if (!this.rooms.has(documentId)) {
      this.rooms.set(documentId, new Set())
    }
    this.rooms.get(documentId).add(ws)

    // Initialize document state if not exists
    if (!this.documentStates.has(documentId)) {
      this.documentStates.set(documentId, {
        content: '',
        version: 1,
        lastModified: Date.now(),
      })
    }

    // Initialize cursors for document if not exists
    if (!this.cursors.has(documentId)) {
      this.cursors.set(documentId, new Map())
    }

    // Send current document state
    this.send(ws, {
      type: 'document_state',
      payload: {
        documentId,
        state: this.documentStates.get(documentId),
        participants: this.getDocumentParticipants(documentId),
        cursors: Array.from(this.cursors.get(documentId).entries()),
        typingUsers: Array.from(this.typingUsers.get(documentId) || []),
      },
    })

    // Notify others about new participant
    this.broadcastToDocument(
      documentId,
      {
        type: 'user_joined',
        payload: {
          user,
          participants: this.getDocumentParticipants(documentId),
        },
      },
      ws
    )

    console.log(`[WebSocket] User ${user.name} joined document ${documentId}`)
  }

  handleLeaveDocument(ws, payload) {
    const { documentId } = payload
    const user = this.users.get(ws.connectionId)

    if (!user || user.documentId !== documentId) {
      return this.sendError(ws, 'User not in document')
    }

    this.removeFromDocument(ws, documentId)

    console.log(`[WebSocket] User ${user.name} left document ${documentId}`)
  }

  handleTextOperation(ws, payload) {
    const { documentId, operation, version } = payload
    const user = this.users.get(ws.connectionId)

    if (!user || user.documentId !== documentId) {
      return this.sendError(ws, 'User not in document')
    }

    const documentState = this.documentStates.get(documentId)
    if (!documentState) {
      return this.sendError(ws, 'Document not found')
    }

    // Simple operational transformation simulation
    if (version !== documentState.version) {
      // In a real implementation, we would transform the operation
      console.warn(`[WebSocket] Version mismatch for document ${documentId}`)
    }

    // Apply operation (simplified)
    this.applyOperation(documentState, operation)
    documentState.version++
    documentState.lastModified = Date.now()

    // Broadcast operation to other participants
    this.broadcastToDocument(
      documentId,
      {
        type: 'text_operation',
        payload: {
          documentId,
          operation,
          version: documentState.version,
          author: user,
          timestamp: Date.now(),
        },
      },
      ws
    )

    // Send acknowledgment
    this.send(ws, {
      type: 'operation_ack',
      payload: {
        documentId,
        version: documentState.version,
        timestamp: Date.now(),
      },
    })
  }

  handleCursorUpdate(ws, payload) {
    const { documentId, position, selection } = payload
    const user = this.users.get(ws.connectionId)

    if (!user || user.documentId !== documentId) {
      return this.sendError(ws, 'User not in document')
    }

    // Update cursor position
    const cursors = this.cursors.get(documentId)
    if (cursors) {
      cursors.set(user.id, { position, selection, user })

      // Broadcast cursor update
      this.broadcastToDocument(
        documentId,
        {
          type: 'cursor_update',
          payload: {
            documentId,
            userId: user.id,
            position,
            selection,
            user,
          },
        },
        ws
      )
    }
  }

  handleTypingStart(ws, payload) {
    const { documentId } = payload
    const user = this.users.get(ws.connectionId)

    if (!user || user.documentId !== documentId) {
      return this.sendError(ws, 'User not in document')
    }

    if (!this.typingUsers.has(documentId)) {
      this.typingUsers.set(documentId, new Set())
    }

    this.typingUsers.get(documentId).add(user.id)

    // Broadcast typing start
    this.broadcastToDocument(
      documentId,
      {
        type: 'typing_start',
        payload: {
          documentId,
          user,
          typingUsers: Array.from(this.typingUsers.get(documentId)),
        },
      },
      ws
    )

    // Auto-stop typing after 3 seconds
    setTimeout(() => {
      if (this.typingUsers.has(documentId)) {
        this.typingUsers.get(documentId).delete(user.id)
        this.broadcastToDocument(documentId, {
          type: 'typing_stop',
          payload: {
            documentId,
            user,
            typingUsers: Array.from(this.typingUsers.get(documentId)),
          },
        })
      }
    }, 3000)
  }

  handleTypingStop(ws, payload) {
    const { documentId } = payload
    const user = this.users.get(ws.connectionId)

    if (!user || user.documentId !== documentId) {
      return this.sendError(ws, 'User not in document')
    }

    if (this.typingUsers.has(documentId)) {
      this.typingUsers.get(documentId).delete(user.id)

      // Broadcast typing stop
      this.broadcastToDocument(
        documentId,
        {
          type: 'typing_stop',
          payload: {
            documentId,
            user,
            typingUsers: Array.from(this.typingUsers.get(documentId)),
          },
        },
        ws
      )
    }
  }

  handlePresenceUpdate(ws, payload) {
    const { documentId, status, activity } = payload
    const user = this.users.get(ws.connectionId)

    if (!user || user.documentId !== documentId) {
      return this.sendError(ws, 'User not in document')
    }

    // Update user presence
    user.status = status
    user.activity = activity
    user.lastSeen = Date.now()

    // Broadcast presence update
    this.broadcastToDocument(
      documentId,
      {
        type: 'presence_update',
        payload: {
          documentId,
          user: { ...user, status, activity },
          participants: this.getDocumentParticipants(documentId),
        },
      },
      ws
    )
  }

  handleCommentAdd(ws, payload) {
    const { documentId, comment } = payload
    const user = this.users.get(ws.connectionId)

    if (!user || user.documentId !== documentId) {
      return this.sendError(ws, 'User not in document')
    }

    const commentWithId = {
      ...comment,
      id: uuidv4(),
      author: user,
      createdAt: Date.now(),
      resolved: false,
    }

    // Broadcast new comment
    this.broadcastToDocument(documentId, {
      type: 'comment_added',
      payload: {
        documentId,
        comment: commentWithId,
      },
    })
  }

  handleCommentResolve(ws, payload) {
    const { documentId, commentId } = payload
    const user = this.users.get(ws.connectionId)

    if (!user || user.documentId !== documentId) {
      return this.sendError(ws, 'User not in document')
    }

    // Broadcast comment resolution
    this.broadcastToDocument(documentId, {
      type: 'comment_resolved',
      payload: {
        documentId,
        commentId,
        resolvedBy: user,
        resolvedAt: Date.now(),
      },
    })
  }

  // Workspace Management
  handleCreateWorkspace(ws, payload) {
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    const workspace = {
      ...payload.workspace,
      id: this.generateId(),
      members: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'owner',
          status: 'active',
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.send(ws, {
      type: 'workspace_created',
      payload: { workspace },
    })

    console.log(`[WebSocket] Workspace created: ${workspace.name}`)
  }

  handleInviteMember(ws, payload) {
    const { workspaceId, email, role } = payload
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    const invitation = {
      id: this.generateId(),
      workspaceId,
      email,
      role,
      invitedBy: user.id,
      invitedAt: new Date().toISOString(),
      status: 'pending',
    }

    this.broadcastToRoom(workspaceId, {
      type: 'member_invited',
      payload: { workspaceId, invitation },
    })

    console.log(
      `[WebSocket] Member invited to workspace ${workspaceId}: ${email}`
    )
  }

  handleUpdateMemberRole(ws, payload) {
    const { workspaceId, memberId, role } = payload
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    this.broadcastToRoom(workspaceId, {
      type: 'member_role_updated',
      payload: { workspaceId, memberId, role, updatedBy: user.id },
    })

    console.log(
      `[WebSocket] Member role updated in workspace ${workspaceId}: ${memberId} -> ${role}`
    )
  }

  // Permission Management
  handleGrantPermission(ws, payload) {
    const { resourceId, permission } = payload
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    const newPermission = {
      ...permission,
      id: this.generateId(),
      grantedBy: user.id,
      grantedAt: new Date().toISOString(),
    }

    this.broadcastToRoom(resourceId, {
      type: 'permission_granted',
      payload: { resourceId, permission: newPermission },
    })

    console.log(`[WebSocket] Permission granted for resource ${resourceId}`)
  }

  handleRevokePermission(ws, payload) {
    const { resourceId, permissionId } = payload
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    this.broadcastToRoom(resourceId, {
      type: 'permission_revoked',
      payload: { resourceId, permissionId, revokedBy: user.id },
    })

    console.log(`[WebSocket] Permission revoked for resource ${resourceId}`)
  }

  // Enhanced Comments and Activity
  handleAddCommentNew(ws, payload) {
    const { documentId, content, position } = payload
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    const comment = {
      id: this.generateId(),
      content,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
      replies: [],
      mentions: [],
      reactions: [],
      resolved: false,
      position,
      status: 'active',
    }

    this.broadcastToDocument(documentId, {
      type: 'comment_added_new',
      payload: { documentId, comment },
    })

    // Add activity event
    const activity = {
      id: this.generateId(),
      type: 'comment',
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      timestamp: new Date().toISOString(),
      description: `Added a comment: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
      resourceId: documentId,
      resourceType: 'document',
    }

    this.broadcastToDocument(documentId, {
      type: 'activity_added',
      payload: { activity },
    })

    console.log(`[WebSocket] Enhanced comment added to document ${documentId}`)
  }

  handleReplyComment(ws, payload) {
    const { parentId, content } = payload
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    const reply = {
      id: this.generateId(),
      content,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
      replies: [],
      mentions: [],
      reactions: [],
      resolved: false,
      status: 'active',
    }

    this.broadcast({
      type: 'comment_replied',
      payload: { parentId, reply },
    })

    console.log(`[WebSocket] Reply added to comment ${parentId}`)
  }

  handleResolveComment(ws, payload) {
    const { commentId } = payload
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    this.broadcast({
      type: 'comment_resolved_new',
      payload: {
        commentId,
        resolvedBy: user.id,
        resolvedAt: new Date().toISOString(),
      },
    })

    console.log(`[WebSocket] Enhanced comment resolved: ${commentId}`)
  }

  handleAddReaction(ws, payload) {
    const { commentId, emoji } = payload
    const user = this.users.get(ws.connectionId)
    if (!user) return this.sendError(ws, 'User not authenticated')

    const reaction = {
      id: this.generateId(),
      emoji,
      userId: user.id,
      userName: user.name,
    }

    this.broadcast({
      type: 'reaction_added',
      payload: { commentId, reaction },
    })

    console.log(`[WebSocket] Reaction added to comment ${commentId}: ${emoji}`)
  }

  handleRemoveReaction(ws, payload) {
    const { commentId, reactionId } = payload
    this.broadcast({
      type: 'reaction_removed',
      payload: { commentId, reactionId },
    })

    console.log(`[WebSocket] Reaction removed from comment ${commentId}`)
  }

  handleDisconnection(ws) {
    const user = this.users.get(ws.connectionId)

    if (user && user.documentId) {
      this.removeFromDocument(ws, user.documentId)
    }

    this.users.delete(ws.connectionId)
  }

  removeFromDocument(ws, documentId) {
    const user = this.users.get(ws.connectionId)

    // Remove from room
    if (this.rooms.has(documentId)) {
      this.rooms.get(documentId).delete(ws)

      // Clean up empty rooms
      if (this.rooms.get(documentId).size === 0) {
        this.rooms.delete(documentId)
        this.cursors.delete(documentId)
        this.typingUsers.delete(documentId)
      }
    }

    // Remove cursor
    if (this.cursors.has(documentId) && user) {
      this.cursors.get(documentId).delete(user.id)
    }

    // Remove from typing users
    if (this.typingUsers.has(documentId) && user) {
      this.typingUsers.get(documentId).delete(user.id)
    }

    // Notify others about user leaving
    if (user) {
      this.broadcastToDocument(documentId, {
        type: 'user_left',
        payload: {
          user,
          participants: this.getDocumentParticipants(documentId),
        },
      })
    }
  }

  applyOperation(documentState, operation) {
    // Simplified operation application
    // In a real implementation, this would be more sophisticated
    switch (operation.type) {
      case 'insert':
        const { position, text } = operation
        documentState.content =
          documentState.content.slice(0, position) +
          text +
          documentState.content.slice(position)
        break

      case 'delete':
        const { start, length } = operation
        documentState.content =
          documentState.content.slice(0, start) +
          documentState.content.slice(start + length)
        break

      case 'replace':
        documentState.content = operation.newContent
        break
    }
  }

  getDocumentParticipants(documentId) {
    const participants = []
    const room = this.rooms.get(documentId)

    if (room) {
      for (const ws of room) {
        const user = this.users.get(ws.connectionId)
        if (user) {
          participants.push({
            ...user,
            isOnline: true,
            lastSeen: Date.now(),
          })
        }
      }
    }

    return participants
  }

  broadcastToDocument(documentId, message, excludeWs = null) {
    const room = this.rooms.get(documentId)

    if (room) {
      for (const ws of room) {
        if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
          this.send(ws, message)
        }
      }
    }
  }

  send(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  sendError(ws, error) {
    this.send(ws, {
      type: 'error',
      payload: { error },
    })
  }

  startCleanupInterval() {
    // Clean up inactive connections every 30 seconds
    setInterval(() => {
      const now = Date.now()
      const timeout = 5 * 60 * 1000 // 5 minutes

      for (const [connectionId, user] of this.users.entries()) {
        if (user.lastSeen && now - user.lastSeen > timeout) {
          console.log(
            `[WebSocket] Cleaning up inactive connection: ${connectionId}`
          )
          // Find and close the connection
          for (const room of this.rooms.values()) {
            for (const ws of room) {
              if (ws.connectionId === connectionId) {
                ws.close()
                break
              }
            }
          }
        }
      }
    }, 30000)
  }

  stop() {
    if (this.wss) {
      this.wss.close()
      console.log('[WebSocket] Mock server stopped')
    }
  }
}

module.exports = MockWebSocketServer

// Start server if run directly
if (require.main === module) {
  const server = new MockWebSocketServer()
  server.start()

  process.on('SIGINT', () => {
    server.stop()
    process.exit(0)
  })
}
