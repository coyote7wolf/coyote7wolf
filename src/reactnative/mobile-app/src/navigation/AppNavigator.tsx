import React from 'react'
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import {RootStackParamList, MainTabParamList} from '../types'

// Screens (we'll create these next)
import AuthScreen from '../screens/AuthScreen'
import DocumentsScreen from '../screens/DocumentsScreen'
import EditorScreen from '../screens/EditorScreen'
import CollaborationScreen from '../screens/CollaborationScreen'
import OfflineScreen from '../screens/OfflineScreen'
import AIAssistantScreen from '../screens/AIAssistantScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import SettingsScreen from '../screens/SettingsScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

const getTabIcon = (routeName: keyof MainTabParamList) => {
  switch (routeName) {
    case 'Documents':
      return 'description'
    case 'Collaboration':
      return 'group'
    case 'Offline':
      return 'cloud-off'
    case 'AIAssistant':
      return 'smart-toy'
    case 'Notifications':
      return 'notifications'
    case 'Settings':
      return 'settings'
    default:
      return 'help'
  }
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({color, size}) => {
          const iconName = getTabIcon(route.name)
          return <MaterialIcons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        headerShown: false,
      })}>
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{title: '文档'}}
      />
      <Tab.Screen
        name="Collaboration"
        component={CollaborationScreen}
        options={{title: '协作'}}
      />
      <Tab.Screen
        name="Offline"
        component={OfflineScreen}
        options={{title: '离线'}}
      />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{title: 'AI助手'}}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{title: '通知'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: '设置'}}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            title: '登录',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{
            title: 'SyncCoreAI',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Document"
          component={DocumentsScreen}
          options={{
            title: '文档详情',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Editor"
          component={EditorScreen}
          options={{
            title: '编辑器',
            headerShown: true,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
