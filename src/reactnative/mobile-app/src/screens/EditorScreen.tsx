import React, {useState, useEffect, useRef} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {useSelector, useDispatch} from 'react-redux'
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import {RootState, AppDispatch} from '../store'
import {updateDocument} from '../store/documentsSlice'
import {RootStackParamList} from '../types'
import {Button} from '../components'
import {lightTheme} from '../utils/theme'
import {CollaborationIndicator} from '../components/CollaborationIndicator'
import {CursorOverlay} from '../components/CursorOverlay'
import {useCollaboration} from '../hooks/useCollaboration'
import {useAI} from '../hooks/useAI'
import {AIToolbar, SmartSuggestionsPanel} from '../components/AI'

type EditorScreenRouteProp = RouteProp<RootStackParamList, 'Editor'>
type EditorScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Editor'
>

export default function EditorScreen() {
  const navigation = useNavigation<EditorScreenNavigationProp>()
  const route = useRoute<EditorScreenRouteProp>()
  const dispatch = useDispatch<AppDispatch>()

  const {documents, isUpdating} = useSelector(
    (state: RootState) => state.documents,
  )

  const documentId = route.params?.documentId
  const document = documents.find(doc => doc.id === documentId)

  const [title, setTitle] = useState(document?.title || '')
  const [content, setContent] = useState(document?.content || '')
  const [hasChanges, setHasChanges] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const textInputRef = useRef<TextInput>(null)

  // Initialize collaboration
  const {isConnected, updateCursor} = useCollaboration(documentId)

  // Initialize AI
  const {
    isEnabled: isAIEnabled,
    getSuggestions,
    suggestions,
    isAnalyzing,
  } = useAI()

  useEffect(() => {
    if (document) {
      setTitle(document.title)
      setContent(document.content)
    }
  }, [document])

  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
    setWordCount(words.length)
  }, [content])

  useEffect(() => {
    const hasUnsavedChanges =
      title !== (document?.title || '') || content !== (document?.content || '')
    setHasChanges(hasUnsavedChanges)
  }, [title, content, document])

  const handleSave = async () => {
    if (!documentId || !hasChanges) {
      return
    }

    try {
      await dispatch(
        updateDocument({
          id: documentId,
          title: title.trim(),
          content: content.trim(),
        }),
      ).unwrap()

      Alert.alert('保存成功', '文档已保存')
      setHasChanges(false)
    } catch (error) {
      Alert.alert('保存失败', '请重试')
    }
  }

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert('未保存的更改', '您有未保存的更改，确定要离开吗？', [
        {text: '取消', style: 'cancel'},
        {text: '不保存', onPress: () => navigation.goBack()},
        {text: '保存', onPress: handleSave},
      ])
    } else {
      navigation.goBack()
    }
  }

  const formatText = (format: 'bold' | 'italic' | 'heading') => {
    // Simple text formatting for mobile
    // In a real app, you'd get text selection
    switch (format) {
      case 'bold':
        setContent(prev => prev + '**加粗文本**')
        break
      case 'italic':
        setContent(prev => prev + '*斜体文本*')
        break
      case 'heading':
        setContent(prev => prev + '\n# 标题\n')
        break
    }
  }

  const insertList = () => {
    setContent(prev => prev + '\n- 列表项\n- 列表项\n')
  }

  const insertLink = () => {
    Alert.prompt(
      '插入链接',
      '请输入链接地址',
      [
        {text: '取消', style: 'cancel'},
        {
          text: '插入',
          onPress: (url?: string) => {
            if (url?.trim()) {
              setContent(prev => prev + `[链接文本](${url.trim()})`)
            }
          },
        },
      ],
      'plain-text',
      'https://',
    )
  }

  // AI Functions
  const handleInsertText = (text: string) => {
    const currentCursorPos = cursorPosition
    const beforeCursor = content.substring(0, currentCursorPos)
    const afterCursor = content.substring(currentCursorPos)
    setContent(beforeCursor + text + afterCursor)
    setCursorPosition(currentCursorPos + text.length)
  }

  const handleReplaceText = (newText: string) => {
    if (selectedText) {
      setContent(prev => prev.replace(selectedText, newText))
      setSelectedText('')
    }
  }

  const handleSelectionChange = (event: any) => {
    const {selection} = event.nativeEvent
    const {start, end} = selection
    setCursorPosition(start)

    if (start !== end) {
      const selected = content.substring(start, end)
      setSelectedText(selected)
    } else {
      setSelectedText('')
    }

    // Update collaboration cursor
    updateCursor(start, selection)

    // Get AI suggestions for current content
    if (isAIEnabled && content.length > 10) {
      getSuggestions(content, start)
    }
  }

  const toggleAISuggestions = () => {
    setShowAISuggestions(!showAISuggestions)
  }

  // Auto-show AI suggestions when content changes
  useEffect(() => {
    if (isAIEnabled && content.length > 0 && suggestions.length > 0) {
      setShowAISuggestions(true)
    }
  }, [suggestions, isAIEnabled, content.length])

  if (!document) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={48} color={lightTheme.colors.error} />
        <Text style={styles.errorText}>文档未找到</Text>
        <Button title="返回" onPress={() => navigation.goBack()} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={lightTheme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title || '新文档'}
          </Text>
          <Text style={styles.wordCountText}>{wordCount} 字</Text>
        </View>

        <View style={styles.headerActions}>
          {isAIEnabled && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleAISuggestions}>
              <MaterialIcons
                name={showAISuggestions ? 'smart-toy' : 'smart-toy'}
                size={20}
                color={
                  showAISuggestions || isAnalyzing
                    ? lightTheme.colors.primary
                    : lightTheme.colors.disabled
                }
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsPreviewMode(!isPreviewMode)}>
            <MaterialIcons
              name={isPreviewMode ? 'edit' : 'visibility'}
              size={20}
              color={lightTheme.colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: hasChanges
                  ? lightTheme.colors.primary
                  : lightTheme.colors.disabled,
              },
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isUpdating}>
            <Text style={styles.saveButtonText}>
              {isUpdating ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isPreviewMode && (
        <View>
          {/* Format Toolbar */}
          <View style={styles.toolbar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => formatText('bold')}>
                <MaterialIcons name="format-bold" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => formatText('italic')}>
                <MaterialIcons name="format-italic" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => formatText('heading')}>
                <MaterialIcons name="title" size={20} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolButton} onPress={insertList}>
                <MaterialIcons name="format-list-bulleted" size={20} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolButton} onPress={insertLink}>
                <MaterialIcons name="link" size={20} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* AI Toolbar */}
          {isAIEnabled && (
            <AIToolbar
              selectedText={selectedText}
              onInsertText={handleInsertText}
              onReplaceText={handleReplaceText}
            />
          )}
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        {isPreviewMode ? (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>{title}</Text>
            <Text style={styles.previewContent}>{content}</Text>
          </View>
        ) : (
          <View style={styles.editorContainer}>
            <View style={styles.collaborationSection}>
              <CollaborationIndicator style={styles.collaborationIndicator} />
              {isConnected && (
                <View style={styles.connectionStatus}>
                  <MaterialIcons
                    name="sync"
                    size={16}
                    color={lightTheme.colors.success}
                  />
                  <Text style={styles.connectionText}>實時協作中</Text>
                </View>
              )}
            </View>

            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="文档标题..."
              placeholderTextColor={lightTheme.colors.disabled}
              multiline={false}
            />

            <View style={styles.contentInputContainer}>
              <TextInput
                ref={textInputRef}
                style={styles.contentInput}
                value={content}
                onChangeText={text => {
                  setContent(text)
                  // Track cursor position changes
                }}
                onSelectionChange={handleSelectionChange}
                placeholder="开始编写内容..."
                placeholderTextColor={lightTheme.colors.disabled}
                multiline
                textAlignVertical="top"
              />
              <CursorOverlay textValue={content} />
            </View>

            {/* AI Suggestions Panel */}
            {isAIEnabled && showAISuggestions && (
              <SmartSuggestionsPanel
                style={styles.suggestionsPanel}
                onApplySuggestion={suggestion => {
                  if (suggestion.position) {
                    const {start, end} = suggestion.position
                    const beforeText = content.substring(0, start)
                    const afterText = content.substring(end)
                    setContent(beforeText + suggestion.suggestion + afterText)
                  } else {
                    handleInsertText(suggestion.suggestion)
                  }
                }}
                onDismissSuggestion={() => {
                  // Suggestions are automatically removed from Redux store
                }}
              />
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: lightTheme.spacing.xs,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: lightTheme.spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: lightTheme.colors.text,
  },
  wordCountText: {
    fontSize: 12,
    color: lightTheme.colors.disabled,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: lightTheme.spacing.xs,
    marginRight: lightTheme.spacing.sm,
  },
  saveButton: {
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.sm,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  toolbar: {
    backgroundColor: lightTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.xs,
  },
  toolButton: {
    padding: lightTheme.spacing.sm,
    marginRight: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.sm,
    backgroundColor: lightTheme.colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  editorContainer: {
    flex: 1,
    padding: lightTheme.spacing.md,
  },
  collaborationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
  },
  collaborationIndicator: {
    flex: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    fontSize: 12,
    color: lightTheme.colors.success,
    marginLeft: 4,
  },
  contentInputContainer: {
    flex: 1,
    position: 'relative',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: lightTheme.colors.text,
    minHeight: 400,
  },
  previewContainer: {
    padding: lightTheme.spacing.md,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.lg,
  },
  previewContent: {
    fontSize: 16,
    lineHeight: 24,
    color: lightTheme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: lightTheme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: lightTheme.colors.error,
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.lg,
    textAlign: 'center',
  },
  suggestionsPanel: {
    marginTop: lightTheme.spacing.md,
  },
})
