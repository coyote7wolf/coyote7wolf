/**
 * AI Assistant Hook
 *
 * React hook for integrating AI-powered writing assistance
 * with document editing components and real-time suggestions.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  aiService,
  AISuggestion,
  ToneAnalysis,
  TranslationResult,
  ContentInsight,
  WritingAssistanceOptions,
} from '@/services/ai'

export interface UseAIAssistantOptions {
  documentId: string
  userId: string
  enableRealTimeAnalysis?: boolean
  debounceMs?: number
  autoAnalyzeThreshold?: number
  assistanceOptions?: Partial<WritingAssistanceOptions>
}

export interface AIAssistantHookResult {
  // State
  suggestions: AISuggestion[]
  toneAnalysis: ToneAnalysis | null
  contentInsights: ContentInsight | null
  translationResult: TranslationResult | null

  // Loading states
  isAnalyzing: boolean
  isTranslating: boolean
  isApplyingSuggestion: boolean

  // Actions
  analyzeText: (text: string) => Promise<void>
  analyzeTone: (text: string) => Promise<void>
  getContentInsights: (text: string) => Promise<void>
  translateText: (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ) => Promise<void>

  // Suggestion management
  applySuggestion: (
    suggestion: AISuggestion,
    onTextChange: (newText: string) => void
  ) => Promise<void>
  dismissSuggestion: (suggestionId: string) => void
  generateCompletion: (text: string, position: number) => Promise<string[]>

  // Settings
  updateAssistanceOptions: (options: Partial<WritingAssistanceOptions>) => void
  toggleRealTimeAnalysis: () => void

  // Mock helpers for development
  generateMockSuggestion: () => AISuggestion

  // Real-time analysis helper
  performRealTimeAnalysis: (text: string) => void

  // Statistics
  stats: {
    totalSuggestions: number
    appliedSuggestions: number
    dismissedSuggestions: number
    analysisCount: number
    lastAnalysis: Date | null
  }
}

const defaultAssistanceOptions: WritingAssistanceOptions = {
  enableGrammarCheck: true,
  enableStyleSuggestions: true,
  enableToneAnalysis: true,
  enableContentSuggestions: true,
  enableAutoComplete: true,
  targetAudience: 'general',
  preferredTone: 'professional',
  language: 'en',
}

export function useAIAssistant(
  options: UseAIAssistantOptions
): AIAssistantHookResult {
  const {
    documentId,
    userId,
    enableRealTimeAnalysis = true,
    debounceMs = 1000,
    autoAnalyzeThreshold = 50,
    assistanceOptions = {},
  } = options

  // State
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null)
  const [contentInsights, setContentInsights] = useState<ContentInsight | null>(
    null
  )
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null)

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false)

  // Settings
  const [currentAssistanceOptions, setCurrentAssistanceOptions] =
    useState<WritingAssistanceOptions>({
      ...defaultAssistanceOptions,
      ...assistanceOptions,
    })
  const [realTimeEnabled, setRealTimeEnabled] = useState(enableRealTimeAnalysis)

  // Statistics
  const [stats, setStats] = useState({
    totalSuggestions: 0,
    appliedSuggestions: 0,
    dismissedSuggestions: 0,
    analysisCount: 0,
    lastAnalysis: null as Date | null,
  })

  // Refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()
  const lastAnalyzedTextRef = useRef<string>('')
  const analysisCountRef = useRef(0)

  // Debounced analysis function
  const debouncedAnalyze = useCallback(
    (text: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (
          text.length >= autoAnalyzeThreshold &&
          text !== lastAnalyzedTextRef.current
        ) {
          analyzeText(text)
          lastAnalyzedTextRef.current = text
        }
      }, debounceMs)
    },
    [debounceMs, autoAnalyzeThreshold]
  )

  // Main text analysis function
  const analyzeText = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setSuggestions([])
        return
      }

      setIsAnalyzing(true)
      try {
        const newSuggestions = await aiService.analyzeText(
          text,
          currentAssistanceOptions
        )
        setSuggestions(newSuggestions)

        // Update statistics
        setStats(prev => ({
          ...prev,
          totalSuggestions: prev.totalSuggestions + newSuggestions.length,
          analysisCount: prev.analysisCount + 1,
          lastAnalysis: new Date(),
        }))

        analysisCountRef.current++
      } catch (error) {
        console.error('Failed to analyze text:', error)
        setSuggestions([])
      } finally {
        setIsAnalyzing(false)
      }
    },
    [currentAssistanceOptions]
  )

  // Tone analysis
  const analyzeTone = useCallback(async (text: string) => {
    if (!text.trim()) {
      setToneAnalysis(null)
      return
    }

    try {
      const analysis = await aiService.analyzeTone(text)
      setToneAnalysis(analysis)
    } catch (error) {
      console.error('Failed to analyze tone:', error)
      setToneAnalysis(null)
    }
  }, [])

  // Content insights
  const getContentInsights = useCallback(async (text: string) => {
    if (!text.trim()) {
      setContentInsights(null)
      return
    }

    try {
      const insights = await aiService.getContentInsights(text)
      setContentInsights(insights)
    } catch (error) {
      console.error('Failed to get content insights:', error)
      setContentInsights(null)
    }
  }, [])

  // Translation
  const translateText = useCallback(
    async (text: string, targetLanguage: string, sourceLanguage = 'auto') => {
      if (!text.trim()) return

      setIsTranslating(true)
      try {
        const result = await aiService.translateText(
          text,
          targetLanguage,
          sourceLanguage
        )
        setTranslationResult(result)
      } catch (error) {
        console.error('Failed to translate text:', error)
        setTranslationResult(null)
      } finally {
        setIsTranslating(false)
      }
    },
    []
  )

  // Apply suggestion to text
  const applySuggestion = useCallback(
    async (
      suggestion: AISuggestion,
      onTextChange: (newText: string) => void
    ) => {
      setIsApplyingSuggestion(true)
      try {
        // Get the current text (this would be passed from the component)
        // For now, we'll simulate applying the suggestion

        // Remove the applied suggestion from the list
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))

        // Update statistics
        setStats(prev => ({
          ...prev,
          appliedSuggestions: prev.appliedSuggestions + 1,
        }))

        // In a real implementation, you would:
        // 1. Get current text from editor
        // 2. Apply the suggestion at the specified position
        // 3. Call onTextChange with the modified text

        console.log(
          'Applied suggestion:',
          suggestion.id,
          suggestion.suggestedText
        )
      } catch (error) {
        console.error('Failed to apply suggestion:', error)
      } finally {
        setIsApplyingSuggestion(false)
      }
    },
    []
  )

  // Dismiss suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    setStats(prev => ({
      ...prev,
      dismissedSuggestions: prev.dismissedSuggestions + 1,
    }))
  }, [])

  // Generate text completion suggestions
  const generateCompletion = useCallback(
    async (text: string, position: number) => {
      try {
        const completions = await aiService.generateCompletions(
          text,
          position,
          3
        )
        return completions
      } catch (error) {
        console.error('Failed to generate completions:', error)
        return []
      }
    },
    []
  )

  // Update assistance options
  const updateAssistanceOptions = useCallback(
    (newOptions: Partial<WritingAssistanceOptions>) => {
      setCurrentAssistanceOptions(prev => ({
        ...prev,
        ...newOptions,
      }))
    },
    []
  )

  // Toggle real-time analysis
  const toggleRealTimeAnalysis = useCallback(() => {
    setRealTimeEnabled(prev => !prev)
  }, [])

  // Generate mock suggestion for development
  const generateMockSuggestion = useCallback(() => {
    const mockSuggestion = aiService.generateMockSuggestion()
    setSuggestions(prev => [mockSuggestion, ...prev])
    setStats(prev => ({
      ...prev,
      totalSuggestions: prev.totalSuggestions + 1,
    }))
    return mockSuggestion
  }, [])

  // Real-time analysis effect
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Auto-analysis for tone and insights when suggestions are updated
  useEffect(() => {
    if (suggestions.length > 0 && lastAnalyzedTextRef.current) {
      // Automatically analyze tone and get insights for significant text
      if (lastAnalyzedTextRef.current.length > 100) {
        analyzeTone(lastAnalyzedTextRef.current)
        getContentInsights(lastAnalyzedTextRef.current)
      }
    }
  }, [suggestions.length, analyzeTone, getContentInsights])

  // Expose real-time analysis function for external use
  const performRealTimeAnalysis = useCallback(
    (text: string) => {
      if (realTimeEnabled) {
        debouncedAnalyze(text)
      }
    },
    [realTimeEnabled, debouncedAnalyze]
  )

  // Add to window for development (optional)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      ;(window as any).aiAssistant = {
        analyzeText,
        generateMockSuggestion,
        stats,
        suggestions,
      }
    }
  }, [analyzeText, generateMockSuggestion, stats, suggestions])

  return {
    // State
    suggestions,
    toneAnalysis,
    contentInsights,
    translationResult,

    // Loading states
    isAnalyzing,
    isTranslating,
    isApplyingSuggestion,

    // Actions
    analyzeText,
    analyzeTone,
    getContentInsights,
    translateText,

    // Suggestion management
    applySuggestion,
    dismissSuggestion,
    generateCompletion,

    // Settings
    updateAssistanceOptions,
    toggleRealTimeAnalysis,

    // Mock helpers
    generateMockSuggestion,

    // Statistics
    stats,

    // Internal helper (for external use)
    performRealTimeAnalysis,
  }
}

// Additional hook for AI writing metrics and analytics
export function useAIMetrics(documentId: string) {
  const [metrics, setMetrics] = useState({
    totalWords: 0,
    improvedWords: 0,
    readabilityImprovement: 0,
    grammarIssuesFixed: 0,
    styleImprovements: 0,
    toneConsistency: 0,
    sessionStartTime: Date.now(),
    lastUpdateTime: Date.now(),
  })

  const updateMetrics = useCallback((update: Partial<typeof metrics>) => {
    setMetrics(prev => ({
      ...prev,
      ...update,
      lastUpdateTime: Date.now(),
    }))
  }, [])

  const getSessionDuration = useCallback(() => {
    return Date.now() - metrics.sessionStartTime
  }, [metrics.sessionStartTime])

  const getImprovementRate = useCallback(() => {
    if (metrics.totalWords === 0) return 0
    return (metrics.improvedWords / metrics.totalWords) * 100
  }, [metrics.totalWords, metrics.improvedWords])

  return {
    metrics,
    updateMetrics,
    getSessionDuration,
    getImprovementRate,
  }
}

export default useAIAssistant
