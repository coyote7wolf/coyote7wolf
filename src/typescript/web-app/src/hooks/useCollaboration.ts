/**
 * React Hook for Real-time Collaboration
 * Provides easy integration with collaboration features in React components
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  collaborationService,
  type User,
  type Participant,
  type CursorPosition,
  type TextOperation,
  type Comment,
  type DocumentState,
} from '@/services/collaboration'

export interface UseCollaborationOptions {
  documentId: string
  user: User
  autoConnect?: boolean
  onError?: (error: any) => void
}

export interface CollaborationState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  participants: Participant[]
  cursors: CursorPosition[]
  typingUsers: string[]
  comments: Comment[]
  documentState: DocumentState | null
}

export function useCollaboration({
  documentId,
  user,
  autoConnect = true,
  onError,
}: UseCollaborationOptions) {
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    participants: [],
    cursors: [],
    typingUsers: [],
    comments: [],
    documentState: null,
  })

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const presenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Connection management
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      await collaborationService.connect()
      await collaborationService.joinDocument(documentId, user)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect'
      setState(prev => ({ ...prev, error: errorMessage, isConnecting: false }))
      onError?.(error)
    }
  }, [documentId, user, onError])

  const disconnect = useCallback(() => {
    collaborationService.leaveDocument()
    collaborationService.disconnect()
  }, [])

  // Text operations
  const sendOperation = useCallback(
    (operation: TextOperation, version: number) => {
      collaborationService.sendTextOperation(operation, version)
    },
    []
  )

  // Cursor management
  const updateCursor = useCallback(
    (position: number, selection?: [number, number]) => {
      collaborationService.updateCursor(position, selection)
    },
    []
  )

  // Typing indicators
  const startTyping = useCallback(() => {
    collaborationService.startTyping()

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      collaborationService.stopTyping()
    }, 3000)
  }, [])

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    collaborationService.stopTyping()
  }, [])

  // Presence management
  const updatePresence = useCallback(
    (status: 'active' | 'idle' | 'away', activity?: string) => {
      collaborationService.updatePresence(status, activity)

      // Auto-update presence to active when user interacts
      if (status === 'active') {
        if (presenceTimeoutRef.current) {
          clearTimeout(presenceTimeoutRef.current)
        }

        presenceTimeoutRef.current = setTimeout(
          () => {
            collaborationService.updatePresence('idle')
          },
          5 * 60 * 1000
        ) // 5 minutes
      }
    },
    []
  )

  // Comment management
  const addComment = useCallback(
    (comment: Omit<Comment, 'id' | 'author' | 'createdAt' | 'resolved'>) => {
      collaborationService.addComment(comment)
    },
    []
  )

  const resolveComment = useCallback((commentId: string) => {
    collaborationService.resolveComment(commentId)
  }, [])

  // Event handlers
  useEffect(() => {
    const handleConnected = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
      }))
    }

    const handleDisconnected = () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }))
    }

    const handleError = (error: any) => {
      const errorMessage = error.message || 'Connection error'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isConnecting: false,
      }))
      onError?.(error)
    }

    const handleDocumentState = (payload: any) => {
      setState(prev => ({
        ...prev,
        documentState: payload.state,
        participants: payload.participants || [],
        cursors: payload.cursors
          ? payload.cursors.map(([userId, cursor]: [string, any]) => cursor)
          : [],
        typingUsers: payload.typingUsers || [],
      }))
    }

    const handleUserJoined = (payload: any) => {
      setState(prev => ({
        ...prev,
        participants: payload.participants || [],
      }))
    }

    const handleUserLeft = (payload: any) => {
      setState(prev => ({
        ...prev,
        participants: payload.participants || [],
        cursors: prev.cursors.filter(
          cursor => cursor.user.id !== payload.user.id
        ),
        typingUsers: prev.typingUsers.filter(
          userId => userId !== payload.user.id
        ),
      }))
    }

    const handleTextOperation = (payload: any) => {
      // This would typically update the document state
      // In a real implementation, you'd apply the operation to your document
      setState(prev => ({
        ...prev,
        documentState: prev.documentState
          ? {
              ...prev.documentState,
              version: payload.version,
              lastModified: payload.timestamp,
            }
          : null,
      }))
    }

    const handleCursorUpdate = (payload: any) => {
      setState(prev => ({
        ...prev,
        cursors: prev.cursors
          .filter(cursor => cursor.user.id !== payload.userId)
          .concat([
            {
              position: payload.position,
              selection: payload.selection,
              user: payload.user,
            },
          ]),
      }))
    }

    const handleTypingStart = (payload: any) => {
      setState(prev => ({
        ...prev,
        typingUsers: Array.from(
          new Set([...prev.typingUsers, payload.user.id])
        ),
      }))
    }

    const handleTypingStop = (payload: any) => {
      setState(prev => ({
        ...prev,
        typingUsers: prev.typingUsers.filter(
          userId => userId !== payload.user.id
        ),
      }))
    }

    const handlePresenceUpdate = (payload: any) => {
      setState(prev => ({
        ...prev,
        participants: payload.participants || [],
      }))
    }

    const handleCommentAdded = (payload: any) => {
      setState(prev => ({
        ...prev,
        comments: [...prev.comments, payload.comment],
      }))
    }

    const handleCommentResolved = (payload: any) => {
      setState(prev => ({
        ...prev,
        comments: prev.comments.map(comment =>
          comment.id === payload.commentId
            ? {
                ...comment,
                resolved: true,
                resolvedBy: payload.resolvedBy,
                resolvedAt: payload.resolvedAt,
              }
            : comment
        ),
      }))
    }

    // Subscribe to events
    collaborationService.on('connected', handleConnected)
    collaborationService.on('disconnected', handleDisconnected)
    collaborationService.on('error', handleError)
    collaborationService.on('document_state', handleDocumentState)
    collaborationService.on('user_joined', handleUserJoined)
    collaborationService.on('user_left', handleUserLeft)
    collaborationService.on('text_operation', handleTextOperation)
    collaborationService.on('cursor_update', handleCursorUpdate)
    collaborationService.on('typing_start', handleTypingStart)
    collaborationService.on('typing_stop', handleTypingStop)
    collaborationService.on('presence_update', handlePresenceUpdate)
    collaborationService.on('comment_added', handleCommentAdded)
    collaborationService.on('comment_resolved', handleCommentResolved)

    // Auto-connect if enabled
    if (autoConnect) {
      connect()
    }

    // Cleanup
    return () => {
      collaborationService.removeListener('connected', handleConnected)
      collaborationService.removeListener('disconnected', handleDisconnected)
      collaborationService.removeListener('error', handleError)
      collaborationService.removeListener('document_state', handleDocumentState)
      collaborationService.removeListener('user_joined', handleUserJoined)
      collaborationService.removeListener('user_left', handleUserLeft)
      collaborationService.removeListener('text_operation', handleTextOperation)
      collaborationService.removeListener('cursor_update', handleCursorUpdate)
      collaborationService.removeListener('typing_start', handleTypingStart)
      collaborationService.removeListener('typing_stop', handleTypingStop)
      collaborationService.removeListener(
        'presence_update',
        handlePresenceUpdate
      )
      collaborationService.removeListener('comment_added', handleCommentAdded)
      collaborationService.removeListener(
        'comment_resolved',
        handleCommentResolved
      )

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      if (presenceTimeoutRef.current) {
        clearTimeout(presenceTimeoutRef.current)
      }
    }
  }, [documentId, user, autoConnect, connect, onError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Automatic presence management
  useEffect(() => {
    if (!state.isConnected) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away')
      } else {
        updatePresence('active')
      }
    }

    const handleActivity = () => {
      updatePresence('active')
    }

    // Set initial presence
    updatePresence('active')

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Listen for user activity
    document.addEventListener('mousedown', handleActivity)
    document.addEventListener('keydown', handleActivity)
    document.addEventListener('scroll', handleActivity)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('mousedown', handleActivity)
      document.removeEventListener('keydown', handleActivity)
      document.removeEventListener('scroll', handleActivity)
    }
  }, [state.isConnected, updatePresence])

  return {
    // State
    ...state,

    // Actions
    connect,
    disconnect,
    sendOperation,
    updateCursor,
    startTyping,
    stopTyping,
    updatePresence,
    addComment,
    resolveComment,
  }
}

// Hook for presence awareness
export function usePresence() {
  const [isVisible, setIsVisible] = useState(!document.hidden)
  const [isActive, setIsActive] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    const handleActivity = () => {
      setIsActive(true)
      setLastActivity(Date.now())
    }

    const activityTimeout = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity

      // Consider user idle after 5 minutes of inactivity
      if (timeSinceLastActivity > 5 * 60 * 1000) {
        setIsActive(false)
      }
    }, 30000) // Check every 30 seconds

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('mousedown', handleActivity)
    document.addEventListener('keydown', handleActivity)
    document.addEventListener('scroll', handleActivity)
    document.addEventListener('mousemove', handleActivity)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('mousedown', handleActivity)
      document.removeEventListener('keydown', handleActivity)
      document.removeEventListener('scroll', handleActivity)
      document.removeEventListener('mousemove', handleActivity)
      clearInterval(activityTimeout)
    }
  }, [lastActivity])

  return {
    isVisible,
    isActive,
    lastActivity,
    status: !isVisible ? 'away' : !isActive ? 'idle' : 'active',
  }
}

export default useCollaboration
