import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for E2E Testing
 *
 * 配置端到端測試環境，支援多瀏覽器測試
 */
export default defineConfig({
  // 測試文件路徑
  testDir: './e2e',

  // 全局超時時間
  timeout: 30000,

  // 每個測試的期望超時
  expect: {
    timeout: 5000,
  },

  // 並行執行測試
  fullyParallel: true,

  // 失敗時不重試（開發階段）
  retries: process.env.CI ? 2 : 0,

  // 並行執行的 worker 數量
  workers: process.env.CI ? 2 : 1,

  // 測試報告格式
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],

  // 全局設置
  use: {
    // 基礎 URL
    baseURL: 'http://localhost:3000',

    // 瀏覽器上下文設置
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 其他設置
  },

  // 測試項目配置（不同瀏覽器）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 移動設備測試
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web Server 配置（自動啟動開發服務器）
  webServer: {
    command: 'npm run dev:mock-data',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
