/**
 * Offline Support UI Components
 *
 * User interface components for offline editing capabilities,
 * sync status indicators, and offline document management.
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import {
  OfflineOperation,
  SyncQueue,
  SyncResult,
  OfflineStorage,
} from '@/services/offline'

interface OfflineStatusProps {
  isOnline: boolean
  syncStatus: 'online' | 'offline' | 'syncing'
  pendingOperations: number
  lastSyncTime: number | null
  onSync?: () => void
  onToggleOfflineMode?: () => void
  className?: string
}

export function OfflineStatus({
  isOnline,
  syncStatus,
  pendingOperations,
  lastSyncTime,
  onSync,
  onToggleOfflineMode,
  className = '',
}: OfflineStatusProps) {
  const getStatusInfo = () => {
    if (syncStatus === 'syncing') {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '⟳',
        text: 'Syncing...',
        description: 'Synchronizing changes with server',
      }
    } else if (!isOnline) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '⚠',
        text: 'Offline',
        description: 'Working offline - changes will sync when online',
      }
    } else if (pendingOperations > 0) {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: '📤',
        text: 'Pending Sync',
        description: `${pendingOperations} change${pendingOperations !== 1 ? 's' : ''} waiting to sync`,
      }
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '✓',
        text: 'Synced',
        description: 'All changes synchronized',
      }
    }
  }

  const status = getStatusInfo()

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never'

    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className={`${className}`}>
      <Card className={`${status.bgColor} border-l-4 border-l-current`}>
        <CardBody className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`text-lg ${status.color}`}>{status.icon}</div>
              <div>
                <div className={`font-medium ${status.color}`}>
                  {status.text}
                </div>
                <div className="text-xs text-gray-600">
                  {status.description}
                </div>
                {lastSyncTime && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last sync: {formatLastSync(lastSyncTime)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {pendingOperations > 0 && (
                <Badge variant="outline" size="sm">
                  {pendingOperations}
                </Badge>
              )}

              {onSync && isOnline && syncStatus !== 'syncing' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSync}
                  disabled={pendingOperations === 0}
                >
                  Sync Now
                </Button>
              )}

              {onToggleOfflineMode && (
                <Button variant="ghost" size="sm" onClick={onToggleOfflineMode}>
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

interface SyncQueueViewerProps {
  queue: SyncQueue
  onRetryOperation?: (operationId: string) => void
  onCancelOperation?: (operationId: string) => void
  onResolveConflict?: (
    operationId: string,
    resolution: 'local' | 'remote' | 'merge'
  ) => void
  className?: string
}

export function SyncQueueViewer({
  queue,
  onRetryOperation,
  onCancelOperation,
  onResolveConflict,
  className = '',
}: SyncQueueViewerProps) {
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(
    new Set()
  )
  const [filterStatus, setFilterStatus] = useState<
    OfflineOperation['status'] | 'all'
  >('all')

  const filteredOperations = useMemo(() => {
    if (filterStatus === 'all') return queue.operations
    return queue.operations.filter(op => op.status === filterStatus)
  }, [queue.operations, filterStatus])

  const statusCounts = useMemo(() => {
    return queue.operations.reduce(
      (acc, op) => {
        acc[op.status] = (acc[op.status] || 0) + 1
        return acc
      },
      {} as Record<OfflineOperation['status'], number>
    )
  }, [queue.operations])

  const toggleExpanded = (operationId: string) => {
    const newExpanded = new Set(expandedOperations)
    if (newExpanded.has(operationId)) {
      newExpanded.delete(operationId)
    } else {
      newExpanded.add(operationId)
    }
    setExpandedOperations(newExpanded)
  }

  const getStatusColor = (status: OfflineOperation['status']) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600'
      case 'syncing':
        return 'text-purple-600'
      case 'synced':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'conflict':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getOperationIcon = (type: OfflineOperation['type']) => {
    switch (type) {
      case 'create':
        return '+'
      case 'update':
        return '✎'
      case 'delete':
        return '×'
      case 'sync':
        return '⟳'
      case 'meta':
        return 'ⓘ'
      default:
        return '?'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-blue-600'
      case 'low':
        return 'text-gray-600'
      default:
        return 'text-gray-500'
    }
  }

  if (queue.operations.length === 0) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <div className="text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No pending operations</p>
            <p className="text-sm mt-1">All changes are synchronized</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Sync Queue</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" size="sm">
            {queue.operations.length} operations
          </Badge>
          {queue.syncInProgress && (
            <div className="flex items-center space-x-1">
              <Spinner size="sm" />
              <span className="text-sm text-gray-600">Syncing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterStatus === 'all' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          All ({queue.operations.length})
        </Button>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'solid' : 'ghost'}
            size="sm"
            onClick={() =>
              setFilterStatus(status as OfflineOperation['status'])
            }
          >
            {status} ({count})
          </Button>
        ))}
      </div>

      {/* Operations List */}
      <div className="space-y-2">
        {filteredOperations.map(operation => (
          <OperationCard
            key={operation.id}
            operation={operation}
            isExpanded={expandedOperations.has(operation.id)}
            onToggleExpanded={() => toggleExpanded(operation.id)}
            onRetry={onRetryOperation}
            onCancel={onCancelOperation}
            onResolveConflict={onResolveConflict}
            getStatusColor={getStatusColor}
            getOperationIcon={getOperationIcon}
            getPriorityColor={getPriorityColor}
          />
        ))}
      </div>
    </div>
  )
}

