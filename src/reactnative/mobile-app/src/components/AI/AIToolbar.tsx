import React, {useState} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import {useAI} from '../../hooks/useAI'
import VoiceInputButton from './VoiceInputButton'

interface AIToolbarProps {
  selectedText?: string
  onInsertText?: (text: string) => void
  onReplaceText?: (newText: string) => void
  style?: any
}

export const AIToolbar: React.FC<AIToolbarProps> = ({
  selectedText = '',
  onInsertText,
  onReplaceText,
  style,
}) => {
  const {
    isEnabled,
    generateText,
    translate,
    proofread,
    isGenerating,
    isTranslating,
    isProofreading,
    generationResult,
    translationResult,
    proofreadingSuggestions,
    clearGeneration,
    clearTranslation,
    clearProofreading,
    supportedLanguages,
  } = useAI()

  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomPromptModal, setShowCustomPromptModal] = useState(false)

  const handleContinue = () => {
    if (!selectedText && !onInsertText) return
    generateText({
      type: 'continue',
      content: selectedText || '請幫我繼續寫...',
      context: 'general',
    })
  }

  const handleSummarize = () => {
    if (!selectedText) {
      Alert.alert('提示', '請先選擇要總結的文字')
      return
    }
    generateText({
      type: 'summarize',
      content: selectedText,
      context: 'general',
    })
  }

  const handleExpand = () => {
    if (!selectedText) {
      Alert.alert('提示', '請先選擇要擴展的文字')
      return
    }
    generateText({
      type: 'expand',
      content: selectedText,
      context: 'general',
    })
  }

  const handleImprove = () => {
    if (!selectedText) {
      Alert.alert('提示', '請先選擇要改善的文字')
      return
    }
    generateText({
      type: 'improve',
      content: selectedText,
      context: 'general',
    })
  }

  const handleTranslate = () => {
    if (!selectedText) {
      Alert.alert('提示', '請先選擇要翻譯的文字')
      return
    }
    setShowTranslationModal(true)
  }

  const handleConfirmTranslation = () => {
    translate(selectedText, targetLanguage)
    setShowTranslationModal(false)
  }

  const handleProofread = () => {
    if (!selectedText) {
      Alert.alert('提示', '請先選擇要校對的文字')
      return
    }
    proofread(selectedText)
  }

  const handleCustomGeneration = () => {
    setShowCustomPromptModal(true)
  }

  const handleConfirmCustomGeneration = () => {
    if (!customPrompt.trim()) return
    generateText({
      type: 'continue',
      content: customPrompt,
      context: 'custom',
    })
    setShowCustomPromptModal(false)
    setCustomPrompt('')
  }

  const handleVoiceResult = (text: string) => {
    if (onInsertText) {
      onInsertText(text)
    }
  }

  React.useEffect(() => {
    if (generationResult) {
      if (onInsertText) {
        onInsertText(generationResult.generated)
      }
      clearGeneration()
    }
  }, [generationResult, onInsertText, clearGeneration])

  React.useEffect(() => {
    if (translationResult) {
      if (onReplaceText) {
        onReplaceText(translationResult.generated)
      }
      clearTranslation()
    }
  }, [translationResult, onReplaceText, clearTranslation])

  React.useEffect(() => {
    if (proofreadingSuggestions.length > 0) {
      Alert.alert(
        '校對建議',
        `發現 ${proofreadingSuggestions.length} 個建議，請查看建議面板`,
        [
          {
            text: '確定',
            onPress: () => {
              clearProofreading()
            },
          },
        ],
      )
    }
  }, [proofreadingSuggestions, clearProofreading])

  if (!isEnabled) {
    return null
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Voice Input */}
        <VoiceInputButton
          onVoiceResult={handleVoiceResult}
          style={styles.toolButton}
        />

        {/* Content Generation Tools */}
        <TouchableOpacity
          style={[styles.toolButton, isGenerating && styles.toolButtonActive]}
          onPress={handleContinue}
          disabled={isGenerating}>
          <Icon name="arrow-forward-outline" size={20} color="#007AFF" />
          <Text style={styles.toolButtonText}>繼續</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, isGenerating && styles.toolButtonActive]}
          onPress={handleSummarize}
          disabled={isGenerating || !selectedText}>
          <Icon name="list-outline" size={20} color="#007AFF" />
          <Text style={styles.toolButtonText}>總結</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, isGenerating && styles.toolButtonActive]}
          onPress={handleExpand}
          disabled={isGenerating || !selectedText}>
          <Icon name="resize-outline" size={20} color="#007AFF" />
          <Text style={styles.toolButtonText}>擴展</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, isGenerating && styles.toolButtonActive]}
          onPress={handleImprove}
          disabled={isGenerating || !selectedText}>
          <Icon name="sparkles-outline" size={20} color="#007AFF" />
          <Text style={styles.toolButtonText}>改善</Text>
        </TouchableOpacity>

        {/* Translation Tool */}
        <TouchableOpacity
          style={[styles.toolButton, isTranslating && styles.toolButtonActive]}
          onPress={handleTranslate}
          disabled={isTranslating || !selectedText}>
          <Icon name="language-outline" size={20} color="#007AFF" />
          <Text style={styles.toolButtonText}>翻譯</Text>
        </TouchableOpacity>

        {/* Proofreading Tool */}
        <TouchableOpacity
          style={[styles.toolButton, isProofreading && styles.toolButtonActive]}
          onPress={handleProofread}
          disabled={isProofreading || !selectedText}>
          <Icon name="checkmark-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.toolButtonText}>校對</Text>
        </TouchableOpacity>

        {/* Custom Generation */}
        <TouchableOpacity
          style={styles.toolButton}
          onPress={handleCustomGeneration}>
          <Icon name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.toolButtonText}>自訂</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Translation Modal */}
      <Modal
        visible={showTranslationModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowTranslationModal(false)
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇翻譯語言</Text>

            <ScrollView style={styles.languageList}>
              {supportedLanguages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    targetLanguage === lang.code && styles.languageOptionActive,
                  ]}
                  onPress={() => {
                    setTargetLanguage(lang.code)
                  }}>
                  <Text
                    style={[
                      styles.languageOptionText,
                      targetLanguage === lang.code &&
                        styles.languageOptionTextActive,
                    ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowTranslationModal(false)
                }}>
                <Text style={styles.modalCancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmTranslation}>
                <Text style={styles.modalConfirmButtonText}>翻譯</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Prompt Modal */}
      <Modal
        visible={showCustomPromptModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCustomPromptModal(false)
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>自訂內容請求</Text>

            <TextInput
              style={styles.promptInput}
              multiline
              numberOfLines={4}
              placeholder="請輸入您想要生成的內容描述..."
              value={customPrompt}
              onChangeText={setCustomPrompt}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCustomPromptModal(false)
                  setCustomPrompt('')
                }}>
                <Text style={styles.modalCancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmCustomGeneration}
                disabled={!customPrompt.trim()}>
                <Text
                  style={[
                    styles.modalConfirmButtonText,
                    !customPrompt.trim() &&
                      styles.modalConfirmButtonTextDisabled,
                  ]}>
                  生成
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  toolButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 60,
  },
  toolButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  toolButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageList: {
    maxHeight: 200,
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  languageOptionActive: {
    backgroundColor: '#e3f2fd',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  languageOptionTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  modalConfirmButtonTextDisabled: {
    color: '#ccc',
  },
})

export default AIToolbar
