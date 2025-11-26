/**
 * CRDT Integration Hook
 *
 * Provides React hook for integrating CRDT operations
 * with conflict resolution in document editing components.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  crdtService,
  CRDTOperation,
  ConflictResolution,
  DocumentState,
} from '@/services/crdt'

export interface UseCRDTOptions {
  documentId: string
  userId: string
  autoResolveThreshold?: number
  enableRealTimeSync?: boolean
  debounceMs?: number
}

export interface CRDTHookResult {
  documentState: DocumentState | null
  conflicts: ConflictResolution[]
  isResolvingConflicts: boolean

  // Operations
  applyOperation: (
    operation: Omit<CRDTOperation, 'id' | 'timestamp' | 'userId' | 'documentId'>
  ) => Promise<void>
  resolveConflict: (
    conflictId: string,
    strategy: 'accept' | 'reject' | 'merge'
  ) => Promise<void>
  dismissConflict: (conflictId: string) => void

  // Content operations
  insertText: (position: number, text: string) => Promise<void>
  deleteText: (position: number, length: number) => Promise<void>
  formatText: (
    position: number,
    length: number,
    attributes: Record<string, any>
  ) => Promise<void>

  // State queries
  getOperationHistory: () => CRDTOperation[]
  generateMockConflict: () => ConflictResolution

  // Event handlers
  onConflictDetected: ((conflict: ConflictResolution) => void) | undefined
  onConflictResolved: ((conflictId: string) => void) | undefined
}

export function useCRDT(options: UseCRDTOptions): CRDTHookResult {
  const {
    documentId,
    userId,
    autoResolveThreshold = 0.9,
    enableRealTimeSync = true,
    debounceMs = 300,
  } = options

  const [documentState, setDocumentState] = useState<DocumentState | null>(null)
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([])
  const [isResolvingConflicts, setIsResolvingConflicts] = useState(false)

  const debounceTimeoutRef = useRef<NodeJS.Timeout>()
  const onConflictDetectedRef = useRef<
    ((conflict: ConflictResolution) => void) | undefined
  >()
  const onConflictResolvedRef = useRef<
    ((conflictId: string) => void) | undefined
  >()

  // Initialize document state
  useEffect(() => {
    const initialState = crdtService.getDocumentState(documentId)
    if (initialState) {
      setDocumentState(initialState)
    }
  }, [documentId])

  // Auto-resolve high-confidence conflicts
  useEffect(() => {
    const autoResolvableConflicts = conflicts.filter(
      conflict =>
        conflict.confidence >= autoResolveThreshold && conflict.type === 'auto'
    )

    if (autoResolvableConflicts.length > 0) {
      autoResolvableConflicts.forEach(conflict => {
        resolveConflict(conflict.id, 'accept')
      })
    }
  }, [conflicts, autoResolveThreshold])

  const applyOperation = useCallback(
    async (
      operationData: Omit<
        CRDTOperation,
        'id' | 'timestamp' | 'userId' | 'documentId'
      >
    ) => {
      const operation: CRDTOperation = {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        userId,
        documentId,
        ...operationData,
      }

      try {
        const result = await crdtService.applyOperation(documentId, operation)

        setDocumentState(result.newState)

        if (result.conflicts && result.conflicts.length > 0) {
          setConflicts(prev => [...prev, ...result.conflicts!])

          // Notify about detected conflicts
          result.conflicts.forEach(conflict => {
            onConflictDetectedRef.current?.(conflict)
          })
        }
      } catch (error) {
        console.error('Failed to apply CRDT operation:', error)
        throw error
      }
    },
    [documentId, userId]
  )

  const resolveConflict = useCallback(
    async (conflictId: string, strategy: 'accept' | 'reject' | 'merge') => {
      setIsResolvingConflicts(true)

      try {
        // Find the conflict
        const conflict = conflicts.find(c => c.id === conflictId)
        if (!conflict) {
          throw new Error(`Conflict ${conflictId} not found`)
        }

        // Apply resolution strategy
        let operationToApply: CRDTOperation | null = null

        switch (strategy) {
          case 'accept':
            operationToApply = conflict.resolvedOperation
            break
          case 'reject':
            // Don't apply any operation, just remove conflict
            break
          case 'merge':
            // Create a merged operation (simplified implementation)
            operationToApply = {
              ...conflict.resolvedOperation,
              id: `merged_${Date.now()}`,
              content: conflict.operations
                .filter(op => op.content)
                .map(op => op.content)
                .join(' '),
              timestamp: Date.now(),
            }
            break
        }

        if (operationToApply) {
          const result = await crdtService.applyOperation(
            documentId,
            operationToApply
          )
          setDocumentState(result.newState)
        }

        // Remove resolved conflict
        setConflicts(prev => prev.filter(c => c.id !== conflictId))
        onConflictResolvedRef.current?.(conflictId)
      } catch (error) {
        console.error('Failed to resolve conflict:', error)
        throw error
      } finally {
        setIsResolvingConflicts(false)
      }
    },
    [conflicts, documentId]
  )

  const dismissConflict = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId))
  }, [])

  // Debounced operation helpers
  const debouncedApplyOperation = useCallback(
    (
      operationData: Omit<
        CRDTOperation,
        'id' | 'timestamp' | 'userId' | 'documentId'
      >
    ) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        applyOperation(operationData)
      }, debounceMs)
    },
    [applyOperation, debounceMs]
  )

  const insertText = useCallback(
    async (position: number, text: string) => {
      await applyOperation({
        type: 'insert',
        position,
        content: text,
        version: (documentState?.version || 0) + 1,
      })
    },
    [applyOperation, documentState?.version]
  )

  const deleteText = useCallback(
    async (position: number, length: number) => {
      await applyOperation({
        type: 'delete',
        position,
        length,
        version: (documentState?.version || 0) + 1,
      })
    },
    [applyOperation, documentState?.version]
  )

  const formatText = useCallback(
    async (
      position: number,
      length: number,
      attributes: Record<string, any>
    ) => {
      await applyOperation({
        type: 'format',
        position,
        length,
        attributes,
        version: (documentState?.version || 0) + 1,
      })
    },
    [applyOperation, documentState?.version]
  )

  const getOperationHistory = useCallback(() => {
    return crdtService.getOperationHistory(documentId)
  }, [documentId])

  const generateMockConflict = useCallback(() => {
    return crdtService.generateMockConflict(documentId)
  }, [documentId])

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    documentState,
    conflicts,
    isResolvingConflicts,

    applyOperation,
    resolveConflict,
    dismissConflict,

    insertText,
    deleteText,
    formatText,

    getOperationHistory,
    generateMockConflict,

    // Event handler setters
    get onConflictDetected() {
      return onConflictDetectedRef.current
    },
    set onConflictDetected(handler) {
      onConflictDetectedRef.current = handler
    },

    get onConflictResolved() {
      return onConflictResolvedRef.current
    },
    set onConflictResolved(handler) {
      onConflictResolvedRef.current = handler
    },
  }
}

// Additional hook for monitoring CRDT performance and statistics
export function useCRDTStats(documentId: string) {
  const [stats, setStats] = useState({
    totalOperations: 0,
    conflictsDetected: 0,
    conflictsResolved: 0,
    averageResolutionTime: 0,
    documentSize: 0,
    lastSyncTime: null as number | null,
  })

  useEffect(() => {
    const history = crdtService.getOperationHistory(documentId)
    const state = crdtService.getDocumentState(documentId)

    setStats(prev => ({
      ...prev,
      totalOperations: history.length,
      documentSize: state?.content.length || 0,
      lastSyncTime: state?.lastModified || null,
    }))
  }, [documentId])

  const updateConflictStats = useCallback(
    (resolved: boolean, resolutionTime?: number) => {
      setStats(prev => ({
        ...prev,
        conflictsDetected: resolved
          ? prev.conflictsDetected
          : prev.conflictsDetected + 1,
        conflictsResolved: resolved
          ? prev.conflictsResolved + 1
          : prev.conflictsResolved,
        averageResolutionTime:
          resolved && resolutionTime
            ? (prev.averageResolutionTime + resolutionTime) / 2
            : prev.averageResolutionTime,
      }))
    },
    []
  )

  return { stats, updateConflictStats }
}

export default useCRDT
