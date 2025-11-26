import {useCallback} from 'react'
import {useAppDispatch, useAppSelector} from '../store'

const SUPPORTED_LANGUAGES = [
  {code: 'zh-TW', name: '繁體中文'},
  {code: 'zh-CN', name: '简体中文'},
  {code: 'en', name: 'English'},
  {code: 'ja', name: '日本語'},
  {code: 'ko', name: '한국어'},
]
import {
  startVoiceRecognition,
  generateContent,
  getSmartSuggestions,
  translateText,
  proofreadText,
  getContextSuggestions,
  setAIEnabled,
  setCurrentLanguage,
  setWritingStyle,
  clearVoiceResult,
  clearGenerationResult,
  clearSuggestions,
  applySuggestion,
  dismissSuggestion,
  clearTranslationResult,
  clearProofreadingSuggestions,
  clearAllErrors,
  selectAIState,
  selectIsAIEnabled,
  selectVoiceResult,
  selectIsListening,
  selectGenerationResult,
  selectIsGenerating,
  selectSuggestions,
  selectIsAnalyzing,
  selectTranslationResult,
  selectIsTranslating,
  selectProofreadingSuggestions,
  selectIsProofreading,
  selectCurrentLanguage,
  selectWritingStyle,
} from '../store/aiSlice'
import {ContentGenerationRequest} from '../services/aiService'

export const useAI = () => {
  const dispatch = useAppDispatch()

  // State selectors
  const aiState = useAppSelector(selectAIState)
  const isEnabled = useAppSelector(selectIsAIEnabled)
  const voiceResult = useAppSelector(selectVoiceResult)
  const isListening = useAppSelector(selectIsListening)
  const generationResult = useAppSelector(selectGenerationResult)
  const isGenerating = useAppSelector(selectIsGenerating)
  const suggestions = useAppSelector(selectSuggestions)
  const isAnalyzing = useAppSelector(selectIsAnalyzing)
  const translationResult = useAppSelector(selectTranslationResult)
  const isTranslating = useAppSelector(selectIsTranslating)
  const proofreadingSuggestions = useAppSelector(selectProofreadingSuggestions)
  const isProofreading = useAppSelector(selectIsProofreading)
  const currentLanguage = useAppSelector(selectCurrentLanguage)
  const writingStyle = useAppSelector(selectWritingStyle)

  // Voice recognition actions
  const startVoice = useCallback(
    (language?: string) => {
      dispatch(startVoiceRecognition(language))
    },
    [dispatch],
  )

  const clearVoice = useCallback(() => {
    dispatch(clearVoiceResult())
  }, [dispatch])

  // Content generation actions
  const generateText = useCallback(
    (request: ContentGenerationRequest) => {
      dispatch(generateContent(request))
    },
    [dispatch],
  )

  const clearGeneration = useCallback(() => {
    dispatch(clearGenerationResult())
  }, [dispatch])

  // Smart suggestions actions
  const getSuggestions = useCallback(
    (content: string, cursorPosition: number) => {
      dispatch(getSmartSuggestions({content, cursorPosition}))
    },
    [dispatch],
  )

  const getContextualSuggestions = useCallback(
    (currentText: string, documentHistory: string[]) => {
      dispatch(getContextSuggestions({currentText, documentHistory}))
    },
    [dispatch],
  )

  const applySuggestionById = useCallback(
    (suggestionId: string) => {
      dispatch(applySuggestion(suggestionId))
    },
    [dispatch],
  )

  const dismissSuggestionById = useCallback(
    (suggestionId: string) => {
      dispatch(dismissSuggestion(suggestionId))
    },
    [dispatch],
  )

  const clearAllSuggestions = useCallback(() => {
    dispatch(clearSuggestions())
  }, [dispatch])

  // Translation actions
  const translate = useCallback(
    (text: string, targetLanguage: string) => {
      dispatch(translateText({text, targetLanguage}))
    },
    [dispatch],
  )

  const clearTranslation = useCallback(() => {
    dispatch(clearTranslationResult())
  }, [dispatch])

  // Proofreading actions
  const proofread = useCallback(
    (text: string) => {
      dispatch(proofreadText(text))
    },
    [dispatch],
  )

  const clearProofreading = useCallback(() => {
    dispatch(clearProofreadingSuggestions())
  }, [dispatch])

  // Settings actions
  const toggleAI = useCallback(
    (enabled: boolean) => {
      dispatch(setAIEnabled(enabled))
    },
    [dispatch],
  )

  const changeLanguage = useCallback(
    (language: string) => {
      dispatch(setCurrentLanguage(language))
    },
    [dispatch],
  )

  const changeWritingStyle = useCallback(
    (style: 'formal' | 'casual' | 'technical' | 'creative') => {
      dispatch(setWritingStyle(style))
    },
    [dispatch],
  )

  const clearErrors = useCallback(() => {
    dispatch(clearAllErrors())
  }, [dispatch])

  // Convenient helper functions
  const hasErrors = useCallback(() => {
    return !!(
      aiState.voiceError ||
      aiState.generationError ||
      aiState.analysisError ||
      aiState.translationError ||
      aiState.proofreadingError
    )
  }, [aiState])

  const isAnyOperationActive = useCallback(() => {
    return !!(
      aiState.isListening ||
      aiState.isGenerating ||
      aiState.isAnalyzing ||
      aiState.isTranslating ||
      aiState.isProofreading
    )
  }, [aiState])

  const getActiveSuggestions = useCallback(() => {
    return suggestions
  }, [suggestions])

  const getAppliedSuggestions = useCallback(() => {
    return []
  }, [])

  // Content generation shortcuts
  const continueText = useCallback(
    (text: string) => {
      generateText({
        type: 'continue',
        content: text,
        context: 'general',
      })
    },
    [generateText],
  )

  const summarizeText = useCallback(
    (text: string) => {
      generateText({
        type: 'summarize',
        content: text,
        context: 'general',
      })
    },
    [generateText],
  )

  const expandText = useCallback(
    (text: string) => {
      generateText({
        type: 'expand',
        content: text,
        context: 'general',
      })
    },
    [generateText],
  )

  const improveText = useCallback(
    (text: string) => {
      generateText({
        type: 'improve',
        content: text,
        context: 'general',
      })
    },
    [generateText],
  )

  // Language support helpers
  const getCurrentLanguageName = useCallback(() => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)
    return lang?.name || currentLanguage
  }, [currentLanguage])

  return {
    // State
    aiState,
    isEnabled,
    voiceResult,
    isListening,
    generationResult,
    isGenerating,
    suggestions,
    isAnalyzing,
    translationResult,
    isTranslating,
    proofreadingSuggestions,
    isProofreading,
    currentLanguage,
    writingStyle,

    // Voice recognition
    startVoice,
    clearVoice,

    // Content generation
    generateText,
    continueText,
    summarizeText,
    expandText,
    improveText,
    clearGeneration,

    // Smart suggestions
    getSuggestions,
    getContextualSuggestions,
    applySuggestionById,
    dismissSuggestionById,
    clearAllSuggestions,

    // Translation
    translate,
    clearTranslation,

    // Proofreading
    proofread,
    clearProofreading,

    // Settings
    toggleAI,
    changeLanguage,
    changeWritingStyle,
    clearErrors,

    // Helper functions
    hasErrors,
    isAnyOperationActive,
    getActiveSuggestions,
    getAppliedSuggestions,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getCurrentLanguageName,
  }
}

export default useAI
