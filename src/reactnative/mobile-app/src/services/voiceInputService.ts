import {Platform, PermissionsAndroid} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {MOCK_CONFIG} from '../utils/constants'

// Mock 語音 API 接口定義（替代 @react-native-voice/voice）
export interface SpeechResultsEvent {
  value?: string[]
}

export interface SpeechErrorEvent {
  error?: {
    message: string
  }
}

export interface SpeechStartEvent {
  // Empty interface for compatibility
}

export interface SpeechEndEvent {
  // Empty interface for compatibility
}

// Mock Voice API 類別
class MockVoice {
  static onSpeechStart?: (event: SpeechStartEvent) => void
  static onSpeechEnd?: (event: SpeechEndEvent) => void
  static onSpeechResults?: (event: SpeechResultsEvent) => void
  static onSpeechPartialResults?: (event: SpeechResultsEvent) => void
  static onSpeechError?: (event: SpeechErrorEvent) => void

  static async isAvailable(): Promise<boolean> {
    return true
  }

  static async getSupportedLocales(): Promise<string[]> {
    return ['zh-TW', 'zh-CN', 'en-US', 'ja-JP', 'ko-KR']
  }

  static async start(
    language: string,
    options?: Record<string, any>,
  ): Promise<void> {
    console.log(`Mock Voice.start called with language: ${language}`, options)
    return Promise.resolve()
  }

  static async stop(): Promise<void> {
    console.log('Mock Voice.stop called')
    return Promise.resolve()
  }

  static async cancel(): Promise<void> {
    console.log('Mock Voice.cancel called')
    return Promise.resolve()
  }

  static removeAllListeners(): void {
    console.log('Mock Voice.removeAllListeners called')
    this.onSpeechStart = undefined
    this.onSpeechEnd = undefined
    this.onSpeechResults = undefined
    this.onSpeechPartialResults = undefined
    this.onSpeechError = undefined
  }

  static destroy(): void {
    console.log('Mock Voice.destroy called')
    this.removeAllListeners()
  }
}

const Voice = MockVoice

export interface VoiceRecognitionConfig {
  language: string
  timeout: number
  partialResults: boolean
  continuousListening: boolean
  punctuation: boolean
  profanityFilter: boolean
}

export interface VoiceRecognitionResult {
  text: string
  confidence: number
  language: string
  isFinal: boolean
  alternatives?: Array<{text: string; confidence: number}>
  timestamp: number
}

export interface VoiceRecognitionState {
  isListening: boolean
  isAvailable: boolean
  hasPermission: boolean
  currentLanguage: string
  supportedLanguages: string[]
  error?: string
}

export type VoiceEventCallback = (result: VoiceRecognitionResult) => void
export type VoiceErrorCallback = (error: string) => void
export type VoiceStateCallback = (state: VoiceRecognitionState) => void

class VoiceInputService {
  private mockMode = MOCK_CONFIG.enabled
  private config: VoiceRecognitionConfig
  private state: VoiceRecognitionState
  private isInitialized = false

  // Event callbacks
  private onResult?: VoiceEventCallback
  private onError?: VoiceErrorCallback
  private onStateChange?: VoiceStateCallback

  // Mock data for testing
  private mockPhrases = [
    '這是一個語音輸入測試',
    '人工智能助手正在幫助您',
    '語音識別功能運作正常',
    '請繼續說話，系統正在聆聽',
    'Hello, this is a voice recognition test',
    'The weather is beautiful today',
    'Artificial intelligence is amazing',
    'Voice input makes typing easier',
  ]

  constructor(config: Partial<VoiceRecognitionConfig> = {}) {
    this.config = {
      language: 'zh-TW',
      timeout: 10000,
      partialResults: true,
      continuousListening: false,
      punctuation: true,
      profanityFilter: false,
      ...config,
    }

    this.state = {
      isListening: false,
      isAvailable: false,
      hasPermission: false,
      currentLanguage: this.config.language,
      supportedLanguages: [],
    }

    console.log('VoiceInputService initialized with mock mode:', this.mockMode)
  }

  // 初始化語音服務
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      if (this.mockMode) {
        await this.initializeMockService()
      } else {
        await this.initializeRealService()
      }

