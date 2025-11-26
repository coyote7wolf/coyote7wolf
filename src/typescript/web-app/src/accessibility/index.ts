/**
 * 無障礙功能管理器
 *
 * 提供 WCAG 2.1 AA 級別的無障礙功能支援
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// 顏色對比度計算
export class ColorContrast {
  private static getLuminance(r: number, g: number, b: number): number {
    const values = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    const [rs = 0, gs = 0, bs = 0] = values
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  static getContrastRatio(color1: string, color2: string): number {
    const hex1 = color1.replace('#', '')
    const hex2 = color2.replace('#', '')

    const r1 = parseInt(hex1.substr(0, 2), 16)
    const g1 = parseInt(hex1.substr(2, 2), 16)
    const b1 = parseInt(hex1.substr(4, 2), 16)

    const r2 = parseInt(hex2.substr(0, 2), 16)
    const g2 = parseInt(hex2.substr(2, 2), 16)
    const b2 = parseInt(hex2.substr(4, 2), 16)

    const lum1 = this.getLuminance(r1, g1, b1)
    const lum2 = this.getLuminance(r2, g2, b2)

    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  static isWCAGCompliant(ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7.0
  }

  static validateTextContrast(
    textColor: string,
    backgroundColor: string
  ): {
    ratio: number
    isCompliant: boolean
    level: 'AA' | 'AAA' | 'fail'
  } {
    const ratio = this.getContrastRatio(textColor, backgroundColor)
    const isAA = ratio >= 4.5
    const isAAA = ratio >= 7.0

    return {
      ratio,
      isCompliant: isAA,
      level: isAAA ? 'AAA' : isAA ? 'AA' : 'fail',
    }
  }
}

// 鍵盤導航管理
export class KeyboardNavigation {
  private focusableElements: string[] = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ]

  getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const selector = this.focusableElements.join(', ')
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
  }

  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container)
    if (focusableElements.length === 0) return () => {}

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement && lastElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement && firstElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      if (e.key === 'Escape') {
        // 處理 Escape 鍵邏輯
        const event = new CustomEvent('escapeFocusTrap', {
          detail: { container },
        })
        container.dispatchEvent(event)
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    if (firstElement) {
      firstElement.focus()
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  createSkipLink(targetId: string, text: string): HTMLElement {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = text
    skipLink.className = 'skip-link sr-only-focusable'
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 1000;
      padding: 8px 16px;
      background: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    `

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px'
    })

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px'
    })

    return skipLink
  }
}

// 螢幕閱讀器支援
export class ScreenReaderSupport {
  static announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `

    document.body.appendChild(announcement)

    // 延遲設置內容以確保螢幕閱讀器能夠偵測到變化
    setTimeout(() => {
      announcement.textContent = message
    }, 100)

    // 清理
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 2000)
  }

  static createLiveRegion(
    id: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): HTMLElement {
    let liveRegion = document.getElementById(id)

    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = id
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `
      document.body.appendChild(liveRegion)
    }

    return liveRegion
  }

  static updateLiveRegion(id: string, message: string): void {
    const liveRegion = document.getElementById(id)
    if (liveRegion) {
      liveRegion.textContent = message
    }
  }

  static createProgressAnnouncer(): {
    announce: (current: number, total: number, label?: string) => void
    cleanup: () => void
  } {
    const liveRegion = this.createLiveRegion('progress-announcer', 'polite')

    const announce = (current: number, total: number, label = 'Progress') => {
      const percentage = Math.round((current / total) * 100)
      const message = `${label}: ${percentage}% complete, ${current} of ${total}`
      this.updateLiveRegion('progress-announcer', message)
    }

    const cleanup = () => {
      const region = document.getElementById('progress-announcer')
      if (region) {
        document.body.removeChild(region)
      }
    }

    return { announce, cleanup }
  }
}

// 動作偏好檢測
export class MotionPreferences {
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  static onMotionPreferenceChange(
    callback: (reducedMotion: boolean) => void
  ): () => void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches)
    }

    mediaQuery.addEventListener('change', handler)

    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }
}

// 文字縮放支援
export class TextScaling {
  static getCurrentTextScale(): number {
    const testElement = document.createElement('div')
    testElement.style.cssText = `
      position: absolute;
      visibility: hidden;
      font-size: 16px;
      width: auto;
      height: auto;
    `
    testElement.textContent = 'Test'
    document.body.appendChild(testElement)

    const actualSize = parseInt(
      window.getComputedStyle(testElement).fontSize,
      10
    )
    document.body.removeChild(testElement)

    return actualSize / 16 // 16px 是基準大小
  }

  static onTextScaleChange(callback: (scale: number) => void): () => void {
    let lastScale = this.getCurrentTextScale()

    const checkScale = () => {
      const currentScale = this.getCurrentTextScale()
      if (Math.abs(currentScale - lastScale) > 0.1) {
        lastScale = currentScale
        callback(currentScale)
      }
    }

    const observer = new ResizeObserver(checkScale)
    observer.observe(document.body)

    return () => {
      observer.disconnect()
    }
  }
}

// ARIA 標籤管理
export class ARIAManager {
  static setARIALabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label)
  }

  static setARIADescribedBy(element: HTMLElement, descriptionId: string): void {
    element.setAttribute('aria-describedby', descriptionId)
  }

  static setARIAExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  static setARIASelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString())
  }

  static setARIAChecked(
    element: HTMLElement,
    checked: boolean | 'mixed'
  ): void {
    element.setAttribute('aria-checked', checked.toString())
  }

  static setARIADisabled(element: HTMLElement, disabled: boolean): void {
    element.setAttribute('aria-disabled', disabled.toString())
  }

  static setARIAHidden(element: HTMLElement, hidden: boolean): void {
    if (hidden) {
      element.setAttribute('aria-hidden', 'true')
    } else {
      element.removeAttribute('aria-hidden')
    }
  }

  static createARIADescribedByElement(
    id: string,
    description: string
  ): HTMLElement {
    let descElement = document.getElementById(id)

    if (!descElement) {
      descElement = document.createElement('div')
      descElement.id = id
      descElement.className = 'sr-only'
      descElement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `
      document.body.appendChild(descElement)
    }

    descElement.textContent = description
    return descElement
  }
}

// 無障礙功能檢查器
export class AccessibilityChecker {
  static checkHeadingStructure(): {
    valid: boolean
    issues: string[]
  } {
    const headings = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    )
    const issues: string[] = []

    if (headings.length === 0) {
      issues.push('No headings found on page')
      return { valid: false, issues }
    }

    const h1s = headings.filter(h => h.tagName === 'H1')
    if (h1s.length === 0) {
      issues.push('No H1 heading found')
    } else if (h1s.length > 1) {
      issues.push('Multiple H1 headings found')
    }

    // 檢查標題階層
    let lastLevel = 0
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))

      if (index === 0 && level !== 1) {
        issues.push('First heading is not H1')
      }

      if (level > lastLevel + 1) {
        issues.push(
          `Heading level skipped: ${heading.tagName} after H${lastLevel}`
        )
      }

      lastLevel = level
    })

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  static checkImages(): {
    valid: boolean
    issues: string[]
  } {
    const images = Array.from(document.querySelectorAll('img'))
    const issues: string[] = []

    images.forEach((img, index) => {
      const alt = img.getAttribute('alt')
      const role = img.getAttribute('role')

      if (alt === null && role !== 'presentation' && role !== 'none') {
        issues.push(`Image ${index + 1} missing alt attribute`)
      } else if (alt === '') {
        // 空 alt 是允許的，用於裝飾性圖片
      } else if (alt && alt.length > 125) {
        issues.push(
          `Image ${index + 1} alt text too long (${alt.length} characters)`
        )
      }
    })

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  static checkFormLabels(): {
    valid: boolean
    issues: string[]
  } {
    const formControls = Array.from(
      document.querySelectorAll('input, select, textarea')
    )
    const issues: string[] = []

    formControls.forEach((control, index) => {
      const element = control as HTMLElement
      const id = element.getAttribute('id')
      const ariaLabel = element.getAttribute('aria-label')
      const ariaLabelledBy = element.getAttribute('aria-labelledby')
      const type = element.getAttribute('type')

      // 跳過隱藏的表單控制項
      if (type === 'hidden') return

      // 檢查是否有標籤
      let hasLabel = false

      if (ariaLabel || ariaLabelledBy) {
        hasLabel = true
      } else if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (label) hasLabel = true
      }

      // 檢查是否在 label 元素內
      const parentLabel = element.closest('label')
      if (parentLabel) hasLabel = true

      if (!hasLabel) {
        issues.push(
          `Form control ${index + 1} (${element.tagName}) has no accessible label`
        )
      }
    })

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  static checkColorContrast(): {
    valid: boolean
    issues: string[]
  } {
    const textElements = Array.from(
      document.querySelectorAll(
        'p, span, div, h1, h2, h3, h4, h5, h6, a, button, label'
      )
    )
    const issues: string[] = []

    textElements.forEach((element, index) => {
      const style = window.getComputedStyle(element)
      const color = style.color
      const backgroundColor = style.backgroundColor

      // 只檢查有明確顏色設定的元素
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        try {
          const ratio = ColorContrast.getContrastRatio(
            this.rgbToHex(color),
            this.rgbToHex(backgroundColor)
          )

          if (ratio < 4.5) {
            issues.push(
              `Element ${index + 1} has insufficient color contrast (${ratio.toFixed(2)}:1)`
            )
          }
        } catch (error) {
          // 無法解析顏色，跳過
        }
      }
    })

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  private static rgbToHex(rgb: string): string {
    const result = rgb.match(/\d+/g)
    if (!result || result.length < 3) return '#000000'

    const r = parseInt(result[0] || '0')
      .toString(16)
      .padStart(2, '0')
    const g = parseInt(result[1] || '0')
      .toString(16)
      .padStart(2, '0')
    const b = parseInt(result[2] || '0')
      .toString(16)
      .padStart(2, '0')

    return `#${r}${g}${b}`
  }

  static runCompleteAudit(): {
    overall: boolean
    results: {
      headings: ReturnType<typeof AccessibilityChecker.checkHeadingStructure>
      images: ReturnType<typeof AccessibilityChecker.checkImages>
      forms: ReturnType<typeof AccessibilityChecker.checkFormLabels>
      colorContrast: ReturnType<typeof AccessibilityChecker.checkColorContrast>
    }
  } {
    const results = {
      headings: this.checkHeadingStructure(),
      images: this.checkImages(),
      forms: this.checkFormLabels(),
      colorContrast: this.checkColorContrast(),
    }

    const overall = Object.values(results).every(result => result.valid)

    return { overall, results }
  }
}
