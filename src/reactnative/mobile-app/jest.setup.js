import jest from 'jest-mock'
import 'react-native-gesture-handler/jestSetup'

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')

  // Mock 任何缺失的方法
  Reanimated.default.call = () => {}

  return Reanimated
})

// Silence console.warn during tests
console.warn = jest.fn()

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getCurrentConnectivity: jest.fn(),
  isConnectionMetered: jest.fn(),
  getCurrentState: jest.fn(() =>
    Promise.resolve({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    }),
  ),
}))

// Mock Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon')
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon')

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}))
