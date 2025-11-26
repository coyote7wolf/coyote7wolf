import {MOCK_CONFIG} from '../utils/constants'

export interface AISuggestion {
  id: string
  type: 'title' | 'content' | 'grammar' | 'style' | 'translation'
  original: string
  suggestion: string
  confidence: number
  reasoning: string
  position?: {start: number; end: number}
}

export interface VoiceRecognitionResult {
  text: string
  confidence: number
  language: string
  alternatives?: Array<{text: string; confidence: number}>
}

export interface ContentGenerationRequest {
  type: 'continue' | 'summarize' | 'expand' | 'translate' | 'improve'
  content: string
  context?: string
  language?: string
  style?: 'formal' | 'casual' | 'technical' | 'creative'
}

export interface ContentGenerationResult {
  generated: string
  confidence: number
  reasoning: string
  alternatives?: string[]
}

class AIService {
  private mockMode = MOCK_CONFIG.enabled

  constructor() {
    console.log('AIService initialized with mock mode:', this.mockMode)
  }

  // Speech recognition
  async startVoiceRecognition(
    language = 'zh-TW',
  ): Promise<VoiceRecognitionResult> {
    if (this.mockMode) {
      return this.mockVoiceRecognition(language)
    }

    // Real implementation would use react-native-voice or similar
    throw new Error('Real voice recognition not implemented')
  }

  private async mockVoiceRecognition(
    language: string,
  ): Promise<VoiceRecognitionResult> {
    // Simulate processing delay
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    )

    const mockTexts = {
      'zh-TW': [
        '今天天氣很好，適合出門散步。',
        '我想要寫一篇關於人工智慧的文章。',
        '請幫我檢查這段文字的語法錯誤。',
        '這個專案需要在下週完成。',
        '讓我們討論一下這個提案的可行性。',
      ],
      'en-US': [
        'The weather is nice today, perfect for a walk.',
        'I want to write an article about artificial intelligence.',
        'Please help me check grammar errors in this text.',
        'This project needs to be completed next week.',
        'Let us discuss the feasibility of this proposal.',
      ],
    }

    const texts =
      mockTexts[language as keyof typeof mockTexts] || mockTexts['en-US']
    const selectedText = texts[Math.floor(Math.random() * texts.length)]

