import AsyncStorage from '@react-native-async-storage/async-storage'
import {MOCK_CONFIG} from '../utils/constants'

export interface AIAssistantConfig {
  model: string
  temperature: number
  maxTokens: number
  contextLength: number
  enableAutoCorrection: boolean
  enableGrammarCheck: boolean
  enableStyleSuggestions: boolean
  enableTranslation: boolean
  language: string
}

export interface TextProcessingRequest {
  text: string
  action: TextProcessingAction
  options?: Record<string, any>
  context?: string
}

export interface TextProcessingResult {
  processedText: string
  suggestions?: string[]
  corrections?: TextCorrection[]
  improvements?: TextImprovement[]
  metadata?: {
    confidence: number
    processingTime: number
    model: string
    tokens: number
  }
}

export interface TextCorrection {
  type: 'spelling' | 'grammar' | 'punctuation' | 'style'
  original: string
  corrected: string
  position: {start: number; end: number}
  confidence: number
  explanation?: string
}

export interface TextImprovement {
  type: 'clarity' | 'conciseness' | 'tone' | 'vocabulary' | 'structure'
  suggestion: string
  position?: {start: number; end: number}
  priority: 'low' | 'medium' | 'high'
  explanation: string
}

export type TextProcessingAction =
  | 'autocorrect'
  | 'grammar_check'
  | 'improve_clarity'
  | 'summarize'
  | 'expand'
  | 'translate'
  | 'tone_adjust'
  | 'format'
  | 'extract_keywords'
  | 'generate_outline'

export interface ProcessingHistory {
  id: string
  timestamp: number
  request: TextProcessingRequest
  result: TextProcessingResult
  userRating?: number
}

class AITextProcessingService {
  private mockMode = MOCK_CONFIG.enabled
  private config: AIAssistantConfig
  private isInitialized = false
  private processingHistory: ProcessingHistory[] = []

  // Mock 數據
  private mockSuggestions = {
    spelling: [
      {word: '協作', suggestions: ['協作', '合作', '配合']},
      {word: '同步', suggestions: ['同步', '同時', '一致']},
      {word: '效率', suggestions: ['效率', '效能', '成效']},
    ],
    grammar: [
      '建議將「這個功能很好用」改為「這項功能相當實用」',
      '「因為所以」的用法不當，建議改為「由於...因此...」',
      '動詞時態不一致，建議統一使用現在式',
    ],
    improvements: [
      {
        type: 'clarity' as const,
        suggestion: '建議將長句拆分為兩個較短的句子，提高可讀性',
        priority: 'medium' as const,
        explanation: '過長的句子可能影響理解',
      },
      {
        type: 'tone' as const,
        suggestion: '可以使用更正式的語調',
        priority: 'low' as const,
        explanation: '根據文件性質調整語調',
      },
    ],
  }

  constructor(config: Partial<AIAssistantConfig> = {}) {
    this.config = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      contextLength: 4096,
      enableAutoCorrection: true,
      enableGrammarCheck: true,
      enableStyleSuggestions: true,
      enableTranslation: true,
      language: 'zh-TW',
      ...config,
    }

