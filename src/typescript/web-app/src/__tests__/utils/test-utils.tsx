import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import documentsReducer from '@/store/slices/documentsSlice'
import uiReducer from '@/store/slices/uiSlice'
import realtimeReducer from '@/store/slices/realtimeSlice'
import templatesReducer from '@/store/slices/templatesSlice'
import activitiesReducer from '@/store/slices/activitiesSlice'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any
  store?: any
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        documents: documentsReducer,
        ui: uiReducer,
        realtime: realtimeReducer,
        templates: templatesReducer,
        activities: activitiesReducer,
      } as any, // 暫時使用 any 避免類型錯誤
      preloadedState,
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST'],
          },
        }),
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export * from '@testing-library/react'
export { renderWithProviders as render }

// Mock data helpers
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar: '/avatars/test-avatar.jpg',
  role: 'user' as const,
  preferences: {
    theme: 'light' as const,
    language: 'en' as const,
  },
}

export const mockDocument = {
  id: 'test-doc-id',
  title: 'Test Document',
  content: 'Test content',
  type: 'document' as const,
  status: 'draft' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  authorId: 'test-user-id',
  tags: ['test'],
  metadata: {},
}

export const mockAuthState = {
  user: mockUser,
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
}

export const mockDocumentsState = {
  documents: [mockDocument],
  currentDocument: mockDocument,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    type: 'all' as const,
    status: 'all' as const,
    tags: [],
  },
}

// Test utilities
export const waitFor = (callback: () => void, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const check = () => {
      try {
        callback()
        resolve(true)
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error)
        } else {
          setTimeout(check, 10)
        }
      }
    }
    check()
  })
}

// Mock localStorage
export const createMockLocalStorage = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
})

// Mock window.location
export const createMockLocation = () => ({
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  replace: jest.fn(),
  assign: jest.fn(),
})

// Setup function for each test
export const setupTest = () => {
  // Reset all mocks
  jest.clearAllMocks()

  const mockLocalStorage = createMockLocalStorage()
  const mockLocation = createMockLocation()

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })

  // Mock location
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  })

  // Mock fetch
  const mockFetch = jest.fn()
  global.fetch = mockFetch

  return {
    mockLocalStorage,
    mockLocation,
    mockFetch: mockFetch as jest.MockedFunction<typeof fetch>,
  }
}