    return {
      text: selectedText,
      confidence: 0.8 + Math.random() * 0.2,
      language,
      alternatives: [
        {text: selectedText + ' (替代1)', confidence: 0.7},
        {text: selectedText + ' (替代2)', confidence: 0.6},
      ],
    }
  }

  // Content generation
  async generateContent(
    request: ContentGenerationRequest,
  ): Promise<ContentGenerationResult> {
    if (this.mockMode) {
      return this.mockGenerateContent(request)
    }

    // Real implementation would call AI API (OpenAI, Azure OpenAI, etc.)
    throw new Error('Real content generation not implemented')
  }

  private async mockGenerateContent(
    request: ContentGenerationRequest,
  ): Promise<ContentGenerationResult> {
    // Simulate processing delay
    await new Promise(resolve =>
      setTimeout(resolve, 2000 + Math.random() * 3000),
    )

    const {type, content} = request

    let generated = ''
    let reasoning = ''

    switch (type) {
      case 'continue':
        generated =
          content +
          '接下來我們可以探討更深入的議題，包括相關的技術細節和實際應用場景。'
        reasoning = '基於上下文內容，提供了自然的續寫建議'
        break

      case 'summarize':
        generated =
          '摘要：本文主要討論了' +
          content.slice(0, 20) +
          '等相關內容，重點在於...'
        reasoning = '提取文本中的關鍵信息，形成簡潔的摘要'
        break

      case 'expand':
        generated =
          content +
          '\n\n進一步說明：這個觀點可以從多個角度來理解。首先，我們需要考慮歷史背景...'
        reasoning = '在原有內容基礎上，添加了更多詳細說明和分析'
        break

      case 'translate':
        generated =
          'Translation: ' + content.replace(/[\u4e00-\u9fff]/g, '[Chinese]')
        reasoning = '將中文內容翻譯為英文，保持原意不變'
        break

      case 'improve':
        generated = content.replace(/。/g, '，並且提供了更好的表達方式。')
        reasoning = '改進了文本的表達方式，使其更加流暢和專業'
        break

      default:
        generated = content + '（AI 輔助完成）'
        reasoning = '提供了基本的文本輔助'
    }

    return {
      generated,
      confidence: 0.75 + Math.random() * 0.25,
      reasoning,
      alternatives: [generated + ' (替代方案1)', generated + ' (替代方案2)'],
    }
  }

  // Smart suggestions
  async getSmartSuggestions(
    content: string,
    cursorPosition: number,
  ): Promise<AISuggestion[]> {
    if (this.mockMode) {
      return this.mockGetSmartSuggestions(content, cursorPosition)
    }

    // Real implementation would analyze content and provide suggestions
    throw new Error('Real smart suggestions not implemented')
  }

  private async mockGetSmartSuggestions(
    content: string,
    cursorPosition: number,
  ): Promise<AISuggestion[]> {
    // Simulate analysis delay
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000),
    )

    const suggestions: AISuggestion[] = []

    // Title suggestions
    if (content.length < 50) {
      suggestions.push({
        id: 'title-1',
        type: 'title',
        original: content,
        suggestion: content + ' - 深度分析',
        confidence: 0.8,
        reasoning: '建議添加副標題以提高文章吸引力',
      })
    }

    // Grammar suggestions
    if (content.includes('的的')) {
      suggestions.push({
        id: 'grammar-1',
        type: 'grammar',
        original: '的的',
        suggestion: '的',
        confidence: 0.9,
        reasoning: '檢測到重複的助詞，建議刪除',
        position: {
          start: content.indexOf('的的'),
          end: content.indexOf('的的') + 2,
        },
      })
    }

    // Style improvements
    if (content.length > 100 && !content.includes('，')) {
      suggestions.push({
        id: 'style-1',
        type: 'style',
        original: content,
        suggestion: content.replace(/。/g, '，這樣可以讓文章更加流暢。'),
        confidence: 0.7,
        reasoning: '建議添加適當的標點符號來改善文章流暢度',
      })
    }

    // Content suggestions
    if (cursorPosition > content.length - 10) {
      suggestions.push({
        id: 'content-1',
        type: 'content',
        original: content,
        suggestion: content + '\n\n此外，我們還可以考慮以下幾個方面：',
        confidence: 0.75,
        reasoning: '基於當前內容，建議添加進一步的討論點',
      })
    }

    return suggestions
  }

  // Proofreading
  async proofreadText(text: string): Promise<AISuggestion[]> {
    if (this.mockMode) {
      return this.mockProofreadText(text)
    }

    // Real implementation would use grammar checking API
    throw new Error('Real proofreading not implemented')
  }

  private async mockProofreadText(text: string): Promise<AISuggestion[]> {
    // Simulate processing delay
    await new Promise(resolve =>
      setTimeout(resolve, 1500 + Math.random() * 2000),
    )

    const suggestions: AISuggestion[] = []

    // Common grammar issues
    const grammarPatterns = [
      {pattern: /他們的的/g, suggestion: '他們的', reason: '重複的助詞'},
      {
        pattern: /因為所以/g,
        suggestion: '因為',
        reason: '不應同時使用「因為」和「所以」',
      },
      {
        pattern: /雖然但是/g,
        suggestion: '雖然',
        reason: '不應同時使用「雖然」和「但是」',
      },
      {pattern: /的話/g, suggestion: '', reason: '「的話」是冗餘表達'},
    ]

    grammarPatterns.forEach((pattern, index) => {
      const matches = [...text.matchAll(pattern.pattern)]
      matches.forEach(match => {
        if (match.index !== undefined) {
          suggestions.push({
            id: `grammar-${index}-${match.index}`,
            type: 'grammar',
            original: match[0],
            suggestion: pattern.suggestion,
            confidence: 0.85,
            reasoning: pattern.reason,
            position: {start: match.index, end: match.index + match[0].length},
          })
        }
      })
    })

    // Style suggestions
    if (text.length > 200 && text.split('。').length < 3) {
      suggestions.push({
        id: 'style-long-sentence',
        type: 'style',
        original: text,
        suggestion: text.replace(/，/g, '。同時，'),
        confidence: 0.7,
        reasoning: '建議將長句子分解為較短的句子以提高可讀性',
      })
    }

    return suggestions
  }

  // Translation
  async translateText(
    text: string,
    targetLanguage = 'en',
  ): Promise<ContentGenerationResult> {
    if (this.mockMode) {
      return this.mockTranslateText(text, targetLanguage)
    }

    // Real implementation would use translation API
    throw new Error('Real translation not implemented')
  }

  private async mockTranslateText(
    text: string,
    targetLanguage: string,
  ): Promise<ContentGenerationResult> {
    // Simulate translation delay
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    )

    const translations = {
      en: 'English translation of: ' + text,
      ja: '日本語翻訳: ' + text,
      ko: '한국어 번역: ' + text,
      fr: 'Traduction française: ' + text,
    }

    const translated =
      translations[targetLanguage as keyof typeof translations] ||
      translations.en

    return {
      generated: translated,
      confidence: 0.8 + Math.random() * 0.2,
      reasoning: `將文本翻譯為${targetLanguage}`,
      alternatives: [translated + ' (替代翻譯1)', translated + ' (替代翻譯2)'],
    }
  }

  // Context-aware suggestions
  async getContextSuggestions(
    currentText: string,
    documentHistory: string[],
  ): Promise<AISuggestion[]> {
    if (this.mockMode) {
      return this.mockGetContextSuggestions(currentText, documentHistory)
    }

    throw new Error('Real context suggestions not implemented')
  }

  private async mockGetContextSuggestions(
    currentText: string,
    documentHistory: string[],
  ): Promise<AISuggestion[]> {
    // Simulate analysis
    await new Promise(resolve =>
      setTimeout(resolve, 800 + Math.random() * 1200),
    )

    const suggestions: AISuggestion[] = []

    // Analyze document history for patterns
    const commonWords = documentHistory
      .join(' ')
      .split(' ')
      .filter(word => word.length > 2)

    if (commonWords.length > 0) {
      const randomWord =
        commonWords[Math.floor(Math.random() * commonWords.length)]
      suggestions.push({
        id: 'context-1',
        type: 'content',
        original: currentText,
        suggestion: currentText + ` 這與之前提到的「${randomWord}」概念相關。`,
        confidence: 0.6,
        reasoning: '基於文檔歷史，發現相關概念可以建立連結',
      })
    }

    return suggestions
  }
}

export const aiService = new AIService()
export default aiService
