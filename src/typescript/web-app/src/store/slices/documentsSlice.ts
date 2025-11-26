import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

/**
 * 文件介面
 */
export interface Document {
  id: string
  title: string
  content: string
  type: 'markdown' | 'rich-text' | 'code' | 'presentation'
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  authorId: string
  authorName: string
  authorAvatar?: string
  collaborators: Collaborator[]
  permissions: DocumentPermissions
  createdAt: string
  updatedAt: string
  lastModifiedBy: string
  version: number
  isShared: boolean
  shareToken?: string
  parentId?: string
  path: string[]
  size: number
  thumbnail?: string
}

/**
 * 協作者介面
 */
export interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
  isOnline: boolean
  lastSeen: string
  cursor?: {
    position: number
    selection?: [number, number]
  }
}

/**
 * 文件權限介面
 */
export interface DocumentPermissions {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canShare: boolean
  canComment: boolean
}

/**
 * 文件狀態介面
 */
export interface DocumentsState {
  documents: Document[]
  currentDocument: Document | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  searchResults: Document[]
  isSearching: boolean
  filter: {
    type?: Document['type']
    status?: Document['status']
    author?: string
    tags?: string[]
  }
  sort: {
    field: 'title' | 'updatedAt' | 'createdAt' | 'size'
    order: 'asc' | 'desc'
  }
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  recentDocuments: Document[]
  sharedWithMe: Document[]
  trash: Document[]
}

/**
 * 創建文件參數
 */
interface CreateDocumentParams {
  title: string
  content?: string
  type: Document['type']
  parentId?: string
  tags?: string[]
}

/**
 * 更新文件參數
 */
interface UpdateDocumentParams {
  id: string
  updates: Partial<Pick<Document, 'title' | 'content' | 'tags' | 'status'>>
}

/**
 * 搜索參數
 */
interface SearchParams {
  query: string
  filters?: DocumentsState['filter']
  page?: number
  limit?: number
}

/**
 * 獲取文件列表參數
 */
interface FetchDocumentsParams {
  page?: number
  limit?: number
  filter?: DocumentsState['filter']
  sort?: DocumentsState['sort']
}

// 初始狀態
const initialState: DocumentsState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  filter: {},
  sort: {
    field: 'updatedAt',
    order: 'desc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  recentDocuments: [],
  sharedWithMe: [],
  trash: [],
}

/**
 * 獲取文件列表 Thunk
 */
export const fetchDocuments = createAsyncThunk<
  { documents: Document[]; total: number; hasMore: boolean },
  FetchDocumentsParams | undefined
>('documents/fetchDocuments', async (params, { rejectWithValue }) => {
  try {
    const { default: ApiService } = await import('../../services/api')
    const documentService = ApiService.document

    const {
      page = 1,
      limit = 20,
      filter = {},
      sort = { field: 'updatedAt', order: 'desc' },
    } = params || {}

    const queryParams: Record<string, string> = {
      _page: page.toString(),
      _limit: limit.toString(),
      _sort: sort.field,
      _order: sort.order,
    }

    // 添加過濾參數
    if (filter.type) queryParams.type = filter.type
    if (filter.status) queryParams.status = filter.status
    if (filter.author) queryParams.authorId = filter.author
    if (filter.tags?.length) {
      filter.tags.forEach((tag, index) => {
        queryParams[`tags_like[${index}]`] = tag
      })
    }

    const response = await documentService.getDocuments(queryParams)
    const documents = Array.isArray(response.data) ? response.data : []
    return {
      documents: documents as Document[],
      total: documents.length,
      hasMore: documents.length === limit,
    }
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : '未知錯誤')
  }
})

/**
 * 獲取單個文件 Thunk
 */
