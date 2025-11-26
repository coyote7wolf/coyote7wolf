import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit'
import {Document} from '../types'

// Mock data for demonstration
export const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: '欢迎使用 SyncCore AI',
    content: '这是一个示例文档，展示了我们的 AI 协作平台的功能。',
    type: 'article',
    status: 'published',
    authorId: 'user1',
    authorName: '管理员',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    version: 1,
    collaborators: [],
    syncStatus: 'synced',
  },
  {
    id: '2',
    title: '产品功能介绍',
    content: '详细介绍我们产品的核心功能和使用方法。',
    type: 'article',
    status: 'draft',
    authorId: 'user1',
    authorName: '管理员',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    lastModified: '2024-01-02T00:00:00Z',
    version: 1,
    collaborators: [],
    syncStatus: 'synced',
  },
]

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return MOCK_DOCUMENTS
  },
)

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async (newDoc: {title: string; content: string; type: Document['type']}) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const document: Document = {
      id: Date.now().toString(),
      title: newDoc.title,
      content: newDoc.content,
      type: newDoc.type,
      status: 'draft',
      authorId: 'current-user',
      authorName: '当前用户',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: 1,
      collaborators: [],
      syncStatus: 'synced',
    }
    return document
  },
)

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async (updateData: {id: string; title?: string; content?: string}) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return updateData
  },
)

export const removeDocument = createAsyncThunk(
  'documents/removeDocument',
  async (documentId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return documentId
  },
)

interface DocumentsState {
  documents: Document[]
  currentDocument: Document | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  error: string | null
}

const initialState: DocumentsState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
}

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    fetchDocumentsStart: state => {
      state.isLoading = true
      state.error = null
    },
    fetchDocumentsSuccess: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload
      state.isLoading = false
      state.error = null
    },
    fetchDocumentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload
    },
    createDocumentStart: state => {
      state.isCreating = true
      state.error = null
    },
    createDocumentSuccess: (state, action: PayloadAction<Document>) => {
      state.documents.unshift(action.payload)
      state.currentDocument = action.payload
      state.isCreating = false
      state.error = null
    },
    createDocumentFailure: (state, action: PayloadAction<string>) => {
      state.isCreating = false
      state.error = action.payload
    },
    updateDocumentStart: state => {
      state.isUpdating = true
      state.error = null
    },
    updateDocumentSuccess: (state, action: PayloadAction<Document>) => {
      const index = state.documents.findIndex(
        doc => doc.id === action.payload.id,
      )
      if (index !== -1) {
        state.documents[index] = action.payload
      }
      if (state.currentDocument?.id === action.payload.id) {
        state.currentDocument = action.payload
      }
      state.isUpdating = false
      state.error = null
    },
    updateDocumentFailure: (state, action: PayloadAction<string>) => {
      state.isUpdating = false
      state.error = action.payload
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload)
      if (state.currentDocument?.id === action.payload) {
        state.currentDocument = null
      }
    },
    clearError: state => {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      // fetchDocuments
      .addCase(fetchDocuments.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch documents'
      })
      // createDocument
      .addCase(createDocument.pending, state => {
        state.isCreating = true
        state.error = null
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload)
        state.isCreating = false
        state.error = null
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.isCreating = false
        state.error = action.error.message || 'Failed to create document'
      })
      // updateDocument
      .addCase(updateDocument.pending, state => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(
          doc => doc.id === action.payload.id,
        )
        if (index !== -1) {
          state.documents[index] = {
            ...state.documents[index],
            ...action.payload,
            updatedAt: new Date().toISOString(),
          }
        }
        state.isUpdating = false
        state.error = null
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.error.message || 'Failed to update document'
      })
      // removeDocument
      .addCase(removeDocument.pending, state => {
        state.error = null
      })
      .addCase(removeDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(
          doc => doc.id !== action.payload,
        )
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null
        }
        state.error = null
      })
      .addCase(removeDocument.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete document'
      })
  },
})

export const {
  fetchDocumentsStart,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  setCurrentDocument,
  createDocumentStart,
  createDocumentSuccess,
  createDocumentFailure,
  updateDocumentStart,
  updateDocumentSuccess,
  updateDocumentFailure,
  deleteDocument,
  clearError,
} = documentsSlice.actions

export default documentsSlice.reducer
