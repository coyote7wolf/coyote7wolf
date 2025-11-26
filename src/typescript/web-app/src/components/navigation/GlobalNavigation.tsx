'use client'
/**
 * Global Navigation Component
 *
 * Provides consistent navigation across all pages with:
 * - Main navigation menu
 * - User authentication status
 * - Route highlighting
 * - Mobile-responsive design
 */
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/Button'
import { APP_ROUTES, getRoutesByCategory } from '@/config/routes'

interface NavItem {
  label: string
  href: string
  description: string
  icon: string
  category: 'main' | 'demo' | 'system'
}

// Map routes to navigation items with icons
const navigationItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    description: 'Landing page with features overview',
    icon: '🏠',
    category: 'main',
  },
  {
    label: 'Login',
    href: '/login',
    description: 'User authentication and OAuth integration',
    icon: '🔐',
    category: 'main',
  },
  {
    label: 'Register',
    href: '/register',
    description: 'User registration with validation',
    icon: '📝',
    category: 'main',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    description: 'User dashboard with AI assistant',
    icon: '📊',
    category: 'main',
  },
  {
    label: 'Documents',
    href: '/documents',
    description: 'Document management and collaboration',
    icon: '📄',
    category: 'main',
  },
  {
    label: 'Profile',
    href: '/profile',
    description: 'User profile and settings',
    icon: '👤',
    category: 'main',
  },
  {
    label: 'File Upload Demo',
    href: '/file-upload-demo',
    description: 'Drag-and-drop file upload with progress tracking',
    icon: '📁',
    category: 'demo',
  },
  {
    label: 'Image Editor Demo',
    href: '/image-editor-demo',
    description: 'Canvas-based image editing with filters',
    icon: '🎨',
    category: 'demo',
  },
  {
    label: 'Media Player Demo',
    href: '/demos/media-player',
    description: 'Audio/video player with subtitle support',
    icon: '🎬',
    category: 'demo',
  },
  {
    label: 'Touch Demo',
    href: '/touch-demo',
    description: 'Touch optimization and gesture handling',
    icon: '👆',
    category: 'demo',
  },
  {
    label: 'PWA Demo',
    href: '/performance-pwa-demo',
    description: 'Progressive Web App features',
    icon: '📱',
    category: 'demo',
  },
  {
    label: 'Design System',
    href: '/design-system',
    description: 'Component library showcase',
    icon: '🎯',
    category: 'system',
  },
  {
    label: 'Test Pages',
    href: '/test',
    description: 'Testing and development utilities',
    icon: '🧪',
    category: 'system',
  },
  {
    label: 'Route Status',
    href: '/routes',
    description: 'App router status and navigation flows',
    icon: '🗺️',
    category: 'system',
  },
]

// ...existing code...

export function GlobalNavigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, i18n } = useTranslation('common')
  const [lang, setLang] = useState(i18n?.language || 'en')
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }
  const groupedItems = navigationItems.reduce(
    (acc: Record<string, NavItem[]>, item: NavItem) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category]!.push(item)
      return acc
    },
    {} as Record<string, NavItem[]>
  )
  const handleLangChange = (lng: string) => {
    i18n?.changeLanguage(lng)
    setLang(lng)
  }
  return (
    <nav className="global-navigation">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <span className="hamburger-icon">{isMenuOpen ? '✕' : '☰'}</span>
      </button>

      {/* Navigation Menu */}
      <div className={`navigation-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <Link href="/" className="nav-logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">SyncCoreAI</span>
          </Link>
        </div>
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="nav-section">
            <h3 className="nav-section-title">
              {category === 'main'
                ? t('application')
                : category === 'demo'
                  ? t('demosFeatures')
                  : t('system')}
            </h3>
            <ul className="nav-items">
              {items.map(item => (
                <li key={item.href} className="nav-item">
                  <Link
                    href={item.href as any}
                    className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <div className="nav-content">
                      <span className="nav-label">
                        {t(item.label.replace(/\s|-/g, ''))}
                      </span>
                      <span className="nav-description">
                        {t(item.label.replace(/\s|-/g, ''))}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <select value={lang} onChange={e => handleLangChange(e.target.value)}>
          <option value="en">English</option>
          <option value="zh-TW">繁體中文</option>
          <option value="zh-CN">简体中文</option>
          <option value="ja">日本語</option>
        </select>
        {/* Quick Actions */}
        <div className="nav-actions">
          <Link href="/login">
            <Button variant="outline" size="sm">
              {t('signIn')}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="solid" size="sm">
              {t('getStarted')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}

      <style jsx>{`
        .global-navigation {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .mobile-menu-button {
          display: block;
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 1001;
        }

        .navigation-menu {
          position: fixed;
          top: 0;
          left: -100%;
          width: 400px;
          height: 100vh;
          background: white;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
          transition: left 0.3s ease;
          overflow-y: auto;
          padding: 2rem 0;
        }

        .navigation-menu.open {
          left: 0;
        }

        .nav-header {
          padding: 0 2rem 2rem 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-section {
          padding: 1.5rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .nav-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #666;
          margin: 0 0 1rem 2rem;
        }

        .nav-items {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          margin: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 2rem;
          text-decoration: none;
          color: #333;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background: #f8f9fa;
          color: #667eea;
        }

        .nav-link.active {
          background: #667eea;
          color: white;
        }

        .nav-link.active .nav-description {
          color: rgba(255, 255, 255, 0.8);
        }

        .nav-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
        }

        .nav-content {
          flex: 1;
        }

        .nav-label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .nav-description {
          display: block;
          font-size: 0.875rem;
          color: #666;
          line-height: 1.3;
        }

        .nav-actions {
          padding: 2rem;
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }

        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        @media (min-width: 1024px) {
          .mobile-menu-button {
            display: none;
          }

          .navigation-menu {
            position: static;
            left: auto;
            width: auto;
            height: auto;
            background: transparent;
            box-shadow: none;
            display: flex;
            align-items: center;
            padding: 1rem 2rem;
            overflow: visible;
          }

          .nav-header {
            padding: 0;
            border: none;
            margin-right: 2rem;
          }

          .nav-section {
            display: none;
          }

          .nav-section:first-of-type {
            display: flex;
            padding: 0;
            border: none;
            gap: 2rem;
            align-items: center;
          }

          .nav-section-title {
            display: none;
          }

          .nav-items {
            display: flex;
            gap: 1rem;
          }

          .nav-link {
            padding: 0.5rem 1rem;
            border-radius: 8px;
          }

          .nav-content {
            display: flex;
            align-items: center;
          }

          .nav-description {
            display: none;
          }

          .nav-actions {
            padding: 0;
            flex-direction: row;
            margin-left: auto;
          }

          .menu-overlay {
            display: none;
          }
        }
      `}</style>
    </nav>
  )
}

export default GlobalNavigation
