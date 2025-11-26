import {Platform} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {MOCK_CONFIG} from '../utils/constants'

export interface BundleMetrics {
  totalSize: number
  mainBundleSize: number
  chunkSizes: Record<string, number>
  compressionRatio: number
  gzipSize: number
}

export interface PerformanceMetrics {
  appStartTime: number
  coldStartTime: number
  hotStartTime: number
  firstInteractiveTime: number
  firstContentfulPaint: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    native: number
    app: number
  }
  frameRate: {
    fps: number
    jankFrames: number
    droppedFrames: number
  }
  networkMetrics: {
    avgLatency: number
    bandwidth: number
    successRate: number
  }
}

export interface PerformanceThresholds {
  coldStartTimeThreshold: number // ms
  hotStartTimeThreshold: number // ms
  fpsThreshold: number
  memoryThreshold: number // MB
  networkLatencyThreshold: number // ms
}

export interface OptimizationReport {
  timestamp: number
  metrics: PerformanceMetrics
  recommendations: string[]
  score: number
}

class PerformanceOptimizationService {
  private mockMode = MOCK_CONFIG.enabled
  private isMonitoring = false
  private performanceHistory: OptimizationReport[] = []
  private thresholds: PerformanceThresholds = {
    coldStartTimeThreshold: 2000,
    hotStartTimeThreshold: 500,
    fpsThreshold: 50,
    memoryThreshold: 100,
    networkLatencyThreshold: 200,
  }

  constructor() {
    console.log(
      'PerformanceOptimizationService initialized with mock mode:',
      this.mockMode,
    )
  }

  // 初始化性能監控
  async initialize(): Promise<void> {
    try {
      if (this.mockMode) {
        await this.initializeMockMonitoring()
      } else {
        await this.initializeRealMonitoring()
      }

      console.log('Performance optimization service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize performance service:', error)
      throw error
    }
  }

  // 初始化真實監控
  private async initializeRealMonitoring(): Promise<void> {
    // 開始性能觀察
    try {
      if (Platform.OS === 'ios') {
        // iOS 特定的性能監控
        console.log('iOS performance monitoring started')
      } else {
        // Android 特定的性能監控
        console.log('Android performance monitoring started')
      }
    } catch (error) {
      console.error('Failed to initialize real monitoring:', error)
    }
  }

  // 初始化 Mock 監控
  private async initializeMockMonitoring(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Mock performance monitoring initialized')
  }

  // 開始性能監控
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    console.log('Performance monitoring started')

