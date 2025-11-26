/**
 * AI-Enhanced Document Editor
 *
 * Advanced document editor with integrated AI assistance including
 * real-time suggestions, tone analysis, translation, and content insights.
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import useAIAssistant from '@/hooks/useAIAssistant'
import {
  AISuggestions,
  ToneAnalyzer,
  TranslationPanel,
  ContentInsights,
} from '@/components/ai/AIAssistant'
import type { User } from '@/services/collaboration'

interface AIDocumentEditorProps {
  documentId: string
  user: User
  initialContent?: string
  title?: string
  readOnly?: boolean
  onSave?: (content: string) => void
  onTitleChange?: (title: string) => void
  className?: string
}

export function AIDocumentEditor({
  documentId,
  user,
  initialContent = '',
  title = 'Untitled Document',
  readOnly = false,
  onSave,
  onTitleChange,
  className = '',
}: AIDocumentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [documentTitle, setDocumentTitle] = useState(title)
  const [activePanel, setActivePanel] = useState<
    'suggestions' | 'tone' | 'translate' | 'insights' | null
  >('suggestions')
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const cursorPositionRef = useRef(0)

  // AI Assistant integration
  const {
    suggestions,
    toneAnalysis,
    contentInsights,
    translationResult,
    isAnalyzing,
    isTranslating,
    isApplyingSuggestion,
    analyzeText,
    analyzeTone,
    getContentInsights,
    translateText,
    applySuggestion,
    dismissSuggestion,
    generateCompletion,
    updateAssistanceOptions,
    toggleRealTimeAnalysis,
    generateMockSuggestion,
    performRealTimeAnalysis,
    stats,
  } = useAIAssistant({
    documentId,
    userId: user.id,
    enableRealTimeAnalysis: true,
    debounceMs: 1000,
    autoAnalyzeThreshold: 50,
    assistanceOptions: {
      enableGrammarCheck: true,
      enableStyleSuggestions: true,
      enableToneAnalysis: true,
      enableContentSuggestions: true,
      targetAudience: 'general',
      preferredTone: 'professional',
      language: 'en',
    },
  })

  // Update word and character count
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
    setWordCount(words)
    setCharCount(content.length)
  }, [content])

  // Handle text changes with AI analysis
  const handleContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = event.target.value
      const cursorPosition = event.target.selectionStart

      if (readOnly) return

      setContent(newContent)
      cursorPositionRef.current = cursorPosition

      // Trigger real-time AI analysis
      performRealTimeAnalysis(newContent)

      // Set editing state
      if (!isEditing) {
        setIsEditing(true)
      }
    },
    [readOnly, isEditing, performRealTimeAnalysis]
  )

  // Handle title changes
  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = event.target.value
      setDocumentTitle(newTitle)
      onTitleChange?.(newTitle)
    },
    [onTitleChange]
  )

  // Apply AI suggestion
  const handleApplySuggestion = useCallback(
    async (suggestion: any) => {
      if (!editorRef.current) return

      try {
        const currentText = content
        const { start, end } = suggestion.position

        // Apply the suggestion to the text
        const newText =
          currentText.slice(0, start) +
          suggestion.suggestedText +
          currentText.slice(end)

        setContent(newText)
        await applySuggestion(suggestion, setContent)

        // Update cursor position
        const newCursorPos = start + suggestion.suggestedText.length
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = newCursorPos
            editorRef.current.selectionEnd = newCursorPos
            editorRef.current.focus()
          }
        }, 0)
      } catch (error) {
        console.error('Failed to apply suggestion:', error)
      }
    },
    [content, applySuggestion]
  )

  // Auto-save functionality
  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave(content)
        setLastSaved(new Date())
        setIsEditing(false)
      } catch (error) {
        console.error('Failed to save document:', error)
      }
    }
  }, [content, onSave])

  // Auto-save after changes
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        handleSave()
      }, 5000) // Auto-save after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isEditing, handleSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        handleSave()
      }

      // Ctrl+Shift+A for AI analysis
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'A'
      ) {
        event.preventDefault()
        analyzeText(content)
      }

      // Ctrl+Shift+T for tone analysis
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'T'
      ) {
        event.preventDefault()
        analyzeTone(content)
        setActivePanel('tone')
      }

      // Ctrl+Shift+I for insights
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'I'
      ) {
        event.preventDefault()
        getContentInsights(content)
        setActivePanel('insights')
      }

      // Tab completion (simplified)
      if (event.key === 'Tab' && editorRef.current) {
        const position = editorRef.current.selectionStart
        if (position > 0) {
          event.preventDefault()
          generateCompletion(content, position).then(completions => {
            if (completions.length > 0) {
              console.log('Available completions:', completions)
              // In a real implementation, you would show a completion popup
            }
          })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    content,
    handleSave,
    analyzeText,
    analyzeTone,
    getContentInsights,
    generateCompletion,
  ])

  // Handle AI panel actions
  const handleAnalyzeAll = useCallback(() => {
    analyzeText(content)
    analyzeTone(content)
    getContentInsights(content)
  }, [content, analyzeText, analyzeTone, getContentInsights])

  const handleTranslate = useCallback(
    (text: string, targetLanguage: string) => {
      translateText(text, targetLanguage)
    },
    [translateText]
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getAIStatusBadges = () => {
    const badges = []

    if (suggestions.length > 0) {
      badges.push(
        <Badge key="suggestions" variant="solid" size="sm">
          {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
        </Badge>
      )
    }

    if (isAnalyzing) {
      badges.push(
        <Badge key="analyzing" variant="outline" size="sm">
          Analyzing...
        </Badge>
      )
    }

    return badges
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={documentTitle}
              onChange={handleTitleChange}
              className="text-xl font-semibold border-none p-0 focus:ring-0 w-full bg-transparent"
              placeholder="Document title..."
              disabled={readOnly}
            />
          </div>

          <div className="flex items-center space-x-4">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Saved {formatDate(lastSaved)}
              </span>
            )}

            <Badge variant={isEditing ? 'solid' : 'outline'}>
              {isEditing ? 'Editing' : 'Saved'}
            </Badge>

            <Button
              onClick={handleSave}
              disabled={!isEditing || readOnly}
              size="sm"
            >
              Save
            </Button>
          </div>
        </div>

        {/* Stats and AI Status */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>AI: {stats.analysisCount} analyses</span>
            {getAIStatusBadges()}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeAll}
              disabled={!content.trim() || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              {showAIPanel ? 'Hide AI' : 'Show AI'}
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={generateMockSuggestion}
              >
                Mock AI
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div
          className={`${showAIPanel ? 'w-2/3' : 'w-full'} h-full transition-all duration-300`}
        >
          <div className="h-full p-4">
            <Card className="h-full">
              <CardBody className="h-full p-0">
                <div className="relative h-full">
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={handleContentChange}
                    className={`w-full h-full p-6 border-none resize-none focus:outline-none font-mono text-sm leading-relaxed ${
                      isApplyingSuggestion
                        ? 'opacity-50 pointer-events-none'
                        : ''
                    }`}
                    placeholder={
                      readOnly
                        ? 'Document is read-only'
                        : 'Start typing your document... (Press Ctrl+Shift+A for AI analysis)'
                    }
                    disabled={readOnly || isApplyingSuggestion}
                    spellCheck={false} // Disable browser spellcheck since we have AI
                  />

                  {/* AI Processing Overlay */}
                  {isApplyingSuggestion && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          Applying AI suggestion...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* AI Assistant Panel */}
        {showAIPanel && (
          <div className="w-1/3 h-full border-l border-gray-200 bg-gray-50 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Panel Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">AI Assistant</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIPanel(false)}
                  >
                    ×
                  </Button>
                </div>

                {/* Panel Tabs */}
                <div className="flex space-x-1">
                  {[
                    {
                      id: 'suggestions',
                      label: 'Suggestions',
                      count: suggestions.length,
                    },
                    { id: 'tone', label: 'Tone', count: null },
                    { id: 'translate', label: 'Translate', count: null },
                    { id: 'insights', label: 'Insights', count: null },
                  ].map(tab => (
                    <Button
                      key={tab.id}
                      variant={activePanel === tab.id ? 'solid' : 'ghost'}
                      size="sm"
                      onClick={() => setActivePanel(tab.id as any)}
                    >
                      {tab.label}
                      {tab.count !== null && tab.count > 0 && (
                        <Badge variant="outline" size="xs" className="ml-1">
                          {tab.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">
                {activePanel === 'suggestions' && (
                  <AISuggestions
                    suggestions={suggestions}
                    onApplySuggestion={handleApplySuggestion}
                    onDismissSuggestion={dismissSuggestion}
                    isLoading={isAnalyzing}
                    className="p-4"
                  />
                )}

                {activePanel === 'tone' && (
                  <div className="p-4">
                    <ToneAnalyzer
                      analysis={toneAnalysis}
                      isLoading={isAnalyzing}
                      onRefresh={() => analyzeTone(content)}
                    />
                  </div>
                )}

                {activePanel === 'translate' && (
                  <div className="p-4">
                    <TranslationPanel
                      result={translationResult}
                      isLoading={isTranslating}
                      onTranslate={handleTranslate}
                    />
                  </div>
                )}

                {activePanel === 'insights' && (
                  <div className="p-4">
                    <ContentInsights
                      insights={contentInsights}
                      isLoading={isAnalyzing}
                      onRefresh={() => getContentInsights(content)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIDocumentEditor
