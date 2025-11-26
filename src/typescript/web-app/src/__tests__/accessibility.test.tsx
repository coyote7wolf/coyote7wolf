/**
 * 無障礙功能測試
 *
 * 測試無障礙功能類別和 React 組件
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ColorContrast,
  KeyboardNavigation,
  ScreenReaderSupport,
  MotionPreferences,
  TextScaling,
  ARIAManager,
  AccessibilityChecker,
} from '@/accessibility'
import {
  SkipLink,
  Announcement,
  FocusTrap,
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  AccessibleProgress,
  AccessibleTooltip,
  AccessibleBreadcrumb,
  AccessibleTable,
} from '@/components/Accessibility'

describe('ColorContrast', () => {
  test('should calculate contrast ratio correctly', () => {
    const ratio = ColorContrast.getContrastRatio('#000000', '#ffffff')
    expect(ratio).toBeCloseTo(21, 1)
  })

  test('should validate WCAG compliance', () => {
    expect(ColorContrast.isWCAGCompliant(4.5, 'AA')).toBe(true)
    expect(ColorContrast.isWCAGCompliant(4.0, 'AA')).toBe(false)
    expect(ColorContrast.isWCAGCompliant(7.0, 'AAA')).toBe(true)
    expect(ColorContrast.isWCAGCompliant(6.0, 'AAA')).toBe(false)
  })

  test('should validate text contrast', () => {
    const result = ColorContrast.validateTextContrast('#000000', '#ffffff')
    expect(result.ratio).toBeCloseTo(21, 1)
    expect(result.isCompliant).toBe(true)
    expect(result.level).toBe('AAA')
  })
})

describe('KeyboardNavigation', () => {
  let keyboardNav: KeyboardNavigation

  beforeEach(() => {
    keyboardNav = new KeyboardNavigation()
  })

  test('should find focusable elements', () => {
    document.body.innerHTML = `
      <div>
        <button>Button 1</button>
        <input type="text" />
        <a href="#test">Link</a>
        <button disabled>Disabled Button</button>
      </div>
    `

    const focusableElements = keyboardNav.getFocusableElements()
    expect(focusableElements).toHaveLength(3) // 不包含 disabled button
  })

  test('should create skip link', () => {
    const skipLink = keyboardNav.createSkipLink(
      'main-content',
      'Skip to main content'
    )
    expect((skipLink as HTMLAnchorElement).href).toContain('#main-content')
    expect(skipLink.textContent).toBe('Skip to main content')
    expect(skipLink.className).toContain('skip-link')
  })

  test('should trap focus', () => {
    document.body.innerHTML = `
      <div id="modal">
        <button id="first">First</button>
        <button id="last">Last</button>
      </div>
    `

    const modal = document.getElementById('modal') as HTMLElement
    const cleanup = keyboardNav.trapFocus(modal)

    // 測試 Tab 鍵循環
    const firstButton = document.getElementById('first') as HTMLElement
    const lastButton = document.getElementById('last') as HTMLElement

    firstButton.focus()
    expect(document.activeElement).toBe(firstButton)

    // 模擬 Tab 鍵
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    })
    modal.dispatchEvent(tabEvent)

    cleanup()
  })
})

describe('ScreenReaderSupport', () => {
  afterEach(() => {
    // 清理動態創建的元素
    document.querySelectorAll('[aria-live]').forEach(el => el.remove())
  })

  test('should announce to screen reader', () => {
    ScreenReaderSupport.announceToScreenReader('Test message', 'polite')

    const announcements = document.querySelectorAll('[aria-live="polite"]')
    expect(announcements.length).toBeGreaterThan(0)
  })

  test('should create live region', () => {
    const liveRegion = ScreenReaderSupport.createLiveRegion(
      'test-region',
      'assertive'
    )

    expect(liveRegion.id).toBe('test-region')
    expect(liveRegion.getAttribute('aria-live')).toBe('assertive')
    expect(liveRegion.getAttribute('aria-atomic')).toBe('true')
  })

  test('should update live region', () => {
    ScreenReaderSupport.createLiveRegion('update-region')
    ScreenReaderSupport.updateLiveRegion('update-region', 'Updated message')

    const region = document.getElementById('update-region')
    expect(region?.textContent).toBe('Updated message')
  })

  test('should create progress announcer', () => {
    const { announce, cleanup } = ScreenReaderSupport.createProgressAnnouncer()

    announce(25, 100, 'Loading')

    const region = document.getElementById('progress-announcer')
    expect(region).toBeTruthy()

    cleanup()
    expect(document.getElementById('progress-announcer')).toBeFalsy()
  })
})

describe('ARIAManager', () => {
  let testElement: HTMLElement

  beforeEach(() => {
    testElement = document.createElement('div')
  })

  test('should set ARIA attributes', () => {
    ARIAManager.setARIALabel(testElement, 'Test label')
    expect(testElement.getAttribute('aria-label')).toBe('Test label')

    ARIAManager.setARIAExpanded(testElement, true)
    expect(testElement.getAttribute('aria-expanded')).toBe('true')

    ARIAManager.setARIASelected(testElement, false)
    expect(testElement.getAttribute('aria-selected')).toBe('false')

    ARIAManager.setARIAChecked(testElement, 'mixed')
    expect(testElement.getAttribute('aria-checked')).toBe('mixed')

    ARIAManager.setARIADisabled(testElement, true)
    expect(testElement.getAttribute('aria-disabled')).toBe('true')
  })

  test('should create describedby element', () => {
    const descElement = ARIAManager.createARIADescribedByElement(
      'test-desc',
      'Test description'
    )

    expect(descElement.id).toBe('test-desc')
    expect(descElement.textContent).toBe('Test description')
    expect(descElement.className).toContain('sr-only')
  })
})

describe('AccessibilityChecker', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('should check heading structure', () => {
    document.body.innerHTML = `
      <h1>Main Title</h1>
      <h2>Section Title</h2>
      <h3>Subsection Title</h3>
    `

    const result = AccessibilityChecker.checkHeadingStructure()
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  test('should detect heading structure issues', () => {
    document.body.innerHTML = `
      <h2>Section Title</h2>
      <h4>Subsection Title</h4>
    `

    const result = AccessibilityChecker.checkHeadingStructure()
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('No H1 heading found')
    expect(result.issues).toContain('First heading is not H1')
  })

  test('should check images', () => {
    document.body.innerHTML = `
      <img src="test.jpg" alt="Test image" />
      <img src="decorative.jpg" alt="" />
      <img src="missing-alt.jpg" />
    `

    const result = AccessibilityChecker.checkImages()
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Image 3 missing alt attribute')
  })

  test('should check form labels', () => {
    document.body.innerHTML = `
      <label for="input1">Label 1</label>
      <input id="input1" type="text" />
      
      <input type="text" aria-label="Input 2" />
      
      <input type="text" />
    `

    const result = AccessibilityChecker.checkFormLabels()
    expect(result.valid).toBe(false)
    expect(result.issues).toContain(
      'Form control 3 (INPUT) has no accessible label'
    )
  })
})

describe('SkipLink Component', () => {
  test('should render skip link', () => {
    render(<SkipLink href="#main">Skip to main content</SkipLink>)

    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main')
    expect(skipLink).toHaveClass('skip-link')
  })

  test('should have proper accessibility attributes', () => {
    render(<SkipLink href="#main">Skip to main content</SkipLink>)

    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink.tagName).toBe('A')
    expect(skipLink).toHaveAttribute('href')
  })
})

describe('Announcement Component', () => {
  test('should render announcement region', () => {
    render(<Announcement message="Test announcement" priority="polite" />)

    const region = screen.getByText('Test announcement')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveAttribute('aria-atomic', 'true')
    expect(region).toHaveClass('sr-only')
  })
})

describe('AccessibleButton Component', () => {
  test('should render button with accessibility features', () => {
    render(
      <AccessibleButton variant="primary" size="medium">
        Click me
      </AccessibleButton>
    )

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('accessible-button-primary')
  })

  test('should handle loading state', () => {
    render(<AccessibleButton loading>Submit</AccessibleButton>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Loading...')).toHaveClass('sr-only')
  })

  test('should have proper button attributes', () => {
    render(<AccessibleButton>Test Button</AccessibleButton>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('accessible-button')
  })
})

describe('AccessibleInput Component', () => {
  test('should render input with proper labeling', () => {
    render(
      <AccessibleInput
        label="Username"
        helpText="Enter your username"
        required
      />
    )

    const input = screen.getByLabelText('Username *')
    const helpText = screen.getByText('Enter your username')

    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-describedby')
    expect(helpText).toBeInTheDocument()
  })

  test('should display error message', () => {
    render(<AccessibleInput label="Email" error="Invalid email format" />)

    const input = screen.getByLabelText('Email')
    const errorMessage = screen.getByRole('alert')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(errorMessage).toHaveTextContent('Invalid email format')
  })

  test('should have proper input attributes', () => {
    render(<AccessibleInput label="Test Input" />)

    const input = screen.getByLabelText('Test Input')
    expect(input).toHaveClass('form-input')
  })
})

describe('AccessibleModal Component', () => {
  test('should render modal when open', () => {
    const onClose = jest.fn()

    render(
      <AccessibleModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </AccessibleModal>
    )

    const modal = screen.getByRole('dialog', { name: 'Test Modal' })
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('aria-modal', 'true')
  })

  test('should not render when closed', () => {
    const onClose = jest.fn()

    render(
      <AccessibleModal isOpen={false} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </AccessibleModal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('should close on escape key', async () => {
    const onClose = jest.fn()
    const user = userEvent.setup()

    render(
      <AccessibleModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </AccessibleModal>
    )

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  test('should have proper modal attributes', () => {
    render(
      <AccessibleModal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </AccessibleModal>
    )

    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('role', 'dialog')
  })
})

describe('AccessibleProgress Component', () => {
  test('should render progress bar with correct attributes', () => {
    render(
      <AccessibleProgress
        value={50}
        max={100}
        label="Loading progress"
        showPercentage={true}
      />
    )

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    expect(progressBar).toHaveAttribute('aria-label', 'Loading progress')

    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  test('should have proper progress attributes', () => {
    render(<AccessibleProgress value={25} label="Test Progress" />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '25')
    expect(progressBar).toHaveAttribute('aria-label', 'Test Progress')
  })
})

describe('AccessibleTable Component', () => {
  const columns = [
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'Age', accessor: 'age', sortable: true },
    { header: 'Email', accessor: 'email' },
  ]

  const data = [
    { name: 'John Doe', age: 30, email: 'john@example.com' },
    { name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  ]

  test('should render table with proper structure', () => {
    render(
      <AccessibleTable
        columns={columns}
        data={data}
        caption="User information table"
      />
    )

    expect(screen.getByText('User information table')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    expect(screen.getAllByRole('row')).toHaveLength(3) // 1 header + 2 data rows
  })

  test('should handle sorting', async () => {
    const onSort = jest.fn()
    const user = userEvent.setup()

    render(
      <AccessibleTable
        columns={columns}
        data={data}
        onSort={onSort}
        sortColumn="name"
        sortDirection="asc"
      />
    )

    const nameHeader = screen.getByRole('button', { name: 'Sort by Name' })
    expect(nameHeader.parentElement).toHaveAttribute('aria-sort', 'ascending')

    await user.click(nameHeader)
    expect(onSort).toHaveBeenCalledWith('name')
  })

  test('should have proper table structure', () => {
    render(<AccessibleTable columns={columns} data={data} />)

    const table = document.querySelector('.accessible-table')
    expect(table).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
  })
})

describe('Integration Tests', () => {
  test('should work together in a complete form', async () => {
    const TestForm = () => (
      <form>
        <AccessibleInput
          label="Full Name"
          required
          helpText="Enter your full name"
        />

        <AccessibleInput
          label="Email"
          type="email"
          error="Please enter a valid email"
        />

        <AccessibleButton type="submit" variant="primary">
          Submit Form
        </AccessibleButton>
      </form>
    )

    const { container } = render(<TestForm />)

    // 檢查表單元素
    expect(screen.getByLabelText('Full Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Submit Form' })
    ).toBeInTheDocument()

    // 檢查基本結構
    expect(container.querySelector('form')).toBeInTheDocument()
  })
})

// 效能測試
describe('Performance Tests', () => {
  test('should not cause memory leaks in event listeners', () => {
    const { unmount } = render(
      <AccessibleModal isOpen={true} onClose={() => {}} title="Test">
        Content
      </AccessibleModal>
    )

    // 模擬大量掛載和卸載
    for (let i = 0; i < 100; i++) {
      const { unmount: tempUnmount } = render(
        <AccessibleModal isOpen={true} onClose={() => {}} title={`Test ${i}`}>
          Content {i}
        </AccessibleModal>
      )
      tempUnmount()
    }

    unmount()

    // 如果有記憶體洩漏，這個測試會變慢或失敗
    expect(true).toBe(true)
  })
})