interface OperationCardProps {
  operation: OfflineOperation
  isExpanded: boolean
  onToggleExpanded: () => void
  onRetry: ((operationId: string) => void) | undefined
  onCancel: ((operationId: string) => void) | undefined
  onResolveConflict:
    | ((operationId: string, resolution: 'local' | 'remote' | 'merge') => void)
    | undefined
  getStatusColor: (status: OfflineOperation['status']) => string
  getOperationIcon: (type: OfflineOperation['type']) => string
  getPriorityColor: (priority: string) => string
}

function OperationCard({
  operation,
  isExpanded,
  onToggleExpanded,
  onRetry,
  onCancel,
  onResolveConflict,
  getStatusColor,
  getOperationIcon,
  getPriorityColor,
}: OperationCardProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card
      variant="outline"
      className="transition-all duration-200 hover:shadow-sm"
    >
      <CardHeader className="cursor-pointer" onClick={onToggleExpanded}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">
              {getOperationIcon(operation.type)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium capitalize">
                  {operation.type} {operation.entityType}
                </span>
                <Badge
                  variant="ghost"
                  size="sm"
                  className={getStatusColor(operation.status)}
                >
                  {operation.status}
                </Badge>
                <Badge
                  variant="ghost"
                  size="sm"
                  className={getPriorityColor(operation.metadata.priority)}
                >
                  {operation.metadata.priority}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                {operation.entityId} • {formatTimestamp(operation.timestamp)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {operation.retryCount > 0 && (
              <Badge variant="outline" size="sm">
                {operation.retryCount}/{operation.maxRetries} retries
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardBody className="border-t space-y-4">
          {/* Operation Data Preview */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Data:</h5>
            <div className="bg-gray-50 rounded-lg p-3">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(operation.data, null, 2).substring(0, 500)}
                {JSON.stringify(operation.data, null, 2).length > 500
                  ? '...'
                  : ''}
              </pre>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Metadata:
            </h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-mono">{operation.version}</span>
              </div>
              <div>
                <span className="text-gray-600">User:</span>
                <span className="ml-2">{operation.userId}</span>
              </div>
              <div>
                <span className="text-gray-600">Original Time:</span>
                <span className="ml-2 text-xs">
                  {formatTimestamp(operation.metadata.originalTimestamp)}
                </span>
              </div>
              {operation.metadata.localId && (
                <div>
                  <span className="text-gray-600">Local ID:</span>
                  <span className="ml-2 font-mono text-xs">
                    {operation.metadata.localId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dependencies */}
          {operation.dependencies && operation.dependencies.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Dependencies:
              </h5>
              <div className="flex flex-wrap gap-1">
                {operation.dependencies.map((dep, index) => (
                  <Badge key={index} variant="ghost" size="sm">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex space-x-2">
              {operation.status === 'failed' && onRetry && (
                <Button
                  variant="solid"
                  colorScheme="primary"
                  size="sm"
                  onClick={() => onRetry(operation.id)}
                >
                  Retry
                </Button>
              )}

              {operation.status === 'conflict' && onResolveConflict && (
                <>
                  <Button
                    variant="solid"
                    colorScheme="success"
                    size="sm"
                    onClick={() => onResolveConflict(operation.id, 'local')}
                  >
                    Keep Local
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="primary"
                    size="sm"
                    onClick={() => onResolveConflict(operation.id, 'remote')}
                  >
                    Use Remote
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="secondary"
                    size="sm"
                    onClick={() => onResolveConflict(operation.id, 'merge')}
                  >
                    Merge
                  </Button>
                </>
              )}

              {(operation.status === 'pending' ||
                operation.status === 'failed') &&
                onCancel && (
                  <Button
                    variant="outline"
                    colorScheme="error"
                    size="sm"
                    onClick={() => onCancel(operation.id)}
                  >
                    Cancel
                  </Button>
                )}
            </div>

            <div className="text-xs text-gray-500">
              ID: {operation.id.substring(0, 16)}...
            </div>
          </div>
        </CardBody>
      )}
    </Card>
  )
}

interface OfflineDocumentsProps {
  documents: Array<{
    id: string
    title: string
    lastModified: number
    size: number
  }>
  onOpenDocument?: (documentId: string) => void
  onDeleteDocument?: (documentId: string) => void
  onExportDocument?: (documentId: string) => void
  className?: string
}

export function OfflineDocuments({
  documents,
  onOpenDocument,
  onDeleteDocument,
  onExportDocument,
  className = '',
}: OfflineDocumentsProps) {
  const [sortBy, setSortBy] = useState<'title' | 'lastModified' | 'size'>(
    'lastModified'
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'lastModified':
          comparison = a.lastModified - b.lastModified
          break
        case 'size':
          comparison = a.size - b.size
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [documents, sortBy, sortOrder])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${Math.round(bytes / (1024 * 1024))} MB`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  if (documents.length === 0) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <div className="text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>No offline documents</p>
            <p className="text-sm mt-1">
              Documents will appear here when stored offline
            </p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Offline Documents</h3>
          <Badge variant="outline" size="sm">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {/* Table Header */}
        <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <button
              className="col-span-5 text-left hover:text-gray-900 flex items-center space-x-1"
              onClick={() => handleSort('title')}
            >
              <span>Title</span>
              {sortBy === 'title' && (
                <span className="text-xs">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
            <button
              className="col-span-3 text-left hover:text-gray-900 flex items-center space-x-1"
              onClick={() => handleSort('lastModified')}
            >
              <span>Modified</span>
              {sortBy === 'lastModified' && (
                <span className="text-xs">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
            <button
              className="col-span-2 text-left hover:text-gray-900 flex items-center space-x-1"
              onClick={() => handleSort('size')}
            >
              <span>Size</span>
              {sortBy === 'size' && (
                <span className="text-xs">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>

        {/* Document List */}
        <div className="divide-y divide-gray-200">
          {sortedDocuments.map(doc => (
            <div
              key={doc.id}
              className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="grid grid-cols-12 gap-4 items-center text-sm">
                <div className="col-span-5">
                  <div className="font-medium text-gray-900 truncate">
                    {doc.title || 'Untitled Document'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    ID: {doc.id}
                  </div>
                </div>
                <div className="col-span-3 text-gray-600">
                  {formatDate(doc.lastModified)}
                </div>
                <div className="col-span-2 text-gray-600">
                  {formatSize(doc.size)}
                </div>
                <div className="col-span-2 flex justify-end space-x-1">
                  {onOpenDocument && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onOpenDocument(doc.id)}
                    >
                      Open
                    </Button>
                  )}
                  {onExportDocument && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onExportDocument(doc.id)}
                    >
                      Export
                    </Button>
                  )}
                  {onDeleteDocument && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

export default OfflineStatus
