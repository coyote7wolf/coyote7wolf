import SQLite from 'react-native-sqlite-storage'
import {Document} from '../types'
import {MOCK_CONFIG} from '../utils/constants'

// Enable debugging in dev mode
SQLite.DEBUG(__DEV__)
SQLite.enablePromise(true)

export interface SyncRecord {
  id: string
  table: string
  recordId: string
  operation: 'create' | 'update' | 'delete'
  data: string // JSON stringified data
  timestamp: number
  synced: boolean
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null
  private initPromise: Promise<void> | null = null

  constructor() {
    this.initDatabase()
  }

  private async initDatabase(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this.performInit()
    return this.initPromise
  }

  private async performInit(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'SyncCoreAI.db',
        location: 'default',
        createFromLocation: '~www/SyncCoreAI.db',
      })

      console.log('Database opened successfully')

      // Create tables
      await this.createTables()

      // Initialize with mock data if enabled
      if (MOCK_CONFIG.enableMockData) {
        await this.initializeMockData()
      }
    } catch (error) {
      console.error('Database initialization failed:', error)
      throw error
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const createDocumentsTable = `
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        tags TEXT,
        is_favorite INTEGER DEFAULT 0,
        word_count INTEGER DEFAULT 0,
        char_count INTEGER DEFAULT 0,
        last_synced INTEGER DEFAULT 0
      )
    `

    const createSyncQueueTable = `
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0
      )
    `

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `

    await this.db.executeSql(createDocumentsTable)
    await this.db.executeSql(createSyncQueueTable)
    await this.db.executeSql(createSettingsTable)

    console.log('Tables created successfully')
  }

  private async initializeMockData(): Promise<void> {
    const documentsCount = await this.getDocumentsCount()

    if (documentsCount === 0) {
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          title: '歡迎使用 SyncCoreAI',
          content:
            '這是一個演示文檔，展示了 SyncCoreAI 的強大功能。\n\n您可以在此編輯文本，所有更改都會自動保存到本地數據庫。',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          tags: ['歡迎', '演示'],
          isFavorite: true,
          wordCount: 25,
          charCount: 65,
        },
        {
          id: 'doc-2',
          title: '移動端編輯器指南',
          content:
            '# 移動端編輯功能\n\n## 基本操作\n- 點擊編輯\n- 長按選擇\n- 雙擊快速選擇\n\n## 協作功能\n- 實時同步\n- 多用戶編輯\n- 版本控制',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString(),
          tags: ['指南', '編輯器'],
          isFavorite: false,
          wordCount: 45,
          charCount: 120,
        },
        {
          id: 'doc-3',
          title: '離線功能測試',
          content:
            '此文檔用於測試離線功能。即使在沒有網路連接的情況下，您也可以：\n\n1. 創建新文檔\n2. 編輯現有文檔\n3. 標記收藏\n4. 搜索文檔\n\n所有更改都會存儲在本地，並在網路恢復時自動同步。',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          tags: ['離線', '測試'],
          isFavorite: false,
          wordCount: 55,
          charCount: 145,
        },
      ]

      for (const doc of mockDocuments) {
        await this.saveDocument(doc)
      }

      console.log('Mock data initialized')
    }
  }

  // Document operations
  async saveDocument(document: Document): Promise<void> {
    await this.ensureInitialized()

    const query = `
      INSERT OR REPLACE INTO documents 
      (id, title, content, created_at, updated_at, tags, is_favorite, word_count, char_count, last_synced) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      document.id,
      document.title,
      document.content,
      document.createdAt,
      document.updatedAt,
      JSON.stringify(document.tags || []),
      document.isFavorite ? 1 : 0,
      document.wordCount || 0,
      document.charCount || 0,
      Date.now(),
    ]

    await this.db!.executeSql(query, params)

    // Add to sync queue
    await this.addToSyncQueue('documents', document.id, 'update', document)
  }

  async getDocument(id: string): Promise<Document | null> {
    await this.ensureInitialized()

    const query = 'SELECT * FROM documents WHERE id = ?'
    const results = await this.db!.executeSql(query, [id])

    if (results[0].rows.length === 0) {
      return null
    }

    return this.mapRowToDocument(results[0].rows.item(0))
  }

  async getAllDocuments(): Promise<Document[]> {
    await this.ensureInitialized()

    const query = 'SELECT * FROM documents ORDER BY updated_at DESC'
    const results = await this.db!.executeSql(query)

    const documents: Document[] = []
    for (let i = 0; i < results[0].rows.length; i++) {
      documents.push(this.mapRowToDocument(results[0].rows.item(i)))
    }

    return documents
  }

  async deleteDocument(id: string): Promise<void> {
    await this.ensureInitialized()

    const query = 'DELETE FROM documents WHERE id = ?'
    await this.db!.executeSql(query, [id])

    // Add to sync queue
    await this.addToSyncQueue('documents', id, 'delete', {id})
  }

  async searchDocuments(searchTerm: string): Promise<Document[]> {
    await this.ensureInitialized()

    const query = `
      SELECT * FROM documents 
      WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
      ORDER BY updated_at DESC
    `
    const searchPattern = `%${searchTerm}%`
    const results = await this.db!.executeSql(query, [
      searchPattern,
      searchPattern,
      searchPattern,
    ])

    const documents: Document[] = []
    for (let i = 0; i < results[0].rows.length; i++) {
      documents.push(this.mapRowToDocument(results[0].rows.item(i)))
    }

    return documents
  }

  private mapRowToDocument(row: any): Document {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags: JSON.parse(row.tags || '[]'),
      isFavorite: row.is_favorite === 1,
      wordCount: row.word_count,
      charCount: row.char_count,
    }
  }

  // Sync queue operations
  private async addToSyncQueue(
    tableName: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete',
    data: any,
  ): Promise<void> {
    const syncRecord: SyncRecord = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      table: tableName,
      recordId,
      operation,
      data: JSON.stringify(data),
      timestamp: Date.now(),
      synced: false,
    }

    const query = `
      INSERT INTO sync_queue (id, table_name, record_id, operation, data, timestamp, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    await this.db!.executeSql(query, [
      syncRecord.id,
      syncRecord.table,
      syncRecord.recordId,
      syncRecord.operation,
      syncRecord.data,
      syncRecord.timestamp,
      syncRecord.synced ? 1 : 0,
    ])
  }

  async getPendingSyncRecords(): Promise<SyncRecord[]> {
    await this.ensureInitialized()

    const query =
      'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp ASC'
    const results = await this.db!.executeSql(query)

    const records: SyncRecord[] = []
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i)
      records.push({
        id: row.id,
        table: row.table_name,
        recordId: row.record_id,
        operation: row.operation,
        data: row.data,
        timestamp: row.timestamp,
        synced: row.synced === 1,
      })
    }

    return records
  }

  async markSyncRecordAsCompleted(syncId: string): Promise<void> {
    await this.ensureInitialized()

    const query = 'UPDATE sync_queue SET synced = 1 WHERE id = ?'
    await this.db!.executeSql(query, [syncId])
  }

  async clearCompletedSyncRecords(): Promise<void> {
    await this.ensureInitialized()

    const query = 'DELETE FROM sync_queue WHERE synced = 1'
    await this.db!.executeSql(query)
  }

  // Utility methods
  private async getDocumentsCount(): Promise<number> {
    await this.ensureInitialized()

    const query = 'SELECT COUNT(*) as count FROM documents'
    const results = await this.db!.executeSql(query)
    return results[0].rows.item(0).count
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.performInit()
    }
    await this.initPromise
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}

export const databaseService = new DatabaseService()
export default databaseService
