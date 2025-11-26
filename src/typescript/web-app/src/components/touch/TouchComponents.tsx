/**
 * Touch-Optimized Components Demo
 *
 * Examples of touch-optimized UI components with gesture support
 */

'use client'

import React, { useState } from 'react'
import {
  useTouchGestures,
  usePinchGesture,
  useDoubleTap,
  useTouchDevice,
  TouchOptimized,
  TouchFeedback,
  touchStyles,
  SwipeGesture,
} from '@/utils/touchOptimization'
import '@/styles/touch-optimization.css'

// Touch-optimized button component
export function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  hapticFeedback = true,
  className = '',
  type = 'button',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  hapticFeedback?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const handleClick = () => {
    if (disabled) return

    if (hapticFeedback) {
      TouchFeedback.hapticFeedback('light')
    }

    onClick?.()
  }

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizeClasses = {
    sm: 'min-h-[40px] px-3 text-sm',
    md: 'min-h-[48px] px-6 text-base',
    lg: 'min-h-[56px] px-8 text-lg',
  }

  return (
    <button
      className={`
        touch-button touch-feedback touch-no-select
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

// Swipeable card component
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}: {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}) {
  const [isSwipeActive, setIsSwipeActive] = useState(false)

  const handleSwipe = (gesture: SwipeGesture) => {
    setIsSwipeActive(false)

    if (gesture.direction === 'left' && onSwipeLeft) {
      TouchFeedback.hapticFeedback('medium')
      onSwipeLeft()
    } else if (gesture.direction === 'right' && onSwipeRight) {
      TouchFeedback.hapticFeedback('medium')
      onSwipeRight()
    }
  }

  return (
    <TouchOptimized
      onSwipe={handleSwipe}
      className={`
        touch-card touch-swipe-indicator
        ${isSwipeActive ? 'swiping' : ''}
        ${className}
      `}
      hapticFeedback={false}
    >
      {children}
    </TouchOptimized>
  )
}

// Pinch-to-zoom image component
export function PinchableImage({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  const { ref, isPinching, scale } = usePinchGesture()

  return (
    <div ref={ref} className={`touch-pinchable overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-transform duration-150 ${isPinching ? 'scale-110' : 'scale-100'}`}
      />
      {isPinching && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {(scale * 100).toFixed(0)}%
        </div>
      )}
    </div>
  )
}

// Touch-optimized navigation
export function TouchNav({
  items,
  onItemClick,
  className = '',
}: {
  items: { id: string; label: string; icon?: React.ReactNode }[]
  onItemClick?: (id: string) => void
  className?: string
}) {
  return (
    <nav className={`touch-nav ${className}`}>
      {items.map(item => (
        <TouchOptimized
          key={item.id}
          onTap={() => onItemClick?.(item.id)}
          className="touch-nav-item"
          hapticFeedback={true}
        >
          {item.icon && <span className="text-xl">{item.icon}</span>}
          <span className="font-medium">{item.label}</span>
        </TouchOptimized>
      ))}
    </nav>
  )
}

// Double-tap to like component
export function DoubleTapLike({
  isLiked = false,
  onToggle,
  children,
  className = '',
}: {
  isLiked?: boolean
  onToggle?: (liked: boolean) => void
  children: React.ReactNode
  className?: string
}) {
  const [liked, setLiked] = useState(isLiked)

  const { handleTap } = useDoubleTap(() => {
    const newLiked = !liked
    setLiked(newLiked)
    onToggle?.(newLiked)
    TouchFeedback.hapticFeedback('medium')
  })

  return (
    <div className={`relative ${className}`} onClick={handleTap}>
      {children}
      {liked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-ping">❤️</div>
        </div>
      )}
    </div>
  )
}

// Touch device info component
export function TouchDeviceInfo() {
  const { isTouchDevice, touchPoints, isMultiTouch } = useTouchDevice()

  return (
    <div className="touch-card">
      <h3 className="font-semibold mb-3">Touch Device Info</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Touch Device:</span>
          <span className={isTouchDevice ? 'text-green-600' : 'text-red-600'}>
            {isTouchDevice ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Touch Points:</span>
          <span>{touchPoints}</span>
        </div>
        <div className="flex justify-between">
          <span>Multi-touch:</span>
          <span className={isMultiTouch ? 'text-green-600' : 'text-red-600'}>
            {isMultiTouch ? 'Supported' : 'Not Supported'}
          </span>
        </div>
      </div>
    </div>
  )
}

// Touch-optimized form
export function TouchForm({
  onSubmit,
  className = '',
}: {
  onSubmit?: (data: any) => void
  className?: string
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    TouchFeedback.hapticFeedback('medium')
    onSubmit?.(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`touch-mobile-spacing space-y-6 ${className}`}
    >
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e =>
            setFormData(prev => ({ ...prev, name: e.target.value }))
          }
          className="touch-input w-full"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={e =>
            setFormData(prev => ({ ...prev, email: e.target.value }))
          }
          className="touch-input w-full"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          value={formData.message}
          onChange={e =>
            setFormData(prev => ({ ...prev, message: e.target.value }))
          }
          className="touch-input w-full min-h-[120px] resize-none"
          placeholder="Enter your message"
          rows={4}
        />
      </div>

      <TouchButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full touch-mobile-button"
      >
        Send Message
      </TouchButton>
    </form>
  )
}

export default TouchButton
