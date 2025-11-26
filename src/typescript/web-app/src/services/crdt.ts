/**
 * CRDT (Conflict-free Replicated Data Type) Service
 *
 * Provides operational transformation algorithms for conflict resolution
 * in collaborative document editing with intelligent conflict handling.
 */

// Types for CRDT operations
export interface CRDTOperation {
  id: string
  type: 'insert' | 'delete' | 'retain' | 'format'
  position: number
  content?: string
  length?: number
  attributes?: Record<string, any>
  timestamp: number
  userId: string
  documentId: string
  version: number
}

export interface ConflictResolution {
  id: string
  type: 'auto' | 'manual' | 'merge'
  strategy: 'last-write-wins' | 'operational-transform' | 'user-choice'
  operations: CRDTOperation[]
  resolvedOperation: CRDTOperation
  confidence: number
  metadata: {
    conflictingUsers: string[]
    affectedRange: { start: number; end: number }
    resolutionReason: string
    timestamp: number
  }
}

export interface DocumentState {
  content: string
  operations: CRDTOperation[]
  version: number
  checksum: string
  lastModified: number
}

class CRDTService {
  private operationHistory: Map<string, CRDTOperation[]> = new Map()
  private documentStates: Map<string, DocumentState> = new Map()
  private conflictResolvers: Map<
    string,
    (ops: CRDTOperation[]) => ConflictResolution
  > = new Map()

  constructor() {
    this.initializeResolvers()
  }

  private initializeResolvers() {
    // Last-write-wins resolver
    this.conflictResolvers.set(
      'last-write-wins',
      (operations: CRDTOperation[]) => {
        if (operations.length === 0) {
          throw new Error('Cannot resolve conflict with empty operations array')
        }

        const sortedOps = operations.sort((a, b) => b.timestamp - a.timestamp)
        const latestOp = sortedOps[0]!
        return {
          id: `conflict_${Date.now()}`,
          type: 'auto',
          strategy: 'last-write-wins',
          operations,
          resolvedOperation: latestOp,
          confidence: 0.8,
          metadata: {
            conflictingUsers: [...new Set(operations.map(op => op.userId))],
            affectedRange: {
              start: latestOp.position,
              end: latestOp.position + (latestOp.length || 0),
            },
            resolutionReason: 'Applied most recent change',
            timestamp: Date.now(),
          },
        }
      }
    )

    // Operational transform resolver
    this.conflictResolvers.set(
      'operational-transform',
      (operations: CRDTOperation[]) => {
        const transformedOps = this.operationalTransform(operations)
        const mergedOp = this.mergeOperations(transformedOps)

        return {
          id: `conflict_${Date.now()}`,
          type: 'auto',
          strategy: 'operational-transform',
          operations,
          resolvedOperation: mergedOp,
          confidence: 0.95,
          metadata: {
            conflictingUsers: [...new Set(operations.map(op => op.userId))],
            affectedRange: this.calculateAffectedRange(transformedOps),
            resolutionReason: 'Applied operational transformation',
            timestamp: Date.now(),
          },
        }
      }
    )
  }

  /**
   * Apply operation to document with conflict detection
   */
  async applyOperation(
    documentId: string,
    operation: CRDTOperation
  ): Promise<{
    success: boolean
    conflicts?: ConflictResolution[]
    newState: DocumentState
  }> {
    const currentState =
      this.documentStates.get(documentId) || this.createEmptyState(documentId)
    const history = this.operationHistory.get(documentId) || []

    // Detect conflicts
    const conflicts = this.detectConflicts(operation, history, currentState)

    if (conflicts.length > 0) {
      // Resolve conflicts
      const resolutions = await this.resolveConflicts(conflicts, operation)

      // Apply resolved operations
      const newState = this.applyResolvedOperations(currentState, resolutions)
      this.documentStates.set(documentId, newState)

      return { success: true, conflicts: resolutions, newState }
    }

    // No conflicts, apply operation directly
    const newState = this.applyOperationDirectly(currentState, operation)
    history.push(operation)

    this.operationHistory.set(documentId, history)
    this.documentStates.set(documentId, newState)

    return { success: true, newState }
  }

