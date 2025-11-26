import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import {useSelector} from 'react-redux'
import {lightTheme} from '../utils/theme'
import {selectActiveUsers} from '../store/collaborationSlice'

interface CollaborationIndicatorProps {
  style?: object
}

export const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({
  style,
}) => {
  const activeUsers = useSelector(selectActiveUsers)

  if (activeUsers.length === 0) {
    return null
  }

  const styles = createStyles(lightTheme)

  return (
    <View style={[styles.container, style]}>
      <View style={styles.usersContainer}>
        {activeUsers.slice(0, 3).map((user, index) => (
          <View
            key={user.id}
            style={[
              styles.userAvatar,
              {backgroundColor: user.color},
              index > 0 && styles.overlappingAvatar,
            ]}>
            <Text style={styles.userInitial}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        ))}
        {activeUsers.length > 3 && (
          <View style={[styles.userAvatar, styles.moreUsersAvatar]}>
            <Text style={styles.moreUsersText}>+{activeUsers.length - 3}</Text>
          </View>
        )}
      </View>
      <Text style={styles.collaboratingText}>
        {activeUsers.length === 1 ? '1 person' : `${activeUsers.length} people`}{' '}
        editing
      </Text>
    </View>
  )
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    usersContainer: {
      flexDirection: 'row',
      marginRight: 8,
    },
    userAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    overlappingAvatar: {
      marginLeft: -8,
    },
    moreUsersAvatar: {
      backgroundColor: theme.colors.primary,
      marginLeft: -8,
    },
    userInitial: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.onPrimary,
    },
    moreUsersText: {
      fontSize: 8,
      fontWeight: 'bold',
      color: theme.colors.onPrimary,
    },
    collaboratingText: {
      fontSize: 12,
      color: theme.colors.onSurface,
      opacity: 0.7,
    },
  })

export default CollaborationIndicator
