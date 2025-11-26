import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {User} from '../types'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (
      state,
      action: PayloadAction<{user: User; token: string}>,
    ) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.isLoading = false
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.isLoading = false
      state.error = action.payload
    },
    logout: state => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.isLoading = false
      state.error = null
    },
    clearError: state => {
      state.error = null
    },
  },
})

export const {loginStart, loginSuccess, loginFailure, logout, clearError} =
  authSlice.actions
export default authSlice.reducer
