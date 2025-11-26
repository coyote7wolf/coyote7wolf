/**
 * Main Layout with Sidebar
 *
 * Layout wrapper that includes the responsive sidebar and main content area
 */

'use client'

import React, { useState, useEffect } from 'react'
import AdvancedSidebar from '../navigation/AdvancedSidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)

      // Auto-collapse sidebar on mobile
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarOpen])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="main-layout">
      <AdvancedSidebar
        defaultMode={isSidebarOpen ? 'expanded' : 'icon'}
        isPublicMode={false}
        noHeader={true}
      />

      <div
        className={`main-content ${
          isMobile
            ? 'main-content-mobile'
            : isSidebarOpen
              ? 'main-content-with-sidebar'
              : 'main-content-with-collapsed-sidebar'
        }`}
      >
        <div className="content-wrapper">{children}</div>
      </div>

      <style jsx>{`
        .main-layout {
          min-height: 100vh;
          display: flex;
        }

        .main-content {
          flex: 1;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
          background: #fafafa;
        }

        .main-content-with-sidebar {
          margin-left: 280px;
        }

        .main-content-with-collapsed-sidebar {
          margin-left: 64px;
        }

        .main-content-mobile {
          margin-left: 0;
        }

        .content-wrapper {
          padding: 2rem;
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .content-wrapper {
            padding: 2rem 1rem;
          }
        }

        @media (max-width: 768px) {
          .content-wrapper {
            padding: 4rem 0.75rem 1rem 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default MainLayout
