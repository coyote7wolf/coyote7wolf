import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit'
import {
  aiService,
  AISuggestion,
  VoiceRecognitionResult,
  ContentGenerationRequest,
  ContentGenerationResult,
} from '../services/aiService'

export interface AIState {
  // Voice recognition state
  isListening: boolean
  voiceResult: VoiceRecognitionResult | null
  voiceError: string | null

  // Content generation state
  isGenerating: boolean
  generationResult: ContentGenerationResult | null
  generationError: string | null

  // Smart suggestions
  suggestions: AISuggestion[]
  isAnalyzing: boolean
  analysisError: string | null

  // Translation state
  isTranslating: boolean
  translationResult: ContentGenerationResult | null
  translationError: string | null

  // Proofreading state
  isProofreading: boolean
  proofreadingSuggestions: AISuggestion[]
  proofreadingError: string | null

  // General state
  isEnabled: boolean
  currentLanguage: string
  writingStyle: 'formal' | 'casual' | 'technical' | 'creative'
}

const initialState: AIState = {
  isListening: false,
  voiceResult: null,
  voiceError: null,

  isGenerating: false,
  generationResult: null,
  generationError: null,

  suggestions: [],
  isAnalyzing: false,
  analysisError: null,

  isTranslating: false,
  translationResult: null,
  translationError: null,

  isProofreading: false,
  proofreadingSuggestions: [],
  proofreadingError: null,

  isEnabled: true,
  currentLanguage: 'zh-TW',
  writingStyle: 'casual',
}

// Async thunks
export const startVoiceRecognition = createAsyncThunk(
  'ai/startVoiceRecognition',
  async (language?: string) => {
    const result = await aiService.startVoiceRecognition(language)
    return result
  },
)

export const generateContent = createAsyncThunk(
  'ai/generateContent',
  async (request: ContentGenerationRequest) => {
    const result = await aiService.generateContent(request)
    return result
  },
)

export const getSmartSuggestions = createAsyncThunk(
  'ai/getSmartSuggestions',
  async (payload: {content: string; cursorPosition: number}) => {
    const {content, cursorPosition} = payload
    const suggestions = await aiService.getSmartSuggestions(
      content,
      cursorPosition,
    )
    return suggestions
  },
)

export const translateText = createAsyncThunk(
  'ai/translateText',
  async (payload: {text: string; targetLanguage: string}) => {
    const {text, targetLanguage} = payload
    const result = await aiService.translateText(text, targetLanguage)
    return result
  },
)

export const proofreadText = createAsyncThunk(
  'ai/proofreadText',
  async (text: string) => {
    const suggestions = await aiService.proofreadText(text)
    return suggestions
  },
)

export const getContextSuggestions = createAsyncThunk(
  'ai/getContextSuggestions',
  async (payload: {currentText: string; documentHistory: string[]}) => {
    const {currentText, documentHistory} = payload
    const suggestions = await aiService.getContextSuggestions(
      currentText,
      documentHistory,
    )
    return suggestions
  },
)

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // General actions
    setAIEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload
    },

    setCurrentLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload
    },

    setWritingStyle: (
      state,
      action: PayloadAction<'formal' | 'casual' | 'technical' | 'creative'>,
    ) => {
      state.writingStyle = action.payload
    },

    // Voice recognition actions
    clearVoiceResult: state => {
      state.voiceResult = null
      state.voiceError = null
    },

    // Content generation actions
    clearGenerationResult: state => {
      state.generationResult = null
      state.generationError = null
    },

    // Suggestions actions
    clearSuggestions: state => {
      state.suggestions = []
      state.analysisError = null
    },

    applySuggestion: (state, action: PayloadAction<string>) => {
      const suggestionId = action.payload
      state.suggestions = state.suggestions.filter(s => s.id !== suggestionId)
    },

    dismissSuggestion: (state, action: PayloadAction<string>) => {
      const suggestionId = action.payload
      state.suggestions = state.suggestions.filter(s => s.id !== suggestionId)
    },

    // Translation actions
    clearTranslationResult: state => {
      state.translationResult = null
      state.translationError = null
    },

    // Proofreading actions
    clearProofreadingSuggestions: state => {
      state.proofreadingSuggestions = []
      state.proofreadingError = null
    },

    // Error handling
    clearAllErrors: state => {
      state.voiceError = null
      state.generationError = null
      state.analysisError = null
      state.translationError = null
      state.proofreadingError = null
    },
  },
  extraReducers: builder => {
    builder
      // Voice recognition
      .addCase(startVoiceRecognition.pending, state => {
        state.isListening = true
        state.voiceError = null
      })
      .addCase(startVoiceRecognition.fulfilled, (state, action) => {
        state.isListening = false
        state.voiceResult = action.payload
        state.voiceError = null
      })
      .addCase(startVoiceRecognition.rejected, (state, action) => {
        state.isListening = false
        state.voiceError = action.error.message || 'Voice recognition failed'
      })

      // Content generation
      .addCase(generateContent.pending, state => {
        state.isGenerating = true
        state.generationError = null
      })
      .addCase(generateContent.fulfilled, (state, action) => {
        state.isGenerating = false
        state.generationResult = action.payload
        state.generationError = null
      })
      .addCase(generateContent.rejected, (state, action) => {
        state.isGenerating = false
        state.generationError =
          action.error.message || 'Content generation failed'
      })

      // Smart suggestions
      .addCase(getSmartSuggestions.pending, state => {
        state.isAnalyzing = true
        state.analysisError = null
      })
      .addCase(getSmartSuggestions.fulfilled, (state, action) => {
        state.isAnalyzing = false
        state.suggestions = action.payload
        state.analysisError = null
      })
      .addCase(getSmartSuggestions.rejected, (state, action) => {
        state.isAnalyzing = false
        state.analysisError = action.error.message || 'Smart suggestions failed'
      })

      // Translation
      .addCase(translateText.pending, state => {
        state.isTranslating = true
        state.translationError = null
      })
      .addCase(translateText.fulfilled, (state, action) => {
        state.isTranslating = false
        state.translationResult = action.payload
        state.translationError = null
      })
      .addCase(translateText.rejected, (state, action) => {
        state.isTranslating = false
        state.translationError = action.error.message || 'Translation failed'
      })

      // Proofreading
      .addCase(proofreadText.pending, state => {
        state.isProofreading = true
        state.proofreadingError = null
      })
      .addCase(proofreadText.fulfilled, (state, action) => {
        state.isProofreading = false
        state.proofreadingSuggestions = action.payload
        state.proofreadingError = null
      })
      .addCase(proofreadText.rejected, (state, action) => {
        state.isProofreading = false
        state.proofreadingError = action.error.message || 'Proofreading failed'
      })

      // Context suggestions
      .addCase(getContextSuggestions.pending, state => {
        state.isAnalyzing = true
        state.analysisError = null
      })
      .addCase(getContextSuggestions.fulfilled, (state, action) => {
        state.isAnalyzing = false
        // Merge with existing suggestions
        const existingSuggestionIds = state.suggestions.map(s => s.id)
        const newSuggestions = action.payload.filter(
          s => !existingSuggestionIds.includes(s.id),
        )
        state.suggestions = [...state.suggestions, ...newSuggestions]
        state.analysisError = null
      })
      .addCase(getContextSuggestions.rejected, (state, action) => {
        state.isAnalyzing = false
        state.analysisError =
          action.error.message || 'Context suggestions failed'
      })
  },
})

export const {
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
} = aiSlice.actions

export default aiSlice.reducer

// Selectors
export const selectAIState = (state: {ai: AIState}) => state.ai

export const selectIsAIEnabled = (state: {ai: AIState}) => state.ai.isEnabled

export const selectVoiceResult = (state: {ai: AIState}) => state.ai.voiceResult

export const selectIsListening = (state: {ai: AIState}) => state.ai.isListening

export const selectGenerationResult = (state: {ai: AIState}) =>
  state.ai.generationResult

export const selectIsGenerating = (state: {ai: AIState}) =>
  state.ai.isGenerating

export const selectSuggestions = (state: {ai: AIState}) => state.ai.suggestions

export const selectIsAnalyzing = (state: {ai: AIState}) => state.ai.isAnalyzing

export const selectTranslationResult = (state: {ai: AIState}) =>
  state.ai.translationResult

export const selectIsTranslating = (state: {ai: AIState}) =>
  state.ai.isTranslating

export const selectProofreadingSuggestions = (state: {ai: AIState}) =>
  state.ai.proofreadingSuggestions

export const selectIsProofreading = (state: {ai: AIState}) =>
  state.ai.isProofreading

export const selectCurrentLanguage = (state: {ai: AIState}) =>
  state.ai.currentLanguage

export const selectWritingStyle = (state: {ai: AIState}) =>
  state.ai.writingStyle
