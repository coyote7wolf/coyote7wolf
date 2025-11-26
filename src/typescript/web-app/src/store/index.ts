import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import documentsReducer from './slices/documentsSlice'
import uiReducer from './slices/uiSlice'
import realtimeReducer from './slices/realtimeSlice'
import templatesReducer from './slices/templatesSlice'
import activitiesReducer from './slices/activitiesSlice'
// import userReducer from './slices/userSlice'
// import notificationsReducer from './slices/notificationsSlice'

/**
 * Redux Store Configuration with Enterprise Integration
 *
 * Enhanced Redux store configuration with:
 * - All necessary slices for user management
 * - Analytics integration for state tracking
 * - Enterprise system integration
 * - Type-safe configuration
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
    ui: uiReducer,
    realtime: realtimeReducer,
    templates: templatesReducer,
    activities: activitiesReducer,
    // user: userReducer,
    // notifications: notificationsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore certain action types that might contain non-serializable values
        ignoredActions: [
          'auth/loginPending',
          'documents/syncUpdate',
          'realtime/connectionUpdate',
          'templates/fetchTemplates/pending',
          'activities/fetchActivities/pending',
          'persist/PERSIST',
          'persist/REHYDRATE',
          'user/updateProfilePicture',
        ],
        // Ignore certain paths in the state that contain non-serializable data
        ignoredPaths: [
          'realtime.socket',
          'auth.lastActivity',
          'ui.modals',
          'user.uploadProgress',
          'notifications.soundEnabled',
          'templates.lastFetch',
          'activities.lastFetch',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/**
 * Store subscription for analytics and enterprise system integration
 */
let previousState = store.getState()

store.subscribe(() => {
  const currentState = store.getState()

  // Track authentication state changes for analytics
  if (
    currentState.auth.isAuthenticated !== previousState.auth.isAuthenticated
  ) {
    if (typeof window !== 'undefined') {
      import('@/utils/analytics').then(({ analytics }) => {
        analytics.track('auth_state_changed', {
          isAuthenticated: currentState.auth.isAuthenticated,
          userId: currentState.auth.user?.id,
          timestamp: new Date().toISOString(),
        })
      })
    }
  }

  // Track theme changes for user experience analytics
  if (currentState.ui.theme !== previousState.ui.theme) {
    if (typeof window !== 'undefined') {
      import('@/utils/analytics').then(({ analytics }) => {
        analytics.track('theme_changed', {
          theme: currentState.ui.theme,
          userId: currentState.auth.user?.id,
          timestamp: new Date().toISOString(),
        })
      })
    }
  }

  // Track document operations for usage analytics
  if (
    currentState.documents.documents.length !==
    previousState.documents.documents.length
  ) {
    if (typeof window !== 'undefined') {
      import('@/utils/analytics').then(({ analytics }) => {
        analytics.track('documents_count_changed', {
          previousCount: previousState.documents.documents.length,
          currentCount: currentState.documents.documents.length,
          userId: currentState.auth.user?.id,
          timestamp: new Date().toISOString(),
        })
      })
    }
  }

  // Track template operations for usage analytics
  if (
    currentState.templates.templates.length !==
    previousState.templates.templates.length
  ) {
    if (typeof window !== 'undefined') {
      import('@/utils/analytics').then(({ analytics }) => {
        analytics.track('templates_count_changed', {
          previousCount: previousState.templates.templates.length,
          currentCount: currentState.templates.templates.length,
          userId: currentState.auth.user?.id,
          timestamp: new Date().toISOString(),
        })
      })
    }
  }

  // Track activity creation for user engagement analytics
  if (
    currentState.activities.activities.length !==
    previousState.activities.activities.length
  ) {
    if (typeof window !== 'undefined') {
      import('@/utils/analytics').then(({ analytics }) => {
        analytics.track('activities_count_changed', {
          previousCount: previousState.activities.activities.length,
          currentCount: currentState.activities.activities.length,
          userId: currentState.auth.user?.id,
          timestamp: new Date().toISOString(),
        })
      })
    }
  }

  // Track user profile updates (temporarily disabled - user slice not yet integrated)
  // if (currentState.user?.profile !== previousState.user?.profile) {
  //   if (typeof window !== 'undefined') {
  //     import('@/utils/analytics').then(({ analytics }) => {
  //       analytics.track('user_profile_updated', {
  //         userId: currentState.auth.user?.id,
  //         timestamp: new Date().toISOString()
  //       })
  //     })
  //   }
  // }

  previousState = currentState
})

export default store
