import React from 'react'
import {View, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native'
import {lightTheme} from '../utils/theme'

interface CardProps {
  title?: string
  children: React.ReactNode
  style?: ViewStyle
  titleStyle?: TextStyle
  contentStyle?: ViewStyle
}

export default function Card({
  title,
  children,
  style,
  titleStyle,
  contentStyle,
}: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightTheme.colors.background,
    borderRadius: 12,
    padding: lightTheme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: lightTheme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.sm,
  },
  content: {
    flex: 1,
  },
})
