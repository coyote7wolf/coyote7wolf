import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

/**
 * User Profile Interface
 */
export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
  avatar?: string
  company?: string
  role: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    emailNotifications: boolean
    pushNotifications: boolean
    marketing: boolean
  }
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise'
    status: 'active' | 'cancelled' | 'expired'
    renewalDate?: string
  }
  stats: {
    documentsCreated: number
    documentsShared: number
    lastLogin: string
    accountCreated: string
  }
}

export interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null
  uploadProgress: number
  hasUnsavedChanges: boolean
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  uploadProgress: 0,
  hasUnsavedChanges: false,
}

/**
 * Async Thunks for user operations
 */
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock user profile data
      const mockProfile: UserProfile = {
        id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Senior Developer with expertise in React and TypeScript.',
        // avatar is optional, so we don't include it
        company: 'Tech Solutions Inc.',
        role: 'Senior Developer',
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'America/New_York',
          emailNotifications: true,
          pushNotifications: true,
          marketing: false,
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          renewalDate: '2024-12-31',
        },
        stats: {
          documentsCreated: 127,
          documentsShared: 43,
          lastLogin: new Date().toISOString(),
          accountCreated: '2023-01-15T10:30:00Z',
        },
      }

      return mockProfile
    } catch (error) {
      return rejectWithValue('Failed to fetch user profile')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      return updates
    } catch (error) {
      return rejectWithValue('Failed to update user profile')
    }
  }
)

export const uploadProfilePicture = createAsyncThunk(
  'user/uploadProfilePicture',
  async (file: File, { dispatch, rejectWithValue }) => {
    try {
      // Simulate file upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        dispatch(userSlice.actions.setUploadProgress(progress))
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Mock uploaded file URL
      const mockUrl = `https://example.com/avatars/${Date.now()}.jpg`
      return mockUrl
    } catch (error) {
      return rejectWithValue('Failed to upload profile picture')
    }
  }
)

/**
 * User Slice
 */
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    setUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.hasUnsavedChanges = action.payload
    },
    updateProfileField: (
      state,
      action: PayloadAction<{ field: keyof UserProfile; value: any }>
    ) => {
      if (state.profile) {
        const { field, value } = action.payload
        ;(state.profile as any)[field] = value
        state.hasUnsavedChanges = true
      }
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserProfile['preferences']>>
    ) => {
      if (state.profile) {
        state.profile.preferences = {
          ...state.profile.preferences,
          ...action.payload,
        }
        state.hasUnsavedChanges = true
      }
    },
    clearError: state => {
      state.error = null
    },
    clearProfile: state => {
      state.profile = null
      state.hasUnsavedChanges = false
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.hasUnsavedChanges = false
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Update user profile
      .addCase(updateUserProfile.pending, state => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload }
        }
        state.hasUnsavedChanges = false
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

      // Upload profile picture
      .addCase(uploadProfilePicture.pending, state => {
        state.uploadProgress = 0
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.avatar = action.payload
        }
        state.uploadProgress = 0
        state.hasUnsavedChanges = false
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.uploadProgress = 0
        state.error = action.payload as string
      })
  },
})

export const {
  setUploadProgress,
  setUnsavedChanges,
  updateProfileField,
  updatePreferences,
  clearError,
  clearProfile,
} = userSlice.actions

export default userSlice.reducer