export const fetchDocument = createAsyncThunk<Document, string>(
  'documents/fetchDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const documentService = ApiService.document

      const response = await documentService.getDocument(documentId)
      return response.data as Document
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 創建文件 Thunk
 */
export const createDocument = createAsyncThunk<Document, CreateDocumentParams>(
  'documents/createDocument',
  async (params, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const documentService = ApiService.document

      const response = await documentService.createDocument({
        title: params.title,
        content: params.content || '',
        type: params.type,
        tags: params.tags || [],
      })
      return response.data as Document
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 更新文件 Thunk
 */
export const updateDocument = createAsyncThunk<Document, UpdateDocumentParams>(
  'documents/updateDocument',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const documentService = ApiService.document

      const response = await documentService.updateDocument(id, updates)
      return response.data as Document
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 刪除文件 Thunk
 */
export const deleteDocument = createAsyncThunk<string, string>(
  'documents/deleteDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const documentService = ApiService.document

      await documentService.deleteDocument(documentId)
      return documentId
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 搜索文件 Thunk
 */
export const searchDocuments = createAsyncThunk<Document[], SearchParams>(
  'documents/searchDocuments',
  async (
    { query, filters = {}, page = 1, limit = 20 },
    { rejectWithValue }
  ) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const searchService = ApiService.search

      const searchParams = {
        page,
        limit,
        filters,
      }

      const response = await searchService.searchDocuments(query, searchParams)
      const documents = Array.isArray(response.data) ? response.data : []
      return documents as Document[]
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * Documents Slice
 */
const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    /**
     * 設置當前文件
     */
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload
    },

    /**
     * 清除錯誤
     */
    clearError: state => {
      state.error = null
    },

    /**
     * 設置搜索查詢
     */
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },

    /**
     * 清除搜索結果
     */
    clearSearchResults: state => {
      state.searchResults = []
      state.searchQuery = ''
    },

    /**
     * 設置過濾器
     */
    setFilter: (state, action: PayloadAction<DocumentsState['filter']>) => {
      state.filter = action.payload
    },

    /**
     * 重置過濾器
     */
    resetFilter: state => {
      state.filter = {}
    },

    /**
     * 設置排序
     */
    setSort: (state, action: PayloadAction<DocumentsState['sort']>) => {
      state.sort = action.payload
    },

    /**
     * 更新文件內容（實時協作）
     */
    updateDocumentContent: (
      state,
      action: PayloadAction<{ id: string; content: string; version: number }>
    ) => {
      const { id, content, version } = action.payload

      // 更新文件列表中的文件
      const documentIndex = state.documents.findIndex(doc => doc.id === id)
      if (documentIndex !== -1) {
        const document = state.documents[documentIndex]
        if (document) {
          document.content = content
          document.version = version
          document.updatedAt = new Date().toISOString()
        }
      }

      // 更新當前文件
      if (state.currentDocument?.id === id) {
        state.currentDocument.content = content
        state.currentDocument.version = version
        state.currentDocument.updatedAt = new Date().toISOString()
      }
    },

    /**
     * 更新協作者狀態
     */
    updateCollaborator: (
      state,
      action: PayloadAction<{ documentId: string; collaborator: Collaborator }>
    ) => {
      const { documentId, collaborator } = action.payload

      // 更新文件列表中的協作者
      const documentIndex = state.documents.findIndex(
        doc => doc.id === documentId
      )
      if (documentIndex !== -1) {
        const document = state.documents[documentIndex]
        if (document) {
          const existingIndex = document.collaborators.findIndex(
            c => c.id === collaborator.id
          )
          if (existingIndex !== -1) {
            document.collaborators[existingIndex] = collaborator
          } else {
            document.collaborators.push(collaborator)
          }
        }
      }

      // 更新當前文件的協作者
      if (state.currentDocument?.id === documentId) {
        const existingIndex = state.currentDocument.collaborators.findIndex(
          c => c.id === collaborator.id
        )
        if (existingIndex !== -1) {
          state.currentDocument.collaborators[existingIndex] = collaborator
        } else {
          state.currentDocument.collaborators.push(collaborator)
        }
      }
    },

    /**
     * 移除協作者
     */
    removeCollaborator: (
      state,
      action: PayloadAction<{ documentId: string; collaboratorId: string }>
    ) => {
      const { documentId, collaboratorId } = action.payload

      // 從文件列表中移除
      const documentIndex = state.documents.findIndex(
        doc => doc.id === documentId
      )
      if (documentIndex !== -1) {
        const document = state.documents[documentIndex]
        if (document) {
          document.collaborators = document.collaborators.filter(
            c => c.id !== collaboratorId
          )
        }
      }

      // 從當前文件中移除
      if (state.currentDocument?.id === documentId) {
        state.currentDocument.collaborators =
          state.currentDocument.collaborators.filter(
            c => c.id !== collaboratorId
          )
      }
    },

    /**
     * 設置分頁
     */
    setPagination: (
      state,
      action: PayloadAction<Partial<DocumentsState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: builder => {
    // 獲取文件列表
    builder
      .addCase(fetchDocuments.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        const { documents, total, hasMore } = action.payload

        if (state.pagination.page === 1) {
          state.documents = documents
        } else {
          state.documents = [...state.documents, ...documents]
        }

        state.pagination.total = total
        state.pagination.hasMore = hasMore
        state.error = null
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 獲取單個文件
    builder
      .addCase(fetchDocument.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentDocument = action.payload

        // 同時更新文件列表中的文件
        const index = state.documents.findIndex(
          doc => doc.id === action.payload.id
        )
        if (index !== -1) {
          state.documents[index] = action.payload
        }

        state.error = null
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 創建文件
    builder
      .addCase(createDocument.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents.unshift(action.payload)
        state.currentDocument = action.payload
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 更新文件
    builder
      .addCase(updateDocument.pending, state => {
        state.error = null
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const updatedDocument = action.payload

        // 更新文件列表中的文件
        const index = state.documents.findIndex(
          doc => doc.id === updatedDocument.id
        )
        if (index !== -1) {
          state.documents[index] = updatedDocument
        }

        // 更新當前文件
        if (state.currentDocument?.id === updatedDocument.id) {
          state.currentDocument = updatedDocument
        }

        state.error = null
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // 刪除文件
    builder
      .addCase(deleteDocument.pending, state => {
        state.error = null
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const documentId = action.payload

        // 從文件列表中移除
        state.documents = state.documents.filter(doc => doc.id !== documentId)

        // 如果是當前文件，清空當前文件
        if (state.currentDocument?.id === documentId) {
          state.currentDocument = null
        }

        state.pagination.total -= 1
        state.error = null
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // 搜索文件
    builder
      .addCase(searchDocuments.pending, state => {
        state.isSearching = true
        state.error = null
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.isSearching = false
        state.searchResults = action.payload
        state.error = null
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.isSearching = false
        state.error = action.payload as string
      })
  },
})

export const {
  setCurrentDocument,
  clearError,
  setSearchQuery,
  clearSearchResults,
  setFilter,
  resetFilter,
  setSort,
  updateDocumentContent,
  updateCollaborator,
  removeCollaborator,
  setPagination,
} = documentsSlice.actions

export default documentsSlice.reducer
