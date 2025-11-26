import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

export default function CollaborationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>协作空间</Text>
      <Text style={styles.subtitle}>多人实时协作</Text>
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
