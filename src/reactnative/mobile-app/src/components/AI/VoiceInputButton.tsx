import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import {useAI} from '../../hooks/useAI'

interface VoiceInputButtonProps {
  onVoiceResult?: (text: string) => void
  language?: string
  style?: any
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onVoiceResult,
  language,
  style,
}) => {
  const {
    isListening,
    voiceResult,
    startVoice,
    clearVoice,
    isEnabled,
    currentLanguage,
  } = useAI()

  const handlePress = () => {
    if (!isEnabled) return

    if (isListening) {
      // Stop listening would be handled by the service
      return
    }

    startVoice(language || currentLanguage)
  }

  React.useEffect(() => {
    if (voiceResult && onVoiceResult) {
      onVoiceResult(voiceResult.text)
      clearVoice()
    }
  }, [voiceResult, onVoiceResult, clearVoice])

  const getButtonColor = () => {
    if (!isEnabled) return '#ccc'
    if (isListening) return '#ff4444'
    return '#007AFF'
  }

  const getIconName = () => {
    if (isListening) return 'stop-circle-outline'
    return 'mic-outline'
  }

  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor: getButtonColor()}, style]}
      onPress={handlePress}
      disabled={!isEnabled}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {isListening ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Icon name={getIconName()} size={24} color="#fff" />
        )}
        <Text style={styles.text}>
          {isListening ? '錄音中...' : '語音輸入'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
})

export default VoiceInputButton
