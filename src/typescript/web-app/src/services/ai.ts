/**
 * AI Suggestion Service
 *
 * Comprehensive AI-powered content assistance including suggestions,
 * grammar checking, translation, tone analysis, and smart writing features.
 * This is a mock implementation for development and testing.
 */

// Types for AI suggestions
export interface AISuggestion {
  id: string
  type: 'grammar' | 'style' | 'tone' | 'content' | 'completion' | 'translation'
  severity: 'low' | 'medium' | 'high'
  originalText: string
  suggestedText: string
  explanation: string
  confidence: number
  position: { start: number; end: number }
  category: string
  metadata: {
    rule?: string
    alternatives?: string[]
    reasoning?: string
    source?: string
  }
}

export interface ToneAnalysis {
  overall:
    | 'formal'
    | 'casual'
    | 'professional'
    | 'friendly'
    | 'neutral'
    | 'academic'
    | 'creative'
  confidence: number
  aspects: {
    formality: number
    politeness: number
    emotion: number
    clarity: number
    engagement: number
  }
  suggestions: string[]
  targetAudience: string[]
}

export interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
  alternatives: string[]
  metadata: {
    service: string
    model: string
    timestamp: number
  }
}

export interface ContentInsight {
  readability: {
    score: number
    level: string
    averageWordsPerSentence: number
    averageSyllablesPerWord: number
    suggestions: string[]
  }
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral'
    score: number
    confidence: number
  }
  keywords: {
    word: string
    frequency: number
    importance: number
  }[]
  structure: {
    paragraphs: number
    sentences: number
    words: number
    characters: number
    averageParagraphLength: number
  }
}

export interface WritingAssistanceOptions {
  enableGrammarCheck: boolean
  enableStyleSuggestions: boolean
  enableToneAnalysis: boolean
  enableContentSuggestions: boolean
  enableAutoComplete: boolean
  targetAudience: 'general' | 'academic' | 'business' | 'casual' | 'technical'
  preferredTone: 'formal' | 'casual' | 'professional' | 'friendly' | 'neutral'
  language: string
}

class AIService {
  private mockGrammarRules = [
    {
      id: 'subject_verb_agreement',
      message: 'Subject and verb must agree in number',
    },
    {
      id: 'comma_splice',
      message: 'Comma splice detected - consider using a semicolon or period',
    },
    {
      id: 'dangling_modifier',
      message: 'Dangling modifier - unclear what is being modified',
    },
    { id: 'passive_voice', message: 'Consider using active voice for clarity' },
    { id: 'wordiness', message: 'This phrase can be simplified' },
    { id: 'spelling', message: 'Possible spelling error' },
    { id: 'capitalization', message: 'Capitalization error' },
    { id: 'punctuation', message: 'Punctuation error' },
  ]

  private mockContentTemplates = {
    business: [
      'I am writing to inform you that',
      'Please find attached',
      'I would like to schedule a meeting',
      'Thank you for your consideration',
      'Looking forward to your response',
    ],
    academic: [
      'According to recent studies',
      'The research indicates that',
      'Furthermore, it should be noted',
      'In conclusion, the evidence suggests',
      'This paper aims to explore',
    ],
    casual: [
      'Hey there!',
      "Hope you're doing well",
      'Just wanted to let you know',
      'Catch you later',
      'What do you think?',
    ],
  }

  private mockTranslations = new Map([
    [
      'hello',
      { es: 'hola', fr: 'bonjour', de: 'hallo', it: 'ciao', pt: 'olá' },
    ],
    [
      'goodbye',
      {
        es: 'adiós',
        fr: 'au revoir',
        de: 'auf wiedersehen',
        it: 'ciao',
        pt: 'tchau',
      },
    ],
    [
      'thank you',
      { es: 'gracias', fr: 'merci', de: 'danke', it: 'grazie', pt: 'obrigado' },
    ],
    [
      'please',
      {
        es: 'por favor',
        fr: "s'il vous plaît",
        de: 'bitte',
        it: 'per favore',
        pt: 'por favor',
      },
    ],
  ])

