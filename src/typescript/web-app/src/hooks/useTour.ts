/**
 * Product Tour Hook
 *
 * Manages tour state and provides convenient methods for controlling tours
 */

'use client'

import { useState, useEffect } from 'react'
import { TourStep } from '@/components/tour/ProductTour'

export interface UseTourOptions {
  storageKey?: string
  autoStart?: boolean
  skipCondition?: () => boolean
}

export function useTour(steps: TourStep[], options: UseTourOptions = {}) {
  const {
    storageKey = 'product-tour-completed',
    autoStart = true,
    skipCondition,
  } = options

  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Check if tour was already completed
  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === 'true'
    setIsCompleted(completed)

    // Auto start if not completed and conditions are met
    if (!completed && autoStart && !skipCondition?.()) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        setIsActive(true)
      }, 1000)
    }
  }, [storageKey, autoStart, skipCondition])

  const startTour = () => {
    setIsActive(true)
  }

  const completeTour = () => {
    setIsActive(false)
    setIsCompleted(true)
    localStorage.setItem(storageKey, 'true')
  }

  const skipTour = () => {
    setIsActive(false)
    setIsCompleted(true)
    localStorage.setItem(storageKey, 'true')
  }

  const resetTour = () => {
    setIsCompleted(false)
    setIsActive(false)
    localStorage.removeItem(storageKey)
  }

  return {
    isActive,
    isCompleted,
    startTour,
    completeTour,
    skipTour,
    resetTour,
  }
}
