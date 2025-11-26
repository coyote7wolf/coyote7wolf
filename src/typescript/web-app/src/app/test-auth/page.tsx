'use client'

import { useEffect, useState } from 'react'
import { ClientLayout } from '@/components/layout/ClientLayout'

export default function TestAuthPage() {
  const [authData, setAuthData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Check all auth-related localStorage keys
      const authState = localStorage.getItem('auth_state')
      const rememberMe = localStorage.getItem('remember_me')
      const lastActivity = localStorage.getItem('last_activity')

      console.log('Auth State:', authState)
      console.log('Remember Me:', rememberMe)
      console.log('Last Activity:', lastActivity)

      if (authState) {
        try {
          // Try to decode the auth state
          const decoded = atob(authState)
          const parsed = JSON.parse(decoded)
          setAuthData(parsed)
        } catch (decodeError) {
          console.error('Failed to decode auth state:', decodeError)
          setError('Failed to decode auth state')
        }
      } else {
        setError('No auth state found in localStorage')
      }
    } catch (e) {
      console.error('Error checking auth:', e)
      setError('Error checking auth: ' + (e as Error).message)
    }
  }, [])

  return (
    <ClientLayout>
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">localStorage Contents:</h2>
          <pre className="text-sm overflow-auto">
            {typeof window !== 'undefined'
              ? JSON.stringify(
                  {
                    auth_state: localStorage.getItem('auth_state'),
                    remember_me: localStorage.getItem('remember_me'),
                    last_activity: localStorage.getItem('last_activity'),
                  },
                  null,
                  2
                )
              : 'Loading...'}
          </pre>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {authData && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h2 className="text-lg font-semibold mb-2">Decoded Auth Data:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(authData, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Clear Storage
          </button>
          <a
            href="/api/auth/callback?code=test456&provider=google&action=login"
            className="bg-green-500 text-white px-4 py-2 rounded inline-block"
          >
            Test OAuth
          </a>
        </div>
      </div>
    </ClientLayout>
  )
}
