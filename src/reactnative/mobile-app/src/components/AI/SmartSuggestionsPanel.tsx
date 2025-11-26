import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import {useAI} from '../../hooks/useAI'
import {AISuggestion} from '../../services/aiService'

interface SmartSuggestionsPanelProps {
  onApplySuggestion?: (suggestion: AISuggestion) => void
  onDismissSuggestion?: (suggestionId: string) => void
  style?: any
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  onApplySuggestion,
  onDismissSuggestion,
  style,
}) => {
  const {
    suggestions,
    isAnalyzing,
    isEnabled,
    applySuggestionById,
    dismissSuggestionById,
  } = useAI()

  const handleApply = (suggestion: AISuggestion) => {
    applySuggestionById(suggestion.id)
    if (onApplySuggestion) {
      onApplySuggestion(suggestion)
    }
  }

  const handleDismiss = (suggestionId: string) => {
    dismissSuggestionById(suggestionId)
    if (onDismissSuggestion) {
      onDismissSuggestion(suggestionId)
    }
  }

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'title':
        return 'text-outline'
      case 'content':
        return 'document-text-outline'
      case 'grammar':
        return 'checkmark-circle-outline'
      case 'style':
        return 'brush-outline'
      case 'translation':
        return 'language-outline'
      default:
        return 'bulb-outline'
    }
  }

  const getSuggestionTypeText = (type: AISuggestion['type']) => {
    switch (type) {
      case 'title':
        return '標題建議'
      case 'content':
        return '內容建議'
      case 'grammar':
        return '語法修正'
      case 'style':
        return '風格改善'
      case 'translation':
        return '翻譯建議'
      default:
        return '建議'
    }
  }

  if (!isEnabled) {
    return null
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Icon name="bulb-outline" size={20} color="#007AFF" />
        <Text style={styles.headerText}>智能建議</Text>
        {isAnalyzing && (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={styles.loading}
          />
        )}
      </View>

      {suggestions.length === 0 && !isAnalyzing ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>暫無建議</Text>
          <Text style={styles.emptySubtext}>開始輸入文字以獲取智能建議</Text>
        </View>
      ) : (
        <ScrollView style={styles.suggestionsList}>
          {suggestions.map(suggestion => (
            <View key={suggestion.id} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionInfo}>
                  <Icon
                    name={getSuggestionIcon(suggestion.type)}
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.suggestionType}>
                    {getSuggestionTypeText(suggestion.type)}
                  </Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {Math.round(suggestion.confidence * 100)}%
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    handleDismiss(suggestion.id)
                  }}
                  style={styles.dismissButton}>
                  <Icon name="close" size={16} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.suggestionContent}>
                {suggestion.original && (
                  <View style={styles.originalText}>
                    <Text style={styles.originalLabel}>原文：</Text>
                    <Text style={styles.originalValue}>
                      {suggestion.original}
                    </Text>
                  </View>
                )}

                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionLabel}>建議：</Text>
                  <Text style={styles.suggestionValue}>
                    {suggestion.suggestion}
                  </Text>
                </View>

                {suggestion.reasoning && (
                  <View style={styles.reasoning}>
                    <Text style={styles.reasoningText}>
                      {suggestion.reasoning}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.suggestionActions}>
                <TouchableOpacity
                  onPress={() => {
                    handleApply(suggestion)
                  }}
                  style={styles.applyButton}>
                  <Icon name="checkmark" size={16} color="#fff" />
                  <Text style={styles.applyButtonText}>採用</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  loading: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
  },
  confidenceBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
  },
  suggestionContent: {
    marginBottom: 12,
  },
  originalText: {
    marginBottom: 8,
  },
  originalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  originalValue: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  suggestionText: {
    marginBottom: 8,
  },
  suggestionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  suggestionValue: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50',
  },
  reasoning: {
    marginTop: 4,
  },
  reasoningText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
})

export default SmartSuggestionsPanel
