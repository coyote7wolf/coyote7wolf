import React, {useEffect} from 'react'
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import {useSelector, useDispatch} from 'react-redux'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import {lightTheme} from '../utils/theme'
import {AppDispatch} from '../store'
import {
  selectIsOnline,
  selectConnectionType,
  selectSyncInProgress,
  selectPendingSyncCount,
  selectLastSyncTime,
  syncPendingChanges,
  initializeOfflineService,
} from '../store/offlineSlice'

interface OfflineIndicatorProps {
  style?: object
  onPress?: () => void
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  style,
  onPress,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const isOnline = useSelector(selectIsOnline)
  const connectionType = useSelector(selectConnectionType)
  const syncInProgress = useSelector(selectSyncInProgress)
  const pendingSyncCount = useSelector(selectPendingSyncCount)
  const lastSyncTime = useSelector(selectLastSyncTime)

  useEffect(() => {
    // Initialize offline service
    dispatch(initializeOfflineService())
  }, [dispatch])

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else if (isOnline && pendingSyncCount > 0 && !syncInProgress) {
      // Auto sync when pressed and conditions are met
      dispatch(syncPendingChanges())
    }
  }

  const getStatusInfo = () => {
    if (syncInProgress) {
      return {
        icon: 'sync',
        text: '同步中...',
        color: lightTheme.colors.primary,
        spinning: true,
      }
    }

    if (!isOnline) {
      return {
        icon: 'cloud-off',
        text: '離線模式',
        color: lightTheme.colors.warning,
        spinning: false,
      }
    }

    if (pendingSyncCount > 0) {
      return {
        icon: 'cloud-upload',
        text: `${pendingSyncCount} 個待同步`,
        color: lightTheme.colors.warning,
        spinning: false,
      }
    }

    return {
      icon: 'cloud-done',
      text: '已同步',
      color: lightTheme.colors.success,
      spinning: false,
    }
  }

  const formatLastSyncTime = (timestamp: number | null) => {
    if (!timestamp) {
      return ''
    }

    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) {
      return '剛剛同步'
    }
    if (minutes < 60) {
      return `${minutes} 分鐘前`
    }
    if (hours < 24) {
      return `${hours} 小時前`
    }
    return new Date(timestamp).toLocaleDateString()
  }

  const statusInfo = getStatusInfo()

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={syncInProgress}>
      <View style={styles.statusContainer}>
        <MaterialIcons
          name={statusInfo.icon}
          size={16}
          color={statusInfo.color}
          style={[styles.icon, statusInfo.spinning && styles.spinningIcon]}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, {color: statusInfo.color}]}>
            {statusInfo.text}
          </Text>
          {isOnline && connectionType && (
            <Text style={styles.connectionType}>
              {connectionType === 'wifi' ? 'WiFi' : '行動網路'}
            </Text>
          )}
          {lastSyncTime && !syncInProgress && (
            <Text style={styles.lastSync}>
              {formatLastSyncTime(lastSyncTime)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  spinningIcon: {
    // Animation would be added with Animated API
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectionType: {
    fontSize: 10,
    color: lightTheme.colors.textSecondary,
    marginTop: 1,
  },
  lastSync: {
    fontSize: 10,
    color: lightTheme.colors.textSecondary,
    marginTop: 1,
  },
})

export default OfflineIndicator
