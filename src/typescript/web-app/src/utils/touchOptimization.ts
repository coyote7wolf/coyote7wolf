/**
 * Touch Optimization Utilities
 *
 * Provides touch-optimized interactions for mobile and tablet devices,
 * including gesture handling, touch feedback, and accessibility improvements.
 */

'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  TouchEvent,
} from 'react'

// Extend Window interface for webkit audio context
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export interface TouchGestureOptions {
  threshold?: number
  velocity?: number
  preventDefault?: boolean
  passive?: boolean
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
  duration: number
}

export interface PinchGesture {
  scale: number
  center: { x: number; y: number }
}

export interface TapGesture {
  x: number
  y: number
  timestamp: number
}

/**
 * Hook for touch gesture detection
 */
export function useTouchGestures({
  threshold = 50,
  velocity = 0.3,
  preventDefault = true,
  passive = false,
}: TouchGestureOptions = {}) {
  const [isTouch, setIsTouch] = useState(false)
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchRef = useRef<HTMLElement | null>(null)

  const setRef = useCallback((element: HTMLElement | null) => {
    touchRef.current = element
  }, [])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return

      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      setIsTouch(true)

      if (preventDefault && !passive) {
        e.preventDefault()
      }
    },
    [preventDefault, passive]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStart.current) return

      const touch = e.changedTouches[0]
      if (!touch) return

      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      const deltaTime = Date.now() - touchStart.current.time
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const calculatedVelocity = distance / deltaTime

      // Determine swipe direction
      let direction: SwipeGesture['direction'] | null = null
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          direction = deltaX > 0 ? 'right' : 'left'
        }
      } else {
        if (Math.abs(deltaY) > threshold) {
          direction = deltaY > 0 ? 'down' : 'up'
        }
      }

      const gesture: SwipeGesture | null = direction
        ? {
            direction,
            distance,
            velocity: calculatedVelocity,
            duration: deltaTime,
          }
        : null

      touchStart.current = null
      setIsTouch(false)

      return gesture
    },
    [threshold]
  )

  useEffect(() => {
    const element = touchRef.current
    if (!element) return

    const touchStartHandler = (e: any) => handleTouchStart(e)
    const touchEndHandler = (e: any) => handleTouchEnd(e)

    element.addEventListener('touchstart', touchStartHandler, { passive })
    element.addEventListener('touchend', touchEndHandler, { passive })

    return () => {
      element.removeEventListener('touchstart', touchStartHandler)
      element.removeEventListener('touchend', touchEndHandler)
    }
  }, [handleTouchStart, handleTouchEnd, passive])

  return {
    ref: setRef,
    isTouch,
    handleTouchStart,
    handleTouchEnd,
  }
}

/**
 * Hook for pinch/zoom gestures
 */
export function usePinchGesture() {
  const [isPinching, setIsPinching] = useState(false)
  const [scale, setScale] = useState(1)
  const initialDistance = useRef<number | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
  }, [])

  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    if (!touch1 || !touch2) return 0
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      setIsPinching(true)
      initialDistance.current = getDistance(e.touches)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance.current && isPinching) {
        const currentDistance = getDistance(e.touches)
        const newScale = currentDistance / initialDistance.current
        setScale(newScale)
        e.preventDefault()
      }
    },
    [isPinching]
  )

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false)
    initialDistance.current = null
    setScale(1)
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const touchStartHandler = (e: any) => handleTouchStart(e)
    const touchMoveHandler = (e: any) => handleTouchMove(e)
    const touchEndHandler = () => handleTouchEnd()

    element.addEventListener('touchstart', touchStartHandler, {
      passive: false,
    })
    element.addEventListener('touchmove', touchMoveHandler, { passive: false })
    element.addEventListener('touchend', touchEndHandler)

    return () => {
      element.removeEventListener('touchstart', touchStartHandler)
      element.removeEventListener('touchmove', touchMoveHandler)
      element.removeEventListener('touchend', touchEndHandler)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    ref: setRef,
    isPinching,
    scale,
  }
}

