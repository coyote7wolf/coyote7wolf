/**
 * AI Assistant UI Components
 *
 * Comprehensive AI-powered writing assistance interface including
 * suggestions panel, tone analyzer, translation tools, and content insights.
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import {
  AISuggestion,
  ToneAnalysis,
  TranslationResult,
  ContentInsight,
  WritingAssistanceOptions,
} from '@/services/ai'

interface AISuggestionsProps {
  suggestions: AISuggestion[]
  onApplySuggestion: (suggestion: AISuggestion) => void
  onDismissSuggestion: (suggestionId: string) => void
  isLoading?: boolean
  className?: string
}

export function AISuggestions({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  isLoading = false,
  className = '',
}: AISuggestionsProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(
    new Set()
  )
  const [filteredType, setFilteredType] = useState<
    AISuggestion['type'] | 'all'
  >('all')

  const filteredSuggestions = useMemo(() => {
    if (filteredType === 'all') return suggestions
    return suggestions.filter(s => s.type === filteredType)
  }, [suggestions, filteredType])

  const suggestionCounts = useMemo(() => {
    const counts = suggestions.reduce(
      (acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1
        return acc
      },
      {} as Record<AISuggestion['type'], number>
    )
    return counts
  }, [suggestions])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSuggestions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSuggestions(newExpanded)
  }

  const getSeverityColor = (
    severity: AISuggestion['severity']
  ): 'solid' | 'outline' | 'ghost' | 'subtle' => {
    switch (severity) {
      case 'high':
        return 'solid'
      case 'medium':
        return 'outline'
      case 'low':
        return 'ghost'
      default:
        return 'ghost'
    }
  }

  const getTypeIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'grammar':
        return '📝'
      case 'style':
        return '✨'
      case 'tone':
        return '🎯'
      case 'content':
        return '💡'
      case 'completion':
        return '🔮'
      case 'translation':
        return '🌐'
      default:
        return '💭'
    }
  }

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <Spinner size="md" />
          <span className="ml-2 text-gray-600">Analyzing text...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
        <Badge variant="solid" size="sm">
          {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filteredType === 'all' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => setFilteredType('all')}
        >
          All ({suggestions.length})
        </Button>
        {Object.entries(suggestionCounts).map(([type, count]) => (
          <Button
            key={type}
            variant={filteredType === type ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => setFilteredType(type as AISuggestion['type'])}
          >
            {getTypeIcon(type as AISuggestion['type'])} {type} ({count})
          </Button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filteredType === 'all'
              ? 'No suggestions available. Your writing looks great!'
              : `No ${filteredType} suggestions found.`}
          </div>
        ) : (
          filteredSuggestions.map(suggestion => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isExpanded={expandedSuggestions.has(suggestion.id)}
              onToggleExpanded={() => toggleExpanded(suggestion.id)}
              onApply={() => onApplySuggestion(suggestion)}
              onDismiss={() => onDismissSuggestion(suggestion.id)}
              getSeverityColor={getSeverityColor}
              getTypeIcon={getTypeIcon}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface SuggestionCardProps {
  suggestion: AISuggestion
  isExpanded: boolean
  onToggleExpanded: () => void
  onApply: () => void
  onDismiss: () => void
  getSeverityColor: (severity: AISuggestion['severity']) => string
  getTypeIcon: (type: AISuggestion['type']) => string
}

function SuggestionCard({
  suggestion,
  isExpanded,
  onToggleExpanded,
  onApply,
  onDismiss,
  getSeverityColor,
  getTypeIcon,
}: SuggestionCardProps) {
  return (
    <Card
      variant="outline"
      className="transition-all duration-200 hover:shadow-md"
    >
      <CardHeader className="cursor-pointer" onClick={onToggleExpanded}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-xl">{getTypeIcon(suggestion.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge
                  variant={
                    getSeverityColor(suggestion.severity) as
                      | 'solid'
                      | 'outline'
                      | 'ghost'
                      | 'subtle'
                  }
                  size="sm"
                >
                  {suggestion.severity}
                </Badge>
                <Badge variant="ghost" size="sm">
                  {suggestion.category}
                </Badge>
                <span className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {suggestion.explanation}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardBody className="border-t space-y-4">
          {/* Original vs Suggested Text */}
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">
                Original:
              </h5>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <code className="text-sm text-red-800">
                  {suggestion.originalText}
                </code>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">
                Suggested:
              </h5>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <code className="text-sm text-green-800">
                  {suggestion.suggestedText}
                </code>
              </div>
            </div>
          </div>

          {/* Detailed Explanation */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">
              Explanation:
            </h5>
            <p className="text-sm text-gray-600">{suggestion.explanation}</p>
          </div>

          {/* Alternatives */}
          {suggestion.metadata.alternatives &&
            suggestion.metadata.alternatives.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">
                  Alternatives:
                </h5>
                <div className="flex flex-wrap gap-1">
                  {suggestion.metadata.alternatives.map((alt, index) => (
                    <Badge key={index} variant="ghost" size="sm">
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex space-x-2">
              <Button
                variant="solid"
                colorScheme="primary"
                size="sm"
                onClick={onApply}
              >
                Apply Suggestion
              </Button>
              <Button variant="outline" size="sm" onClick={onDismiss}>
                Dismiss
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              Position: {suggestion.position.start}-{suggestion.position.end}
            </div>
          </div>
        </CardBody>
      )}
    </Card>
  )
}

interface ToneAnalyzerProps {
  analysis: ToneAnalysis | null
  isLoading?: boolean
  onRefresh?: () => void
  className?: string
}

export function ToneAnalyzer({
  analysis,
  isLoading = false,
  onRefresh,
  className = '',
}: ToneAnalyzerProps) {
  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'formal':
        return 'bg-blue-100 text-blue-800'
      case 'casual':
        return 'bg-green-100 text-green-800'
      case 'professional':
        return 'bg-purple-100 text-purple-800'
      case 'friendly':
        return 'bg-yellow-100 text-yellow-800'
      case 'academic':
        return 'bg-indigo-100 text-indigo-800'
      case 'creative':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPercentage = (value: number) => {
    return Math.round(value * 100)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-8">
          <Spinner size="md" />
          <span className="ml-2 text-gray-600">Analyzing tone...</span>
        </CardBody>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <p className="text-gray-500 mb-4">No tone analysis available</p>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Analyze Tone
            </Button>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tone Analysis</h3>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              ↻
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Overall Tone */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Overall Tone
          </h4>
          <div className="flex items-center space-x-3">
            <Badge className={getToneColor(analysis.overall)} size="lg">
              {analysis.overall}
            </Badge>
            <span className="text-sm text-gray-600">
              {formatPercentage(analysis.confidence)}% confidence
            </span>
          </div>
        </div>

        {/* Tone Aspects */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Tone Breakdown
          </h4>
          <div className="space-y-3">
            {Object.entries(analysis.aspects).map(([aspect, value]) => (
              <div key={aspect} className="flex items-center justify-between">
                <span className="text-sm capitalize text-gray-600">
                  {aspect}:
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${formatPercentage(value)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 w-8">
                    {formatPercentage(value)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </h4>
          <div className="flex flex-wrap gap-1">
            {analysis.targetAudience.map((audience, index) => (
              <Badge key={index} variant="ghost" size="sm">
                {audience}
              </Badge>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Suggestions
            </h4>
            <ul className="space-y-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 flex items-start"
                >
                  <span className="text-green-600 mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

interface TranslationPanelProps {
  result: TranslationResult | null
  isLoading?: boolean
  onTranslate?: (text: string, targetLanguage: string) => void
  onSelectAlternative?: (alternative: string) => void
  className?: string
}

export function TranslationPanel({
  result,
  isLoading = false,
  onTranslate,
  onSelectAlternative,
  className = '',
}: TranslationPanelProps) {
  const [targetLanguage, setTargetLanguage] = useState('es')
  const [textToTranslate, setTextToTranslate] = useState('')

  const supportedLanguages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ]

  const handleTranslate = () => {
    if (textToTranslate.trim() && onTranslate) {
      onTranslate(textToTranslate.trim(), targetLanguage)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">Translation</h3>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Translation Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text to translate:
            </label>
            <textarea
              value={textToTranslate}
              onChange={e => setTextToTranslate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter text to translate..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Language:
              </label>
              <select
                value={targetLanguage}
                onChange={e => setTargetLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Select target language"
                aria-label="Target language selection"
              >
                {supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-6">
              <Button
                variant="solid"
                colorScheme="primary"
                onClick={handleTranslate}
                disabled={!textToTranslate.trim() || isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : 'Translate'}
              </Button>
            </div>
          </div>
        </div>

        {/* Translation Result */}
        {result && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Translation Result
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800">{result.translatedText}</p>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>
                  {result.sourceLanguage} → {result.targetLanguage}
                </span>
                <span>{formatPercentage(result.confidence)}% confidence</span>
              </div>
            </div>

            {/* Alternatives */}
            {result.alternatives.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Alternatives
                </h4>
                <div className="space-y-2">
                  {result.alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => onSelectAlternative?.(alt)}
                    >
                      <span className="text-sm text-gray-700">{alt}</span>
                      <Button variant="ghost" size="xs">
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )

  function formatPercentage(value: number) {
    return Math.round(value * 100)
  }
}

interface ContentInsightsProps {
  insights: ContentInsight | null
  isLoading?: boolean
  onRefresh?: () => void
  className?: string
}

export function ContentInsights({
  insights,
  isLoading = false,
  onRefresh,
  className = '',
}: ContentInsightsProps) {
  const getReadabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-8">
          <Spinner size="md" />
          <span className="ml-2 text-gray-600">Analyzing content...</span>
        </CardBody>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <p className="text-gray-500 mb-4">No content insights available</p>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Analyze Content
            </Button>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Content Insights</h3>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              ↻
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Document Structure */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Document Structure
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Paragraphs:</span>
              <span className="font-medium">
                {insights.structure.paragraphs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sentences:</span>
              <span className="font-medium">
                {insights.structure.sentences}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Words:</span>
              <span className="font-medium">{insights.structure.words}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Characters:</span>
              <span className="font-medium">
                {insights.structure.characters}
              </span>
            </div>
          </div>
        </div>

        {/* Readability */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Readability
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Score:</span>
              <span
                className={`font-medium ${getReadabilityColor(insights.readability.score)}`}
              >
                {insights.readability.score}/100 ({insights.readability.level})
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. words/sentence:</span>
              <span>{insights.readability.averageWordsPerSentence}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. syllables/word:</span>
              <span>{insights.readability.averageSyllablesPerWord}</span>
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Sentiment Analysis
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall sentiment:</span>
            <div className="text-right">
              <div
                className={`font-medium capitalize ${getSentimentColor(insights.sentiment.overall)}`}
              >
                {insights.sentiment.overall}
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(insights.sentiment.confidence * 100)}% confidence
              </div>
            </div>
          </div>
        </div>

        {/* Top Keywords */}
        {insights.keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Top Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {insights.keywords.slice(0, 8).map((keyword, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <Badge variant="ghost" size="sm">
                    {keyword.word}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    ({keyword.frequency})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Readability Suggestions */}
        {insights.readability.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Suggestions
            </h4>
            <ul className="space-y-1">
              {insights.readability.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 flex items-start"
                >
                  <span className="text-blue-600 mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default AISuggestions
