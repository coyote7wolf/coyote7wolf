import React from 'react'
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native'
import {lightTheme} from '../utils/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
  labelStyle?: TextStyle
  errorStyle?: TextStyle
}

export default function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...textInputProps
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, inputStyle]}
        placeholderTextColor={lightTheme.colors.textSecondary}
        {...textInputProps}
      />
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: lightTheme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    borderRadius: 8,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    fontSize: 16,
    color: lightTheme.colors.text,
    backgroundColor: lightTheme.colors.background,
    minHeight: 44,
  },
  inputError: {
    borderColor: lightTheme.colors.error,
  },
  error: {
    fontSize: 14,
    color: lightTheme.colors.error,
    marginTop: lightTheme.spacing.xs,
  },
})
