/**
 * 無障礙功能的 React Hooks
 *
 * 提供在 React 組件中使用的無障礙功能
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ColorContrast,
  KeyboardNavigation,
  ScreenReaderSupport,
  MotionPreferences,
  TextScaling,
  ARIAManager,
  AccessibilityChecker,
} from '@/accessibility'

// 鍵盤導航 Hook
export function useKeyboardNavigation() {
  const keyboardNav = useRef(new KeyboardNavigation())

  const trapFocus = useCallback((container: HTMLElement) => {
    return keyboardNav.current.trapFocus(container)
  }, [])

  const getFocusableElements = useCallback((container?: HTMLElement) => {
    return keyboardNav.current.getFocusableElements(container)
  }, [])

  const createSkipLink = useCallback((targetId: string, text: string) => {
    return keyboardNav.current.createSkipLink(targetId, text)
  }, [])

  return {
    trapFocus,
    getFocusableElements,
    createSkipLink,
  }
}

// 螢幕閱讀器支援 Hook
export function useScreenReader() {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      ScreenReaderSupport.announceToScreenReader(message, priority)
    },
    []
  )

  const createLiveRegion = useCallback(
    (id: string, priority: 'polite' | 'assertive' = 'polite') => {
      return ScreenReaderSupport.createLiveRegion(id, priority)
    },
    []
  )

  const updateLiveRegion = useCallback((id: string, message: string) => {
    ScreenReaderSupport.updateLiveRegion(id, message)
  }, [])

  const createProgressAnnouncer = useCallback(() => {
    return ScreenReaderSupport.createProgressAnnouncer()
  }, [])

  return {
    announce,
    createLiveRegion,
    updateLiveRegion,
    createProgressAnnouncer,
  }
}

// 動作偏好 Hook
export function useMotionPreferences() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    MotionPreferences.prefersReducedMotion()
  )

  useEffect(() => {
    const cleanup = MotionPreferences.onMotionPreferenceChange(
      setPrefersReducedMotion
    )
    return cleanup
  }, [])

  return {
    prefersReducedMotion,
  }
}

// 文字縮放 Hook
export function useTextScaling() {
  const [textScale, setTextScale] = useState(() =>
    TextScaling.getCurrentTextScale()
  )

  useEffect(() => {
    const cleanup = TextScaling.onTextScaleChange(setTextScale)
    return cleanup
  }, [])

  return {
    textScale,
    isLargeText: textScale > 1.2,
    isSmallText: textScale < 0.8,
  }
}

// ARIA 管理 Hook
export function useARIA() {
  const setLabel = useCallback((element: HTMLElement, label: string) => {
    ARIAManager.setARIALabel(element, label)
  }, [])

  const setDescribedBy = useCallback(
    (element: HTMLElement, descriptionId: string) => {
      ARIAManager.setARIADescribedBy(element, descriptionId)
    },
    []
  )

  const setExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    ARIAManager.setARIAExpanded(element, expanded)
  }, [])

  const setSelected = useCallback((element: HTMLElement, selected: boolean) => {
    ARIAManager.setARIASelected(element, selected)
  }, [])

  const setChecked = useCallback(
    (element: HTMLElement, checked: boolean | 'mixed') => {
      ARIAManager.setARIAChecked(element, checked)
    },
    []
  )

  const setDisabled = useCallback((element: HTMLElement, disabled: boolean) => {
    ARIAManager.setARIADisabled(element, disabled)
  }, [])

  const setHidden = useCallback((element: HTMLElement, hidden: boolean) => {
    ARIAManager.setARIAHidden(element, hidden)
  }, [])

  const createDescribedByElement = useCallback(
    (id: string, description: string) => {
      return ARIAManager.createARIADescribedByElement(id, description)
    },
    []
  )

  return {
    setLabel,
    setDescribedBy,
    setExpanded,
    setSelected,
    setChecked,
    setDisabled,
    setHidden,
    createDescribedByElement,
  }
}

// 顏色對比度檢查 Hook
export function useColorContrast() {
  const validateTextContrast = useCallback(
    (textColor: string, backgroundColor: string) => {
      return ColorContrast.validateTextContrast(textColor, backgroundColor)
    },
    []
  )

  const getContrastRatio = useCallback((color1: string, color2: string) => {
    return ColorContrast.getContrastRatio(color1, color2)
  }, [])

  const isWCAGCompliant = useCallback(
    (ratio: number, level: 'AA' | 'AAA' = 'AA') => {
      return ColorContrast.isWCAGCompliant(ratio, level)
    },
    []
  )

  return {
    validateTextContrast,
    getContrastRatio,
    isWCAGCompliant,
  }
}

// 無障礙功能檢查 Hook
export function useAccessibilityChecker() {
  const [auditResults, setAuditResults] = useState<ReturnType<
    typeof AccessibilityChecker.runCompleteAudit
  > | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const runAudit = useCallback(async () => {
    setIsChecking(true)

    // 使用 setTimeout 來避免阻塞 UI
    setTimeout(() => {
      try {
        const results = AccessibilityChecker.runCompleteAudit()
        setAuditResults(results)
      } catch (error) {
        console.error('Accessibility audit failed:', error)
      } finally {
        setIsChecking(false)
      }
    }, 0)
  }, [])

  const checkHeadings = useCallback(() => {
    return AccessibilityChecker.checkHeadingStructure()
  }, [])

  const checkImages = useCallback(() => {
    return AccessibilityChecker.checkImages()
  }, [])

  const checkForms = useCallback(() => {
    return AccessibilityChecker.checkFormLabels()
  }, [])

  const checkColorContrast = useCallback(() => {
    return AccessibilityChecker.checkColorContrast()
  }, [])

  return {
    auditResults,
    isChecking,
    runAudit,
    checkHeadings,
    checkImages,
    checkForms,
    checkColorContrast,
  }
}

// 焦點管理 Hook
export function useFocusManagement() {
  const focusedElementRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (
      previousFocusRef.current &&
      typeof previousFocusRef.current.focus === 'function'
    ) {
      previousFocusRef.current.focus()
    }
  }, [])

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus()
      focusedElementRef.current = element
    }
  }, [])

  const focusById = useCallback(
    (id: string) => {
      const element = document.getElementById(id)
      focusElement(element)
    },
    [focusElement]
  )

  const focusFirst = useCallback(
    (container?: HTMLElement) => {
      const keyboardNav = new KeyboardNavigation()
      const focusableElements = keyboardNav.getFocusableElements(container)
      if (focusableElements.length > 0) {
        focusElement(focusableElements[0] || null)
      }
    },
    [focusElement]
  )

  const focusLast = useCallback(
    (container?: HTMLElement) => {
      const keyboardNav = new KeyboardNavigation()
      const focusableElements = keyboardNav.getFocusableElements(container)
      if (focusableElements.length > 0) {
        focusElement(focusableElements[focusableElements.length - 1] || null)
      }
    },
    [focusElement]
  )

  return {
    saveFocus,
    restoreFocus,
    focusElement,
    focusById,
    focusFirst,
    focusLast,
    currentFocus: focusedElementRef.current,
  }
}

// 鍵盤快捷鍵 Hook
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        event.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+')

      const action = shortcuts[key]
      if (action) {
        event.preventDefault()
        action()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// 跳過連結 Hook
export function useSkipLinks() {
  const [skipLinks, setSkipLinks] = useState<
    Array<{
      id: string
      text: string
      targetId: string
    }>
  >([])

  const addSkipLink = useCallback(
    (id: string, text: string, targetId: string) => {
      setSkipLinks(prev => [
        ...prev.filter(link => link.id !== id),
        { id, text, targetId },
      ])
    },
    []
  )

  const removeSkipLink = useCallback((id: string) => {
    setSkipLinks(prev => prev.filter(link => link.id !== id))
  }, [])

  const renderSkipLinks = useCallback(() => {
    return skipLinks.map(link => {
      const keyboardNav = new KeyboardNavigation()
      return keyboardNav.createSkipLink(link.targetId, link.text)
    })
  }, [skipLinks])

  return {
    skipLinks,
    addSkipLink,
    removeSkipLink,
    renderSkipLinks,
  }
}

// 可訪問性公告 Hook
export function useAccessibilityAnnouncements() {
  const { announce } = useScreenReader()
  const [announcements, setAnnouncements] = useState<
    Array<{
      id: string
      message: string
      priority: 'polite' | 'assertive'
      timestamp: number
    }>
  >([])

  const makeAnnouncement = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const id = `announcement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const timestamp = Date.now()

      // 添加到歷史記錄
      setAnnouncements(prev => [...prev, { id, message, priority, timestamp }])

      // 實際發出公告
      announce(message, priority)

      // 清理舊公告（保留最近 20 個）
      setTimeout(() => {
        setAnnouncements(prev => prev.slice(-20))
      }, 100)
    },
    [announce]
  )

  const announceError = useCallback(
    (message: string) => {
      makeAnnouncement(`Error: ${message}`, 'assertive')
    },
    [makeAnnouncement]
  )

  const announceSuccess = useCallback(
    (message: string) => {
      makeAnnouncement(`Success: ${message}`, 'polite')
    },
    [makeAnnouncement]
  )

  const announceLoading = useCallback(
    (message: string = 'Loading...') => {
      makeAnnouncement(message, 'polite')
    },
    [makeAnnouncement]
  )

  const announcePageChange = useCallback(
    (pageName: string) => {
      makeAnnouncement(`Navigated to ${pageName}`, 'polite')
    },
    [makeAnnouncement]
  )

  return {
    announcements,
    makeAnnouncement,
    announceError,
    announceSuccess,
    announceLoading,
    announcePageChange,
  }
}

// 高對比度模式 Hook
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-contrast: high)').matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-contrast: high)')

    const handler = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handler)

    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  return {
    isHighContrast,
  }
}

// 組合型無障礙 Hook
export function useAccessibility() {
  const motionPrefs = useMotionPreferences()
  const textScaling = useTextScaling()
  const screenReader = useScreenReader()
  const focusManagement = useFocusManagement()
  const colorContrast = useColorContrast()
  const highContrast = useHighContrastMode()
  const announcements = useAccessibilityAnnouncements()

  return {
    motion: motionPrefs,
    text: textScaling,
    screenReader,
    focus: focusManagement,
    colorContrast,
    highContrast,
    announcements,
  }
}
