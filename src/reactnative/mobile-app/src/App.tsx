import React from 'react'
import {StatusBar} from 'react-native'
import {Provider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import 'react-native-gesture-handler'

import AppNavigator from './navigation/AppNavigator'
import {store, persistor} from '@store/index'
import {MOCK_CONFIG} from './utils/constants'

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#ffffff"
            translucent={false}
          />
          <AppNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  )
}

// Log mock configuration
if (__DEV__) {
  console.log('SyncCoreAI Mobile App - Mock Mode:', MOCK_CONFIG)
}
