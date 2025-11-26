/**
 * Responsive Sidebar Component
 * 
 * A collapsible sidebar that adapts to different screen sizes
 * Includes mock API integration for all interactive elements
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { APP_ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
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

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [mockData, setMockData] = useState<MockData>({
    notifications: 0,
    recentDocuments: [],
    userStats: {
      documentsCreated: 0,
      collaborations: 0,
      storageUsed: '0 MB'
    }
  })

  // Mock API call to fetch sidebar data
  const fetchSidebarData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data response
      const mockResponse: MockData = {
        notifications: Math.floor(Math.random() * 10) + 1,
        recentDocuments: [
          {
            id: '1',
            title: 'Project Proposal Draft',
            updatedAt: '2 hours ago'
          },
          {
            id: '2', 
            title: 'Meeting Notes - Q4 Review',
            updatedAt: '1 day ago'
          },
          {
            id: '3',
            title: 'Technical Specification',
            updatedAt: '3 days ago'
          }
        ],
        userStats: {
          documentsCreated: Math.floor(Math.random() * 50) + 10,
          collaborations: Math.floor(Math.random() * 20) + 5,
          storageUsed: `${(Math.random() * 500 + 100).toFixed(1)} MB`
        }
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
    fetchSidebarData() // Refresh data
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
    fetchSidebarData() // Refresh data
    setIsLoading(false)
  }

  // Load data on component mount
  useEffect(() => {
    fetchSidebarData()
  }, [])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {isOpen ? (
              <span className="logo-text">SyncCoreAI</span>
            ) : (
              <span className="logo-icon">S</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="toggle-button"
          >
            {isOpen ? '←' : '→'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="sidebar-section">
          {isOpen && <h3 className="section-title">Quick Actions</h3>}
          
          <div className="action-buttons">
            <Button
              variant="solid"
              colorScheme="primary"
              size={isOpen ? 'md' : 'sm'}
              onClick={handleCreateDocument}
              disabled={isLoading}
              className="action-button"
            >
              {isOpen ? (
                <>📝 Create Document</>
              ) : (
                '📝'
              )}
            </Button>

            <Button
              variant="outline"
              colorScheme="secondary"
              size={isOpen ? 'md' : 'sm'}
              onClick={handleUploadFile}
              disabled={isLoading}
              className="action-button"
            >
              {isOpen ? (
                <>📁 Upload File</>
              ) : (
                '📁'
              )}
            </Button>

            <Button
              variant="ghost"
              colorScheme="neutral"
              size={isOpen ? 'md' : 'sm'}
              onClick={handleViewNotifications}
              disabled={isLoading}
              className="action-button notification-button"
            >
              {isOpen ? (
                <>🔔 Notifications ({mockData.notifications})</>
              ) : (
                <span className="notification-icon">
                  🔔
                  <span className="notification-badge">{mockData.notifications}</span>
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="sidebar-section">
          {isOpen && <h3 className="section-title">Navigation</h3>}
          
          <nav className="sidebar-nav">
            {APP_ROUTES.slice(0, 6).map(route => (
              <Link 
                key={route.path} 
                href={route.path as any}
                className="nav-item"
              >
                <span className="nav-icon">
                  {route.path === '/' ? '🏠' : 
                   route.path === '/dashboard' ? '📊' :
                   route.path === '/documents' ? '📝' :
                   route.path === '/profile' ? '👤' :
                   route.path === '/login' ? '🔐' : '📄'}
                </span>
                {isOpen && <span className="nav-text">{route.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Stats */}
        {isOpen && (
          <div className="sidebar-section">
            <h3 className="section-title">Your Stats</h3>
            <Card size="sm" className="stats-card">
              <CardBody>
                {isLoading ? (
                  <div className="loading-placeholder">Loading...</div>
                ) : (
                  <div className="stats-content">
                    <div className="stat-item">
                      <span className="stat-value">{mockData.userStats.documentsCreated}</span>
                      <span className="stat-label">Documents</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{mockData.userStats.collaborations}</span>
                      <span className="stat-label">Collaborations</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{mockData.userStats.storageUsed}</span>
                      <span className="stat-label">Storage Used</span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Recent Documents */}
        {isOpen && (
          <div className="sidebar-section">
            <h3 className="section-title">Recent Documents</h3>
            <div className="recent-documents">
              {isLoading ? (
                <div className="loading-placeholder">Loading...</div>
              ) : (
                mockData.recentDocuments.map(doc => (
                  <div key={doc.id} className="recent-doc-item">
                    <div className="doc-info">
                      <span className="doc-title">{doc.title}</span>
                      <span className="doc-time">{doc.updatedAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </aside>

      <style jsx>{`
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
          display: none;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          background: white;
          border-right: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          z-index: 50;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .sidebar-open {
          width: 280px;
        }

        .sidebar-closed {
          width: 64px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          min-height: 64px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: bold;
          color: #2563eb;
        }

        .logo-icon {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2563eb;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dbeafe;
          border-radius: 8px;
        }

        .toggle-button {
          padding: 0.5rem;
          min-width: 32px;
        }

        .sidebar-section {
          padding: 1rem;
          border-bottom: 1px solid #f8fafc;
        }

        .section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.75rem;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-button {
          justify-content: flex-start;
          text-align: left;
        }

        .notification-button {
          position: relative;
        }

        .notification-icon {
          position: relative;
          display: inline-block;
        }

        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 6px;
          text-decoration: none;
          color: #475569;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: #f8fafc;
          color: #2563eb;
        }

        .nav-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
        }

        .nav-text {
          font-weight: 500;
        }

        .stats-card {
          background: #f8fafc;
        }

        .stats-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-value {
          font-weight: 600;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        .recent-documents {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .recent-doc-item {
          padding: 0.5rem;
          border-radius: 4px;
          background: #f8fafc;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .recent-doc-item:hover {
          background: #e2e8f0;
        }

        .doc-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .doc-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
          line-height: 1.2;
        }

        .doc-time {
          font-size: 0.75rem;
          color: #64748b;
        }

        .loading-placeholder {
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
          padding: 1rem 0;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .sidebar-overlay {
            display: block;
          }

          .sidebar-closed {
            transform: translateX(-100%);
            width: 280px;
          }

          .sidebar-open {
            transform: translateX(0);
            width: 280px;
          }
        }

        @media (max-width: 768px) {
          .sidebar-open {
            width: 260px;
          }
        }
      `}</style>
    </>
  )
}

export default Sidebar