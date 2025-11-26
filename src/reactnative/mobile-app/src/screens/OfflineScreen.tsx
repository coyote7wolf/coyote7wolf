import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

export default function OfflineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>离线管理</Text>
      <Text style={styles.subtitle}>离线编辑与同步</Text>
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
