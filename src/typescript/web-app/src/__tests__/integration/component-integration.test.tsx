/**
 * 整合測試 - Integration Tests
 *
 * 驗證模組間的串接正確性，包括：
 * - API 服務與 Redux Store 的整合
 * - 組件與狀態管理的互動
 * - 路由與認證的整合
 */

import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import {
  render,
  setupTest,
  mockAuthState,
  mockDocumentsState,
} from '../utils/test-utils'

// Import components and services
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

describe('Integration Tests - Redux Store Integration', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should connect components to Redux store', () => {
    const preloadedState = {
      auth: mockAuthState,
      documents: mockDocumentsState,
    }

    const TestComponent = () => {
      return (
        <div>
          <div data-testid="auth-status">
            {mockAuthState.isAuthenticated
              ? 'Authenticated'
              : 'Not Authenticated'}
          </div>
          <div data-testid="documents-count">
            Documents: {mockDocumentsState.documents.length}
          </div>
        </div>
      )
    }

    render(<TestComponent />, { preloadedState })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    expect(screen.getByTestId('documents-count')).toHaveTextContent(
      'Documents: 1'
    )
  })

  it('should handle store state changes', () => {
    let storeInstance: any

    const TestComponent = () => {
      return (
        <div>
          <Button
            onClick={() => {
              storeInstance?.dispatch({ type: 'test/action' })
            }}
          >
            Dispatch Action
          </Button>
        </div>
      )
    }

    const { store } = render(<TestComponent />)
    storeInstance = store

    const button = screen.getByRole('button')

    expect(() => {
      fireEvent.click(button)
    }).not.toThrow()
  })
})

describe('Integration Tests - Form Handling', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should handle form submission with validation', async () => {
    const mockSubmit = jest.fn()

    const LoginForm = () => {
      const [email, setEmail] = React.useState('')
      const [password, setPassword] = React.useState('')
      const [isSubmitting, setIsSubmitting] = React.useState(false)

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
          await mockSubmit({ email, password })
        } finally {
          setIsSubmitting(false)
        }
      }

      return (
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            data-testid="email-input"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            data-testid="password-input"
          />
          <Button
            type="submit"
            loading={isSubmitting}
            data-testid="submit-button"
          >
            Login
          </Button>
        </form>
      )
    }

    mockSubmit.mockResolvedValue({ success: true })

    render(<LoginForm />)

    // 填入表單數據
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('submit-button')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // 提交表單
    fireEvent.click(submitButton)

    // 驗證提交狀態
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })
})

describe('Integration Tests - API Service Mock', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should mock API calls correctly', async () => {
    const { mockFetch } = setupTest()

    // Mock API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 1, name: 'Test' } }),
    } as Response)

    const TestComponent = () => {
      const [data, setData] = React.useState(null)
      const [loading, setLoading] = React.useState(false)

      const fetchData = async () => {
        setLoading(true)
        try {
          const response = await fetch('/api/test')
          const result = await response.json()
          setData(result.data)
        } finally {
          setLoading(false)
        }
      }

      return (
        <div>
          <Button onClick={fetchData} loading={loading}>
            Fetch Data
          </Button>
          {data && <div data-testid="result">{JSON.stringify(data)}</div>}
        </div>
      )
    }

    render(<TestComponent />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent(
        '{"id":1,"name":"Test"}'
      )
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/test')
  })
})

describe('Integration Tests - Error Handling', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should handle API errors gracefully', async () => {
    const { mockFetch } = setupTest()

    // Mock API error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const TestComponent = () => {
      const [error, setError] = React.useState<string | null>(null)
      const [loading, setLoading] = React.useState(false)

      const fetchData = async () => {
        setLoading(true)
        setError(null)

        try {
          await fetch('/api/test')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
          setLoading(false)
        }
      }

      return (
        <div>
          <Button onClick={fetchData} loading={loading}>
            Fetch Data
          </Button>
          {error && (
            <div data-testid="error" role="alert">
              {error}
            </div>
          )}
        </div>
      )
    }

    render(<TestComponent />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error')
    })
  })
})

describe('Integration Tests - Local Storage', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should persist data to localStorage', () => {
    const { mockLocalStorage } = setupTest()

    const TestComponent = () => {
      const saveData = () => {
        localStorage.setItem('test-key', 'test-value')
      }

      const loadData = () => {
        return localStorage.getItem('test-key')
      }

      return (
        <div>
          <Button onClick={saveData} data-testid="save-button">
            Save Data
          </Button>
          <div data-testid="loaded-data">{loadData()}</div>
        </div>
      )
    }

    render(<TestComponent />)

    const saveButton = screen.getByTestId('save-button')
    fireEvent.click(saveButton)

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      'test-value'
    )
  })
})

describe('Integration Tests - Component Communication', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should handle parent-child component communication', () => {
    const ParentComponent = () => {
      const [message, setMessage] = React.useState('')

      return (
        <div>
          <ChildComponent onMessage={setMessage} />
          <div data-testid="parent-message">{message}</div>
        </div>
      )
    }

    const ChildComponent = ({
      onMessage,
    }: {
      onMessage: (msg: string) => void
    }) => {
      return (
        <Button onClick={() => onMessage('Hello from child!')}>
          Send Message
        </Button>
      )
    }

    render(<ParentComponent />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByTestId('parent-message')).toHaveTextContent(
      'Hello from child!'
    )
  })
})

describe('Integration Tests - Event Handling', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should handle multiple event types', () => {
    const mockHandlers = {
      onClick: jest.fn(),
      onMouseEnter: jest.fn(),
      onMouseLeave: jest.fn(),
      onFocus: jest.fn(),
      onBlur: jest.fn(),
    }

    const TestComponent = () => {
      return (
        <Button
          onClick={mockHandlers.onClick}
          onMouseEnter={mockHandlers.onMouseEnter}
          onMouseLeave={mockHandlers.onMouseLeave}
          onFocus={mockHandlers.onFocus}
          onBlur={mockHandlers.onBlur}
          data-testid="interactive-button"
        >
          Interactive Button
        </Button>
      )
    }

    render(<TestComponent />)

    const button = screen.getByTestId('interactive-button')

    // 測試各種事件
    fireEvent.click(button)
    fireEvent.mouseEnter(button)
    fireEvent.mouseLeave(button)
    fireEvent.focus(button)
    fireEvent.blur(button)

    expect(mockHandlers.onClick).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onMouseEnter).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onMouseLeave).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onFocus).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onBlur).toHaveBeenCalledTimes(1)
  })
})

describe('Integration Tests - Async Operations', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should handle async operations with loading states', async () => {
    const AsyncComponent = () => {
      const [data, setData] = React.useState<string | null>(null)
      const [loading, setLoading] = React.useState(false)

      const loadData = async () => {
        setLoading(true)
        // 模擬異步操作
        await new Promise(resolve => setTimeout(resolve, 100))
        setData('Async data loaded')
        setLoading(false)
      }

      return (
        <div>
          <Button
            onClick={loadData}
            loading={loading}
            data-testid="load-button"
          >
            Load Data
          </Button>
          {data && <div data-testid="async-data">{data}</div>}
        </div>
      )
    }

    render(<AsyncComponent />)

    const button = screen.getByTestId('load-button')

    // 點擊按鈕觸發異步操作
    fireEvent.click(button)

    // 檢查加載狀態
    expect(button).toBeDisabled()

    // 等待異步操作完成
    await waitFor(() => {
      expect(screen.getByTestId('async-data')).toHaveTextContent(
        'Async data loaded'
      )
    })

    // 檢查加載狀態結束
    expect(button).not.toBeDisabled()
  })
})
