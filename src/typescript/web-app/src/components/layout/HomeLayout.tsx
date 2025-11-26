/**
 * Home Layout with Advanced Sidebar
 *
 * Layout wrapper for the homepage that includes the advanced sidebar
 */

'use client'

import React from 'react'
import AdvancedSidebar from '../navigation/AdvancedSidebar'

interface HomeLayoutProps {
  children: React.ReactNode
}

export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="home-layout">
      <AdvancedSidebar
        defaultMode="icon"
        isPublicMode={true}
        noHeader={false}
      />

      <div className="home-content">{children}</div>

      <style jsx>{`
        .home-layout {
          min-height: 100vh;
          display: flex;
        }

        .home-content {
          flex: 1;
          margin-left: 64px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .home-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default HomeLayout
