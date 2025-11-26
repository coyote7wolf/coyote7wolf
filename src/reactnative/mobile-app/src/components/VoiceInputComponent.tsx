import React, {useEffect, useState, useCallback} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
} from 'react-native'
import VoiceInputService, {
  VoiceRecognitionResult,
  VoiceRecognitionState,
} from '../services/voiceInputService'

interface VoiceInputComponentProps {
  onTextInput?: (text: string) => void
  onPartialInput?: (text: string) => void
  onError?: (error: string) => void
  language?: string
  showHistory?: boolean
  style?: any
}

const VoiceInputComponent: React.FC<VoiceInputComponentProps> = ({
  onTextInput,
  onPartialInput,
  onError,
  language = 'zh-TW',
  showHistory = true,
  style,
}) => {
  const [voiceService] = useState(() => new VoiceInputService())
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>({
    isListening: false,
    isAvailable: false,
    hasPermission: false,
    currentLanguage: language,
    supportedLanguages: [],
  })
  const [currentText, setCurrentText] = useState('')
  const [partialText, setPartialText] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [recognitionHistory, setRecognitionHistory] = useState<
    VoiceRecognitionResult[]
  >([])

  // 初始化語音服務
  useEffect(() => {
    initializeVoiceService()
    return () => {
      voiceService.cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 加載語音識別歷史
  useEffect(() => {
    if (showHistory) {
      loadRecognitionHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHistory])

  const initializeVoiceService = async () => {
    setIsInitializing(true)
    try {
      voiceService.setStateChangeCallback(setVoiceState)
      await voiceService.initialize()
    } catch (error) {
      console.error('Failed to initialize voice service:', error)
      Alert.alert('錯誤', '語音服務初始化失敗')
    } finally {
      setIsInitializing(false)
    }
  }

  const loadRecognitionHistory = async () => {
    const history = await voiceService.getRecognitionHistory()
    setRecognitionHistory(history)
  }

  // 處理語音識別結果
  const handleVoiceResult = useCallback(
    (result: VoiceRecognitionResult) => {
      console.log('Voice result:', result)

      if (result.isFinal) {
        setCurrentText(result.text)
        setPartialText('')
        onTextInput?.(result.text)

        // 保存到歷史記錄
        voiceService.saveRecognitionHistory(result)
        if (showHistory) {
          loadRecognitionHistory()
        }
      } else {
        setPartialText(result.text)
        onPartialInput?.(result.text)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onTextInput, onPartialInput, showHistory],
  )

  // 處理語音識別錯誤
  const handleVoiceError = useCallback(
    (error: string) => {
      console.error('Voice error:', error)
      onError?.(error)
      Alert.alert('語音識別錯誤', error)
    },
    [onError],
  )

  // 開始語音識別
  const startListening = async () => {
    if (!voiceState.isAvailable) {
      Alert.alert('錯誤', '語音識別不可用')
      return
    }

    if (!voiceState.hasPermission) {
      Alert.alert('錯誤', '需要麥克風權限')
      return
    }

    try {
      setCurrentText('')
      setPartialText('')
      await voiceService.startListening(
        language,
        handleVoiceResult,
        handleVoiceError,
      )
    } catch (error) {
      console.error('Failed to start listening:', error)
      Alert.alert('錯誤', '開始語音識別失敗')
    }
  }

  // 停止語音識別
  const stopListening = async () => {
    try {
      await voiceService.stopListening()
    } catch (error) {
      console.error('Failed to stop listening:', error)
    }
  }

  // 取消語音識別
  const cancelListening = async () => {
    try {
      await voiceService.cancelListening()
      setCurrentText('')
      setPartialText('')
    } catch (error) {
      console.error('Failed to cancel listening:', error)
    }
  }

  // 切換語音識別
  const toggleListening = async () => {
    if (voiceState.isListening) {
      await stopListening()
    } else {
      await startListening()
    }
  }

  // 選擇語言
  const selectLanguage = (selectedLanguage: string) => {
    voiceService.setConfig({language: selectedLanguage})
    setShowLanguageModal(false)
  }

  // 從歷史記錄選擇文本
  const selectFromHistory = (result: VoiceRecognitionResult) => {
    setCurrentText(result.text)
    onTextInput?.(result.text)
    setShowHistoryModal(false)
  }

  // 清除歷史記錄
  const clearHistory = async () => {
    Alert.alert('確認', '確定要清除所有語音識別歷史記錄嗎？', [
      {text: '取消', style: 'cancel'},
      {
        text: '確定',
        style: 'destructive',
        onPress: async () => {
          await voiceService.clearRecognitionHistory()
          setRecognitionHistory([])
        },
      },
    ])
  }

  // 獲取麥克風按鈕樣式
  const getMicButtonStyle = () => {
    if (isInitializing) {
      return [styles.micButton, styles.micButtonDisabled]
    }
    if (voiceState.isListening) {
      return [styles.micButton, styles.micButtonListening]
    }
    if (!voiceState.isAvailable || !voiceState.hasPermission) {
      return [styles.micButton, styles.micButtonDisabled]
    }
    return styles.micButton
  }

  // 獲取麥克風圖標文字
  const getMicButtonText = () => {
    if (isInitializing) {
      return '初始化中...'
    }
    if (voiceState.isListening) {
      return '🔴 停止'
    }
    if (!voiceState.isAvailable) {
      return '❌ 不可用'
    }
    if (!voiceState.hasPermission) {
      return '🔒 無權限'
    }
    return '🎤 說話'
  }

  // 格式化時間戳
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 語言顯示名稱映射
  const getLanguageDisplayName = (lang: string) => {
    const names: Record<string, string> = {
      'zh-TW': '繁體中文',
      'zh-CN': '簡體中文',
      'en-US': 'English',
      'ja-JP': '日本語',
      'ko-KR': '한국어',
      'fr-FR': 'Français',
      'de-DE': 'Deutsch',
      'es-ES': 'Español',
    }
    return names[lang] || lang
  }

  return (
    <View style={[styles.container, style]}>
      {/* 語音控制區域 */}
      <View style={styles.controlArea}>
        <TouchableOpacity
          style={getMicButtonStyle()}
          onPress={toggleListening}
          disabled={
            isInitializing ||
            !voiceState.isAvailable ||
            !voiceState.hasPermission
          }>
          <Text style={styles.micButtonText}>{getMicButtonText()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowLanguageModal(true)}
          disabled={voiceState.isListening}>
          <Text style={styles.languageButtonText}>
            {getLanguageDisplayName(voiceState.currentLanguage)}
          </Text>
        </TouchableOpacity>

        {voiceState.isListening && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelListening}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 文字顯示區域 */}
      <View style={styles.textArea}>
        {partialText ? (
          <Text style={styles.partialText}>{partialText}</Text>
        ) : null}

        {currentText ? (
          <Text style={styles.finalText}>{currentText}</Text>
        ) : (
          <Text style={styles.placeholderText}>
            {voiceState.isListening ? '正在聆聽...' : '點擊麥克風開始語音輸入'}
          </Text>
        )}
      </View>

      {/* 功能按鈕區域 */}
      {showHistory && (
        <View style={styles.actionArea}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setShowHistoryModal(true)}>
            <Text style={styles.historyButtonText}>
              歷史記錄 ({recognitionHistory.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 語言選擇模態框 */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇語言</Text>
            <FlatList
              data={voiceState.supportedLanguages}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    item === voiceState.currentLanguage &&
                      styles.languageItemSelected,
                  ]}
                  onPress={() => selectLanguage(item)}>
                  <Text
                    style={[
                      styles.languageItemText,
                      item === voiceState.currentLanguage &&
                        styles.languageItemTextSelected,
                    ]}>
                    {getLanguageDisplayName(item)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.modalCloseButtonText}>關閉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 歷史記錄模態框 */}
      <Modal
        visible={showHistoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>語音識別歷史</Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearHistory}>
                <Text style={styles.clearButtonText}>清除</Text>
              </TouchableOpacity>
            </View>

            {recognitionHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>暫無歷史記錄</Text>
              </View>
            ) : (
              <FlatList
                data={recognitionHistory}
                keyExtractor={(item, index) => `${item.timestamp}-${index}`}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => selectFromHistory(item)}>
                    <Text style={styles.historyItemText} numberOfLines={2}>
                      {item.text}
                    </Text>
                    <View style={styles.historyItemMeta}>
                      <Text style={styles.historyItemLanguage}>
                        {getLanguageDisplayName(item.language)}
                      </Text>
                      <Text style={styles.historyItemTime}>
                        {formatTimestamp(item.timestamp)}
                      </Text>
                      <Text style={styles.historyItemConfidence}>
                        {Math.round(item.confidence * 100)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHistoryModal(false)}>
              <Text style={styles.modalCloseButtonText}>關閉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  controlArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  micButton: {
    backgroundColor: '#007bff',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  micButtonListening: {
    backgroundColor: '#dc3545',
  },
  micButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  micButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  languageButton: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  languageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#ffc107',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    minHeight: 80,
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  partialText: {
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  finalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#adb5bd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionArea: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  historyButton: {
    backgroundColor: '#6f42c1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  languageItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  languageItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  languageItemText: {
    fontSize: 16,
    color: '#333',
  },
  languageItemTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  historyItemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  historyItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemLanguage: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#dee2e6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  historyItemTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  historyItemConfidence: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default VoiceInputComponent
