import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

/**
 * 用戶資料介面
 */
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: string
  updatedAt: string
}

/**
 * 認證狀態介面
 */
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastActivity: number
  sessionExpiry: number | null
}

/**
 * 登入請求參數
 */
interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * 註冊請求參數
 */
interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

/**
 * API 響應介面
 */
interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

// 初始狀態
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
  sessionExpiry: null,
}

/**
 * 異步登入 Thunk
 */
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '登入失敗')
      }

      const data = await response.json()

      // 保存到 localStorage
      if (credentials.rememberMe) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('refresh_token', data.refreshToken)
      } else {
        sessionStorage.setItem('auth_token', data.token)
        sessionStorage.setItem('refresh_token', data.refreshToken)
      }

      return data
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 異步註冊 Thunk
 */
export const registerUser = createAsyncThunk<AuthResponse, RegisterCredentials>(
  'auth/registerUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '註冊失敗')
      }

      const data = await response.json()

      // 保存到 localStorage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('refresh_token', data.refreshToken)

      return data
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 刷新 Token Thunk
 */
export const refreshToken = createAsyncThunk<AuthResponse, void>(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState }
      const currentRefreshToken =
        state.auth.refreshToken ||
        localStorage.getItem('refresh_token') ||
        sessionStorage.getItem('refresh_token')

      if (!currentRefreshToken) {
        throw new Error('沒有 refresh token')
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentRefreshToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Token 刷新失敗')
      }

      const data = await response.json()

      // 更新保存的 token
      const storage = localStorage.getItem('auth_token')
        ? localStorage
        : sessionStorage
      storage.setItem('auth_token', data.token)
      storage.setItem('refresh_token', data.refreshToken)

      return data
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * 驗證現有 Token Thunk
 */
export const validateToken = createAsyncThunk<User, void>(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token')

      if (!token) {
        throw new Error('沒有找到 token')
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Token 驗證失敗')
      }

      const user = await response.json()
      return user
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '未知錯誤'
      )
    }
  }
)

/**
 * Auth Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * 登出用戶
     */
    logout: state => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      state.sessionExpiry = null

      // 清除儲存的 token
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('refresh_token')
    },

    /**
     * 清除錯誤
     */
    clearError: state => {
      state.error = null
    },

    /**
     * 更新最後活動時間
     */
    updateLastActivity: state => {
      state.lastActivity = Date.now()
    },

    /**
     * 設置會話過期時間
     */
    setSessionExpiry: (state, action: PayloadAction<number>) => {
      state.sessionExpiry = action.payload
    },

    /**
     * 更新用戶資料
     */
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: builder => {
    // 登入
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.lastActivity = Date.now()
        state.sessionExpiry = Date.now() + action.payload.expiresIn * 1000
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })

    // 註冊
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.lastActivity = Date.now()
        state.sessionExpiry = Date.now() + action.payload.expiresIn * 1000
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })

    // Token 刷新
    builder
      .addCase(refreshToken.pending, state => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.lastActivity = Date.now()
        state.sessionExpiry = Date.now() + action.payload.expiresIn * 1000
        state.error = null
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Token 刷新失敗時登出
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.sessionExpiry = null
      })

    // Token 驗證
    builder
      .addCase(validateToken.pending, state => {
        state.isLoading = true
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.lastActivity = Date.now()

        // 從 storage 獲取 token
        const token =
          localStorage.getItem('auth_token') ||
          sessionStorage.getItem('auth_token')
        const refreshToken =
          localStorage.getItem('refresh_token') ||
          sessionStorage.getItem('refresh_token')

        state.token = token
        state.refreshToken = refreshToken
        state.error = null
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        // 清除無效的 token
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('refresh_token')
      })
  },
})

export const {
  logout,
  clearError,
  updateLastActivity,
  setSessionExpiry,
  updateUser,
} = authSlice.actions

export default authSlice.reducer
