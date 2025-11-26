import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native'
import {lightTheme} from '../utils/theme'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[size],
    styles[variant],
    (disabled || loading) && styles.disabled,
    style,
  ]

  const textStyles = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles],
    styles[`${variant}Text` as keyof typeof styles],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : lightTheme.colors.primary}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  // Variants
  primary: {
    backgroundColor: lightTheme.colors.primary,
  },
  secondary: {
    backgroundColor: lightTheme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: lightTheme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  // Text base
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Text variants
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#ffffff',
  },
  outlineText: {
    color: lightTheme.colors.primary,
  },
  disabledText: {
    opacity: 0.7,
  },
})
