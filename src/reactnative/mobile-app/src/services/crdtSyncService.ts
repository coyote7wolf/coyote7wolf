import AsyncStorage from '@react-native-async-storage/async-storage'
import {MOCK_CONFIG} from '../utils/constants'

// CRDT 操作類型
export type CRDTOperation = {
  id: string
  type: 'insert' | 'delete' | 'format'
  position: number
  content?: string
  length?: number
  attributes?: Record<string, any>
  timestamp: number
  userId: string
  documentId: string
  vectorClock: Record<string, number>
}

// 文檔狀態
export interface DocumentState {
  id: string
  content: string
  operations: CRDTOperation[]
  vectorClock: Record<string, number>
  lastSyncTime: number
}

// Delta 同步包
export interface DeltaSync {
  documentId: string
  operations: CRDTOperation[]
  vectorClock: Record<string, number>
  fromVersion: Record<string, number>
  toVersion: Record<string, number>
}

// 衝突解決結果
export interface ConflictResolution {
  resolvedOperations: CRDTOperation[]
  conflictType: 'concurrent' | 'causality' | 'duplicate'
  resolution: 'merge' | 'priority' | 'transform'
  metadata: Record<string, any>
}

class CRDTSyncService {
  private mockMode = MOCK_CONFIG.enabled
  private userId: string
  private documentStates: Map<string, DocumentState> = new Map()

  constructor(userId: string) {
    this.userId = userId
    console.log('CRDTSyncService initialized with mock mode:', this.mockMode)
  }

  // 生成向量時鐘
  private generateVectorClock(
    current: Record<string, number>,
    userId: string,
  ): Record<string, number> {
    const newClock = {...current}
    newClock[userId] = (newClock[userId] || 0) + 1
    return newClock
  }

  // 比較向量時鐘（因果關係檢查）
  private compareVectorClocks(
    clock1: Record<string, number>,
    clock2: Record<string, number>,
  ): 'before' | 'after' | 'concurrent' {
    let before = false
    let after = false

    const allUsers = new Set([...Object.keys(clock1), ...Object.keys(clock2)])

    for (const user of allUsers) {
      const c1 = clock1[user] || 0
      const c2 = clock2[user] || 0

      if (c1 < c2) before = true
      if (c1 > c2) after = true
    }

    if (before && after) return 'concurrent'
    if (before) return 'before'
    if (after) return 'after'
    return 'concurrent'
  }