/**
 * Hook for double-tap detection
 */
export function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const tapCount = useRef(0)
  const tapTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleTap = useCallback(() => {
    tapCount.current += 1

    if (tapCount.current === 1) {
      tapTimeout.current = setTimeout(() => {
        tapCount.current = 0
      }, delay)
    } else if (tapCount.current === 2) {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current)
      }
      tapCount.current = 0
      onDoubleTap()
    }
  }, [onDoubleTap, delay])

  return { handleTap }
}

/**
 * Hook for touch device detection
 */
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [touchPoints, setTouchPoints] = useState(0)

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      setIsTouchDevice(hasTouch)
      setTouchPoints(navigator.maxTouchPoints || 0)
    }

    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)

    return () => window.removeEventListener('resize', checkTouchDevice)
  }, [])

  return {
    isTouchDevice,
    touchPoints,
    isMultiTouch: touchPoints > 1,
  }
}

/**
 * Touch feedback utilities
 */
export class TouchFeedback {
  static vibrate(pattern: number | number[] = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  static hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    // For supported devices with haptic feedback
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      }
      navigator.vibrate(patterns[type])
    }
  }

  static playTouchSound(frequency = 800, duration = 100) {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext
        if (!AudioContextClass) return

        const audioContext = new AudioContextClass()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration / 1000
        )

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration / 1000)
      } catch (error) {
        // Silently fail if audio context is not available
      }
    }
  }
}

/**
 * Touch optimization CSS classes
 */
export const touchStyles = {
  // Touch target sizing (minimum 44px)
  touchTarget: 'min-h-[44px] min-w-[44px]',

  // Touch feedback
  touchFeedback: 'active:scale-95 transition-transform duration-150',

  // Prevent text selection on touch
  noSelect: 'select-none',

  // Optimized scrolling
  smoothScroll: 'scroll-smooth overflow-scroll',

  // Touch-friendly spacing
  touchSpacing: 'space-y-4 p-4',

  // Enhanced tap targets
  enhancedTap:
    'relative before:absolute before:inset-0 before:min-h-[44px] before:min-w-[44px] before:flex before:items-center before:justify-center',
}

/**
 * Touch-optimized component wrapper
 */
export function TouchOptimized({
  children,
  onTap,
  onDoubleTap,
  onSwipe,
  className = '',
  hapticFeedback = false,
  preventTextSelection = true,
  enhanceTapTarget = true,
}: {
  children: React.ReactNode
  onTap?: () => void
  onDoubleTap?: () => void
  onSwipe?: (gesture: SwipeGesture) => void
  className?: string
  hapticFeedback?: boolean
  preventTextSelection?: boolean
  enhanceTapTarget?: boolean
}) {
  const { ref: swipeRef, handleTouchStart, handleTouchEnd } = useTouchGestures()
  const { handleTap: doubleTapHandler } = useDoubleTap(
    onDoubleTap || (() => {})
  )
  const { isTouchDevice } = useTouchDevice()

  const handleTouch = useCallback(
    (e: TouchEvent) => {
      const gesture = handleTouchEnd(e)

      if (hapticFeedback) {
        TouchFeedback.hapticFeedback('light')
      }

      if (gesture && onSwipe) {
        onSwipe(gesture)
      } else if (onTap) {
        onTap()
      }

      if (onDoubleTap) {
        doubleTapHandler()
      }
    },
    [
      handleTouchEnd,
      hapticFeedback,
      onSwipe,
      onTap,
      onDoubleTap,
      doubleTapHandler,
    ]
  )

  const combinedClassName = [
    className,
    isTouchDevice ? touchStyles.touchFeedback : '',
    preventTextSelection ? touchStyles.noSelect : '',
    enhanceTapTarget ? touchStyles.touchTarget : '',
  ]
    .filter(Boolean)
    .join(' ')

  return React.createElement(
    'div',
    {
      ref: swipeRef,
      className: combinedClassName,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouch,
    },
    children
  )
}

export default useTouchGestures
