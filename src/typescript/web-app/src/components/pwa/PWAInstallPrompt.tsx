'use client'

import { usePWA } from '@/hooks/usePWA'
import { useState } from 'react'

interface PWAInstallPromptProps {
  onClose?: () => void
  showFeatures?: boolean
  className?: string
}

export function PWAInstallPrompt({
  onClose,
  showFeatures: initialShowFeatures = false,
  className = '',
}: PWAInstallPromptProps) {
  const { canInstall, isInstalling, showInstallPrompt, isInstalled } = usePWA()

  const isIOS =
    typeof window !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isStandalone = isInstalled

  const [showFeatures, setShowFeatures] = useState(initialShowFeatures)
  const [showManualInstructions, setShowManualInstructions] = useState(false)

  // Don't show if already installed or can't install
  if (isStandalone || (!canInstall && !isIOS)) {
    return null
  }

  const handleInstall = async () => {
    try {
      await showInstallPrompt()
      onClose?.()
    } catch (error) {
      console.error('Failed to install app:', error)
    }
  }

  const handleShowManual = () => {
    setShowManualInstructions(true)
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md mx-auto ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Install SyncCoreAI</h3>
            <p className="text-sm text-gray-600">Get the full app experience</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Get the best experience with our app. Install it for faster access,
        offline support, and native app feel.
      </p>

      {/* Features preview */}
      {showFeatures && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Works offline</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Faster loading</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Push notifications</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Native app experience</span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3">
        {canInstall && !showManualInstructions ? (
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isInstalling ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  ></circle>
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    className="opacity-75"
                  ></path>
                </svg>
                Installing...
              </>
            ) : (
              'Install App'
            )}
          </button>
        ) : isIOS ? (
          <button
            onClick={handleShowManual}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Show Install Instructions
          </button>
        ) : (
          <div className="flex-1 text-center text-sm text-gray-500 py-2">
            Install not available
          </div>
        )}

        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium transition-colors"
        >
          {showFeatures ? 'Hide' : 'Why?'}
        </button>
      </div>

      {/* iOS Manual Instructions */}
      {showManualInstructions && isIOS && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">
            Install Instructions for iOS
          </h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>
                Tap the Share button{' '}
                <svg
                  className="inline w-4 h-4 mx-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                </svg>{' '}
                in Safari
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>Scroll down and tap "Add to Home Screen"</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>Tap "Add" to confirm</span>
            </li>
          </ol>
          <button
            onClick={() => setShowManualInstructions(false)}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  )
}

// Simplified install button component without complex prop types
export function PWAInstallButton({
  children,
  className = '',
  variant = 'outline',
  size = 'sm',
}: {
  children?: React.ReactNode
  className?: string
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}) {
  const { canInstall, isInstalling, showInstallPrompt } = usePWA()

  if (!canInstall) return null

  const handleInstall = async () => {
    try {
      await showInstallPrompt()
    } catch (error) {
      console.error('Failed to install app:', error)
    }
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`
        ${variant === 'solid' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
        ${variant === 'outline' ? 'border border-blue-600 text-blue-600 hover:bg-blue-50' : ''}
        ${variant === 'ghost' ? 'text-blue-600 hover:bg-blue-50' : ''}
        ${size === 'sm' ? 'px-3 py-1.5 text-sm' : ''}
        ${size === 'md' ? 'px-4 py-2 text-base' : ''}
        ${size === 'lg' ? 'px-6 py-3 text-lg' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        rounded-lg font-medium transition-colors
        flex items-center justify-center
        ${className}
      `}
    >
      {isInstalling ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            ></circle>
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            ></path>
          </svg>
          Installing...
        </>
      ) : (
        children || (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Install App
          </>
        )
      )}
    </button>
  )
}
