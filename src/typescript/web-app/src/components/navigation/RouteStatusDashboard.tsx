/**
 * Route Status Dashboard
 *
 * Displays the status of all routes in the application
 * Shows which pages are implemented, connected, and working
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  APP_ROUTES,
  getRoutesByCategory,
  NAVIGATION_FLOWS,
} from '@/config/routes'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface RouteStatus {
  implemented: boolean
  accessible: boolean
  hasContent: boolean
  lastTested?: Date
}

export function RouteStatusDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Mock route status - in real app this would come from monitoring
  const getRouteStatus = (path: string): RouteStatus => {
    const implementedRoutes = [
      '/',
      '/login',
      '/register',
      '/dashboard',
      '/documents',
      '/profile',
      '/file-upload-demo',
      '/image-editor-demo',
      '/demos/media-player',
      '/touch-demo',
      '/performance-pwa-demo',
      '/design-system',
      '/test',
      '/test-auth',
    ]

    return {
      implemented: implementedRoutes.includes(path),
      accessible: implementedRoutes.includes(path),
      hasContent: implementedRoutes.includes(path),
      lastTested: new Date(),
    }
  }

  const filteredRoutes =
    selectedCategory === 'all'
      ? APP_ROUTES
      : getRoutesByCategory(selectedCategory as any)

  const categories = ['all', 'main', 'demo', 'system', 'auth']

  return (
    <div className="route-status-dashboard">
      <div className="dashboard-header">
        <h1>🗺️ App Router Status Dashboard</h1>
        <p>Complete overview of application routes and their connectivity</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all'
              ? 'All Routes'
              : category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Route Grid */}
      <div className="routes-grid">
        {filteredRoutes.map(route => {
          const status = getRouteStatus(route.path)
          return (
            <Card key={route.path} className="route-card">
              <CardHeader>
                <div className="route-header">
                  <div className="route-title">
                    <span className="route-path">{route.path}</span>
                    <span className="route-name">{route.name}</span>
                  </div>
                  <div className="status-indicators">
                    <span
                      className={`status-dot ${status.implemented ? 'implemented' : 'not-implemented'}`}
                    >
                      {status.implemented ? '✅' : '❌'}
                    </span>
                    <span className="status-label">
                      {status.implemented ? 'Live' : 'Pending'}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardBody>
                <p className="route-description">{route.description}</p>

                <div className="route-features">
                  <h4>Key Features:</h4>
                  <ul>
                    {route.features.map((feature, index) => (
                      <li key={index}>
                        <span className="feature-icon">🔧</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="route-metadata">
                  <div className="metadata-item">
                    <strong>Category:</strong>
                    <span className={`category-badge ${route.category}`}>
                      {route.category}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <strong>Access:</strong>
                    <span
                      className={`access-badge ${route.isPublic ? 'public' : 'private'}`}
                    >
                      {route.isPublic ? '🌐 Public' : '🔒 Private'}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <strong>Auth Required:</strong>
                    <span
                      className={`auth-badge ${route.requiresAuth ? 'required' : 'optional'}`}
                    >
                      {route.requiresAuth ? '🔐 Required' : '🚪 Optional'}
                    </span>
                  </div>
                </div>

                <div className="route-actions">
                  {status.implemented ? (
                    <Link href={route.path as any}>
                      <Button variant="solid" size="sm">
                        Visit Page
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Navigation Flows */}
      <div className="navigation-flows">
        <h2>🚀 User Journey Flows</h2>
        <div className="flows-grid">
          {Object.entries(NAVIGATION_FLOWS).map(([flowName, routes]) => (
            <Card key={flowName} className="flow-card">
              <CardHeader>
                <h3>{flowName}</h3>
              </CardHeader>
              <CardBody>
                <div className="flow-path">
                  {routes.map((routePath, index) => (
                    <React.Fragment key={routePath}>
                      <Link href={routePath as any} className="flow-step">
                        <span className="step-number">{index + 1}</span>
                        <span className="step-name">
                          {APP_ROUTES.find(r => r.path === routePath)?.name ||
                            routePath}
                        </span>
                      </Link>
                      {index < routes.length - 1 && (
                        <span className="flow-arrow">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="route-statistics">
        <h2>📊 Route Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{APP_ROUTES.length}</div>
            <div className="stat-label">Total Routes</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {
                APP_ROUTES.filter(r => getRouteStatus(r.path).implemented)
                  .length
              }
            </div>
            <div className="stat-label">Implemented</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {APP_ROUTES.filter(r => r.isPublic).length}
            </div>
            <div className="stat-label">Public Routes</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {APP_ROUTES.filter(r => r.requiresAuth).length}
            </div>
            <div className="stat-label">Protected Routes</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .route-status-dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .category-filter {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .routes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .route-card {
          border: 1px solid #e2e8f0;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .route-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .route-title {
          flex: 1;
        }

        .route-path {
          display: block;
          font-family: monospace;
          font-size: 0.875rem;
          color: #667eea;
          margin-bottom: 0.25rem;
        }

        .route-name {
          display: block;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .status-indicators {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          font-size: 1.2rem;
        }

        .status-label {
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: #f7fafc;
        }

        .route-description {
          color: #666;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .route-features h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #4a5568;
        }

        .route-features ul {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
        }

        .route-features li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .feature-icon {
          font-size: 0.75rem;
        }

        .route-metadata {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .category-badge,
        .access-badge,
        .auth-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .category-badge.main {
          background: #e6fffa;
          color: #2d3748;
        }
        .category-badge.demo {
          background: #fff5f5;
          color: #2d3748;
        }
        .category-badge.system {
          background: #f7fafc;
          color: #2d3748;
        }
        .category-badge.auth {
          background: #fef5e7;
          color: #2d3748;
        }

        .access-badge.public {
          background: #f0fff4;
          color: #2d3748;
        }
        .access-badge.private {
          background: #fef5e7;
          color: #2d3748;
        }

        .auth-badge.required {
          background: #fef5e7;
          color: #2d3748;
        }
        .auth-badge.optional {
          background: #f0fff4;
          color: #2d3748;
        }

        .route-actions {
          display: flex;
          gap: 0.5rem;
        }

        .navigation-flows {
          margin-bottom: 3rem;
        }

        .navigation-flows h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.8rem;
        }

        .flows-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .flow-card {
          border: 1px solid #e2e8f0;
        }

        .flow-path {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }

        .flow-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          background: #f7fafc;
          text-decoration: none;
          color: inherit;
          transition: background 0.2s ease;
        }

        .flow-step:hover {
          background: #e2e8f0;
        }

        .step-number {
          background: #667eea;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .step-name {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .flow-arrow {
          color: #a0aec0;
          font-weight: bold;
        }

        .route-statistics h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.8rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 2rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .route-status-dashboard {
            padding: 1rem;
          }

          .routes-grid {
            grid-template-columns: 1fr;
          }

          .flows-grid {
            grid-template-columns: 1fr;
          }

          .flow-path {
            flex-direction: column;
            align-items: stretch;
          }

          .flow-arrow {
            transform: rotate(90deg);
            align-self: center;
          }
        }
      `}</style>
    </div>
  )
}

export default RouteStatusDashboard