  /**
   * Analyze text and provide AI-powered suggestions
   */
  async analyzeText(
    text: string,
    options: WritingAssistanceOptions
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    if (options.enableGrammarCheck) {
      suggestions.push(...(await this.checkGrammar(text)))
    }

    if (options.enableStyleSuggestions) {
      suggestions.push(
        ...(await this.analyzeStyle(text, options.targetAudience))
      )
    }

    if (options.enableContentSuggestions) {
      suggestions.push(
        ...(await this.generateContentSuggestions(text, options.targetAudience))
      )
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Grammar checking with mock rules
   */
  private async checkGrammar(text: string): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]?.trim()
      if (!sentence) continue

      // Mock grammar checks
      if (sentence.includes('there is') || sentence.includes('there are')) {
        const startPos = text.indexOf(sentence)
        suggestions.push({
          id: `grammar_${Date.now()}_${i}`,
          type: 'grammar',
          severity: 'medium',
          originalText: sentence,
          suggestedText: sentence.replace(/there (is|are)/g, 'exists'),
          explanation:
            'Consider using more direct language instead of "there is/are"',
          confidence: 0.75,
          position: { start: startPos, end: startPos + sentence.length },
          category: 'Clarity',
          metadata: {
            rule: 'avoid_there_is',
            alternatives: ['exists', 'appears', 'occurs'],
            reasoning: 'Direct language is often clearer and more engaging',
          },
        })
      }

      // Check for passive voice
      if (sentence.match(/\b(was|were|is|are|been)\s+\w+ed\b/)) {
        const startPos = text.indexOf(sentence)
        suggestions.push({
          id: `style_${Date.now()}_${i}`,
          type: 'style',
          severity: 'low',
          originalText: sentence,
          suggestedText: sentence + ' (Consider active voice)',
          explanation:
            'Active voice often makes writing more engaging and direct',
          confidence: 0.65,
          position: { start: startPos, end: startPos + sentence.length },
          category: 'Voice',
          metadata: {
            rule: 'passive_voice',
            reasoning:
              'Active voice typically creates stronger, clearer sentences',
          },
        })
      }

      // Check for repetitive words
      const words = sentence.toLowerCase().split(/\s+/)
      const wordCounts = new Map<string, number>()
      words.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
      })

      for (const [word, count] of wordCounts) {
        if (count > 2 && word.length > 3) {
          const startPos = text.indexOf(sentence)
          suggestions.push({
            id: `repetition_${Date.now()}_${word}`,
            type: 'style',
            severity: 'low',
            originalText: sentence,
            suggestedText: sentence,
            explanation: `The word "${word}" appears ${count} times in this sentence`,
            confidence: 0.6,
            position: { start: startPos, end: startPos + sentence.length },
            category: 'Repetition',
            metadata: {
              rule: 'word_repetition',
              alternatives: ['synonym', 'pronoun', 'rephrase'],
              reasoning: 'Varied vocabulary makes writing more engaging',
            },
          })
        }
      }
    }

    return suggestions
  }

  /**
   * Style analysis based on target audience
   */
  private async analyzeStyle(
    text: string,
    audience: string
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []
    const words = text.split(/\s+/)
    const avgWordsPerSentence = words.length / text.split(/[.!?]+/).length

    // Check sentence length for different audiences
    if (audience === 'business' && avgWordsPerSentence > 25) {
      suggestions.push({
        id: `style_sentence_length_${Date.now()}`,
        type: 'style',
        severity: 'medium',
        originalText: text,
        suggestedText: text,
        explanation: 'Consider shorter sentences for business communication',
        confidence: 0.7,
        position: { start: 0, end: text.length },
        category: 'Clarity',
        metadata: {
          rule: 'sentence_length',
          reasoning: 'Business writing benefits from concise, clear sentences',
        },
      })
    } else if (audience === 'academic' && avgWordsPerSentence < 15) {
      suggestions.push({
        id: `style_academic_depth_${Date.now()}`,
        type: 'style',
        severity: 'low',
        originalText: text,
        suggestedText: text,
        explanation:
          'Academic writing often benefits from more detailed sentences',
        confidence: 0.6,
        position: { start: 0, end: text.length },
        category: 'Academic Style',
        metadata: {
          rule: 'academic_complexity',
          reasoning:
            'Academic writing typically includes more complex sentence structures',
        },
      })
    }

    return suggestions
  }

  /**
   * Generate content suggestions based on context
   */
  private async generateContentSuggestions(
    text: string,
    audience: string
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []
    const lastSentence =
      text
        .split(/[.!?]+/)
        .pop()
        ?.trim() || ''

    // Suggest content completion based on context
    if (lastSentence.length > 0) {
      const templates =
        this.mockContentTemplates[
          audience as keyof typeof this.mockContentTemplates
        ] || []
      const relevantTemplate = templates.find(template =>
        template
          .toLowerCase()
          .includes(lastSentence.toLowerCase().substring(0, 5))
      )

      if (relevantTemplate) {
        suggestions.push({
          id: `content_${Date.now()}`,
          type: 'completion',
          severity: 'low',
          originalText: lastSentence,
          suggestedText: relevantTemplate,
          explanation: `Suggested completion for ${audience} writing`,
          confidence: 0.55,
          position: {
            start: text.length - lastSentence.length,
            end: text.length,
          },
          category: 'Content Suggestion',
          metadata: {
            rule: 'context_completion',
            alternatives: templates.slice(0, 3),
            reasoning: `Common phrase in ${audience} communication`,
          },
        })
      }
    }

    return suggestions
  }

  /**
   * Analyze tone of the text
   */
  async analyzeTone(text: string): Promise<ToneAnalysis> {
    const words = text.toLowerCase().split(/\s+/)

    // Mock tone analysis based on keywords
    const formalWords = [
      'furthermore',
      'however',
      'therefore',
      'consequently',
      'moreover',
    ]
    const casualWords = ['yeah', 'okay', 'cool', 'awesome', 'hey', 'gonna']
    const professionalWords = [
      'please',
      'thank you',
      'regarding',
      'sincerely',
      'respectfully',
    ]
    const friendlyWords = ['hope', 'excited', 'happy', 'wonderful', 'great']

    const formalScore =
      formalWords.filter(word => words.includes(word)).length / words.length
    const casualScore =
      casualWords.filter(word => words.includes(word)).length / words.length
    const professionalScore =
      professionalWords.filter(word => words.includes(word)).length /
      words.length
    const friendlyScore =
      friendlyWords.filter(word => words.includes(word)).length / words.length

    let overall: ToneAnalysis['overall'] = 'neutral'
    let confidence = 0.5

    if (formalScore > 0.1) {
      overall = 'formal'
      confidence = Math.min(0.9, 0.5 + formalScore * 2)
    } else if (casualScore > 0.05) {
      overall = 'casual'
      confidence = Math.min(0.9, 0.5 + casualScore * 4)
    } else if (professionalScore > 0.05) {
      overall = 'professional'
      confidence = Math.min(0.9, 0.5 + professionalScore * 4)
    } else if (friendlyScore > 0.05) {
      overall = 'friendly'
      confidence = Math.min(0.9, 0.5 + friendlyScore * 4)
    }

    return {
      overall,
      confidence,
      aspects: {
        formality: formalScore * 10,
        politeness: professionalScore * 10,
        emotion: friendlyScore * 10,
        clarity: Math.min(1, words.length / text.split(/[.!?]+/).length / 20),
        engagement: Math.min(1, (friendlyScore + casualScore) * 5),
      },
      suggestions: this.generateToneSuggestions(overall, confidence),
      targetAudience: this.inferTargetAudience(overall, {
        formalScore,
        casualScore,
        professionalScore,
        friendlyScore,
      }),
    }
  }

  private generateToneSuggestions(tone: string, confidence: number): string[] {
    const suggestions: string[] = []

    if (confidence < 0.7) {
      suggestions.push(
        'Consider using more consistent language to establish a clearer tone'
      )
    }

    switch (tone) {
      case 'formal':
        suggestions.push(
          'Maintain formal language throughout',
          'Avoid contractions and colloquialisms'
        )
        break
      case 'casual':
        suggestions.push(
          'Keep the relaxed tone consistent',
          'Consider your audience when using informal language'
        )
        break
      case 'professional':
        suggestions.push(
          'Excellent professional tone',
          'Consider adding more personal touch if appropriate'
        )
        break
      case 'friendly':
        suggestions.push(
          'Great engaging tone',
          'Ensure formality level matches your audience'
        )
        break
    }

    return suggestions
  }

  private inferTargetAudience(tone: string, scores: any): string[] {
    const audiences: string[] = []

    if (scores.professionalScore > 0.05)
      audiences.push('Business professionals')
    if (scores.formalScore > 0.1) audiences.push('Academic audience')
    if (scores.casualScore > 0.05) audiences.push('General public')
    if (scores.friendlyScore > 0.05) audiences.push('Friends and colleagues')

    return audiences.length > 0 ? audiences : ['General audience']
  }

  /**
   * Translate text to specified language
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage = 'auto'
  ): Promise<TranslationResult> {
    // Mock translation - in real implementation, would call external API
    const lowerText = text.toLowerCase().trim()
    const translation = this.mockTranslations.get(lowerText)

    let translatedText = text
    let confidence = 0.5

    if (
      translation &&
      translation[targetLanguage as keyof typeof translation]
    ) {
      translatedText = translation[targetLanguage as keyof typeof translation]
      confidence = 0.95
    } else {
      // Mock translation for longer text
      translatedText = `[${targetLanguage.toUpperCase()}] ${text}`
      confidence = 0.6
    }

    return {
      originalText: text,
      translatedText,
      sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
      targetLanguage,
      confidence,
      alternatives: this.generateAlternativeTranslations(
        translatedText,
        targetLanguage
      ),
      metadata: {
        service: 'mock-ai-translator',
        model: 'mock-v1.0',
        timestamp: Date.now(),
      },
    }
  }

  private generateAlternativeTranslations(
    text: string,
    language: string
  ): string[] {
    // Mock alternatives
    return [`${text} (formal)`, `${text} (casual)`, `${text} (literal)`].slice(
      0,
      2
    )
  }

  /**
   * Get comprehensive content insights
   */
  async getContentInsights(text: string): Promise<ContentInsight> {
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)

    // Mock readability calculation
    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = this.estimateSyllables(words)
    const readabilityScore = Math.max(
      0,
      Math.min(
        100,
        206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
      )
    )

    // Mock sentiment analysis
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'fantastic',
    ]
    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'horrible',
      'disappointing',
      'poor',
    ]

    const positiveCount = words.filter(w =>
      positiveWords.includes(w.toLowerCase())
    ).length
    const negativeCount = words.filter(w =>
      negativeWords.includes(w.toLowerCase())
    ).length

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    let sentimentScore = 0

    if (positiveCount > negativeCount) {
      sentiment = 'positive'
      sentimentScore = Math.min(
        1,
        ((positiveCount - negativeCount) / words.length) * 10
      )
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative'
      sentimentScore = Math.min(
        1,
        ((negativeCount - positiveCount) / words.length) * 10
      )
    }

    // Mock keyword extraction
    const wordFreq = new Map<string, number>()
    words.forEach(word => {
      const cleaned = word.toLowerCase().replace(/[^\w]/g, '')
      if (cleaned.length > 3) {
        wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1)
      }
    })

    const keywords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, freq]) => ({
        word,
        frequency: freq,
        importance: Math.min(1, (freq / words.length) * 20),
      }))

    return {
      readability: {
        score: Math.round(readabilityScore),
        level: this.getReadabilityLevel(readabilityScore),
        averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        averageSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
        suggestions: this.generateReadabilitySuggestions(
          readabilityScore,
          avgWordsPerSentence
        ),
      },
      sentiment: {
        overall: sentiment,
        score: Math.round(sentimentScore * 100) / 100,
        confidence: Math.min(
          0.9,
          Math.max(0.1, ((positiveCount + negativeCount) / words.length) * 5)
        ),
      },
      keywords,
      structure: {
        paragraphs: paragraphs.length,
        sentences: sentences.length,
        words: words.length,
        characters: text.length,
        averageParagraphLength: Math.round(words.length / paragraphs.length),
      },
    }
  }

  private estimateSyllables(words: string[]): number {
    // Simple syllable estimation
    const totalSyllables = words.reduce((total, word) => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
      const vowels = cleanWord.match(/[aeiouy]+/g)
      let syllableCount = vowels ? vowels.length : 1

      // Adjust for silent e
      if (cleanWord.endsWith('e') && syllableCount > 1) {
        syllableCount--
      }

      return total + Math.max(1, syllableCount)
    }, 0)

    return totalSyllables / words.length
  }

  private getReadabilityLevel(score: number): string {
    if (score >= 90) return 'Very Easy'
    if (score >= 80) return 'Easy'
    if (score >= 70) return 'Fairly Easy'
    if (score >= 60) return 'Standard'
    if (score >= 50) return 'Fairly Difficult'
    if (score >= 30) return 'Difficult'
    return 'Very Difficult'
  }

  private generateReadabilitySuggestions(
    score: number,
    avgWordsPerSentence: number
  ): string[] {
    const suggestions: string[] = []

    if (score < 50) {
      suggestions.push(
        'Consider using shorter sentences to improve readability'
      )
      suggestions.push('Try using simpler words where possible')
    }

    if (avgWordsPerSentence > 20) {
      suggestions.push('Break up long sentences for better flow')
    }

    if (score > 80) {
      suggestions.push('Great readability! Your text is easy to understand')
    }

    return suggestions
  }

  /**
   * Generate writing suggestions for auto-completion
   */
  async generateCompletions(
    text: string,
    position: number,
    maxSuggestions = 3
  ): Promise<string[]> {
    const beforeCursor = text.substring(0, position)
    const lastWords = beforeCursor
      .split(/\s+/)
      .slice(-3)
      .join(' ')
      .toLowerCase()

    // Mock completion suggestions based on common patterns
    const completions: string[] = []

    if (lastWords.includes('in order to')) {
      completions.push('achieve this goal', 'ensure success', 'make progress')
    } else if (lastWords.includes('it is important')) {
      completions.push('to note that', 'to understand', 'to consider')
    } else if (lastWords.includes('on the other hand')) {
      completions.push(
        ', we should consider',
        ', it might be better',
        ', there are alternatives'
      )
    } else if (lastWords.includes('furthermore')) {
      completions.push(
        ', it should be noted',
        ', research shows',
        ', evidence suggests'
      )
    } else {
      // Generic completions based on context
      completions.push('and therefore', 'which means that', 'in this context')
    }

    return completions.slice(0, maxSuggestions)
  }

  /**
   * Generate mock conflict for testing
   */
  generateMockSuggestion(): AISuggestion {
    const mockSuggestions = [
      {
        type: 'grammar' as const,
        originalText: 'The data is showing interesting results.',
        suggestedText: 'The data are showing interesting results.',
        explanation: 'Data is a plural noun and should take a plural verb',
      },
      {
        type: 'style' as const,
        originalText: 'It is believed that the results are accurate.',
        suggestedText: 'The results appear accurate.',
        explanation: 'Active voice is clearer and more direct',
      },
      {
        type: 'tone' as const,
        originalText: 'This might be okay I guess.',
        suggestedText: 'This approach should be effective.',
        explanation: 'More confident language strengthens your message',
      },
    ]

    const mock =
      mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)]!

    return {
      id: `mock_${Date.now()}`,
      type: mock.type,
      severity: 'medium',
      originalText: mock.originalText,
      suggestedText: mock.suggestedText,
      explanation: mock.explanation,
      confidence: 0.8 + Math.random() * 0.2,
      position: { start: 0, end: mock.originalText.length },
      category: 'Mock Suggestion',
      metadata: {
        rule: 'mock_rule',
        reasoning: 'This is a mock suggestion for development purposes',
      },
    }
  }
}

export const aiService = new AIService()
export default aiService