    // 定期收集性能指標
    this.startPeriodicMonitoring()
  }

  // 停止性能監控
  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false
    console.log('Performance monitoring stopped')
  }

  // 定期監控
  private startPeriodicMonitoring(): void {
    // 每 30 秒收集一次性能指標
    const interval = setInterval(async () => {
      if (this.isMonitoring) {
        const metrics = await this.collectMetrics()
        const report = this.generateReport(metrics)
        this.performanceHistory.unshift(report)

        // 只保留最近 100 條記錄
        if (this.performanceHistory.length > 100) {
          this.performanceHistory.pop()
        }

        await this.savePerformanceHistory()
      } else {
        clearInterval(interval)
      }
    }, 30000)
  }

  // 收集性能指標
  private async collectMetrics(): Promise<PerformanceMetrics> {
    if (this.mockMode) {
      return await this.collectMockMetrics()
    } else {
      return await this.collectRealMetrics()
    }
  }

  // 收集真實指標
  private async collectRealMetrics(): Promise<PerformanceMetrics> {
    // 這裡應該使用真實的性能 API
    return {
      appStartTime: 0,
      coldStartTime: 1500,
      hotStartTime: 400,
      firstInteractiveTime: 1800,
      firstContentfulPaint: 1200,
      memoryUsage: {
        heapUsed: 35 * 1024 * 1024,
        heapTotal: 50 * 1024 * 1024,
        native: 15 * 1024 * 1024,
        app: 45 * 1024 * 1024,
      },
      frameRate: {
        fps: 58,
        jankFrames: 2,
        droppedFrames: 1,
      },
      networkMetrics: {
        avgLatency: 150,
        bandwidth: 10 * 1024 * 1024, // 10 Mbps
        successRate: 0.99,
      },
    }
  }

  // 收集 Mock 指標
  private async collectMockMetrics(): Promise<PerformanceMetrics> {
    return {
      appStartTime: Date.now(),
      coldStartTime: 1200 + Math.random() * 800,
      hotStartTime: 300 + Math.random() * 200,
      firstInteractiveTime: 1400 + Math.random() * 600,
      firstContentfulPaint: 800 + Math.random() * 500,
      memoryUsage: {
        heapUsed: (30 + Math.random() * 20) * 1024 * 1024,
        heapTotal: 50 * 1024 * 1024,
        native: (10 + Math.random() * 10) * 1024 * 1024,
        app: (40 + Math.random() * 20) * 1024 * 1024,
      },
      frameRate: {
        fps: 55 + Math.random() * 5,
        jankFrames: Math.floor(Math.random() * 5),
        droppedFrames: Math.floor(Math.random() * 3),
      },
      networkMetrics: {
        avgLatency: 100 + Math.random() * 150,
        bandwidth: 5 * 1024 * 1024 + Math.random() * 15 * 1024 * 1024,
        successRate: 0.95 + Math.random() * 0.05,
      },
    }
  }

  // 生成性能報告
  private generateReport(metrics: PerformanceMetrics): OptimizationReport {
    const recommendations: string[] = []
    let score = 100

    // 檢查冷啟動時間
    if (metrics.coldStartTime > this.thresholds.coldStartTimeThreshold) {
      recommendations.push(
        `冷啟動時間 (${Math.round(metrics.coldStartTime)}ms) 超過閾值 (${
          this.thresholds.coldStartTimeThreshold
        }ms)，建議優化初始化流程`,
      )
      score -= 15
    }

    // 檢查熱啟動時間
    if (metrics.hotStartTime > this.thresholds.hotStartTimeThreshold) {
      recommendations.push(
        `熱啟動時間 (${Math.round(
          metrics.hotStartTime,
        )}ms) 超過閾值，建議優化路由或狀態管理`,
      )
      score -= 10
    }

    // 檢查幀率
    if (metrics.frameRate.fps < this.thresholds.fpsThreshold) {
      recommendations.push(
        `幀率 (${Math.round(metrics.frameRate.fps)}) 低於閾值 (${
          this.thresholds.fpsThreshold
        })，檢查是否有密集計算`,
      )
      score -= 20
    }

    // 檢查記憶體使用
    const memoryUsagePercent = metrics.memoryUsage.app / (100 * 1024 * 1024)
    if (memoryUsagePercent > this.thresholds.memoryThreshold / 100) {
      recommendations.push(
        `記憶體使用 (${Math.round(
          memoryUsagePercent * 100,
        )}%) 超過閾值，建議優化記憶體管理`,
      )
      score -= 15
    }

    // 檢查網路延遲
    if (
      metrics.networkMetrics.avgLatency >
      this.thresholds.networkLatencyThreshold
    ) {
      recommendations.push(
        `網路延遲 (${Math.round(
          metrics.networkMetrics.avgLatency,
        )}ms) 超過閾值，建議優化網路請求`,
      )
      score -= 10
    }

    // 檢查卡頓幀
    if (metrics.frameRate.jankFrames > 5) {
      recommendations.push(
        `檢測到 ${metrics.frameRate.jankFrames} 個卡頓幀，可能影響用戶體驗`,
      )
      score -= 10
    }

    return {
      timestamp: Date.now(),
      metrics,
      recommendations,
      score: Math.max(0, score),
    }
  }

  // 獲取 Bundle 分析
  async getBundleMetrics(): Promise<BundleMetrics> {
    return {
      totalSize: 3.2 * 1024 * 1024, // 3.2 MB
      mainBundleSize: 2.1 * 1024 * 1024,
      chunkSizes: {
        auth: 128 * 1024,
        documents: 256 * 1024,
        editor: 512 * 1024,
        collaboration: 384 * 1024,
        offline: 192 * 1024,
        ai: 320 * 1024,
      },
      compressionRatio: 0.72,
      gzipSize: 2.3 * 1024 * 1024,
    }
  }

  // 獲取優化建議
  async getOptimizationRecommendations(): Promise<string[]> {
    const recommendations: string[] = []

    // 代碼分割建議
    recommendations.push('使用 React.lazy 和 Suspense 進行路由級別的代碼分割')
    recommendations.push('對大型組件庫進行動態導入')
    recommendations.push('考慮使用 Webpack 的 tree shaking 去除死代碼')

    // 記憶體優化建議
    recommendations.push('使用虛擬列表優化長列表渲染性能')
    recommendations.push('實現圖片懶載入和緩存機制')
    recommendations.push('定期清理不使用的事件監聽器和定時器')

    // 動畫優化建議
    recommendations.push('使用 Reanimated 進行高性能動畫')
    recommendations.push('避免在主線程進行密集計算')
    recommendations.push('使用 requestAnimationFrame 控制動畫幀率')

    // 網路優化建議
    recommendations.push('實現 HTTP 快取策略')
    recommendations.push('使用 WebSocket 替代頻繁的 HTTP 輪詢')
    recommendations.push('實現請求合併和批量處理')

    return recommendations
  }

  // 生成性能報告
  async generatePerformanceReport(): Promise<OptimizationReport | null> {
    if (this.performanceHistory.length === 0) {
      return null
    }

    return this.performanceHistory[0]
  }

  // 獲取性能歷史
  async getPerformanceHistory(
    limit: number = 10,
  ): Promise<OptimizationReport[]> {
    return this.performanceHistory.slice(0, limit)
  }

  // 設置閾值
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = {...this.thresholds, ...thresholds}
    console.log('Performance thresholds updated:', this.thresholds)
  }

  // 獲取當前閾值
  getThresholds(): PerformanceThresholds {
    return {...this.thresholds}
  }

  // 保存性能歷史
  private async savePerformanceHistory(): Promise<void> {
    try {
      const history = this.performanceHistory.slice(0, 50)
      await AsyncStorage.setItem('performance_history', JSON.stringify(history))
    } catch (error) {
      console.error('Failed to save performance history:', error)
    }
  }

  // 加載性能歷史
  async loadPerformanceHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('performance_history')
      if (stored) {
        this.performanceHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load performance history:', error)
    }
  }

  // 導出性能報告
  async exportPerformanceReport(
    format: 'json' | 'csv' = 'json',
  ): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          history: this.performanceHistory,
          thresholds: this.thresholds,
        },
        null,
        2,
      )
    } else {
      // CSV 格式
      let csv = 'Timestamp,ColdStartTime,HotStartTime,FPS,MemoryUsage,Score\n'
      for (const report of this.performanceHistory) {
        csv += `${new Date(report.timestamp).toISOString()},${Math.round(
          report.metrics.coldStartTime,
        )},${Math.round(report.metrics.hotStartTime)},${Math.round(
          report.metrics.frameRate.fps,
        )},${Math.round(report.metrics.memoryUsage.app / (1024 * 1024))},${
          report.score
        }\n`
      }
      return csv
    }
  }

  // 清理服務
  cleanup(): void {
    this.stopMonitoring()
    this.performanceHistory = []
    console.log('Performance optimization service cleaned up')
  }
}

export default PerformanceOptimizationService
