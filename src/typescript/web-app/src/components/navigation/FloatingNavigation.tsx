/**
 * Floating Navigation Component
 *
 * A floating navigation widget that provides quick access to all app routes
 * Positioned at the bottom-right corner with expandable menu
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { APP_ROUTES, getRoutesByCategory } from '@/config/routes'
import { Button } from '@/components/ui/Button'

export function FloatingNavigation() {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const mainRoutes = getRoutesByCategory('main')
  const demoRoutes = getRoutesByCategory('demo')
  const systemRoutes = getRoutesByCategory('system')

  return (
    <div className="floating-nav">
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="floating-backdrop"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded Menu */}
      {isExpanded && (
        <div className="floating-menu">
          <div className="menu-section">
            <h3 className="menu-title">🏠 Main Features</h3>
            <div className="menu-items">
              {mainRoutes.map(route => (
                <Link
                  key={route.path}
                  href={route.path as any}
                  className="menu-item"
                >
                  <span className="item-name">{route.name}</span>
                  <span className="item-desc">{route.description}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="menu-section">
            <h3 className="menu-title">🎯 Demos & Showcases</h3>
            <div className="menu-items">
              {demoRoutes.map(route => (
                <Link
                  key={route.path}
                  href={route.path as any}
                  className="menu-item"
                >
                  <span className="item-name">{route.name}</span>
                  <span className="item-desc">{route.description}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="menu-section">
            <h3 className="menu-title">🛠️ System & Development</h3>
            <div className="menu-items">
              {systemRoutes.map(route => (
                <Link
                  key={route.path}
                  href={route.path as any}
                  className="menu-item"
                >
                  <span className="item-name">{route.name}</span>
                  <span className="item-desc">{route.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="floating-button-container">
        <Button
          variant="solid"
          colorScheme="primary"
          size="lg"
          onClick={toggleExpanded}
          className="floating-button"
        >
          {isExpanded ? '✕' : '🚀'}
        </Button>

        {!isExpanded && (
          <div className="floating-tooltip">Quick Navigation</div>
        )}
      </div>

      <style jsx>{`
        .floating-nav {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        .floating-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          z-index: -1;
        }

        .floating-menu {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 320px;
          max-height: 70vh;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          overflow-y: auto;
          animation: fadeInUp 0.2s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-section {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .menu-section:last-child {
          border-bottom: none;
        }

        .menu-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .menu-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .menu-item {
          display: block;
          padding: 0.75rem;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .menu-item:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
          transform: translateX(2px);
        }

        .item-name {
          display: block;
          font-weight: 500;
          color: #334155;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .item-desc {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.3;
        }

        .floating-button-container {
          position: relative;
          display: inline-block;
        }

        .floating-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          font-size: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .floating-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .floating-tooltip {
          position: absolute;
          bottom: 50%;
          right: 70px;
          transform: translateY(50%);
          background: #1f2937;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .floating-tooltip::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-left-color: #1f2937;
        }

        .floating-button-container:hover .floating-tooltip {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .floating-nav {
            bottom: 1rem;
            right: 1rem;
          }

          .floating-menu {
            width: calc(100vw - 2rem);
            right: -1rem;
            max-width: 320px;
          }

          .floating-button {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }

          .floating-tooltip {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

export default FloatingNavigation
