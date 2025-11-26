/**
 * Advanced Document Editor
 * Enhanced editor with rich text formatting, collaborative editing, and conflict resolution
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import useCollaboration from '@/hooks/useCollaboration'
import {
  UserPresence,
  TypingIndicator,
  CollaborationToolbar,
  CursorOverlay,
} from '@/components/collaboration/CollaborationUI'
import RichTextToolbar, {
  FormattingState,
} from '@/components/editor/RichTextToolbar'
import type { User, TextOperation } from '@/services/collaboration'

// Mock conflict resolution system
interface Conflict {
  id: string
  type: 'text' | 'formatting'
  description: string
  localChange: string
  remoteChange: string
  remoteUser: User
  timestamp: number
}

interface AdvancedEditorProps {
  documentId: string
  initialContent?: string
  user: User
  title?: string
  readOnly?: boolean
  onSave?: (content: string, formatting?: FormattingState) => void
  onTitleChange?: (title: string) => void
  enableRichText?: boolean
  enableConflictResolution?: boolean
}

export function AdvancedEditor({
  documentId,
  initialContent = '',
  user,
  title = 'Untitled Document',
  readOnly = false,
  onSave,
  onTitleChange,
  enableRichText = true,
  enableConflictResolution = true,
}: AdvancedEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [documentTitle, setDocumentTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [showConflicts, setShowConflicts] = useState(false)

  // Rich text formatting state
  const [formatting, setFormatting] = useState<FormattingState>({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 16,
    fontFamily: 'Inter, sans-serif',
    textAlign: 'left',
    listType: 'none',
  })

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const richEditorRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const lastCursorPosition = useRef(0)
  const documentVersion = useRef(1)
  const conflictResolutionEnabled = useRef(enableConflictResolution)

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

  // Update word and character count
  useEffect(() => {
    const plainText = enableRichText
      ? richEditorRef.current?.textContent || ''
      : content
    const words = plainText
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
    setWordCount(words)
    setCharCount(plainText.length)
  }, [content, enableRichText])

  // Mock conflict detection
  const detectConflicts = useCallback(
    (operation: TextOperation, remoteUser?: User) => {
      if (!conflictResolutionEnabled.current || !remoteUser) return

      // Simulate conflict detection
      const hasConflict = Math.random() < 0.1 // 10% chance of conflict for demo

      if (hasConflict) {
        const conflict: Conflict = {
          id: `conflict_${Date.now()}_${Math.random()}`,
          type: operation.type === 'replace' ? 'text' : 'formatting',
          description: `Conflicting ${operation.type} operation`,
          localChange: operation.newContent || operation.text || 'Local change',
          remoteChange: 'Remote change (simulated)',
          remoteUser,
          timestamp: Date.now(),
        }

        setConflicts(prev => [...prev, conflict])
        setShowConflicts(true)
      }
    },
    []
  )

  // Handle content changes (plain text)
  const handleContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = event.target.value
      const cursorPosition = event.target.selectionStart

      if (readOnly) return

      const operation: TextOperation = {
        type: 'replace',
        newContent: newContent,
      }

      setContent(newContent)

      if (isConnected) {
        sendOperation(operation, documentVersion.current)
        documentVersion.current++
        updateCursor(cursorPosition)
        startTyping()
      }

      if (!isEditing) {
        setIsEditing(true)
        updatePresence('active', 'Editing document')
      }
    },
    [
      readOnly,
      isConnected,
      sendOperation,
      updateCursor,
      startTyping,
      isEditing,
      updatePresence,
    ]
  )

  // Handle rich text content changes
  const handleRichTextChange = useCallback(() => {
    if (!richEditorRef.current || readOnly) return

    const newContent = richEditorRef.current.innerHTML
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)
    const cursorPosition = range?.startOffset || 0

    const operation: TextOperation = {
      type: 'replace',
      newContent: newContent,
    }

    setContent(newContent)

    if (isConnected) {
      sendOperation(operation, documentVersion.current)
      documentVersion.current++
      updateCursor(cursorPosition)
      startTyping()
    }

    if (!isEditing) {
      setIsEditing(true)
      updatePresence('active', 'Editing document')
    }
  }, [
    readOnly,
    isConnected,
    sendOperation,
    updateCursor,
    startTyping,
    isEditing,
    updatePresence,
  ])

  // Handle formatting changes
  const handleFormatChange = useCallback(
    (property: keyof FormattingState, value: any) => {
      setFormatting(prev => ({ ...prev, [property]: value }))

      if (enableRichText && richEditorRef.current) {
        // Apply formatting to rich text editor
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          document.execCommand(property, false, value)
        }
      }

      if (isConnected) {
        updatePresence('active', `Formatting: ${property}`)
      }
    },
    [enableRichText, isConnected, updatePresence]
  )

  // Insert elements
  const handleInsertLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url && enableRichText && richEditorRef.current) {
      document.execCommand('createLink', false, url)
      handleRichTextChange()
    }
  }, [enableRichText, handleRichTextChange])

  const handleInsertImage = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url && enableRichText && richEditorRef.current) {
      const img = `<img src="${url}" alt="Inserted image" style="max-width: 100%; height: auto;" />`
      document.execCommand('insertHTML', false, img)
      handleRichTextChange()
    }
  }, [enableRichText, handleRichTextChange])

  const handleInsertTable = useCallback(() => {
    if (enableRichText && richEditorRef.current) {
      const table = `
        <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
          <tr><td>Cell 3</td><td>Cell 4</td></tr>
        </table>
      `
      document.execCommand('insertHTML', false, table)
      handleRichTextChange()
    }
  }, [enableRichText, handleRichTextChange])

  const handleInsertCode = useCallback(() => {
    if (enableRichText && richEditorRef.current) {
      const code = `<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;">// Your code here</pre>`
      document.execCommand('insertHTML', false, code)
      handleRichTextChange()
    }
  }, [enableRichText, handleRichTextChange])

  const handleInsertQuote = useCallback(() => {
    if (enableRichText && richEditorRef.current) {
      const quote = `<blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 16px; color: #666;">Your quote here</blockquote>`
      document.execCommand('insertHTML', false, quote)
      handleRichTextChange()
    }
  }, [enableRichText, handleRichTextChange])

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

  // Conflict resolution
  const handleResolveConflict = useCallback(
    (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
      setConflicts(prev => prev.filter(c => c.id !== conflictId))

      // In a real implementation, you would apply the resolution
      console.log(`Resolved conflict ${conflictId} with ${resolution} version`)

      if (conflicts.length <= 1) {
        setShowConflicts(false)
      }
    },
    [conflicts.length]
  )

  // Auto-save functionality
  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave(content, formatting)
        setLastSaved(new Date())
        setIsEditing(false)

        if (isConnected) {
          updatePresence('active', 'Document saved')
        }
      } catch (error) {
        console.error('Failed to save document:', error)
      }
    }
  }, [content, formatting, onSave, isConnected, updatePresence])

  // Auto-save timer
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        handleSave()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isEditing, handleSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault()
            handleSave()
            break
          case 'b':
            if (enableRichText) {
              event.preventDefault()
              handleFormatChange('bold', !formatting.bold)
            }
            break
          case 'i':
            if (enableRichText) {
              event.preventDefault()
              handleFormatChange('italic', !formatting.italic)
            }
            break
          case 'u':
            if (enableRichText) {
              event.preventDefault()
              handleFormatChange('underline', !formatting.underline)
            }
            break
          case 'k':
            if (enableRichText) {
              event.preventDefault()
              handleInsertLink()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    handleSave,
    enableRichText,
    formatting,
    handleFormatChange,
    handleInsertLink,
  ])

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

      {/* Rich Text Toolbar */}
      {enableRichText && (
        <RichTextToolbar
          formatting={formatting}
          onFormatChange={handleFormatChange}
          onInsertLink={handleInsertLink}
          onInsertImage={handleInsertImage}
          onInsertTable={handleInsertTable}
          onInsertCode={handleInsertCode}
          onInsertQuote={handleInsertQuote}
          disabled={readOnly}
        />
      )}

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
            {conflicts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConflicts(true)}
                className="text-red-600 border-red-600"
              >
                {conflicts.length} Conflicts
              </Button>
            )}

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
            {enableRichText && (
              <Badge variant="outline" className="text-xs">
                Rich Text
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <UserPresence participants={participants} size="sm" />
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <div className="h-full p-4">
          <Card className="h-full">
            <CardBody className="h-full p-0">
              <div className="relative h-full">
                {enableRichText ? (
                  <div
                    ref={richEditorRef}
                    contentEditable={!readOnly}
                    onInput={handleRichTextChange}
                    onFocus={() => updatePresence('active', 'Editing document')}
                    onBlur={() => updatePresence('idle')}
                    className={`w-full h-full p-6 border-none resize-none focus:outline-none text-sm leading-relaxed overflow-y-auto ${
                      formatting.textAlign === 'center'
                        ? 'text-center'
                        : formatting.textAlign === 'right'
                          ? 'text-right'
                          : formatting.textAlign === 'justify'
                            ? 'text-justify'
                            : 'text-left'
                    }`}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={handleContentChange}
                    onFocus={() => updatePresence('active', 'Editing document')}
                    onBlur={() => updatePresence('idle')}
                    className="w-full h-full p-6 border-none resize-none focus:outline-none font-mono text-sm leading-relaxed"
                    placeholder={
                      readOnly
                        ? 'Document is read-only'
                        : 'Start typing your document...'
                    }
                    disabled={readOnly}
                    spellCheck={true}
                  />
                )}

                {/* Cursor Overlay */}
                <CursorOverlay
                  cursors={cursors}
                  containerRef={enableRichText ? richEditorRef : editorRef}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Footer with Typing Indicator */}
      <div className="border-t border-gray-200 p-2">
        <TypingIndicator
          typingUsers={typingUsers}
          participants={participants}
        />
      </div>

      {/* Conflict Resolution Modal */}
      {showConflicts && conflicts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Resolve Conflicts ({conflicts.length})
              </h3>

              {conflicts.map(conflict => (
                <div
                  key={conflict.id}
                  className="border border-gray-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-red-600">
                      {conflict.type} conflict
                    </Badge>
                    <span className="text-sm text-gray-500">
                      with {conflict.remoteUser.name}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {conflict.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Version
                      </label>
                      <div className="bg-green-50 p-2 rounded text-sm">
                        {conflict.localChange}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {conflict.remoteUser.name}'s Version
                      </label>
                      <div className="bg-blue-50 p-2 rounded text-sm">
                        {conflict.remoteChange}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="solid"
                      onClick={() =>
                        handleResolveConflict(conflict.id, 'local')
                      }
                    >
                      Keep Mine
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleResolveConflict(conflict.id, 'remote')
                      }
                    >
                      Keep Theirs
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleResolveConflict(conflict.id, 'merge')
                      }
                    >
                      Merge Both
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setShowConflicts(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedEditor
