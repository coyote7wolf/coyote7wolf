import React from 'react'
import {View, Text, StyleSheet, Animated} from 'react-native'
import {useSelector} from 'react-redux'
import {selectCursors} from '../store/collaborationSlice'

interface CursorOverlayProps {
  textValue: string
  style?: object
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({
  textValue,
  style,
}) => {
  const cursors = useSelector(selectCursors)

  const getPositionFromIndex = (index: number): {x: number; y: number} => {
    // This is a simplified position calculation
    // In a real implementation, you'd need to measure text layout
    const lineHeight = 20
    const charWidth = 8
    const linesBeforeIndex =
      textValue.substring(0, index).split('\n').length - 1
    const charsInCurrentLine =
      textValue.substring(0, index).split('\n').pop()?.length || 0

    return {
      x: charsInCurrentLine * charWidth,
      y: linesBeforeIndex * lineHeight,
    }
  }

  if (cursors.length === 0) {
    return null
  }

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {cursors.map(cursor => {
        const position = getPositionFromIndex(cursor.position)
        return (
          <View key={cursor.userId} style={styles.cursorContainer}>
            {/* Cursor line */}
            <Animated.View
              style={[
                styles.cursorLine,
                {
                  backgroundColor: cursor.color,
                  left: position.x,
                  top: position.y,
                },
              ]}
            />

            {/* Cursor label */}
            <View
              style={[
                styles.cursorLabel,
                {
                  backgroundColor: cursor.color,
                  left: position.x,
                  top: position.y - 20,
                },
              ]}>
              <Text style={styles.cursorLabelText}>{cursor.userName}</Text>
            </View>

            {/* Selection highlight */}
            {cursor.selection && (
              <View
                style={[
                  styles.selection,
                  {
                    backgroundColor: cursor.color,
                    opacity: 0.2,
                    left: getPositionFromIndex(cursor.selection.start).x,
                    top: getPositionFromIndex(cursor.selection.start).y,
                    width:
                      getPositionFromIndex(cursor.selection.end).x -
                      getPositionFromIndex(cursor.selection.start).x,
                    height:
                      getPositionFromIndex(cursor.selection.end).y -
                      getPositionFromIndex(cursor.selection.start).y +
                      20,
                  },
                ]}
              />
            )}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cursorContainer: {
    position: 'absolute',
  },
  cursorLine: {
    position: 'absolute',
    width: 2,
    height: 20,
    opacity: 0.8,
  },
  cursorLabel: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  cursorLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selection: {
    position: 'absolute',
  },
})

export default CursorOverlay
