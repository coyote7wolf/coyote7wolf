/**
 * Conflict Resolution UI Components
 *
 * Provides visual interface for handling CRDT conflicts
 * with intelligent resolution suggestions and user controls.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ConflictResolution, CRDTOperation } from '@/services/crdt'

interface ConflictVisualizerProps {
  conflicts: ConflictResolution[]
  onResolve: (
    conflictId: string,
    strategy: 'accept' | 'reject' | 'merge'
  ) => void
  onDismiss: (conflictId: string) => void
  className?: string
}

export function ConflictVisualizer({
  conflicts,
  onResolve,
  onDismiss,
  className = '',
}: ConflictVisualizerProps) {
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(
    new Set()
  )
  const [resolvingConflicts, setResolvingConflicts] = useState<Set<string>>(
    new Set()
  )

  const toggleExpanded = (conflictId: string) => {
    const newExpanded = new Set(expandedConflicts)
    if (newExpanded.has(conflictId)) {
      newExpanded.delete(conflictId)
    } else {
      newExpanded.add(conflictId)
    }
    setExpandedConflicts(newExpanded)
  }

  const handleResolve = async (
    conflictId: string,
    strategy: 'accept' | 'reject' | 'merge'
  ) => {
    setResolvingConflicts(prev => new Set(prev).add(conflictId))
    try {
      await onResolve(conflictId, strategy)
    } finally {
      setResolvingConflicts(prev => {
        const newSet = new Set(prev)
        newSet.delete(conflictId)
        return newSet
      })
    }
  }

  if (conflicts.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Document Conflicts ({conflicts.length})
        </h3>
        <Badge variant="solid" size="sm">
          Needs Attention
        </Badge>
      </div>

      {conflicts.map(conflict => (
        <ConflictCard
          key={conflict.id}
          conflict={conflict}
          isExpanded={expandedConflicts.has(conflict.id)}
          isResolving={resolvingConflicts.has(conflict.id)}
          onToggleExpanded={() => toggleExpanded(conflict.id)}
          onResolve={strategy => handleResolve(conflict.id, strategy)}
          onDismiss={() => onDismiss(conflict.id)}
        />
      ))}
    </div>
  )
}

interface ConflictCardProps {
  conflict: ConflictResolution
  isExpanded: boolean
  isResolving: boolean
  onToggleExpanded: () => void
  onResolve: (strategy: 'accept' | 'reject' | 'merge') => void
  onDismiss: () => void
}

function ConflictCard({
  conflict,
  isExpanded,
  isResolving,
  onToggleExpanded,
  onResolve,
  onDismiss,
}: ConflictCardProps) {
  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'operational-transform':
        return 'solid'
      case 'last-write-wins':
        return 'outline'
      case 'user-choice':
        return 'solid'
      default:
        return 'ghost'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'solid'
    if (confidence >= 0.7) return 'outline'
    return 'ghost'
  }

  return (
    <Card
      variant="outline"
      className="transition-all duration-200 hover:shadow-md"
    >
      <CardHeader className="cursor-pointer" onClick={onToggleExpanded}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Badge variant={getStrategyColor(conflict.strategy)} size="sm">
                {conflict.strategy.replace('-', ' ')}
              </Badge>
              <Badge
                variant={getConfidenceColor(conflict.confidence)}
                size="sm"
              >
                {Math.round(conflict.confidence * 100)}% confidence
              </Badge>
            </div>
            <span className="text-sm text-gray-600">
              {conflict.metadata.conflictingUsers.length} users affected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isResolving && <Spinner size="sm" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation()
                onToggleExpanded()
              }}
            >
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-700 mt-2">
          {conflict.metadata.resolutionReason}
        </p>
      </CardHeader>

      {isExpanded && (
        <CardBody className="border-t">
          <div className="space-y-4">
            {/* Conflict Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Conflict Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Affected Range:</span>
                  <span className="ml-2 font-mono">
                    {conflict.metadata.affectedRange.start}-
                    {conflict.metadata.affectedRange.end}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="ml-2">
                    {new Date(conflict.metadata.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Conflicting Operations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Conflicting Changes
              </h4>
              <div className="space-y-2">
                {conflict.operations.map((operation, index) => (
                  <OperationPreview
                    key={operation.id}
                    operation={operation}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {/* Proposed Resolution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Proposed Resolution
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <OperationPreview
                  operation={conflict.resolvedOperation}
                  isResolution
                />
              </div>
            </div>

            {/* Resolution Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex space-x-2">
                <Button
                  variant="solid"
                  colorScheme="success"
                  size="sm"
                  onClick={() => onResolve('accept')}
                  disabled={isResolving}
                >
                  Accept Resolution
                </Button>
                <Button
                  variant="outline"
                  colorScheme="primary"
                  size="sm"
                  onClick={() => onResolve('merge')}
                  disabled={isResolving}
                >
                  Merge Changes
                </Button>
                <Button
                  variant="outline"
                  colorScheme="error"
                  size="sm"
                  onClick={() => onResolve('reject')}
                  disabled={isResolving}
                >
                  Reject
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                disabled={isResolving}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </CardBody>
      )}
    </Card>
  )
}

interface OperationPreviewProps {
  operation: CRDTOperation
  index?: number
  isResolution?: boolean
}

function OperationPreview({
  operation,
  index,
  isResolution = false,
}: OperationPreviewProps) {
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'insert':
        return '+'
      case 'delete':
        return '−'
      case 'format':
        return '✎'
      case 'retain':
        return '→'
      default:
        return '?'
    }
  }

  const getOperationColor = (type: string) => {
    switch (type) {
      case 'insert':
        return 'text-green-600'
      case 'delete':
        return 'text-red-600'
      case 'format':
        return 'text-blue-600'
      case 'retain':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div
      className={`flex items-start space-x-3 p-2 rounded-lg ${
        isResolution ? 'bg-transparent' : 'bg-gray-50'
      }`}
    >
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          isResolution ? 'bg-green-100 text-green-600' : 'bg-white border'
        }`}
      >
        {isResolution ? '✓' : getOperationIcon(operation.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 text-sm">
          <span className={getOperationColor(operation.type)}>
            {operation.type.toUpperCase()}
          </span>
          {!isResolution && (
            <span className="text-gray-500">by {operation.userId}</span>
          )}
          <span className="text-gray-400 text-xs">
            pos: {operation.position}
          </span>
        </div>

        {operation.content && (
          <div className="mt-1">
            <span className="text-xs text-gray-500">Content:</span>
            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              {operation.content.substring(0, 50)}
              {operation.content.length > 50 ? '...' : ''}
            </code>
          </div>
        )}

        {operation.length && (
          <div className="mt-1">
            <span className="text-xs text-gray-500">Length:</span>
            <span className="ml-2 text-xs">{operation.length}</span>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 text-xs text-gray-400">
        {new Date(operation.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}

// Real-time conflict notification component
interface ConflictNotificationProps {
  conflict: ConflictResolution
  onView: () => void
  onQuickResolve: () => void
  onDismiss: () => void
}

export function ConflictNotification({
  conflict,
  onView,
  onQuickResolve,
  onDismiss,
}: ConflictNotificationProps) {
  useEffect(() => {
    // Auto-dismiss after 10 seconds if high confidence
    if (conflict.confidence > 0.9) {
      const timer = setTimeout(onQuickResolve, 10000)
      return () => clearTimeout(timer)
    }
  }, [conflict.confidence, onQuickResolve])

  return (
    <div className="fixed top-4 right-4 max-w-sm bg-white border border-orange-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-orange-600 text-sm">⚠</span>
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            Document Conflict Detected
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            {conflict.metadata.conflictingUsers.length} users made conflicting
            changes
          </p>

          <div className="flex space-x-2 mt-3">
            <Button
              variant="solid"
              colorScheme="primary"
              size="xs"
              onClick={onView}
            >
              View Details
            </Button>
            {conflict.confidence > 0.8 && (
              <Button
                variant="outline"
                colorScheme="success"
                size="xs"
                onClick={onQuickResolve}
              >
                Auto-Resolve
              </Button>
            )}
            <Button variant="ghost" size="xs" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConflictVisualizer
