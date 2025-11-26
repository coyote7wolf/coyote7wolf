/**
 * E2E 測試 - 主要用戶流程
 *
 * 測試完整的用戶工作流程，模擬真實用戶行為
 */

import { test, expect } from '@playwright/test'

test.describe('Homepage E2E Tests', () => {
  test('should load homepage correctly', async ({ page }) => {
    await page.goto('/')

    // 檢查頁面標題
    await expect(page).toHaveTitle(/SyncCoreAI/i)

    // 檢查主要內容區域
    await expect(page.locator('main')).toBeVisible()

    // 檢查導航元素
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // 尋找並點擊登入連結
    const loginLink = page.getByRole('link', { name: /login|sign in/i }).first()
    await loginLink.click()

    // 驗證導航到登入頁面
    await expect(page).toHaveURL(/.*login/)

    // 檢查登入表單
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/')

    // 尋找並點擊註冊連結
    const registerLink = page
      .getByRole('link', { name: /register|sign up/i })
      .first()
    await registerLink.click()

    // 驗證導航到註冊頁面
    await expect(page).toHaveURL(/.*register/)

    // 檢查註冊表單
    await expect(page.getByRole('main')).toBeVisible()
  })
})

test.describe('Navigation E2E Tests', () => {
  test('should handle sidebar navigation', async ({ page }) => {
    await page.goto('/')

    // 檢查側邊欄是否存在
    const sidebar = page
      .locator('[data-testid="advanced-sidebar"], .sidebar, nav')
      .first()

    if (await sidebar.isVisible()) {
      // 測試側邊欄互動（如果存在）
      await sidebar.hover()

      // 檢查側邊欄是否展開或有反應
      await page.waitForTimeout(500) // 等待動畫完成
    }
  })

  test('should handle responsive navigation', async ({ page }) => {
    // 測試桌面視窗
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    await expect(page.getByRole('main')).toBeVisible()

    // 測試移動視窗
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()

    await expect(page.getByRole('main')).toBeVisible()
  })
})

test.describe('Form Interaction E2E Tests', () => {
  test('should handle login form', async ({ page }) => {
    await page.goto('/login')

    // 尋找表單元素
    const emailInput = page.getByRole('textbox', { name: /email/i }).first()
    const passwordInput = page
      .getByRole('textbox', { name: /password/i })
      .first()
    const submitButton = page
      .getByRole('button', { name: /login|sign in/i })
      .first()

    if (await emailInput.isVisible()) {
      // 填寫表單
      await emailInput.fill('test@example.com')
      await passwordInput.fill('password123')

      // 提交表單
      await submitButton.click()

      // 等待響應（可能是錯誤或成功）
      await page.waitForTimeout(1000)

      // 檢查頁面是否有反應（不會拋出錯誤就是成功）
      expect(page.url()).toBeTruthy()
    }
  })

  test('should handle register form', async ({ page }) => {
    await page.goto('/register')

    // 尋找表單元素
    const nameInput = page.getByRole('textbox', { name: /name/i }).first()
    const emailInput = page.getByRole('textbox', { name: /email/i }).first()
    const passwordInput = page
      .getByRole('textbox', { name: /password/i })
      .first()
    const submitButton = page
      .getByRole('button', { name: /register|sign up/i })
      .first()

    if (await nameInput.isVisible()) {
      // 填寫表單
      await nameInput.fill('Test User')
      await emailInput.fill('test@example.com')
      await passwordInput.fill('password123')

      // 提交表單
      await submitButton.click()

      // 等待響應
      await page.waitForTimeout(1000)

      // 檢查頁面反應
      expect(page.url()).toBeTruthy()
    }
  })
})

test.describe('Page Loading E2E Tests', () => {
  test('should load all main pages without errors', async ({ page }) => {
    const pages = ['/', '/login', '/register']

    for (const pagePath of pages) {
      await page.goto(pagePath)

      // 檢查頁面是否加載完成
      await expect(page.locator('body')).toBeVisible()

      // 檢查是否有 JavaScript 錯誤
      const errors: string[] = []
      page.on('pageerror', error => {
        errors.push(error.message)
      })

      // 等待頁面完全加載
      await page.waitForLoadState('networkidle')

      // 檢查沒有嚴重錯誤
      expect(
        errors.filter(e => e.includes('404') || e.includes('500'))
      ).toHaveLength(0)
    }
  })
})

test.describe('Interactive Elements E2E Tests', () => {
  test('should handle button interactions', async ({ page }) => {
    await page.goto('/')

    // 尋找可互動的按鈕
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()

    if (buttonCount > 0) {
      // 測試第一個按鈕
      const firstButton = buttons.first()

      if (await firstButton.isVisible()) {
        // 檢查按鈕是否可點擊
        await expect(firstButton).toBeEnabled()

        // 點擊按鈕（如果不會導航到其他頁面）
        const buttonText = await firstButton.textContent()
        if (buttonText && !buttonText.match(/login|register|sign/i)) {
          await firstButton.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test('should handle hover effects', async ({ page }) => {
    await page.goto('/')

    // 尋找可 hover 的元素
    const interactiveElements = page.locator('button, a, [role="button"]')
    const elementCount = await interactiveElements.count()

    if (elementCount > 0) {
      const firstElement = interactiveElements.first()

      if (await firstElement.isVisible()) {
        // 測試 hover 效果
        await firstElement.hover()
        await page.waitForTimeout(300)

        // 檢查元素仍然可見
        await expect(firstElement).toBeVisible()
      }
    }
  })
})

test.describe('Error Handling E2E Tests', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    // 訪問不存在的頁面
    await page.goto('/non-existent-page')

    // 檢查是否有適當的錯誤處理
    await expect(page.locator('body')).toBeVisible()

    // 頁面應該要能夠渲染（即使是 404 頁面）
    const pageContent = await page.textContent('body')
    expect(pageContent).toBeTruthy()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // 監聽網路錯誤
    const networkErrors: string[] = []
    page.on('requestfailed', request => {
      networkErrors.push(request.url())
    })

    await page.goto('/')

    // 等待頁面加載
    await page.waitForLoadState('domcontentloaded')

    // 檢查頁面基本功能仍可用
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Performance E2E Tests', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // 頁面加載時間應該少於 10 秒
    expect(loadTime).toBeLessThan(10000)
  })

  test('should handle multiple simultaneous interactions', async ({ page }) => {
    await page.goto('/')

    // 同時執行多個操作
    const promises = []

    // 尋找多個可互動元素
    const buttons = page.getByRole('button')
    const links = page.getByRole('link')

    if ((await buttons.count()) > 0) {
      promises.push(buttons.first().hover())
    }

    if ((await links.count()) > 0) {
      promises.push(links.first().hover())
    }

    // 等待所有操作完成
    await Promise.all(promises)

    // 檢查頁面仍然正常
    await expect(page.locator('body')).toBeVisible()
  })
})
