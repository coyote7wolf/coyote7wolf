/**
 * Advanced Responsive Sidebar Component
 *
 * Features:
 * - Hover to expand from icon mode
 * - Pinnable/unpinnable sidebar
 * - Resizable width
 * - Persistent settings in localStorage
 * - Full mock API integration
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { APP_ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import styles from './AdvancedSidebar.module.css'

interface AdvancedSidebarProps {
  defaultMode?: 'icon' | 'expanded' | 'collapsed'
  isPublicMode?: boolean // For homepage vs authenticated pages
  noHeader?: boolean // Whether page has no top header
}

interface MockData {
  notifications: number
  recentDocuments: Array<{
    id: string
    title: string
    updatedAt: string
  }>
  userStats: {
    documentsCreated: number
    collaborations: number
    storageUsed: string
  }
}

interface SidebarSettings {
  isPinned: boolean
  width: number
  mode: 'icon' | 'expanded' | 'collapsed'
}

const MIN_WIDTH = 240
const MAX_WIDTH = 400
const ICON_WIDTH = 64
const DEFAULT_WIDTH = 280

export function AdvancedSidebar({
  defaultMode = 'icon',
  isPublicMode = false,
  noHeader = false,
}: AdvancedSidebarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const [settings, setSettings] = useState<SidebarSettings>({
    isPinned: false,
    width: DEFAULT_WIDTH,
    mode: defaultMode,
  })

  const [mockData, setMockData] = useState<MockData>({
    notifications: 0,
    recentDocuments: [],
    userStats: {
      documentsCreated: 0,
      collaborations: 0,
      storageUsed: '0 MB',
    },
  })

  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('advanced-sidebar-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.log('Failed to parse sidebar settings')
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback(
    (newSettings: Partial<SidebarSettings>) => {
      const updated = { ...settings, ...newSettings }
      setSettings(updated)
      localStorage.setItem('advanced-sidebar-settings', JSON.stringify(updated))
    },
    [settings]
  )

  // Mock API call to fetch sidebar data
  const fetchSidebarData = async () => {
    if (isPublicMode) return // Skip API calls for public pages

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockResponse: MockData = {
        notifications: Math.floor(Math.random() * 10) + 1,
        recentDocuments: [
          {
            id: '1',
            title: 'Project Proposal Draft',
            updatedAt: '2 hours ago',
          },
          {
            id: '2',
            title: 'Meeting Notes - Q4 Review',
            updatedAt: '1 day ago',
          },
          {
            id: '3',
            title: 'Technical Specification',
            updatedAt: '3 days ago',
          },
        ],
        userStats: {
          documentsCreated: Math.floor(Math.random() * 50) + 10,
          collaborations: Math.floor(Math.random() * 20) + 5,
          storageUsed: `${(Math.random() * 500 + 100).toFixed(1)} MB`,
        },
      }

      setMockData(mockResponse)
    } catch (error) {
      console.log('Mock API call completed with simulated data')
    } finally {
      setIsLoading(false)
    }
  }

  // Mock action handlers
  const handleCreateDocument = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    alert('📝 Mock: New document created successfully!')
    fetchSidebarData()
    setIsLoading(false)
  }

  const handleViewNotifications = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    alert(`🔔 Mock: You have ${mockData.notifications} notifications`)
    setIsLoading(false)
  }

  const handleUploadFile = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('📁 Mock: File uploaded successfully!')
    fetchSidebarData()
    setIsLoading(false)
  }

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return

      const rect = sidebarRef.current.getBoundingClientRect()
      const newWidth = Math.max(
        MIN_WIDTH,
        Math.min(MAX_WIDTH, e.clientX - rect.left)
      )

      saveSettings({ width: newWidth })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Load data on component mount
  useEffect(() => {
    fetchSidebarData()
  }, [])

  // Determine current display state
  const isExpanded =
    settings.isPinned || isHovered || settings.mode === 'expanded'
  const isCollapsed = settings.mode === 'collapsed'
  const isIconMode = settings.mode === 'icon' && !isExpanded

  const currentWidth = isCollapsed
    ? 0
    : isIconMode
      ? ICON_WIDTH
      : settings.width

  // Update CSS variable for dynamic width
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.setProperty(
        '--sidebar-width',
        `${currentWidth}px`
      )
    }
  }, [currentWidth])

  // Get navigation routes based on mode
  const navRoutes = isPublicMode
    ? APP_ROUTES.filter(route => route.isPublic).slice(0, 8)
    : APP_ROUTES.slice(0, 6)

  return (
    <>
      {/* Mobile Overlay */}
      {isExpanded && !settings.isPinned && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsHovered(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${styles.advancedSidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${isResizing ? styles.sidebarResizing : ''} ${noHeader ? styles.noHeader : ''}`}
        onMouseEnter={() => !settings.isPinned && setIsHovered(true)}
        onMouseLeave={() => !settings.isPinned && setIsHovered(false)}
        data-tour="sidebar"
      >
        {!isCollapsed && (
          <>
            {/* Sidebar Header */}
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarLogo}>
                {isExpanded ? (
                  <span className={styles.logoText}>SyncCoreAI</span>
                ) : (
                  <span className={styles.logoIcon}>S</span>
                )}
              </div>

              {isExpanded && (
                <div className={styles.headerControls}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      saveSettings({ isPinned: !settings.isPinned })
                    }
                    className={`${styles.pinButton}${settings.isPinned ? ` ${styles.pinned}` : ''}`}
                    title={settings.isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                    data-tour="sidebar-pin"
                  >
                    {settings.isPinned ? '📌' : '📍'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => saveSettings({ mode: 'collapsed' })}
                    className={styles.collapseButton || ''}
                    title="Collapse sidebar"
                  >
                    ←
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!isPublicMode && (
              <div className={styles.sidebarSection}>
                {isExpanded && (
                  <h3 className={styles.sectionTitle}>Quick Actions</h3>
                )}

                <div className={styles.actionButtons}>
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    size={isExpanded ? 'md' : 'sm'}
                    onClick={handleCreateDocument}
                    disabled={isLoading}
                    className={styles.actionButton || ''}
                    title="Create Document"
                  >
                    {isExpanded ? <>📝 Create Document</> : '📝'}
                  </Button>

                  <Button
                    variant="outline"
                    colorScheme="secondary"
                    size={isExpanded ? 'md' : 'sm'}
                    onClick={handleUploadFile}
                    disabled={isLoading}
                    className={styles.actionButton || ''}
                    title="Upload File"
                  >
                    {isExpanded ? <>📁 Upload File</> : '📁'}
                  </Button>

                  <Button
                    variant="ghost"
                    colorScheme="neutral"
                    size={isExpanded ? 'md' : 'sm'}
                    onClick={handleViewNotifications}
                    disabled={isLoading}
                    className={`${styles.actionButton || ''} ${styles.notificationButton || ''}`}
                    title={`${mockData.notifications} notifications`}
                  >
                    {isExpanded ? (
                      <>🔔 Notifications ({mockData.notifications})</>
                    ) : (
                      <span className={styles.notificationIcon}>
                        🔔
                        <span className={styles.notificationBadge}>
                          {mockData.notifications}
                        </span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <div className={styles.sidebarSection}>
              {isExpanded && (
                <h3 className={styles.sectionTitle}>Navigation</h3>
              )}

              <nav className={styles.sidebarNav}>
                {navRoutes.map(route => (
                  <Link
                    key={route.path}
                    href={route.path as any}
                    className={styles.navItem}
                    title={route.name}
                    data-tour={
                      route.path === '/'
                        ? 'nav-home'
                        : route.path === '/documents'
                          ? 'nav-documents'
                          : route.path === '/dashboard'
                            ? 'nav-dashboard'
                            : undefined
                    }
                  >
                    <span className={styles.navIcon}>
                      {route.path === '/'
                        ? '🏠'
                        : route.path === '/dashboard'
                          ? '📊'
                          : route.path === '/documents'
                            ? '📝'
                            : route.path === '/profile'
                              ? '👤'
                              : route.path === '/login'
                                ? '🔐'
                                : route.path === '/register'
                                  ? '📝'
                                  : route.path === '/design-system'
                                    ? '🎨'
                                    : route.path === '/test'
                                      ? '🧪'
                                      : '📄'}
                    </span>
                    {isExpanded && (
                      <span className={styles.navText}>{route.name}</span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Stats - Only for authenticated users */}
            {!isPublicMode && isExpanded && (
              <div className={styles.sidebarSection}>
                <h3 className={styles.sectionTitle}>Your Stats</h3>
                <Card size="sm" className={styles.statsCard || ''}>
                  <CardBody>
                    {isLoading ? (
                      <div className={styles.loadingPlaceholder}>
                        Loading...
                      </div>
                    ) : (
                      <div className={styles.statsContent}>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {mockData.userStats.documentsCreated}
                          </span>
                          <span className={styles.statLabel}>Documents</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {mockData.userStats.collaborations}
                          </span>
                          <span className={styles.statLabel}>
                            Collaborations
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {mockData.userStats.storageUsed}
                          </span>
                          <span className={styles.statLabel}>Storage Used</span>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Recent Documents - Only for authenticated users */}
            {!isPublicMode && isExpanded && (
              <div className={styles.sidebarSection}>
                <h3 className={styles.sectionTitle}>Recent Documents</h3>
                <div className={styles.recentDocuments}>
                  {isLoading ? (
                    <div className={styles.loadingPlaceholder}>Loading...</div>
                  ) : (
                    mockData.recentDocuments.map(doc => (
                      <div key={doc.id} className={styles.recentDocItem}>
                        <div className={styles.docInfo}>
                          <span className={styles.docTitle}>{doc.title}</span>
                          <span className={styles.docTime}>
                            {doc.updatedAt}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Resize Handle */}
            {isExpanded && !isIconMode && (
              <div
                ref={resizeHandleRef}
                className={styles.resizeHandle}
                onMouseDown={handleMouseDown}
                title="Drag to resize"
                data-tour="sidebar-resize"
              />
            )}
          </>
        )}
      </aside>

      {/* Collapsed sidebar toggle button */}
      {isCollapsed && (
        <button
          className={styles.collapsedToggle}
          onClick={() => saveSettings({ mode: 'icon' })}
          title="Show sidebar"
        >
          →
        </button>
      )}
    </>
  )
}

export default AdvancedSidebar
