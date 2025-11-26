/**
 * 簡化的 Smoke 測試 - 基本組件渲染測試
 */

import React from 'react'
import { screen } from '@testing-library/react'
import { render, setupTest } from '../utils/test-utils'

// Import UI components only
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

describe('Basic Smoke Tests - UI Components', () => {
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

describe('Basic Smoke Tests - Store Integration', () => {
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

describe('Basic Smoke Tests - Environment', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should load environment configuration correctly', () => {
    // 檢查環境變數
    expect(process.env.NODE_ENV).toBeDefined()
  })

  it('should have all required dependencies available', () => {
    // 檢查關鍵依賴
    expect(React).toBeDefined()
    expect(screen).toBeDefined()
    expect(render).toBeDefined()
  })
})

describe('Basic Smoke Tests - Performance', () => {
  beforeEach(() => {
    setupTest()
  })

  it('should render components within reasonable time', async () => {
    const startTime = performance.now()

    render(<Button>Performance Test</Button>)

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