  // 創建操作
  async createOperation(
    documentId: string,
    type: CRDTOperation['type'],
    position: number,
    content?: string,
    length?: number,
    attributes?: Record<string, any>,
  ): Promise<CRDTOperation> {
    const docState = await this.getDocumentState(documentId)
    const newVectorClock = this.generateVectorClock(
      docState.vectorClock,
      this.userId,
    )

    const operation: CRDTOperation = {
      id: `${this.userId}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      type,
      position,
      content,
      length,
      attributes,
      timestamp: Date.now(),
      userId: this.userId,
      documentId,
      vectorClock: newVectorClock,
    }

    return operation
  }

  // 應用操作到本地狀態
  async applyOperation(
    documentId: string,
    operation: CRDTOperation,
  ): Promise<DocumentState> {
    const docState = await this.getDocumentState(documentId)

    // 應用操作到內容
    let newContent = docState.content
    switch (operation.type) {
      case 'insert':
        if (operation.content) {
          newContent =
            newContent.slice(0, operation.position) +
            operation.content +
            newContent.slice(operation.position)
        }
        break
      case 'delete':
        if (operation.length) {
          newContent =
            newContent.slice(0, operation.position) +
            newContent.slice(operation.position + operation.length)
        }
        break
      case 'format':
        // 格式化操作不改變內容，只改變屬性
        break
    }

    // 更新文檔狀態
    const newState: DocumentState = {
      ...docState,
      content: newContent,
      operations: [...docState.operations, operation],
      vectorClock: {...operation.vectorClock},
      lastSyncTime: Date.now(),
    }

    // 保存到本地
    await this.saveDocumentState(documentId, newState)
    this.documentStates.set(documentId, newState)

    return newState
  }

  // 轉換操作（OT算法核心）
  private transformOperation(
    op1: CRDTOperation,
    op2: CRDTOperation,
  ): CRDTOperation {
    if (op1.position <= op2.position) {
      return op2 // 不需要轉換
    }

    // 根據操作類型進行位置轉換
    let newPosition = op2.position

    if (op1.type === 'insert' && op1.content) {
      newPosition += op1.content.length
    } else if (op1.type === 'delete' && op1.length) {
      if (op1.position + op1.length <= op2.position) {
        newPosition -= op1.length
      } else if (op1.position < op2.position) {
        newPosition = op1.position
      }
    }

    return {
      ...op2,
      position: Math.max(0, newPosition),
    }
  }

  // 解決衝突
  async resolveConflicts(
    localOps: CRDTOperation[],
    remoteOps: CRDTOperation[],
  ): Promise<ConflictResolution> {
    const resolvedOperations: CRDTOperation[] = []
    const allOps = [...localOps, ...remoteOps]

    // 按向量時鐘排序操作
    allOps.sort((a, b) => {
      const comparison = this.compareVectorClocks(a.vectorClock, b.vectorClock)
      if (comparison === 'before') return -1
      if (comparison === 'after') return 1

      // 並發操作按用戶ID排序（確定性解決）
      return a.userId.localeCompare(b.userId)
    })

    // 應用操作變換
    for (let i = 0; i < allOps.length; i++) {
      let currentOp = allOps[i]

      // 對當前操作應用之前所有操作的變換
      for (let j = 0; j < i; j++) {
        currentOp = this.transformOperation(allOps[j], currentOp)
      }

      resolvedOperations.push(currentOp)
    }

    return {
      resolvedOperations,
      conflictType: 'concurrent',
      resolution: 'transform',
      metadata: {
        localOpsCount: localOps.length,
        remoteOpsCount: remoteOps.length,
        totalOps: resolvedOperations.length,
      },
    }
  }

  // 生成 Delta 同步包
  async generateDelta(
    documentId: string,
    remoteVectorClock: Record<string, number>,
  ): Promise<DeltaSync> {
    const docState = await this.getDocumentState(documentId)

    // 找出需要同步的操作
    const deltaOperations = docState.operations.filter(op => {
      const remoteVersion = remoteVectorClock[op.userId] || 0
      const localVersion = op.vectorClock[op.userId] || 0
      return localVersion > remoteVersion
    })

    return {
      documentId,
      operations: deltaOperations,
      vectorClock: docState.vectorClock,
      fromVersion: remoteVectorClock,
      toVersion: docState.vectorClock,
    }
  }

  // 應用 Delta 同步包
  async applyDelta(delta: DeltaSync): Promise<DocumentState> {
    const docState = await this.getDocumentState(delta.documentId)

    // 檢查是否有衝突
    const localNewOps = docState.operations.filter(op => {
      const deltaVersion = delta.fromVersion[op.userId] || 0
      const localVersion = op.vectorClock[op.userId] || 0
      return localVersion > deltaVersion
    })

    let finalOperations: CRDTOperation[]

    if (localNewOps.length > 0) {
      // 有衝突，需要解決
      const resolution = await this.resolveConflicts(
        localNewOps,
        delta.operations,
      )
      finalOperations = resolution.resolvedOperations
    } else {
      // 無衝突，直接應用
      finalOperations = [...docState.operations, ...delta.operations]
    }

    // 重新構建文檔內容
    let newContent = ''
    const sortedOps = finalOperations.sort((a, b) => a.timestamp - b.timestamp)

    for (const op of sortedOps) {
      switch (op.type) {
        case 'insert':
          if (op.content) {
            newContent =
              newContent.slice(0, op.position) +
              op.content +
              newContent.slice(op.position)
          }
          break
        case 'delete':
          if (op.length) {
            newContent =
              newContent.slice(0, op.position) +
              newContent.slice(op.position + op.length)
          }
          break
      }
    }

    // 合併向量時鐘
    const mergedVectorClock: Record<string, number> = {...docState.vectorClock}
    for (const [userId, version] of Object.entries(delta.vectorClock)) {
      mergedVectorClock[userId] = Math.max(
        mergedVectorClock[userId] || 0,
        version,
      )
    }

    const newState: DocumentState = {
      id: delta.documentId,
      content: newContent,
      operations: finalOperations,
      vectorClock: mergedVectorClock,
      lastSyncTime: Date.now(),
    }

    await this.saveDocumentState(delta.documentId, newState)
    this.documentStates.set(delta.documentId, newState)

    return newState
  }

  // 獲取文檔狀態
  private async getDocumentState(documentId: string): Promise<DocumentState> {
    if (this.documentStates.has(documentId)) {
      return this.documentStates.get(documentId)!
    }

    try {
      const stored = await AsyncStorage.getItem(`crdt_doc_${documentId}`)
      if (stored) {
        const state = JSON.parse(stored)
        this.documentStates.set(documentId, state)
        return state
      }
    } catch (error) {
      console.error('Failed to load document state:', error)
    }

    // 創建新的文檔狀態
    const newState: DocumentState = {
      id: documentId,
      content: '',
      operations: [],
      vectorClock: {},
      lastSyncTime: Date.now(),
    }

    await this.saveDocumentState(documentId, newState)
    this.documentStates.set(documentId, newState)
    return newState
  }

  // 保存文檔狀態
  private async saveDocumentState(
    documentId: string,
    state: DocumentState,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `crdt_doc_${documentId}`,
        JSON.stringify(state),
      )
    } catch (error) {
      console.error('Failed to save document state:', error)
    }
  }

  // Mock 同步測試
  async mockSync(documentId: string): Promise<DeltaSync> {
    if (!this.mockMode) {
      throw new Error('Mock sync only available in mock mode')
    }

    // 模擬遠程操作
    const mockRemoteOps: CRDTOperation[] = [
      {
        id: 'remote_1',
        type: 'insert',
        position: 10,
        content: '遠程插入的文字 ',
        timestamp: Date.now() - 1000,
        userId: 'remote_user',
        documentId,
        vectorClock: {remote_user: 1},
      },
      {
        id: 'remote_2',
        type: 'delete',
        position: 5,
        length: 3,
        timestamp: Date.now() - 500,
        userId: 'remote_user',
        documentId,
        vectorClock: {remote_user: 2},
      },
    ]

    return {
      documentId,
      operations: mockRemoteOps,
      vectorClock: {remote_user: 2},
      fromVersion: {},
      toVersion: {remote_user: 2},
    }
  }

  // 清理舊操作（性能優化）
  async compactOperations(
    documentId: string,
    keepRecentCount = 100,
  ): Promise<void> {
    const docState = await this.getDocumentState(documentId)

    if (docState.operations.length <= keepRecentCount) {
      return
    }

    // 只保留最近的操作
    const recentOps = docState.operations
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, keepRecentCount)

    const compactedState: DocumentState = {
      ...docState,
      operations: recentOps,
    }

    await this.saveDocumentState(documentId, compactedState)
    this.documentStates.set(documentId, compactedState)
  }
}

export default CRDTSyncService