  /**
   * Operational Transform Algorithm
   */
  private operationalTransform(operations: CRDTOperation[]): CRDTOperation[] {
    if (operations.length <= 1) return operations

    const sorted = operations.sort((a, b) => a.timestamp - b.timestamp)
    const transformed: CRDTOperation[] = []

    for (let i = 0; i < sorted.length; i++) {
      let currentOp = sorted[i]!

      // Transform against all previous operations
      for (let j = 0; j < i; j++) {
        currentOp = this.transformOperation(currentOp, sorted[j]!)
      }

      transformed.push(currentOp)
    }

    return transformed
  }

  /**
   * Transform one operation against another
   */
  private transformOperation(
    op1: CRDTOperation,
    op2: CRDTOperation
  ): CRDTOperation {
    if (op1.type === 'insert' && op2.type === 'insert') {
      return this.transformInsertInsert(op1, op2)
    } else if (op1.type === 'insert' && op2.type === 'delete') {
      return this.transformInsertDelete(op1, op2)
    } else if (op1.type === 'delete' && op2.type === 'insert') {
      return this.transformDeleteInsert(op1, op2)
    } else if (op1.type === 'delete' && op2.type === 'delete') {
      return this.transformDeleteDelete(op1, op2)
    }

    return op1
  }

  private transformInsertInsert(
    op1: CRDTOperation,
    op2: CRDTOperation
  ): CRDTOperation {
    if (op2.position <= op1.position) {
      return {
        ...op1,
        position: op1.position + (op2.content?.length || 0),
      }
    }
    return op1
  }

  private transformInsertDelete(
    op1: CRDTOperation,
    op2: CRDTOperation
  ): CRDTOperation {
    if (op2.position <= op1.position) {
      return {
        ...op1,
        position: Math.max(op2.position, op1.position - (op2.length || 0)),
      }
    }
    return op1
  }

  private transformDeleteInsert(
    op1: CRDTOperation,
    op2: CRDTOperation
  ): CRDTOperation {
    if (op2.position <= op1.position) {
      return {
        ...op1,
        position: op1.position + (op2.content?.length || 0),
      }
    }
    return op1
  }

  private transformDeleteDelete(
    op1: CRDTOperation,
    op2: CRDTOperation
  ): CRDTOperation {
    if (op2.position < op1.position) {
      const overlap =
        Math.min(
          op1.position + (op1.length || 0),
          op2.position + (op2.length || 0)
        ) - Math.max(op1.position, op2.position)

      if (overlap > 0) {
        return {
          ...op1,
          position: op2.position,
          length: Math.max(0, (op1.length || 0) - overlap),
        }
      }

      return {
        ...op1,
        position: Math.max(op2.position, op1.position - (op2.length || 0)),
      }
    }
    return op1
  }

  /**
   * Detect conflicts between operations
   */
  private detectConflicts(
    operation: CRDTOperation,
    history: CRDTOperation[],
    state: DocumentState
  ): CRDTOperation[][] {
    const conflicts: CRDTOperation[][] = []
    const timeWindow = 5000 // 5 seconds
    const positionThreshold = 10 // characters

    // Find recent operations in similar positions
    const recentOps = history.filter(
      op =>
        Math.abs(op.timestamp - operation.timestamp) < timeWindow &&
        Math.abs(op.position - operation.position) < positionThreshold &&
        op.userId !== operation.userId
    )

    if (recentOps.length > 0) {
      conflicts.push([operation, ...recentOps])
    }

    return conflicts
  }

  /**
   * Resolve conflicts using appropriate strategy
   */
  private async resolveConflicts(
    conflicts: CRDTOperation[][],
    newOperation: CRDTOperation
  ): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = []

    for (const conflictGroup of conflicts) {
      const strategy = this.selectResolutionStrategy(conflictGroup)
      const resolver = this.conflictResolvers.get(strategy)

      if (resolver) {
        const resolution = resolver(conflictGroup)
        resolutions.push(resolution)
      }
    }

