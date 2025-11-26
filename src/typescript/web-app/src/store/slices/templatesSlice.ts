import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

/**
 * 模板介面
 */
export interface Template {
  id: string
  name: string
  description: string
  category: string
  language: string
  content: string
  tags: string[]
  authorId: string
  usageCount: number
  rating: number
  isPremium: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 模板狀態介面
 */
export interface TemplatesState {
  templates: Template[]
  categories: string[]
  currentTemplate: Template | null
  isLoading: boolean
  error: string | null
  filter: {
    category?: string
    language?: string
    isPremium?: boolean
    tags?: string[]
  }
  sort: {
    field: 'name' | 'rating' | 'usageCount' | 'createdAt' | 'updatedAt'
    order: 'asc' | 'desc'
  }
  searchQuery: string
  searchResults: Template[]
  isSearching: boolean
}

/**
 * 創建模板參數
 */
interface CreateTemplateParams {
  name: string
  description: string
  category: string
  content: string
  tags?: string[]
  language?: string
}

/**
 * 更新模板參數
 */
interface UpdateTemplateParams {
  id: string
  updates: Partial<
    Pick<Template, 'name' | 'description' | 'content' | 'tags' | 'category'>
  >
}

/**
 * 獲取模板列表參數
 */
interface FetchTemplatesParams {
  category?: string
  language?: string
  isPremium?: boolean
  tags?: string[]
  sort?: TemplatesState['sort']
}

// 初始狀態
const initialState: TemplatesState = {
  templates: [],
  categories: [],
  currentTemplate: null,
  isLoading: false,
  error: null,
  filter: {},
  sort: {
    field: 'rating',
    order: 'desc',
  },
  searchQuery: '',
  searchResults: [],
  isSearching: false,
}

/**
 * 獲取模板列表 Thunk
 */
export const fetchTemplates = createAsyncThunk<
  { templates: Template[]; categories: string[] },
  FetchTemplatesParams | undefined
>('templates/fetchTemplates', async (params = {}, { rejectWithValue }) => {
  try {
    const { default: ApiService } = await import('../../services/api')
    const templateService = ApiService.template

    const queryParams: Record<string, string> = {}

    if (params.category) queryParams.category = params.category
    if (params.language) queryParams.language = params.language
    if (params.isPremium !== undefined)
      queryParams.isPremium = params.isPremium.toString()
    if (params.tags?.length) {
      params.tags.forEach((tag, index) => {
        queryParams[`tags_like[${index}]`] = tag
      })
    }
    if (params.sort) {
      queryParams._sort = params.sort.field
      queryParams._order = params.sort.order
    }

    const templatesResponse = await templateService.getTemplates(queryParams)
    const categoriesResponse = await templateService.getCategories()

    const templates = Array.isArray(templatesResponse.data)
      ? templatesResponse.data
      : []
    const categories = Array.isArray(categoriesResponse.data)
      ? categoriesResponse.data
      : []

    return {
      templates: templates as Template[],
      categories: categories as string[],
    }
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : '未知錯誤')
  }
})

/**
 * 獲取單個模板 Thunk
 */
