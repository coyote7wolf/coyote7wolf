import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

/**
 * 活動介面
 */
export interface Activity {
  id: string
  userId: string
  type: string
  resourceId: string | null
  resourceType: string
  action: string
  title: string
  description: string
  metadata?: Record<string, any>
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

/**
 * 活動狀態介面
 */
export interface ActivitiesState {
  activities: Activity[]
  userActivities: Activity[]
  currentActivity: Activity | null
  isLoading: boolean
  error: string | null
  filter: {
    userId?: string
    type?: string
    resourceType?: string
    dateRange?: {
      start: string
      end: string
    }
  }
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

/**
 * 獲取活動列表參數
 */
interface FetchActivitiesParams {
  page?: number
  limit?: number
  userId?: string
  type?: string
  resourceType?: string
  dateRange?: {
    start: string
    end: string
  }
}

/**
 * 創建活動參數
 */
interface CreateActivityParams {
  type: string
  resourceId?: string
  resourceType: string
  action: string
  title: string
  description: string
  metadata?: Record<string, any>
}

// 初始狀態
const initialState: ActivitiesState = {
  activities: [],
  userActivities: [],
  currentActivity: null,
  isLoading: false,
  error: null,
  filter: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
}

/**
 * 獲取活動列表 Thunk
 */
export const fetchActivities = createAsyncThunk<
  { activities: Activity[]; total: number; hasMore: boolean },
  FetchActivitiesParams | undefined
>('activities/fetchActivities', async (params = {}, { rejectWithValue }) => {
  try {
    const { default: ApiService } = await import('../../services/api')
    const activityService = ApiService.activity

    const {
      page = 1,
      limit = 20,
      userId,
      type,
      resourceType,
      dateRange,
    } = params

    const queryParams: Record<string, string> = {
      _page: page.toString(),
      _limit: limit.toString(),
      _sort: 'timestamp',
      _order: 'desc',
    }

    // 添加過濾參數
    if (userId) queryParams.userId = userId
    if (type) queryParams.type = type
    if (resourceType) queryParams.resourceType = resourceType
    if (dateRange) {
      queryParams.timestamp_gte = dateRange.start
      queryParams.timestamp_lte = dateRange.end
    }

    const response = await activityService.getActivities(queryParams)
    const activities = Array.isArray(response.data) ? response.data : []

    return {
      activities: activities as Activity[],
      total: activities.length,
      hasMore: activities.length === limit,
    }
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : '未知錯誤')
  }
})

/**
 * 獲取用戶活動 Thunk
 */
export const fetchUserActivities = createAsyncThunk<
  Activity[],
  { userId: string; limit?: number }
>(
  'activities/fetchUserActivities',
  async ({ userId, limit = 10 }, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const activityService = ApiService.activity

      const queryParams = {
        limit,
        sort: 'timestamp',
        order: 'desc' as const,
      }

      const response = await activityService.getUserActivities(
        userId,
        queryParams
      )
      const activities = Array.isArray(response.data) ? response.data : []
      return activities as Activity[]
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 創建活動記錄 Thunk
 */
export const createActivity = createAsyncThunk<Activity, CreateActivityParams>(
  'activities/createActivity',
  async (params, { rejectWithValue }) => {
    try {
      const { default: ApiService } = await import('../../services/api')
      const activityService = ApiService.activity

      const response = await activityService.createActivity({
        type: params.type,
        resourceId: params.resourceId ?? null,
        resourceType: params.resourceType,
        action: params.action,
        title: params.title,
        description: params.description,
        ...(params.metadata && { metadata: params.metadata }),
        timestamp: new Date().toISOString(),
      })
      return response.data as Activity
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 獲取活動統計 Thunk
 */
export const fetchActivityStats = createAsyncThunk<
  {
    totalActivities: number
    todayActivities: number
    weeklyActivities: number
    monthlyActivities: number
    topActions: Array<{ action: string; count: number }>
    activityTrend: Array<{ date: string; count: number }>
  },
  { userId?: string; dateRange?: { start: string; end: string } }
>('activities/fetchActivityStats', async (params = {}, { rejectWithValue }) => {
  try {
    const { default: ApiService } = await import('../../services/api')
    const activityService = ApiService.activity

    const response = await activityService.getActivityStats(params)
    return response.data as any
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : '未知錯誤')
  }
})

/**
 * Activities Slice
 */
const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    /**
     * 設置當前活動
     */
    setCurrentActivity: (state, action: PayloadAction<Activity | null>) => {
      state.currentActivity = action.payload
    },

    /**
     * 清除錯誤
     */
    clearError: state => {
      state.error = null
    },

    /**
     * 設置過濾器
     */
    setFilter: (state, action: PayloadAction<ActivitiesState['filter']>) => {
      state.filter = action.payload
    },

    /**
     * 重置過濾器
     */
    resetFilter: state => {
      state.filter = {}
    },

    /**
     * 設置分頁
     */
    setPagination: (
      state,
      action: PayloadAction<Partial<ActivitiesState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },

    /**
     * 添加新活動到列表頂部（實時更新）
     */
    addActivityToTop: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload)
      state.pagination.total += 1
    },

    /**
     * 清除所有活動
     */
    clearActivities: state => {
      state.activities = []
      state.userActivities = []
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false,
      }
    },

    /**
     * 批量標記活動為已讀（如果需要的話）
     */
    markActivitiesAsRead: (state, action: PayloadAction<string[]>) => {
      const activityIds = action.payload
      state.activities.forEach(activity => {
        if (activityIds.includes(activity.id) && activity.metadata) {
          activity.metadata.isRead = true
        }
      })
      state.userActivities.forEach(activity => {
        if (activityIds.includes(activity.id) && activity.metadata) {
          activity.metadata.isRead = true
        }
      })
    },
  },
  extraReducers: builder => {
    // 獲取活動列表
    builder
      .addCase(fetchActivities.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.isLoading = false
        const { activities, total, hasMore } = action.payload

        if (state.pagination.page === 1) {
          state.activities = activities
        } else {
          state.activities = [...state.activities, ...activities]
        }

        state.pagination.total = total
        state.pagination.hasMore = hasMore
        state.error = null
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 獲取用戶活動
    builder
      .addCase(fetchUserActivities.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserActivities.fulfilled, (state, action) => {
        state.isLoading = false
        state.userActivities = action.payload
        state.error = null
      })
      .addCase(fetchUserActivities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 創建活動
    builder
      .addCase(createActivity.pending, state => {
        state.error = null
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        // 將新活動添加到列表頂部
        state.activities.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // 獲取活動統計
    builder
      .addCase(fetchActivityStats.pending, state => {
        state.error = null
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        // 統計數據可以存儲在 metadata 中或單獨的狀態中
        state.error = null
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  setCurrentActivity,
  clearError,
  setFilter,
  resetFilter,
  setPagination,
  addActivityToTop,
  clearActivities,
  markActivitiesAsRead,
} = activitiesSlice.actions

export default activitiesSlice.reducer
