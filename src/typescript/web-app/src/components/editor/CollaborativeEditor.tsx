/**
 * Collaborative Document Editor
 * Advanced document editor with real-time collaboration features
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import useCollaboration from '@/hooks/useCollaboration'
import useCRDT from '@/hooks/useCRDT'
import {
  UserPresence,
  TypingIndicator,
  CollaborationToolbar,
  CursorOverlay,
} from '@/components/collaboration/CollaborationUI'
import {
  ConflictVisualizer,
  ConflictNotification,
} from '@/components/crdt/ConflictVisualizer'
import type { User, TextOperation } from '@/services/collaboration'

interface CollaborativeEditorProps {
  documentId: string
  initialContent?: string
  user: User
  title?: string
  readOnly?: boolean
  onSave?: (content: string) => void
  onTitleChange?: (title: string) => void
}

export function CollaborativeEditor({
  documentId,
  initialContent = '',
  user,
  title = 'Untitled Document',
  readOnly = false,
  onSave,
  onTitleChange,
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [documentTitle, setDocumentTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [showConflictPanel, setShowConflictPanel] = useState(false)
  const [activeConflictNotification, setActiveConflictNotification] = useState<
    string | null
  >(null)

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const lastCursorPosition = useRef(0)
  const documentVersion = useRef(1)

  const {
    isConnected,
    isConnecting,
    error,
    participants,
    cursors,
    typingUsers,
    sendOperation,
    updateCursor,
    startTyping,
    stopTyping,
    updatePresence,
    connect,
  } = useCollaboration({
    documentId,
    user,
    onError: error => {
      console.error('Collaboration error:', error)
    },
  })

  // CRDT Integration for conflict resolution
  const {
    documentState,
    conflicts,
    isResolvingConflicts,
    applyOperation,
    resolveConflict,
    dismissConflict,
    insertText,
    deleteText,
    generateMockConflict,
  } = useCRDT({
    documentId,
    userId: user.id,
    autoResolveThreshold: 0.85,
    enableRealTimeSync: true,
    debounceMs: 200,
  })

  // Update word and character count
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
    setWordCount(words)
    setCharCount(content.length)
  }, [content])

  // Sync CRDT document state with local content
  useEffect(() => {
    if (documentState && documentState.content !== content) {
      setContent(documentState.content)
    }
  }, [documentState])

  // Handle conflict notifications
  useEffect(() => {
    if (conflicts.length > 0 && !activeConflictNotification) {
      const highPriorityConflict = conflicts.find(c => c.confidence < 0.8)
      if (highPriorityConflict) {
        setActiveConflictNotification(highPriorityConflict.id)
      }
    }
  }, [conflicts, activeConflictNotification])

  // Auto-show conflict panel when conflicts are detected
  useEffect(() => {
    if (conflicts.length > 0) {
      setShowConflictPanel(true)
    } else {
      setShowConflictPanel(false)
      setActiveConflictNotification(null)
    }
  }, [conflicts.length])

  // Handle text changes with CRDT integration
  const handleContentChange = useCallback(
    async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = event.target.value
      const cursorPosition = event.target.selectionStart

      if (readOnly) return

      // Calculate the difference for CRDT operation
      const oldContent = content
      const oldLength = oldContent.length
      const newLength = newContent.length

      try {
        if (newLength > oldLength) {
          // Text insertion
          const insertPosition = cursorPosition - (newLength - oldLength)
          const insertedText = newContent.slice(insertPosition, cursorPosition)
          await insertText(insertPosition, insertedText)
        } else if (newLength < oldLength) {
          // Text deletion
          const deletePosition = cursorPosition
          const deleteLength = oldLength - newLength
          await deleteText(deletePosition, deleteLength)
        } else {
          // Text replacement - apply as CRDT operation
          await applyOperation({
            type: 'insert',
            position: 0,
            content: newContent,
            version: documentVersion.current + 1,
          })
        }

        // Update local content
        setContent(newContent)

        // Send operation to other collaborators
        if (isConnected) {
          const operation: TextOperation = {
            type: 'replace',
            newContent: newContent,
          }

          sendOperation(operation, documentVersion.current)
          documentVersion.current++

          // Update cursor position
          updateCursor(cursorPosition)

          // Start typing indicator
          startTyping()
        }

        // Set editing state
        if (!isEditing) {
          setIsEditing(true)
          updatePresence('active', 'Editing document')
        }
      } catch (error) {
        console.error('Failed to apply CRDT operation:', error)
        // Fallback to local update
        setContent(newContent)
      }
    },
    [
      readOnly,
      content,
      isConnected,
      sendOperation,
      updateCursor,
      startTyping,
      isEditing,
      updatePresence,
      insertText,
      deleteText,
      applyOperation,
    ]
  )

  // Handle cursor position changes
  const handleCursorChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const position = event.target.selectionStart
      lastCursorPosition.current = position

      if (isConnected) {
        updateCursor(position)
      }
    },
    [isConnected, updateCursor]
  )

  // Handle title changes
  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = event.target.value
      setDocumentTitle(newTitle)
      onTitleChange?.(newTitle)

      if (isConnected) {
        updatePresence('active', 'Editing title')
      }
    },
    [onTitleChange, isConnected, updatePresence]
  )

  // Auto-save functionality
  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave(content)
        setLastSaved(new Date())
        setIsEditing(false)

        if (isConnected) {
          updatePresence('active', 'Document saved')
        }
      } catch (error) {
        console.error('Failed to save document:', error)
      }
    }
  }, [content, onSave, isConnected, updatePresence])

  // Stop typing when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing) {
        stopTyping()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [content, isEditing, stopTyping])

  // Conflict resolution handlers
  const handleConflictResolve = useCallback(
    async (conflictId: string, strategy: 'accept' | 'reject' | 'merge') => {
      try {
        await resolveConflict(conflictId, strategy)
        console.log(
          `Conflict ${conflictId} resolved with strategy: ${strategy}`
        )
      } catch (error) {
        console.error('Failed to resolve conflict:', error)
      }
    },
    [resolveConflict]
  )

  const handleConflictDismiss = useCallback(
    (conflictId: string) => {
      dismissConflict(conflictId)
      if (activeConflictNotification === conflictId) {
        setActiveConflictNotification(null)
      }
    },
    [dismissConflict, activeConflictNotification]
  )

  const handleViewConflicts = useCallback(() => {
    setShowConflictPanel(true)
  }, [])

  const handleQuickResolveConflict = useCallback(
    async (conflictId: string) => {
      await handleConflictResolve(conflictId, 'accept')
      setActiveConflictNotification(null)
    },
    [handleConflictResolve]
  )

  // Development helper: Generate mock conflict
  const handleGenerateMockConflict = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const mockConflict = generateMockConflict()
      console.log('Generated mock conflict:', mockConflict)
    }
  }, [generateMockConflict])

  // Auto-save after changes
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        handleSave()
      }, 5000) // Auto-save after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isEditing, handleSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        handleSave()
      }

      // Escape to stop editing
      if (event.key === 'Escape') {
        setIsEditing(false)
        stopTyping()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, stopTyping])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getConnectionStatus = () => {
    if (error) return { text: 'Connection Error', color: 'text-red-600' }
    if (isConnecting) return { text: 'Connecting...', color: 'text-yellow-600' }
    if (isConnected) return { text: 'Connected', color: 'text-green-600' }
    return { text: 'Offline', color: 'text-gray-500' }
  }

  const status = getConnectionStatus()

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Collaboration Toolbar */}
      <CollaborationToolbar
        participants={participants}
        typingUsers={typingUsers}
        isConnected={isConnected}
        isConnecting={isConnecting}
        error={error}
        onReconnect={connect}
      />

      {/* Document Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <Input
              ref={titleInputRef}
              value={documentTitle}
              onChange={handleTitleChange}
              className="text-xl font-semibold border-none p-0 focus:ring-0"
              placeholder="Document title..."
              disabled={readOnly}
            />
          </div>

          <div className="flex items-center space-x-4">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Saved {formatDate(lastSaved)}
              </span>
            )}

            <Badge variant={isEditing ? 'solid' : 'outline'}>
              {isEditing ? 'Editing' : 'Saved'}
            </Badge>

            <Button
              onClick={handleSave}
              disabled={!isEditing || readOnly}
              size="sm"
            >
              Save
            </Button>
          </div>
        </div>

        {/* Document Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span className={status.color}>{status.text}</span>
            {documentState && <span>v{documentState.version}</span>}
            {conflicts.length > 0 && (
              <Badge variant="solid" size="sm">
                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <UserPresence participants={participants} size="sm" />
            {conflicts.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleViewConflicts}>
                View Conflicts
              </Button>
            )}
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateMockConflict}
              >
                Mock Conflict
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative flex">
        <div
          className={`${showConflictPanel ? 'w-2/3' : 'w-full'} h-full p-4 transition-all duration-300`}
        >
          <Card className="h-full">
            <CardBody className="h-full p-0">
              <div className="relative h-full">
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={handleContentChange}
                  onSelect={handleCursorChange}
                  onFocus={() => updatePresence('active', 'Editing document')}
                  onBlur={() => updatePresence('idle')}
                  className={`w-full h-full p-6 border-none resize-none focus:outline-none font-mono text-sm leading-relaxed ${
                    isResolvingConflicts ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  placeholder={
                    readOnly
                      ? 'Document is read-only'
                      : 'Start typing your document...'
                  }
                  disabled={readOnly || isResolvingConflicts}
                  spellCheck={true}
                />

                {/* Cursor Overlay */}
                <CursorOverlay cursors={cursors} containerRef={editorRef} />

                {/* Resolving Conflicts Overlay */}
                {isResolvingConflicts && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">
                        Resolving conflicts...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Conflict Resolution Panel */}
        {showConflictPanel && (
          <div className="w-1/3 h-full border-l border-gray-200 bg-gray-50">
            <div className="h-full overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Conflict Resolution</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConflictPanel(false)}
                  >
                    ×
                  </Button>
                </div>

                <ConflictVisualizer
                  conflicts={conflicts}
                  onResolve={handleConflictResolve}
                  onDismiss={handleConflictDismiss}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Typing Indicator */}
      <div className="border-t border-gray-200 p-2">
        <TypingIndicator
          typingUsers={typingUsers}
          participants={participants}
        />
      </div>

      {/* Conflict Notification */}
      {activeConflictNotification && (
        <ConflictNotification
          conflict={conflicts.find(c => c.id === activeConflictNotification)!}
          onView={handleViewConflicts}
          onQuickResolve={() =>
            handleQuickResolveConflict(activeConflictNotification)
          }
          onDismiss={() => handleConflictDismiss(activeConflictNotification)}
        />
      )}
    </div>
  )
}

export default CollaborativeEditor
