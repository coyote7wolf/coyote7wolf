/**
 * Offline-Enhanced Document Editor
 *
 * Advanced document editor with comprehensive offline support,
 * real-time collaboration, and intelligent sync management.
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import useOffline from '@/hooks/useOffline'
import OfflineUI from '@/components/offline/OfflineUI'

// Mock icons as simple components since lucide-react is not available
const WifiIcon = ({ className }: { className?: string }) => (
  <span className={className}>📶</span>
)
const WifiOffIcon = ({ className }: { className?: string }) => (
  <span className={className}>📵</span>
)
const CloudIcon = ({ className }: { className?: string }) => (
  <span className={className}>☁️</span>
)
const RefreshCwIcon = ({ className }: { className?: string }) => (
  <span className={className}>🔄</span>
)
const SaveIcon = ({ className }: { className?: string }) => (
  <span className={className}>💾</span>
)
const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <span className={className}>⚠️</span>
)
const ClockIcon = ({ className }: { className?: string }) => (
  <span className={className}>⏰</span>
)
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <span className={className}>✅</span>
)
const XCircleIcon = ({ className }: { className?: string }) => (
  <span className={className}>❌</span>
)
const DownloadIcon = ({ className }: { className?: string }) => (
  <span className={className}>⬇️</span>
)
const UploadIcon = ({ className }: { className?: string }) => (
  <span className={className}>⬆️</span>
)
const LayersIcon = ({ className }: { className?: string }) => (
  <span className={className}>📚</span>
)

// Mock utility function
const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(' ')

// Mock Tooltip components
const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)
const Tooltip = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)
const TooltipTrigger = ({
  asChild,
  children,
}: {
  asChild?: boolean
  children: React.ReactNode
}) => <div>{children}</div>
const TooltipContent = ({ children }: { children: React.ReactNode }) => (
  <div className="tooltip-content">{children}</div>
)

// Mock Card components
const CardHeader = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <div className={cn('card-header', className)}>{children}</div>
const CardTitle = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <h3 className={cn('card-title', className)}>{children}</h3>
const CardContent = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <div className={cn('card-content', className)}>{children}</div>

export interface OfflineDocumentEditorProps {
  documentId: string
  userId: string
  initialContent?: string
  onSave?: (content: string) => void
  onSync?: (syncResult: any) => void
  onConflictDetected?: (conflict: any) => void
  className?: string
  enableAutoSync?: boolean
  syncInterval?: number
}

export function OfflineDocumentEditor(props: OfflineDocumentEditorProps) {
  const {
    documentId,
    userId,
    initialContent = '',
    onSave,
    onSync,
    onConflictDetected,
    className,
    enableAutoSync = true,
    syncInterval = 300000, // 5 minutes
  } = props

  // State
  const [content, setContent] = useState(initialContent)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showOfflinePanel, setShowOfflinePanel] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Offline hook
  const offline = useOffline({
    documentId,
    userId,
    enableAutoSync,
    syncInterval,
    maxRetries: 3,
  })

  // Load document from offline storage on mount
  useEffect(() => {
    const offlineDoc = offline.getOfflineDocument(documentId)
    if (offlineDoc && offlineDoc.content !== initialContent) {
      setContent(offlineDoc.content)
      setIsDirty(true)
    }
  }, [documentId, initialContent, offline])

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!isDirty || !content.trim()) return

    try {
      const document = {
        id: documentId,
        content,
        title:
          (content.split('\n')[0] || '').slice(0, 50) || 'Untitled Document',
        lastModified: Date.now(),
        version: Date.now(),
        author: userId,
      }

      await offline.saveOffline(documentId, document)

      // Queue sync operation
      await offline.queueOperation({
        type: 'update',
        entityType: 'document',
        entityId: documentId,
        data: document,
        userId,
        version: 1,
        maxRetries: 3,
        metadata: {
          originalTimestamp: Date.now(),
          priority: 'medium',
        },
      })

      setLastSaved(new Date())
      setIsDirty(false)
      onSave?.(content)
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [content, documentId, isDirty, offline, onSave, userId])

  // Content change handler
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent)
      setIsDirty(true)

      // Clear existing auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Set new auto-save timeout
      if (autoSaveEnabled) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          performAutoSave()
        }, 2000) // Auto-save after 2 seconds of inactivity
      }
    },
    [autoSaveEnabled, performAutoSave]
  )

  // Manual save
  const handleManualSave = useCallback(async () => {
    await performAutoSave()
  }, [performAutoSave])

  // Sync operations
  const handleSync = useCallback(async () => {
    try {
      const result = await offline.triggerSync()
      onSync?.(result)
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [offline, onSync])

  // Conflict resolution
  const handleConflictResolution = useCallback(
    async (operationId: string, resolution: 'local' | 'remote' | 'merge') => {
      try {
        await offline.resolveConflict(operationId, resolution)
      } catch (error) {
        console.error('Conflict resolution failed:', error)
      }
    },
    [offline]
  )

  // Setup event handlers
  useEffect(() => {
    offline.onSync = result => {
      onSync?.(result)
    }

    offline.onConflict = (operation, serverData) => {
      onConflictDetected?.({ operation, serverData })
    }

    offline.onError = error => {
      console.error('Offline error:', error)
    }

    return () => {
      offline.onSync = undefined
      offline.onConflict = undefined
      offline.onError = undefined
    }
  }, [offline, onConflictDetected, onSync])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Status indicators
  const getConnectionStatus = () => {
    if (offline.syncStatus === 'syncing') {
      return {
        icon: RefreshCwIcon,
        label: 'Syncing...',
        variant: 'outline' as const,
        className: 'animate-spin',
      }
    } else if (offline.isOnline) {
      return {
        icon: WifiIcon,
        label: 'Online',
        variant: 'solid' as const,
        className: 'text-green-600',
      }
    } else {
      return {
        icon: WifiOffIcon,
        label: 'Offline',
        variant: 'outline' as const,
        className: 'text-red-600',
      }
    }
  }

  const getSaveStatus = () => {
    if (isDirty) {
      return {
        icon: ClockIcon,
        label: 'Unsaved changes',
        variant: 'outline' as const,
        className: 'text-amber-600',
      }
    } else if (lastSaved) {
      return {
        icon: CheckCircleIcon,
        label: `Saved ${lastSaved.toLocaleTimeString()}`,
        variant: 'solid' as const,
        className: 'text-green-600',
      }
    } else {
      return {
        icon: SaveIcon,
        label: 'Not saved',
        variant: 'outline' as const,
        className: 'text-gray-600',
      }
    }
  }

  const connectionStatus = getConnectionStatus()
  const saveStatus = getSaveStatus()

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Document Editor</CardTitle>

              <div className="flex items-center gap-2">
                {/* Connection Status */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={connectionStatus.variant} className="gap-1">
                      <connectionStatus.icon
                        className={cn('w-3 h-3', connectionStatus.className)}
                      />
                      {connectionStatus.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div>Status: {offline.syncStatus}</div>
                      <div>Pending: {offline.pendingOperations} operations</div>
                      <div>
                        Queue size: {offline.syncQueue.operations.length}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Save Status */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={saveStatus.variant} className="gap-1">
                      <saveStatus.icon
                        className={cn('w-3 h-3', saveStatus.className)}
                      />
                      {saveStatus.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div>
                        Auto-save: {autoSaveEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                      {lastSaved && (
                        <div>Last saved: {lastSaved.toLocaleString()}</div>
                      )}
                      {isDirty && <div>Unsaved changes detected</div>}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Conflict Indicator */}
                {offline.stats.conflictOperations > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1">
                        <AlertTriangleIcon className="w-3 h-3" />
                        {offline.stats.conflictOperations} conflicts
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        Conflicts require resolution
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Action Buttons */}
                <Button
                  size="sm"
                  onClick={handleManualSave}
                  disabled={!isDirty}
                  className="gap-1"
                >
                  <SaveIcon className="w-3 h-3" />
                  Save Now
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={
                    offline.syncStatus === 'syncing' ||
                    offline.pendingOperations === 0
                  }
                  className="gap-1"
                >
                  <RefreshCwIcon
                    className={cn(
                      'w-3 h-3',
                      offline.syncStatus === 'syncing' ? 'animate-spin' : ''
                    )}
                  />
                  Sync
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowOfflinePanel(!showOfflinePanel)}
                  className="gap-1"
                >
                  <LayersIcon className="w-3 h-3" />
                  Offline Panel
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div>
                  Words:{' '}
                  {content.split(/\s+/).filter(word => word.length > 0).length}
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div>Characters: {content.length}</div>
                <Separator orientation="vertical" className="h-4" />
                <div>
                  Success Rate: {offline.stats.syncSuccessRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor and Offline Panel */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Editor */}
          <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 p-4">
              <textarea
                ref={editorRef}
                value={content}
                onChange={e => handleContentChange(e.target.value)}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                placeholder="Start typing your document..."
                className="w-full h-full resize-none border-0 outline-none bg-transparent font-mono text-sm leading-relaxed min-h-[400px]"
              />
            </CardContent>
          </Card>

          {/* Offline Panel */}
          {showOfflinePanel && (
            <div className="w-80 flex-shrink-0">
              <OfflineUI
                isOnline={offline.isOnline}
                syncStatus={offline.syncStatus}
                pendingOperations={offline.pendingOperations}
                lastSyncTime={offline.stats.lastSyncTime}
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <Card className="mt-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <CloudIcon className="w-4 h-4" />
                  Storage: {(offline.storageInfo.storageSize / 1024).toFixed(1)}
                  KB used
                </div>

                <div className="flex items-center gap-1">
                  <UploadIcon className="w-4 h-4" />
                  Synced: {offline.stats.syncedOperations}
                </div>

                <div className="flex items-center gap-1">
                  <DownloadIcon className="w-4 h-4" />
                  Pending: {offline.pendingOperations}
                </div>

                {offline.stats.lastSyncTime && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Last sync:{' '}
                    {new Date(offline.stats.lastSyncTime).toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={e => setAutoSaveEnabled(e.target.checked)}
                    className="w-3 h-3"
                  />
                  Auto-save
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

export default OfflineDocumentEditor
