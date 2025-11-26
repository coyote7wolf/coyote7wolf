'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardBody } from '@/components'
import { authStorage, UserInfo } from '@/utils/authStorage'
import { analytics } from '@/utils/analytics'
import { routeManager, RouteName } from '@/utils/routing'
import loggerModule, { LogCategory } from '@/utils/logger'
import { featureFlags } from '@/utils/featureFlags'
import {
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveStack,
  ResponsiveText,
  ResponsiveBox,
} from '@/components/responsive'
import ClientLayout from '@/components/layout/ClientLayout'

const logger = loggerModule.defaultLogger

interface User {
  id: string
  name: string
  email: string
  role: string
  isPremium: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [i18nInstance, setI18nInstance] = useState<any>(null)

  // Initialize i18n only on client side
  useEffect(() => {
    const initI18n = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { default: i18n } = await import('@/utils/i18n')
          setI18nInstance(i18n)
        } catch (error) {
          console.warn('Failed to load i18n:', error)
        }
      }
    }
    initI18n()
  }, [])

  // Simple translation function
  const t = (key: string, fallback?: string) => {
    if (!i18nInstance || typeof window === 'undefined') {
      return fallback || key
    }
    try {
      return i18nInstance.t(key) || fallback || key
    } catch {
      return fallback || key
    }
  }

  useEffect(() => {
    // Check for authentication
    const checkAuth = async () => {
      try {
        const currentUser = await authStorage.getUserInfo()
        if (currentUser) {
          setUser(currentUser)
        } else {
          // Check if user is authenticated
          const isAuthenticated = await authStorage.isAuthenticated()
          if (!isAuthenticated) {
            // Redirect to login if no user found
            routeManager.navigate(RouteName.LOGIN)
            return
          }
        }

        // Track dashboard page view
        await analytics.track('dashboard_view', {
          page: '/dashboard',
          timestamp: Date.now(),
        })

        logger.info(LogCategory.SYSTEM, 'Dashboard loaded successfully', {
          component: 'DashboardPage',
          metadata: {
            userId: currentUser?.id,
            userName: currentUser?.name,
          },
        })
      } catch (error) {
        logger.error(
          LogCategory.SYSTEM,
          'Auth check failed',
          {
            component: 'DashboardPage',
          },
          error as Error
        )
        routeManager.navigate(RouteName.LOGIN)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await authStorage.logout()
      localStorage.removeItem('sync_auth_user')
      localStorage.removeItem('sync_auth_session')
      routeManager.navigate(RouteName.LOGIN)
    } catch (error) {
      logger.error(
        LogCategory.SYSTEM,
        'Logout failed',
        {
          component: 'DashboardPage',
        },
        error as Error
      )
      // Force logout anyway
      routeManager.navigate(RouteName.LOGIN)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-neutral-50">
        {/* Welcome Section */}
        <div className="bg-white border-b border-neutral-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-neutral-600 mt-1">
                  Here's what's happening with your documents today.
                </p>
              </div>
              <Button
                variant="outline"
                colorScheme="neutral"
                size="sm"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {t('dashboard.title') || 'Dashboard'}
            </h1>
            <p className="text-neutral-600">
              {t('dashboard.welcome') ||
                `Welcome back, ${user.name}! Here's an overview of your collaborative workspace.`}
            </p>
            <div className="mt-2 text-sm text-neutral-500">
              {t('dashboard.role') || 'Role'}: {user.role} •
              {user.isPremium && (
                <span className="ml-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                  {t('dashboard.premium') || 'Premium'}
                </span>
              )}
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8">
            <Card
              variant="outline"
              className="border-success-200 bg-success-50"
            >
              <CardBody className="flex items-center space-x-3 py-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-success-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-success-700">
                  Successfully signed in! Welcome to your SyncCoreAI dashboard.
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Documents Card */}
            <Card variant="elevated">
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-primary-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-neutral-500">
                      {t('dashboard.myDocuments') || 'My Documents'}
                    </h3>
                    <p className="text-2xl font-semibold text-neutral-900">3</p>
                    <p className="text-sm text-neutral-600">
                      {t('dashboard.documentsCreated') || 'documents created'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    colorScheme="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      analytics.track('view_documents_clicked', {
                        source: 'dashboard',
                      })
                      routeManager.navigate(RouteName.DOCUMENTS)
                    }}
                  >
                    {t('dashboard.viewAllDocuments') || 'View All Documents'}
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Collaborations Card */}
            <Card variant="elevated">
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-secondary-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-neutral-500">
                      {t('dashboard.activeCollaborations') ||
                        'Active Collaborations'}
                    </h3>
                    <p className="text-2xl font-semibold text-neutral-900">5</p>
                    <p className="text-sm text-neutral-600">
                      {t('dashboard.ongoingProjects') || 'ongoing projects'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    colorScheme="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      analytics.track('view_collaborations_clicked', {
                        source: 'dashboard',
                      })
                      routeManager.navigate(RouteName.COLLABORATION)
                    }}
                  >
                    {t('dashboard.viewCollaborations') || 'View Collaborations'}
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Settings Card */}
            <Card variant="elevated">
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-neutral-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-neutral-500">
                      {t('dashboard.accountSettings') || 'Account Settings'}
                    </h3>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {t('dashboard.setupComplete') || 'Setup'}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {t('dashboard.customizeProfile') ||
                        'customize your profile'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    colorScheme="neutral"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      analytics.track('manage_settings_clicked', {
                        source: 'dashboard',
                      })
                      routeManager.navigate(RouteName.SETTINGS)
                    }}
                  >
                    {t('dashboard.manageSettings') || 'Manage Settings'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          {featureFlags.isEnabled('dashboard-quick-actions') && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                {t('dashboard.quickActions') || 'Quick Actions'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-6 h-auto"
                  onClick={() => {
                    analytics.track('quick_action_clicked', {
                      action: 'create_document',
                    })
                    routeManager.navigate(RouteName.DOCUMENTS)
                  }}
                >
                  <svg
                    className="w-8 h-8 text-primary-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {t('dashboard.createDocument') || 'Create Document'}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center p-6 h-auto"
                  onClick={() => {
                    analytics.track('quick_action_clicked', {
                      action: 'invite_collaborator',
                    })
                    routeManager.navigate(RouteName.COLLABORATION)
                  }}
                >
                  <svg
                    className="w-8 h-8 text-secondary-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {t('dashboard.inviteCollaborator') || 'Invite Collaborator'}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center p-6 h-auto"
                  onClick={() => {
                    analytics.track('quick_action_clicked', {
                      action: 'view_analytics',
                    })
                    routeManager.navigate(RouteName.AI_ANALYSIS)
                  }}
                >
                  <svg
                    className="w-8 h-8 text-success-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {t('dashboard.viewAnalytics') || 'View Analytics'}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center p-6 h-auto"
                  onClick={() => {
                    analytics.track('quick_action_clicked', {
                      action: 'manage_settings',
                    })
                    routeManager.navigate(RouteName.SETTINGS)
                  }}
                >
                  <svg
                    className="w-8 h-8 text-neutral-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {t('dashboard.settings') || 'Settings'}
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* Recent Activity Section */}
          {featureFlags.isEnabled('dashboard-recent-activity') && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                {t('dashboard.recentActivity') || 'Recent Activity'}
              </h2>
              <Card variant="outline">
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">
                          {t('dashboard.documentCreated') || 'Document created'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {t('dashboard.justNow') || 'Just now'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                      <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-secondary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">
                          {t('dashboard.collaboratorInvited') ||
                            'Collaborator invited'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {t('dashboard.twoHoursAgo') || '2 hours ago'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
                      <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-success-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">
                          {t('dashboard.profileUpdated') || 'Profile updated'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {t('dashboard.yesterday') || 'Yesterday'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <Button
                      variant="ghost"
                      colorScheme="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        analytics.track('view_all_activity_clicked', {
                          source: 'dashboard',
                        })
                        routeManager.navigate(RouteName.PROFILE)
                      }}
                    >
                      {t('dashboard.viewAllActivity') || 'View All Activity'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Welcome Card - shown when feature flags are disabled */}
          {!featureFlags.isEnabled('dashboard-quick-actions') && (
            <Card variant="outline" className="text-center py-12">
              <CardBody>
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {t('dashboard.welcomeTitle') || 'Welcome to SyncCoreAI!'}
                  </h3>
                  <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
                    {t('dashboard.welcomeMessage') ||
                      "You're all set up and ready to start collaborating. Create your first document or explore our features to get the most out of your experience."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="solid"
                      colorScheme="primary"
                      size="lg"
                      onClick={() => {
                        analytics.track('create_first_document_clicked', {
                          source: 'welcome_card',
                        })
                        routeManager.navigate(RouteName.DOCUMENTS)
                      }}
                    >
                      {t('dashboard.createFirstDocument') ||
                        'Create First Document'}
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="primary"
                      size="lg"
                      onClick={() => {
                        analytics.track('take_tour_clicked', {
                          source: 'welcome_card',
                        })
                        // Tour functionality could be implemented here
                        logger.info(
                          LogCategory.UI,
                          'Tour feature clicked - not yet implemented'
                        )
                      }}
                    >
                      {t('dashboard.takeTour') || 'Take a Tour'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </main>
      </div>
    </ClientLayout>
  )
}
