import {configureStore} from '@reduxjs/toolkit'
import {persistStore, persistReducer} from 'redux-persist'
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'

import authReducer from './authSlice'
import documentsReducer from './documentsSlice'
import syncReducer from './syncSlice'
import collaborationReducer from './collaborationSlice'
import offlineReducer from './offlineSlice'
import aiReducer from './aiSlice'

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'documents'], // Only persist auth and documents
}

// Create root reducer
const rootReducer = {
  auth: persistReducer({...persistConfig, key: 'auth'}, authReducer),
  documents: persistReducer(
    {...persistConfig, key: 'documents'},
    documentsReducer,
  ),
  sync: syncReducer, // Don't persist sync state
  collaboration: collaborationReducer, // Don't persist collaboration state
  offline: offlineReducer, // Don't persist offline state
  ai: aiReducer, // Don't persist AI state (temporary data)
}

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: __DEV__,
})

// Create persistor
export const persistor = persistStore(store)

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
