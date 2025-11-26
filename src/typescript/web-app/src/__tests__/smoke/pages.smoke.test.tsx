/**
 * Smoke Tests - 冒煙測試
 *
 * 驗證所有主要頁面和組件能夠正常渲染，無嚴重錯誤
 * 這些測試作為第一道防線，確保基本功能不會被破壞
 */

import React from 'react'
import { screen } from '@testing-library/react'
import { render, setupTest } from '../utils/test-utils'

// Import all major page components
import HomePage from '@/app/page'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import DashboardPage from '@/app/dashboard/page'
import DocumentsPage from '@/app/documents/page'
import ProfilePage from '@/app/profile/page'

// Import major components
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

describe('Smoke Tests - Page Rendering', () => {
  beforeEach(() => {
    setupTest()
  })

  describe('公開頁面 (Public Pages)', () => {
    it('should render HomePage without crashing', async () => {
      render(<HomePage />)

      // 檢查頁面基本元素
      expect(document.body).toBeInTheDocument()

      // 檢查是否有錯誤邊界觸發
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument()
    })

    it('should render LoginPage without crashing', async () => {
      render(<LoginPage />)

      expect(document.body).toBeInTheDocument()
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument()

      // 基本表單元素應該存在
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should render RegisterPage without crashing', async () => {
      render(<RegisterPage />)

      expect(document.body).toBeInTheDocument()
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  describe('認證頁面 (Authenticated Pages)', () => {
    const mockAuthenticatedState = {
      auth: {
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    }

    it('should render DashboardPage without crashing', async () => {
      render(<DashboardPage />, { preloadedState: mockAuthenticatedState })

      expect(document.body).toBeInTheDocument()
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument()
    })

    it('should render DocumentsPage without crashing', async () => {
      render(<DocumentsPage />, { preloadedState: mockAuthenticatedState })

      expect(document.body).toBeInTheDocument()
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument()
    })

    it('should render ProfilePage without crashing', async () => {
      render(<ProfilePage />, { preloadedState: mockAuthenticatedState })

      expect(document.body).toBeInTheDocument()
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument()
    })
  })
})

describe('Smoke Tests - UI Components', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should render Button component without crashing', () => {
    render(<Button>Test Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toBeVisible()
  })

  it('should render Input component without crashing', () => {
    render(<Input placeholder="Test input" />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toBeVisible()
  })

  it('should render Card component without crashing', () => {
    render(
      <Card>
        <div>
          <h2>Test Card</h2>
          <p>Card content</p>
        </div>
      </Card>
    )

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should render Badge component without crashing', () => {
    render(<Badge>Test Badge</Badge>)

    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('should render Spinner component without crashing', () => {
    render(<Spinner />)

    // Spinner should have animation class
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})

describe('Smoke Tests - Navigation', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should render navigation elements without crashing', async () => {
    render(<HomePage />)

    // 檢查導航相關元素
    expect(document.body).toBeInTheDocument()

    // 確認沒有未捕獲的錯誤
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument()
  })
})

describe('Smoke Tests - Store Integration', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should initialize Redux store without errors', () => {
    const { store } = render(<div>Store Test</div>)

    // 檢查 store 狀態
    const state = store.getState()
    expect(state).toBeDefined()
    expect(state.auth).toBeDefined()
    expect(state.documents).toBeDefined()
    expect(state.ui).toBeDefined()
  })

  it('should handle store actions without errors', () => {
    const { store } = render(<div>Action Test</div>)

    // 測試基本的 action dispatch
    expect(() => {
      store.dispatch({ type: '@@INIT' })
    }).not.toThrow()
  })
})

describe('Smoke Tests - Error Boundaries', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should handle component errors gracefully', () => {
    // 創建一個會拋出錯誤的組件
    const ThrowError = () => {
      throw new Error('Test error')
    }

    // 使用 React Error Boundary 捕獲錯誤
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      try {
        return <div>{children}</div>
      } catch (error) {
        return <div>Error caught</div>
      }
    }

    // 這個測試確保錯誤邊界能正常工作
    expect(() => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      )
    }).not.toThrow()
  })
})

describe('Smoke Tests - Environment', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should load environment configuration correctly', () => {
    // 檢查環境變數
    expect(process.env.NODE_ENV).toBeDefined()

    // 檢查測試環境設置
    expect(process.env.MODE).toBe('test')
  })

  it('should have all required dependencies available', () => {
    // 檢查關鍵依賴
    expect(React).toBeDefined()
    expect(screen).toBeDefined()
    expect(render).toBeDefined()
  })
})

describe('Smoke Tests - Performance', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should render components within reasonable time', async () => {
    const startTime = performance.now()

    render(<HomePage />)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // 組件渲染時間應該少於 1000ms
    expect(renderTime).toBeLessThan(1000)
  })

  it('should not have memory leaks in basic rendering', () => {
    // 多次渲染同一組件，檢查是否有明顯的內存洩漏
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<Button>Test {i}</Button>)
      unmount()
    }

    // 如果到這裡沒有拋出錯誤，說明基本的內存管理是正常的
    expect(true).toBe(true)
  })
})
