/**
 * Product Tour Component
 *
 * Provides an interactive onboarding experience with floating tooltips
 * that guide users through the application features
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components'
import styles from './ProductTour.module.css'

export interface TourStep {
  id: string
  target: string // CSS selector for the target element
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  showSkip?: boolean
  showPrevious?: boolean
  showNext?: boolean
  onBeforeShow?: () => void
  onAfterShow?: () => void
}

export interface ProductTourProps {
  steps: TourStep[]
  isActive: boolean
  onStart?: () => void
  onComplete?: () => void
  onSkip?: () => void
  autoStart?: boolean
  showProgress?: boolean
  theme?: 'light' | 'dark'
}

export function ProductTour({
  steps,
  isActive,
  onStart,
  onComplete,
  onSkip,
  autoStart = false,
  showProgress = true,
  theme = 'light',
}: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Auto start tour
  useEffect(() => {
    if (autoStart && isActive && steps.length > 0) {
      startTour()
    }
  }, [autoStart, isActive, steps.length])

  // Update target element and position when step changes
  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      updateTargetElement()
    }
  }, [currentStep, isVisible])

  // Update CSS variables for dynamic positioning
  useEffect(() => {
    if (targetElement && overlayRef.current) {
      const rect = targetElement.getBoundingClientRect()
      const spotlightEl = overlayRef.current.querySelector(
        `.${styles.spotlight}`
      ) as HTMLElement
      if (spotlightEl) {
        spotlightEl.style.setProperty('--spotlight-left', `${rect.left - 8}px`)
        spotlightEl.style.setProperty('--spotlight-top', `${rect.top - 8}px`)
        spotlightEl.style.setProperty(
          '--spotlight-width',
          `${rect.width + 16}px`
        )
        spotlightEl.style.setProperty(
          '--spotlight-height',
          `${rect.height + 16}px`
        )
      }
    }

    if (tooltipRef.current) {
      tooltipRef.current.style.setProperty(
        '--tooltip-left',
        `${tooltipPosition.x}px`
      )
      tooltipRef.current.style.setProperty(
        '--tooltip-top',
        `${tooltipPosition.y}px`
      )
    }

    if (progressRef.current) {
      const progressWidth = ((currentStep + 1) / steps.length) * 100
      progressRef.current.style.setProperty(
        '--progress-width',
        `${progressWidth}%`
      )
    }
  }, [targetElement, tooltipPosition, currentStep, steps.length])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isVisible && targetElement) {
        updateTooltipPosition()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isVisible, targetElement])

  const startTour = () => {
    setCurrentStep(0)
    setIsVisible(true)
    onStart?.()
  }

  const updateTargetElement = () => {
    const step = steps[currentStep]
    if (!step) return

    const element = document.querySelector(step.target) as HTMLElement
    if (element) {
      setTargetElement(element)

      // Call onBeforeShow callback
      step.onBeforeShow?.()

      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })

      // Wait for scroll to complete, then position tooltip
      setTimeout(() => {
        updateTooltipPosition()
        step.onAfterShow?.()
      }, 500)
    }
  }

  const updateTooltipPosition = () => {
    if (!targetElement || !tooltipRef.current) return

    const targetRect = targetElement.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const step = steps[currentStep]
    if (!step) return

    const position = step.position || 'bottom'

    let x = 0
    let y = 0

    switch (position) {
      case 'top':
        x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
        y = targetRect.top - tooltipRect.height - 16
        break
      case 'bottom':
        x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
        y = targetRect.bottom + 16
        break
      case 'left':
        x = targetRect.left - tooltipRect.width - 16
        y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
        break
      case 'right':
        x = targetRect.right + 16
        y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
        break
      case 'center':
        x = window.innerWidth / 2 - tooltipRect.width / 2
        y = window.innerHeight / 2 - tooltipRect.height / 2
        break
    }

    // Keep tooltip within viewport
    x = Math.max(16, Math.min(x, window.innerWidth - tooltipRect.width - 16))
    y = Math.max(16, Math.min(y, window.innerHeight - tooltipRect.height - 16))

    setTooltipPosition({ x, y })
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    setIsVisible(false)
    setTargetElement(null)
    onSkip?.()
  }

  const completeTour = () => {
    setIsVisible(false)
    setTargetElement(null)
    onComplete?.()
  }

  if (!isActive || !isVisible || steps.length === 0) {
    return null
  }

  const step = steps[currentStep]
  if (!step) {
    return null
  }

  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div
        ref={overlayRef}
        className={`${styles.overlay} ${styles[theme]}`}
        onClick={skipTour}
      >
        {targetElement && <div className={styles.spotlight} />}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`${styles.tooltip} ${styles[theme]} ${styles.positionedTooltip}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress indicator */}
        {showProgress && (
          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} ref={progressRef} />
            </div>
            <span className={styles.progressText}>
              {currentStep + 1} / {steps.length}
            </span>
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.title}>{step.title}</h3>
          <p className={styles.description}>{step.content}</p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {step.showSkip !== false && (
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className={styles.skipButton || ''}
            >
              跳過導覽
            </Button>
          )}

          <div className={styles.navigation}>
            {!isFirstStep && step.showPrevious !== false && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className={styles.prevButton || ''}
              >
                上一步
              </Button>
            )}

            {step.showNext !== false && (
              <Button
                variant="solid"
                colorScheme="primary"
                size="sm"
                onClick={nextStep}
                className={styles.nextButton || ''}
              >
                {isLastStep ? '完成' : '下一步'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductTour
