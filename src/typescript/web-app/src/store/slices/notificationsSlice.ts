import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

/**
 * Notification Interface
 */
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'system' | 'document' | 'user' | 'security'
  actionUrl?: string
  actionLabel?: string
  expiresAt?: string
}

export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  browserNotifications: boolean
  soundEnabled: boolean
  categories: {
    system: boolean
    document: boolean
    user: boolean
    security: boolean
  }
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
}

export interface NotificationsState {
  items: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  preferences: NotificationPreferences
  isPermissionGranted: boolean
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    browserNotifications: true,
    soundEnabled: true,
    categories: {
      system: true,
      document: true,
      user: true,
      security: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  isPermissionGranted: false,
}

/**
 * Async Thunks for notification operations
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          title: 'New Document Shared',
          message: 'John Doe shared "Project Proposal" with you',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          priority: 'medium',
          category: 'document',
          actionUrl: '/documents/project-proposal',
          actionLabel: 'View Document',
        },
        {
          id: '2',
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile information has been successfully updated',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: true,
          priority: 'low',
          category: 'user',
        },
        {
          id: '3',
          type: 'warning',
          title: 'Security Alert',
          message: 'New login detected from unusual location',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: false,
          priority: 'high',
          category: 'security',
          actionUrl: '/security/sessions',
          actionLabel: 'Review Sessions',
        },
        {
          id: '4',
          type: 'error',
          title: 'Sync Failed',
          message: 'Failed to synchronize document changes',
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 2
          ).toISOString(),
          read: false,
          priority: 'high',
          category: 'system',
          actionUrl: '/documents',
          actionLabel: 'Retry Sync',
        },
      ]

      return mockNotifications
    } catch (error) {
      return rejectWithValue('Failed to fetch notifications')
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return notificationId
    } catch (error) {
      return rejectWithValue('Failed to mark notification as read')
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return true
    } catch (error) {
      return rejectWithValue('Failed to mark all notifications as read')
    }
  }
)

export const requestNotificationPermission = createAsyncThunk(
  'notifications/requestPermission',
  async (_, { rejectWithValue }) => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
      return false
    } catch (error) {
      return rejectWithValue('Failed to request notification permission')
    }
  }
)

/**
 * Notifications Slice
 */
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }

      state.items.unshift(notification)
      if (!notification.read) {
        state.unreadCount += 1
      }

      // Limit to 100 notifications to prevent memory issues
      if (state.items.length > 100) {
        const removedNotifications = state.items.splice(100)
        const removedUnreadCount = removedNotifications.filter(
          n => !n.read
        ).length
        state.unreadCount -= removedUnreadCount
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(item => item.id === action.payload)
      if (index !== -1) {
        const notification = state.items[index]
        if (notification && !notification.read) {
          state.unreadCount -= 1
        }
        state.items.splice(index, 1)
      }
    },

    clearAllNotifications: state => {
      state.items = []
      state.unreadCount = 0
    },

    updatePreferences: (
      state,
      action: PayloadAction<Partial<NotificationPreferences>>
    ) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      }
    },

    clearError: state => {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.unreadCount = action.payload.filter(n => !n.read).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(
          item => item.id === action.payload
        )
        if (notification) {
          if (!notification.read) {
            state.unreadCount -= 1
          }
          notification.read = true
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, state => {
        state.items.forEach(item => {
          item.read = true
        })
        state.unreadCount = 0
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Request permission
      .addCase(requestNotificationPermission.fulfilled, (state, action) => {
        state.isPermissionGranted = action.payload
      })
      .addCase(requestNotificationPermission.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
  updatePreferences,
  clearError,
} = notificationsSlice.actions

export default notificationsSlice.reducer