export const fetchTemplate = createAsyncThunk<Template, string>(
  'templates/fetchTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const templateService = ApiService.template

      const response = await templateService.getTemplate(templateId)
      return response.data as Template
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 創建模板 Thunk
 */
export const createTemplate = createAsyncThunk<Template, CreateTemplateParams>(
  'templates/createTemplate',
  async (params, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const templateService = ApiService.template

      const response = await templateService.createTemplate({
        name: params.name,
        description: params.description,
        category: params.category,
        content: params.content,
        tags: params.tags || [],
        isPublic: true,
      })
      return response.data as Template
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 更新模板 Thunk
 */
export const updateTemplate = createAsyncThunk<Template, UpdateTemplateParams>(
  'templates/updateTemplate',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const templateService = ApiService.template

      const response = await templateService.updateTemplate(id, updates)
      return response.data as Template
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 刪除模板 Thunk
 */
export const deleteTemplate = createAsyncThunk<string, string>(
  'templates/deleteTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const templateService = ApiService.template

      await templateService.deleteTemplate(templateId)
      return templateId
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 使用模板創建文件 Thunk
 */
export const useTemplate = createAsyncThunk<
  { template: Template; document: any },
  { templateId: string; title?: string }
>(
  'templates/useTemplate',
  async ({ templateId, title }, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const templateService = ApiService.template
      const documentService = ApiService.document

      // 獲取模板
      const templateResponse = await templateService.getTemplate(templateId)
      const template = templateResponse.data as Template

      // 使用模板創建文件
      const documentResponse = await documentService.createDocument({
        title: title || `基於模板：${template.name}`,
        content: template.content,
        type: 'rich-text',
        tags: template.tags,
      })

      // 增加模板使用次數
      try {
        await templateService.incrementUsage(templateId)
      } catch (error) {
        // 忽略使用次數更新失敗
        console.warn('Failed to update template usage count:', error)
      }

      return {
        template,
        document: documentResponse.data,
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 搜索模板 Thunk
 */
export const searchTemplates = createAsyncThunk<Template[], string>(
  'templates/searchTemplates',
  async (query, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const searchService = ApiService.search

      const response = await searchService.searchTemplates(query)
      const templates = Array.isArray(response.data) ? response.data : []
      return templates as Template[]
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * Templates Slice
 */
const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    /**
     * 設置當前模板
     */
    setCurrentTemplate: (state, action: PayloadAction<Template | null>) => {
      state.currentTemplate = action.payload
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
    setFilter: (state, action: PayloadAction<TemplatesState['filter']>) => {
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
    setSort: (state, action: PayloadAction<TemplatesState['sort']>) => {
      state.sort = action.payload
    },

    /**
     * 增加模板使用次數
     */
    incrementTemplateUsage: (state, action: PayloadAction<string>) => {
      const templateId = action.payload
      const template = state.templates.find(t => t.id === templateId)
      if (template) {
        template.usageCount += 1
      }
      if (state.currentTemplate?.id === templateId) {
        state.currentTemplate.usageCount += 1
      }
    },
  },
  extraReducers: builder => {
    // 獲取模板列表
    builder
      .addCase(fetchTemplates.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false
        const { templates, categories } = action.payload
        state.templates = templates
        state.categories = categories
        state.error = null
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 獲取單個模板
    builder
      .addCase(fetchTemplate.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTemplate = action.payload

        // 同時更新模板列表中的模板
        const index = state.templates.findIndex(
          template => template.id === action.payload.id
        )
        if (index !== -1) {
          state.templates[index] = action.payload
        }

        state.error = null
      })
      .addCase(fetchTemplate.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 創建模板
    builder
      .addCase(createTemplate.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.isLoading = false
        state.templates.unshift(action.payload)
        state.currentTemplate = action.payload
        state.error = null
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 更新模板
    builder
      .addCase(updateTemplate.pending, state => {
        state.error = null
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const updatedTemplate = action.payload

        // 更新模板列表中的模板
        const index = state.templates.findIndex(
          template => template.id === updatedTemplate.id
        )
        if (index !== -1) {
          state.templates[index] = updatedTemplate
        }

        // 更新當前模板
        if (state.currentTemplate?.id === updatedTemplate.id) {
          state.currentTemplate = updatedTemplate
        }

        state.error = null
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // 刪除模板
    builder
      .addCase(deleteTemplate.pending, state => {
        state.error = null
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        const templateId = action.payload

        // 從模板列表中移除
        state.templates = state.templates.filter(
          template => template.id !== templateId
        )

        // 如果是當前模板，清空當前模板
        if (state.currentTemplate?.id === templateId) {
          state.currentTemplate = null
        }

        state.error = null
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // 使用模板
    builder
      .addCase(useTemplate.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(useTemplate.fulfilled, (state, action) => {
        state.isLoading = false
        const { template } = action.payload

        // 增加使用次數
        const index = state.templates.findIndex(t => t.id === template.id)
        if (index !== -1 && state.templates[index]) {
          state.templates[index]!.usageCount += 1
        }
        if (state.currentTemplate?.id === template.id) {
          state.currentTemplate.usageCount += 1
        }

        state.error = null
      })
      .addCase(useTemplate.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 搜索模板
    builder
      .addCase(searchTemplates.pending, state => {
        state.isSearching = true
        state.error = null
      })
      .addCase(searchTemplates.fulfilled, (state, action) => {
        state.isSearching = false
        state.searchResults = action.payload
        state.error = null
      })
      .addCase(searchTemplates.rejected, (state, action) => {
        state.isSearching = false
        state.error = action.payload as string
      })
  },
})

export const {
  setCurrentTemplate,
  clearError,
  setSearchQuery,
  clearSearchResults,
  setFilter,
  resetFilter,
  setSort,
  incrementTemplateUsage,
} = templatesSlice.actions

export default templatesSlice.reducer
