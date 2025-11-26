/**
 * Navigation Test Utility
 *
 * Automated testing tool to verify all navigation links work correctly
 */

'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { APP_ROUTES } from '@/config/routes'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface TestResult {
  path: string
  status: 'untested' | 'testing' | 'success' | 'error'
  error?: string
  responseTime?: number
}

export function NavigationTester() {
  const [testResults, setTestResults] = useState<TestResult[]>(
    APP_ROUTES.map(route => ({
      path: route.path,
      status: 'untested',
    }))
  )
  const [isRunning, setIsRunning] = useState(false)

  const testRoute = useCallback(async (path: string): Promise<TestResult> => {
    const startTime = Date.now()

    try {
      // Simulate navigation test (in real app would check if route loads)
      const response = await fetch(path, { method: 'HEAD' })
      const responseTime = Date.now() - startTime

      if (response.ok) {
        return {
          path,
          status: 'success' as const,
          responseTime,
        }
      } else {
        return {
          path,
          status: 'error' as const,
          responseTime,
          error: `HTTP ${response.status}`,
        }
      }
    } catch (error) {
      return {
        path,
        status: 'error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }, [])

  const runAllTests = useCallback(async () => {
    setIsRunning(true)

    // Reset all to untested
    setTestResults(prev =>
      prev.map(result => ({ ...result, status: 'untested' }))
    )

    // Test each route sequentially
    for (const route of APP_ROUTES) {
      setTestResults(prev =>
        prev.map(result =>
          result.path === route.path ? { ...result, status: 'testing' } : result
        )
      )

      const result = await testRoute(route.path)

      setTestResults(prev =>
        prev.map(prevResult =>
          prevResult.path === route.path ? result : prevResult
        )
      )

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setIsRunning(false)
  }, [testRoute])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'untested':
        return '⚪'
      case 'testing':
        return '🔄'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
    }
  }

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length
  const totalCount = testResults.length

  return (
    <div className="navigation-tester">
      <div className="tester-header">
        <h1>🔍 Navigation Link Tester</h1>
        <p>Automated testing of all application routes and navigation links</p>

        <div className="test-controls">
          <Button variant="solid" onClick={runAllTests} disabled={isRunning}>
            {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
          </Button>

          {testResults.some(r => r.status !== 'untested') && (
            <div className="test-summary">
              <span className="summary-item success">
                ✅ {successCount} Passed
              </span>
              <span className="summary-item error">❌ {errorCount} Failed</span>
              <span className="summary-item total">📊 {totalCount} Total</span>
            </div>
          )}
        </div>
      </div>

      <div className="test-results">
        {testResults.map((result, index) => {
          const route = APP_ROUTES.find(r => r.path === result.path)
          if (!route) return null

          return (
            <Card key={result.path} className="test-result-card">
              <CardHeader>
                <div className="result-header">
                  <div className="route-info">
                    <span className="route-path">{result.path}</span>
                    <span className="route-name">{route.name}</span>
                  </div>
                  <div className="status-info">
                    <span className={`status-icon status-${result.status}`}>
                      {getStatusIcon(result.status)}
                    </span>
                    <span className="status-text">
                      {result.status.charAt(0).toUpperCase() +
                        result.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardBody>
                <div className="result-details">
                  <div className="route-meta">
                    <span className="meta-item">
                      <strong>Category:</strong> {route.category}
                    </span>
                    <span className="meta-item">
                      <strong>Access:</strong>{' '}
                      {route.isPublic ? 'Public' : 'Private'}
                    </span>
                    {result.responseTime && (
                      <span className="meta-item">
                        <strong>Response Time:</strong> {result.responseTime}ms
                      </span>
                    )}
                  </div>

                  {result.error && (
                    <div className="error-info">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}

                  <div className="test-actions">
                    <Link href={result.path as any}>
                      <Button variant="outline" size="sm">
                        Visit Page
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        testRoute(result.path).then(newResult => {
                          setTestResults(prev =>
                            prev.map(prevResult =>
                              prevResult.path === result.path
                                ? newResult
                                : prevResult
                            )
                          )
                        })
                      }
                    >
                      Retest
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      <style jsx>{`
        .navigation-tester {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .tester-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .tester-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .test-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .test-summary {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .summary-item {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .summary-item.success {
          background: #f0fff4;
          color: #38a169;
        }

        .summary-item.error {
          background: #fed7d7;
          color: #e53e3e;
        }

        .summary-item.total {
          background: #e2e8f0;
          color: #4a5568;
        }

        .test-results {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .test-result-card {
          border: 1px solid #e2e8f0;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .test-result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .route-info {
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

        .status-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-icon {
          font-size: 1.5rem;
        }

        .status-icon.status-untested {
          color: #a0aec0;
        }

        .status-icon.status-testing {
          color: #667eea;
        }

        .status-icon.status-success {
          color: #48bb78;
        }

        .status-icon.status-error {
          color: #f56565;
        }

        .status-text {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .result-details {
          margin-top: 1rem;
        }

        .route-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          font-size: 0.875rem;
          color: #666;
        }

        .error-info {
          background: #fed7d7;
          color: #e53e3e;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .test-actions {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .navigation-tester {
            padding: 1rem;
          }

          .test-results {
            grid-template-columns: 1fr;
          }

          .test-summary {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}

export default NavigationTester