    return resolutions
  }

  /**
   * Select appropriate resolution strategy
   */
  private selectResolutionStrategy(operations: CRDTOperation[]): string {
    // Simple heuristics for strategy selection
    const hasFormattingConflicts = operations.some(op => op.type === 'format')
    const hasMultipleUsers = new Set(operations.map(op => op.userId)).size > 2

    if (hasFormattingConflicts) {
      return 'operational-transform'
    }

    if (hasMultipleUsers) {
      return 'operational-transform'
    }

    return 'last-write-wins'
  }

  /**
   * Merge multiple operations into one
   */
  private mergeOperations(operations: CRDTOperation[]): CRDTOperation {
    if (operations.length === 0) {
      throw new Error('Cannot merge empty operations array')
    }

    if (operations.length === 1) return operations[0]!

    const merged: CRDTOperation = {
      id: `merged_${Date.now()}`,
      type: 'insert', // Default type
      position: Math.min(...operations.map(op => op.position)),
      content: operations
        .filter(op => op.content)
        .map(op => op.content)
        .join(''),
      timestamp: Math.max(...operations.map(op => op.timestamp)),
      userId: 'system',
      documentId: operations[0]!.documentId,
      version: Math.max(...operations.map(op => op.version)) + 1,
    }

    return merged
  }

  /**
   * Calculate affected range for conflict resolution
   */
  private calculateAffectedRange(operations: CRDTOperation[]): {
    start: number
    end: number
  } {
    if (operations.length === 0) {
      return { start: 0, end: 0 }
    }

    const positions = operations.map(op => op.position)
    const lengths = operations.map(op => op.length || op.content?.length || 0)

    const start = Math.min(...positions)
    const end = Math.max(...positions.map((pos, i) => pos + (lengths[i] || 0)))

    return { start, end }
  }

  /**
   * Apply resolved operations to document state
   */
  private applyResolvedOperations(
    state: DocumentState,
    resolutions: ConflictResolution[]
  ): DocumentState {
    let newContent = state.content
    let newVersion = state.version + 1

    for (const resolution of resolutions) {
      const op = resolution.resolvedOperation
      newContent = this.applyOperationToContent(newContent, op)
    }

    return {
      content: newContent,
      operations: [
        ...state.operations,
        ...resolutions.map(r => r.resolvedOperation),
      ],
      version: newVersion,
      checksum: this.calculateChecksum(newContent),
      lastModified: Date.now(),
    }
  }

  /**
   * Apply operation directly to document state
   */
  private applyOperationDirectly(
    state: DocumentState,
    operation: CRDTOperation
  ): DocumentState {
    const newContent = this.applyOperationToContent(state.content, operation)

    return {
      content: newContent,
      operations: [...state.operations, operation],
      version: state.version + 1,
      checksum: this.calculateChecksum(newContent),
      lastModified: Date.now(),
    }
  }

  /**
   * Apply operation to content string
   */
  private applyOperationToContent(
    content: string,
    operation: CRDTOperation
  ): string {
    switch (operation.type) {
      case 'insert':
        return (
          content.slice(0, operation.position) +
          (operation.content || '') +
          content.slice(operation.position)
        )

      case 'delete':
        return (
          content.slice(0, operation.position) +
          content.slice(operation.position + (operation.length || 0))
        )

      case 'retain':
        return content

      default:
        return content
    }
  }

  /**
   * Create empty document state
   */
  private createEmptyState(documentId: string): DocumentState {
    return {
      content: '',
      operations: [],
      version: 0,
      checksum: this.calculateChecksum(''),
      lastModified: Date.now(),
    }
  }

  /**
   * Calculate content checksum
   */
  private calculateChecksum(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  /**
   * Get document state
   */
  getDocumentState(documentId: string): DocumentState | null {
    return this.documentStates.get(documentId) || null
  }

  /**
   * Get operation history
   */
  getOperationHistory(documentId: string): CRDTOperation[] {
    return this.operationHistory.get(documentId) || []
  }

  /**
   * Generate mock conflict scenario for testing
   */
  generateMockConflict(documentId: string): ConflictResolution {
    const mockOperations: CRDTOperation[] = [
      {
        id: 'op1',
        type: 'insert',
        position: 10,
        content: 'Hello',
        timestamp: Date.now() - 1000,
        userId: 'user1',
        documentId,
        version: 1,
      },
      {
        id: 'op2',
        type: 'insert',
        position: 10,
        content: 'Hi',
        timestamp: Date.now() - 500,
        userId: 'user2',
        documentId,
        version: 1,
      },
    ]

    const resolver = this.conflictResolvers.get('operational-transform')!
    return resolver(mockOperations)
  }
}

export const crdtService = new CRDTService()
export default crdtService