      this.isInitialized = true
      this.notifyStateChange()
      console.log('Voice service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize voice service:', error)
      this.state.error = (error as Error).message
      this.notifyStateChange()
    }
  }

  // 初始化真實語音服務
  private async initializeRealService(): Promise<void> {
    // 檢查權限
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) {
      throw new Error('Microphone permission denied')
    }

    // 檢查語音服務可用性
    const isAvailable = await Voice.isAvailable()
    if (!isAvailable) {
      throw new Error('Voice recognition not available on this device')
    }

    // 獲取支援的語言
    const supportedLanguages = await Voice.getSupportedLocales()

    // 設置事件監聽器
    Voice.onSpeechStart = this.handleSpeechStart
    Voice.onSpeechEnd = this.handleSpeechEnd
    Voice.onSpeechResults = this.handleSpeechResults
    Voice.onSpeechPartialResults = this.handleSpeechPartialResults
    Voice.onSpeechError = this.handleSpeechError

    this.state = {
      ...this.state,
      isAvailable: true,
      hasPermission: true,
      supportedLanguages: supportedLanguages || [],
    }
  }

  // 初始化 Mock 服務
  private async initializeMockService(): Promise<void> {
    // 模擬權限檢查延遲
    await new Promise(resolve => setTimeout(resolve, 1000))

    this.state = {
      ...this.state,
      isAvailable: true,
      hasPermission: true,
      supportedLanguages: [
        'zh-TW',
        'zh-CN',
        'en-US',
        'ja-JP',
        'ko-KR',
        'fr-FR',
        'de-DE',
        'es-ES',
      ],
    }
  }

  // 請求麥克風權限
  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '麥克風權限',
            message: '此應用需要使用麥克風進行語音輸入',
            buttonNeutral: '稍後詢問',
            buttonNegative: '拒絕',
            buttonPositive: '允許',
          },
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (error) {
        console.error('Failed to request microphone permission:', error)
        return false
      }
    }
    return true // iOS 會在 Info.plist 中處理權限
  }

  // 開始語音識別
  async startListening(
    language?: string,
    onResult?: VoiceEventCallback,
    onError?: VoiceErrorCallback,
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (this.state.isListening) {
      console.log('Already listening, stopping first')
      await this.stopListening()
    }

    if (!this.state.hasPermission) {
      const error = 'Microphone permission not granted'
      console.error(error)
      onError?.(error)
      return
    }

    this.onResult = onResult
    this.onError = onError

    const targetLanguage = language || this.config.language
    this.state.currentLanguage = targetLanguage

    try {
      if (this.mockMode) {
        await this.startMockListening(targetLanguage)
      } else {
        await this.startRealListening(targetLanguage)
      }

      this.state.isListening = true
      this.notifyStateChange()
      console.log(`Started listening in ${targetLanguage}`)
    } catch (error) {
      console.error('Failed to start listening:', error)
      const errorMessage = (error as Error).message
      this.state.error = errorMessage
      this.notifyStateChange()
      onError?.(errorMessage)
    }
  }

  // 開始真實語音識別
  private async startRealListening(language: string): Promise<void> {
    await Voice.start(language, {
      EXTRA_PARTIAL_RESULTS: this.config.partialResults,
      REQUEST_PERMISSIONS_AUTO: true,
      EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: this.config.timeout,
      EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
    })
  }

  // 開始 Mock 語音識別
  private async startMockListening(language: string): Promise<void> {
    // 模擬語音識別開始
    this.handleSpeechStart({} as SpeechStartEvent)

    // 模擬部分結果
    if (this.config.partialResults) {
      setTimeout(() => {
        this.handleMockPartialResults(language)
      }, 1000)
    }

    // 模擬最終結果
    setTimeout(() => {
      this.handleMockFinalResults(language)
      this.handleSpeechEnd({} as SpeechEndEvent)
    }, 3000 + Math.random() * 2000)
  }

  // 停止語音識別
  async stopListening(): Promise<void> {
    if (!this.state.isListening) {
      return
    }

    try {
      if (!this.mockMode) {
        await Voice.stop()
      }

      this.state.isListening = false
      this.notifyStateChange()
      console.log('Stopped listening')
    } catch (error) {
      console.error('Failed to stop listening:', error)
    }
  }

  // 取消語音識別
  async cancelListening(): Promise<void> {
    if (!this.state.isListening) {
      return
    }

    try {
      if (!this.mockMode) {
        await Voice.cancel()
      }

      this.state.isListening = false
      this.notifyStateChange()
      console.log('Cancelled listening')
    } catch (error) {
      console.error('Failed to cancel listening:', error)
    }
  }

  // 處理語音開始事件
  private handleSpeechStart = (_event: SpeechStartEvent): void => {
    console.log('Speech started')
    this.state.isListening = true
    this.notifyStateChange()
  }

  // 處理語音結束事件
  private handleSpeechEnd = (_event: SpeechEndEvent): void => {
    console.log('Speech ended')
    this.state.isListening = false
    this.notifyStateChange()
  }

  // 處理語音識別結果
  private handleSpeechResults = (event: SpeechResultsEvent): void => {
    const {value} = event
    console.log('Speech results:', value)

    if (value && value.length > 0) {
      const result: VoiceRecognitionResult = {
        text: value[0],
        confidence: 0.9, // Real implementation would provide actual confidence
        language: this.state.currentLanguage,
        isFinal: true,
        alternatives: value.slice(1).map((text: string, index: number) => ({
          text,
          confidence: 0.9 - (index + 1) * 0.1,
        })),
        timestamp: Date.now(),
      }

      this.onResult?.(result)
    }
  }

  // 處理部分語音識別結果
  private handleSpeechPartialResults = (event: SpeechResultsEvent): void => {
    const {value} = event
    console.log('Partial speech results:', value)

    if (value && value.length > 0) {
      const result: VoiceRecognitionResult = {
        text: value[0],
        confidence: 0.7,
        language: this.state.currentLanguage,
        isFinal: false,
        timestamp: Date.now(),
      }

      this.onResult?.(result)
    }
  }

  // 處理語音識別錯誤
  private handleSpeechError = (event: SpeechErrorEvent): void => {
    console.error('Speech error:', event.error)
    this.state.isListening = false
    const errorMessage = event.error?.message || 'Unknown speech error'
    this.state.error = errorMessage
    this.notifyStateChange()
    this.onError?.(errorMessage)
  }

  // Mock 部分結果處理
  private handleMockPartialResults(language: string): void {
    const phrase = this.getRandomMockPhrase(language)
    const partialText = phrase.substring(0, phrase.length / 2)

    const result: VoiceRecognitionResult = {
      text: partialText,
      confidence: 0.7,
      language,
      isFinal: false,
      timestamp: Date.now(),
    }

    this.onResult?.(result)
  }

  // Mock 最終結果處理
  private handleMockFinalResults(language: string): void {
    const phrase = this.getRandomMockPhrase(language)

    const result: VoiceRecognitionResult = {
      text: phrase,
      confidence: 0.9 + Math.random() * 0.1,
      language,
      isFinal: true,
      alternatives: [
        {
          text: this.getRandomMockPhrase(language),
          confidence: 0.8,
        },
        {
          text: this.getRandomMockPhrase(language),
          confidence: 0.7,
        },
      ],
      timestamp: Date.now(),
    }

    this.onResult?.(result)
  }

  // 獲取隨機 Mock 短語
  private getRandomMockPhrase(language: string): string {
    const chinesePhrases = this.mockPhrases.filter(phrase =>
      /[\u4e00-\u9fff]/.test(phrase),
    )
    const englishPhrases = this.mockPhrases.filter(phrase =>
      /^[a-zA-Z\s,.'!?]+$/.test(phrase),
    )

    if (language.startsWith('zh')) {
      return chinesePhrases[Math.floor(Math.random() * chinesePhrases.length)]
    } else {
      return englishPhrases[Math.floor(Math.random() * englishPhrases.length)]
    }
  }

  // 設置配置
  setConfig(config: Partial<VoiceRecognitionConfig>): void {
    this.config = {...this.config, ...config}
    console.log('Voice config updated:', this.config)
  }

  // 設置狀態變更回調
  setStateChangeCallback(callback: VoiceStateCallback): void {
    this.onStateChange = callback
  }

  // 通知狀態變更
  private notifyStateChange(): void {
    this.onStateChange?.(this.state)
  }

  // 獲取當前狀態
  getState(): VoiceRecognitionState {
    return {...this.state}
  }

  // 獲取支援的語言
  getSupportedLanguages(): string[] {
    return [...this.state.supportedLanguages]
  }

  // 檢查語言是否支援
  isLanguageSupported(language: string): boolean {
    return this.state.supportedLanguages.includes(language)
  }

  // 保存語音識別歷史
  async saveRecognitionHistory(result: VoiceRecognitionResult): Promise<void> {
    try {
      const history = await this.getRecognitionHistory()
      history.unshift(result)

      // 只保留最近 100 條記錄
      const trimmedHistory = history.slice(0, 100)

      await AsyncStorage.setItem(
        'voice_recognition_history',
        JSON.stringify(trimmedHistory),
      )
    } catch (error) {
      console.error('Failed to save recognition history:', error)
    }
  }

  // 獲取語音識別歷史
  async getRecognitionHistory(): Promise<VoiceRecognitionResult[]> {
    try {
      const stored = await AsyncStorage.getItem('voice_recognition_history')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get recognition history:', error)
      return []
    }
  }

  // 清除語音識別歷史
  async clearRecognitionHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem('voice_recognition_history')
    } catch (error) {
      console.error('Failed to clear recognition history:', error)
    }
  }

  // 清理服務
  cleanup(): void {
    if (!this.mockMode) {
      Voice.removeAllListeners()
      Voice.destroy()
    }

    this.isInitialized = false
    this.state.isListening = false
    console.log('Voice service cleaned up')
  }
}

export default VoiceInputService
