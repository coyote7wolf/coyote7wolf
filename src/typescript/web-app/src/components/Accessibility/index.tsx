/**
 * 無障礙功能組件
 *
 * 提供可重用的無障礙功能組件
 */

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { useAccessibility } from '@/hooks/useAccessibility'

// 跳過連結組件
interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = '',
}) => {
  return (
    <a
      href={href}
      className={`skip-link ${className}`}
      onFocus={e => {
        const target = document.querySelector(href)
        if (target) {
          ;(target as HTMLElement).setAttribute('tabindex', '-1')
        }
      }}
    >
      {children}
    </a>
  )
}

// 無障礙公告組件
interface AnnouncementProps {
  message: string
  priority?: 'polite' | 'assertive'
  id?: string
}

export const Announcement: React.FC<AnnouncementProps> = ({
  message,
  priority = 'polite',
  id = 'announcement-region',
}) => {
  const { screenReader } = useAccessibility()

  useEffect(() => {
    if (message) {
      screenReader.announce(message, priority)
    }
  }, [message, priority, screenReader])

  return (
    <div id={id} aria-live={priority} aria-atomic="true" className="sr-only">
      {message}
    </div>
  )
}

// 焦點陷阱組件
interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  onEscape?: () => void
  className?: string
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active,
  onEscape,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { focus } = useAccessibility()

  useEffect(() => {
    if (active && containerRef.current) {
      // 使用 KeyboardNavigation 直接進行焦點陷阱
      const keyboardNav = new (require('@/accessibility').KeyboardNavigation)()
      const cleanup = keyboardNav.trapFocus(containerRef.current)

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onEscape) {
          onEscape()
        }
      }

      document.addEventListener('keydown', handleEscape)

      return () => {
        cleanup()
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [active, focus, onEscape])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// 可訪問的按鈕組件
interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  children: React.ReactNode
}

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    useImperativeHandle(ref, () => buttonRef.current!)

    const baseClasses = 'accessible-button'
    const variantClasses = {
      primary: 'accessible-button-primary',
      secondary: 'accessible-button-secondary',
      danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
    }
    const sizeClasses = {
      small: 'text-sm px-3 py-1.5',
      medium: 'text-base px-4 py-2',
      large: 'text-lg px-6 py-3',
    }

    return (
      <button
        ref={buttonRef}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="loading-spinner mr-2" aria-hidden="true" />
        )}
        <span className={loading ? 'sr-only' : ''}>{children}</span>
        {loading && (
          <span aria-live="polite" className="sr-only">
            Loading...
          </span>
        )}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// 可訪問的輸入框組件
interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
  required?: boolean
}

export const AccessibleInput = forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(
  (
    { label, error, helpText, required = false, id, className = '', ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${inputId}-error` : undefined
    const helpId = helpText ? `${inputId}-help` : undefined

    const describedBy = [errorId, helpId].filter(Boolean).join(' ')

    return (
      <div className="form-field">
        <label
          htmlFor={inputId}
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          className={`form-input ${error ? 'error-input' : ''} ${className}`}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          {...props}
        />

        {helpText && (
          <div id={helpId} className="form-help-text">
            {helpText}
          </div>
        )}

        {error && (
          <div id={errorId} className="form-error-text" role="alert">
            <span className="form-error-icon" aria-hidden="true">
              ⚠
            </span>
            {error}
          </div>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

// 可訪問的模態視窗組件
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const { focus, announcements } = useAccessibility()

  useEffect(() => {
    if (isOpen) {
      // 保存當前焦點
      focus.saveFocus()

      // 公告模態視窗開啟
      announcements.makeAnnouncement(`${title} dialog opened`)

      // 設置焦點到模態視窗
      if (modalRef.current) {
        modalRef.current.focus()
      }
    } else {
      // 恢復焦點
      focus.restoreFocus()

      // 公告模態視窗關閉
      announcements.makeAnnouncement('Dialog closed')
    }
  }, [isOpen, title, focus, announcements])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <FocusTrap active={isOpen} onEscape={onClose}>
        <div
          ref={modalRef}
          className={`modal-content ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>

          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>

          <div className="modal-body">{children}</div>
        </div>
      </FocusTrap>
    </div>
  )
}

// 可訪問的進度條組件
interface AccessibleProgressProps {
  value: number
  max?: number
  label: string
  showPercentage?: boolean
  className?: string
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const { announcements } = useAccessibility()

  useEffect(() => {
    // 在特定里程碑時公告進度
    if (
      percentage === 25 ||
      percentage === 50 ||
      percentage === 75 ||
      percentage === 100
    ) {
      announcements.makeAnnouncement(
        `${label}: ${Math.round(percentage)}% complete`
      )
    }
  }, [percentage, label, announcements])

  return (
    <div className={`progress-container ${className}`}>
      <div className="progress-label">
        {label}
        {showPercentage && (
          <span className="progress-percentage">{Math.round(percentage)}%</span>
        )}
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="progress-bar-fill" data-width={percentage} />
        <div className="progress-bar-text sr-only">
          {Math.round(percentage)}% complete
        </div>
      </div>
    </div>
  )
}

// 可訪問的工具提示組件
interface AccessibleTooltipProps {
  content: string
  children: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export const AccessibleTooltip: React.FC<AccessibleTooltipProps> = ({
  content,
  children,
  placement = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div
      className={`tooltip ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <div aria-describedby={tooltipId} tabIndex={0}>
        {children}
      </div>

      <div
        id={tooltipId}
        className={`tooltip-content tooltip-${placement} ${isVisible ? 'tooltip-visible' : 'tooltip-hidden'}`}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        {content}
      </div>
    </div>
  )
}

// 可訪問的麵包屑導航組件
interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface AccessibleBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export const AccessibleBreadcrumb: React.FC<AccessibleBreadcrumbProps> = ({
  items,
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.current ? (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a href={item.href} className="breadcrumb-link">
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// 可訪問的表格組件
interface TableColumn {
  header: string
  accessor: string
  sortable?: boolean
}

interface AccessibleTableProps {
  columns: TableColumn[]
  data: Record<string, any>[]
  caption?: string
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string) => void
  className?: string
}

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  columns,
  data,
  caption,
  sortColumn,
  sortDirection,
  onSort,
  className = '',
}) => {
  return (
    <table className={`accessible-table ${className}`}>
      {caption && <caption>{caption}</caption>}

      <thead>
        <tr>
          {columns.map(column => (
            <th
              key={column.accessor}
              scope="col"
              className={column.sortable ? 'sortable' : ''}
              aria-sort={
                sortColumn === column.accessor
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : column.sortable
                    ? 'none'
                    : undefined
              }
            >
              {column.sortable && onSort ? (
                <button
                  className="table-sort-button"
                  onClick={() => onSort(column.accessor)}
                  aria-label={`Sort by ${column.header}`}
                >
                  {column.header}
                  {sortColumn === column.accessor && (
                    <span aria-hidden="true">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              ) : (
                column.header
              )}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map(column => (
              <td key={column.accessor}>{row[column.accessor]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export { useAccessibility } from '@/hooks/useAccessibility'