    console.log(
      'AITextProcessingService initialized with mock mode:',
      this.mockMode,
    )
  }

  // 初始化服務
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 加載處理歷史
      await this.loadProcessingHistory()

      if (this.mockMode) {
        await this.initializeMockService()
      } else {
        await this.initializeRealService()
      }

      this.isInitialized = true
      console.log('AI text processing service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize AI text processing service:', error)
      throw error
    }
  }

  // 初始化真實服務
  private async initializeRealService(): Promise<void> {
    // 在真實實現中，這裡會初始化 AI 模型連接
    // 例如：OpenAI API、本地模型等
    console.log('Real AI service would be initialized here')
  }

  // 初始化 Mock 服務
  private async initializeMockService(): Promise<void> {
    // 模擬初始化延遲
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Mock AI service initialized')
  }

  // 處理文本
  async processText(
    request: TextProcessingRequest,
  ): Promise<TextProcessingResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      let result: TextProcessingResult

      if (this.mockMode) {
        result = await this.processMockText(request)
      } else {
        result = await this.processRealText(request)
      }

      // 記錄處理歷史
      const historyItem: ProcessingHistory = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        request,
        result,
      }

      this.processingHistory.unshift(historyItem)
      await this.saveProcessingHistory()

      return result
    } catch (error) {
      console.error('Text processing failed:', error)
      throw new Error(`文本處理失敗: ${(error as Error).message}`)
    }
  }

  // Mock 文本處理
  private async processMockText(
    request: TextProcessingRequest,
  ): Promise<TextProcessingResult> {
    const {text, action, options} = request

    // 模擬處理延遲
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    )

    switch (action) {
      case 'autocorrect':
        return this.mockAutoCorrect(text)

      case 'grammar_check':
        return this.mockGrammarCheck(text)

      case 'improve_clarity':
        return this.mockImproveClarity(text)

      case 'summarize':
        return this.mockSummarize(text, options?.maxLength || 100)

      case 'expand':
        return this.mockExpand(text)

      case 'translate':
        return this.mockTranslate(text, options?.targetLanguage || 'en')

      case 'tone_adjust':
        return this.mockToneAdjust(text, options?.tone || 'formal')

      case 'format':
        return this.mockFormat(text, options?.format || 'paragraph')

      case 'extract_keywords':
        return this.mockExtractKeywords(text)

      case 'generate_outline':
        return this.mockGenerateOutline(text)

      default:
        throw new Error(`Unsupported action: ${action}`)
    }
  }

  // 真實文本處理
  private async processRealText(
    _request: TextProcessingRequest,
  ): Promise<TextProcessingResult> {
    // 真實實現會調用 AI API
    throw new Error('Real AI processing not implemented yet')
  }

  // Mock 自動糾錯
  private mockAutoCorrect(text: string): TextProcessingResult {
    const corrections: TextCorrection[] = []
    let processedText = text

    // 模擬一些常見錯誤糾正
    const commonErrors = [
      {from: '协作', to: '協作', type: 'spelling' as const},
      {from: '同步', to: '同步', type: 'spelling' as const},
      {from: '，，', to: '，', type: 'punctuation' as const},
      {from: '。。', to: '。', type: 'punctuation' as const},
    ]

    commonErrors.forEach(error => {
      if (processedText.includes(error.from)) {
        const index = processedText.indexOf(error.from)
        corrections.push({
          type: error.type,
          original: error.from,
          corrected: error.to,
          position: {start: index, end: index + error.from.length},
          confidence: 0.95,
          explanation: `將「${error.from}」糾正為「${error.to}」`,
        })
        processedText = processedText.replace(error.from, error.to)
      }
    })

    return {
      processedText,
      corrections,
      metadata: {
        confidence: 0.9,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: text.length,
      },
    }
  }

  // Mock 語法檢查
  private mockGrammarCheck(text: string): TextProcessingResult {
    const corrections: TextCorrection[] = []
    const suggestions: string[] = []

    // 模擬語法問題檢測
    if (text.includes('因為所以')) {
      corrections.push({
        type: 'grammar',
        original: '因為所以',
        corrected: '由於...因此...',
        position: {
          start: text.indexOf('因為所以'),
          end: text.indexOf('因為所以') + 4,
        },
        confidence: 0.8,
        explanation: '「因為所以」的用法不當',
      })
    }

    suggestions.push(...this.mockSuggestions.grammar)

    return {
      processedText: text,
      corrections,
      suggestions,
      metadata: {
        confidence: 0.85,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: text.length,
      },
    }
  }

  // Mock 改善清晰度
  private mockImproveClarity(text: string): TextProcessingResult {
    const improvements: TextImprovement[] = []
    let processedText = text

    // 模擬改善建議
    if (text.length > 100) {
      improvements.push({
        type: 'clarity',
        suggestion: '建議將長句拆分為多個短句',
        priority: 'medium',
        explanation: '長句可能影響閱讀理解',
      })
    }

    if (text.includes('很好')) {
      improvements.push({
        type: 'vocabulary',
        suggestion: '可以使用更具體的形容詞',
        priority: 'low',
        explanation: '「很好」過於籠統',
      })
      processedText = processedText.replace('很好', '優秀')
    }

    return {
      processedText,
      improvements,
      metadata: {
        confidence: 0.8,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: text.length,
      },
    }
  }

  // Mock 總結
  private mockSummarize(text: string, maxLength: number): TextProcessingResult {
    const sentences = text.split(/[。！？]/).filter(s => s.trim())
    const summaryLength = Math.min(maxLength, Math.ceil(sentences.length / 2))
    const summary = sentences.slice(0, summaryLength).join('。') + '。'

    return {
      processedText: summary,
      metadata: {
        confidence: 0.75,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: summary.length,
      },
    }
  }

  // Mock 擴展
  private mockExpand(text: string): TextProcessingResult {
    const expandedText =
      text + ' 此外，我們可以進一步探討相關的細節和應用場景。'

    return {
      processedText: expandedText,
      metadata: {
        confidence: 0.7,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: expandedText.length,
      },
    }
  }

  // Mock 翻譯
  private mockTranslate(
    text: string,
    targetLanguage: string,
  ): TextProcessingResult {
    const translations: Record<string, string> = {
      en: 'This is a mock translation to English.',
      ja: 'これは日本語へのモック翻訳です。',
      ko: '이것은 한국어로의 모의 번역입니다.',
      fr: 'Ceci est une traduction fictive en français.',
    }

    const processedText = translations[targetLanguage] || text

    return {
      processedText,
      metadata: {
        confidence: 0.8,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: processedText.length,
      },
    }
  }

  // Mock 語調調整
  private mockToneAdjust(text: string, tone: string): TextProcessingResult {
    let processedText = text

    switch (tone) {
      case 'formal':
        processedText = text.replace(/很/g, '相當').replace(/好/g, '良好')
        break
      case 'casual':
        processedText = text.replace(/非常/g, '超').replace(/優秀/g, '棒')
        break
      case 'professional':
        processedText = text
          .replace(/我覺得/g, '據分析')
          .replace(/應該/g, '建議')
        break
    }

    return {
      processedText,
      metadata: {
        confidence: 0.75,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: processedText.length,
      },
    }
  }

  // Mock 格式化
  private mockFormat(text: string, format: string): TextProcessingResult {
    let processedText = text

    switch (format) {
      case 'bullet_points':
        const points = text.split(/[。！？]/).filter(s => s.trim())
        processedText = points.map(point => `• ${point.trim()}`).join('\n')
        break
      case 'numbered_list':
        const items = text.split(/[。！？]/).filter(s => s.trim())
        processedText = items
          .map((item, index) => `${index + 1}. ${item.trim()}`)
          .join('\n')
        break
      case 'paragraph':
        processedText = text.replace(/\n+/g, '\n\n')
        break
    }

    return {
      processedText,
      metadata: {
        confidence: 0.9,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: processedText.length,
      },
    }
  }

  // Mock 提取關鍵詞
  private mockExtractKeywords(text: string): TextProcessingResult {
    const keywords = [
      '協作',
      '同步',
      '效率',
      '文檔',
      '團隊',
      '創新',
      '技術',
      '管理',
    ]
    const foundKeywords = keywords.filter(keyword => text.includes(keyword))

    return {
      processedText: foundKeywords.join(', '),
      suggestions: foundKeywords,
      metadata: {
        confidence: 0.85,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: text.length,
      },
    }
  }

  // Mock 生成大綱
  private mockGenerateOutline(_text: string): TextProcessingResult {
    const outline = `
1. 主要概念
   - 核心思想
   - 重要觀點

2. 詳細內容
   - 具體說明
   - 實例分析

3. 總結與建議
   - 關鍵要點
   - 後續行動
    `.trim()

    return {
      processedText: outline,
      metadata: {
        confidence: 0.7,
        processingTime: Date.now(),
        model: this.config.model,
        tokens: outline.length,
      },
    }
  }

  // 批量處理文本
  async batchProcessText(
    requests: TextProcessingRequest[],
  ): Promise<TextProcessingResult[]> {
    const results: TextProcessingResult[] = []

    for (const request of requests) {
      try {
        const result = await this.processText(request)
        results.push(result)
      } catch (error) {
        console.error('Batch processing error:', error)
        // 添加錯誤結果
        results.push({
          processedText: request.text,
          metadata: {
            confidence: 0,
            processingTime: Date.now(),
            model: 'error',
            tokens: 0,
          },
        })
      }
    }

    return results
  }

  // 獲取建議
  async getSuggestions(_text: string): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Mock 建議
    const suggestions = [
      '考慮增加更多細節說明',
      '可以添加相關的例子',
      '建議調整段落結構',
      '語調可以更加正式',
      '添加過渡句以提高連貫性',
    ]

    return suggestions.slice(0, 3)
  }

  // 保存處理歷史
  private async saveProcessingHistory(): Promise<void> {
    try {
      const history = this.processingHistory.slice(0, 50) // 只保留最近 50 條
      await AsyncStorage.setItem(
        'ai_processing_history',
        JSON.stringify(history),
      )
    } catch (error) {
      console.error('Failed to save processing history:', error)
    }
  }

  // 加載處理歷史
  private async loadProcessingHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('ai_processing_history')
      if (stored) {
        this.processingHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load processing history:', error)
      this.processingHistory = []
    }
  }

  // 獲取處理歷史
  getProcessingHistory(): ProcessingHistory[] {
    return [...this.processingHistory]
  }

  // 清除處理歷史
  async clearProcessingHistory(): Promise<void> {
    try {
      this.processingHistory = []
      await AsyncStorage.removeItem('ai_processing_history')
    } catch (error) {
      console.error('Failed to clear processing history:', error)
    }
  }

  // 評價處理結果
  async rateProcessingResult(historyId: string, rating: number): Promise<void> {
    const historyItem = this.processingHistory.find(
      item => item.id === historyId,
    )
    if (historyItem) {
      historyItem.userRating = rating
      await this.saveProcessingHistory()
    }
  }

  // 設置配置
  setConfig(config: Partial<AIAssistantConfig>): void {
    this.config = {...this.config, ...config}
    console.log('AI config updated:', this.config)
  }

  // 獲取配置
  getConfig(): AIAssistantConfig {
    return {...this.config}
  }

  // 檢查功能可用性
  isFeatureEnabled(feature: keyof AIAssistantConfig): boolean {
    return Boolean(this.config[feature])
  }

  // 獲取支援的操作
  getSupportedActions(): TextProcessingAction[] {
    return [
      'autocorrect',
      'grammar_check',
      'improve_clarity',
      'summarize',
      'expand',
      'translate',
      'tone_adjust',
      'format',
      'extract_keywords',
      'generate_outline',
    ]
  }

  // 清理服務
  cleanup(): void {
    this.isInitialized = false
    this.processingHistory = []
    console.log('AI text processing service cleaned up')
  }
}

export default AITextProcessingService
