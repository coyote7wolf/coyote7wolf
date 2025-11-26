import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

export default function AIAssistantScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 智能助手</Text>
      <Text style={styles.subtitle}>AI 驱动的内容创作</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
})
