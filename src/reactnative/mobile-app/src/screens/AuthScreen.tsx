import React, {useState} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {useDispatch} from 'react-redux'
import {useNavigation} from '@react-navigation/native'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'

import {Button, Input, Card} from '../components'
import {loginStart, loginSuccess, loginFailure} from '../store/authSlice'
import {authService} from '../services/authService'
import {lightTheme} from '../utils/theme'
import {TEST_ACCOUNTS} from '../utils/constants'
import {RootStackParamList} from '../types'

type AuthScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Auth'
>

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTestAccounts] = useState(true)

  const dispatch = useDispatch()
  const navigation = useNavigation<AuthScreenNavigationProp>()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('错误', '请输入邮箱和密码')
      return
    }

    setIsLoading(true)
    dispatch(loginStart())

    try {
      const response = await authService.login({email: email.trim(), password})
      dispatch(loginSuccess(response))
      navigation.replace('Main')
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      dispatch(loginFailure(message))
      Alert.alert('登录失败', message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (testEmail: string, testPassword: string) => {
    setEmail(testEmail)
    setPassword(testPassword)
  }

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true)
      const response = await authService.authenticateWithBiometrics()
      dispatch(loginSuccess(response))
      navigation.replace('Main')
    } catch (error) {
      Alert.alert('生物识别登录失败', '请使用账号密码登录')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>SyncCoreAI Mobile</Text>
            <Text style={styles.subtitle}>企业级移动协作平台</Text>
          </View>

          <Card title="登录" style={styles.loginCard}>
            <Input
              label="邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="请输入邮箱"
            />
            <Input
              label="密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="请输入密码"
            />
            <Button
              title="登录"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />
            <Button
              title="生物识别登录"
              onPress={handleBiometricLogin}
              variant="outline"
              style={styles.biometricButton}
            />
          </Card>

          {showTestAccounts && (
            <Card title="测试账号 (开发模式)" style={styles.testAccountsCard}>
              <Text style={styles.testAccountsNote}>
                点击下方按钮快速填入测试账号信息
              </Text>
              {TEST_ACCOUNTS.map(account => (
                <Button
                  key={account.email}
                  title={`${account.name} (${account.role})`}
                  onPress={() =>
                    handleQuickLogin(account.email, account.password)
                  }
                  variant="outline"
                  size="small"
                  style={styles.testAccountButton}
                />
              ))}
            </Card>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              SyncCoreAI v1.0.0 - 即时同步，智能协作
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: lightTheme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.xl,
    marginTop: lightTheme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
  },
  loginCard: {
    marginBottom: lightTheme.spacing.lg,
  },
  loginButton: {
    marginTop: lightTheme.spacing.md,
  },
  biometricButton: {
    marginTop: lightTheme.spacing.sm,
  },
  testAccountsCard: {
    marginBottom: lightTheme.spacing.lg,
  },
  testAccountsNote: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    marginBottom: lightTheme.spacing.md,
    textAlign: 'center',
  },
  testAccountButton: {
    marginBottom: lightTheme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: lightTheme.spacing.xl,
  },
  footerText: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
  },
})
