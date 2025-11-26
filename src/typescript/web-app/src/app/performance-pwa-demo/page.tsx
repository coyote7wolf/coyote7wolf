/**
 * Performance & PWA Demo Page
 *
 * Demonstrates the PWA features, image optimization, lazy loading,
 * and bundle analysis tools.
 */

'use client'

import { useState } from 'react'
import { HomeLayout } from '@/components/layout/HomeLayout'
import {
  PWAInstallPrompt,
  PWAInstallButton,
} from '@/components/pwa/PWAInstallPrompt'
import {
  OptimizedImage,
  LazyImage,
  GalleryImage,
  HeroImage,
  AvatarImage,
} from '@/components/ui/OptimizedImage'
import {
  LazyContainer,
  LazyVideo,
  LazyComponent,
  LazyList,
} from '@/components/lazy/LazyLoad'
import BundleAnalyzer from '@/components/tools/BundleAnalyzer'
import { usePWA } from '@/hooks/usePWA'

export default function PerformancePWADemo() {
  const [activeSection, setActiveSection] = useState<
    'pwa' | 'images' | 'lazy' | 'bundle'
  >('pwa')
  const { isInstalled, canReceiveNotifications, showNotification } = usePWA()

  const testNotification = () => {
    showNotification('Test Notification', {
      body: 'PWA notifications are working!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
    })
  }

  const sampleItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }))

  const sections = [
    { id: 'pwa', label: 'PWA Features', icon: '📱' },
    { id: 'images', label: 'Image Optimization', icon: '🖼️' },
    { id: 'lazy', label: 'Lazy Loading', icon: '⚡' },
    { id: 'bundle', label: 'Bundle Analysis', icon: '📊' },
  ]

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-gray-900">
                Performance & PWA Demo
              </h1>
              <div className="flex items-center space-x-4">
                {!isInstalled && <PWAInstallButton variant="solid" />}
                {canReceiveNotifications && (
                  <button
                    onClick={testNotification}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Test Notification
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isInstalled && (
            <PWAInstallPrompt showFeatures={true} className="mb-8" />
          )}

          {activeSection === 'pwa' && (
            <PWASection
              isInstalled={isInstalled}
              canReceiveNotifications={canReceiveNotifications}
              onTestNotification={testNotification}
            />
          )}

          {activeSection === 'images' && <ImageOptimizationSection />}
          {activeSection === 'lazy' && (
            <LazyLoadingSection items={sampleItems} />
          )}
          {activeSection === 'bundle' && <BundleAnalysisSection />}
        </main>
      </div>
    </HomeLayout>
  )
}

function PWASection({
  isInstalled,
  canReceiveNotifications,
  onTestNotification,
}: {
  isInstalled: boolean
  canReceiveNotifications: boolean
  onTestNotification: () => void
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">PWA Status</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">App Installed</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isInstalled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {isInstalled ? 'Yes' : 'Not Yet'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Notifications</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                canReceiveNotifications
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {canReceiveNotifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Service Worker</span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Offline Support</span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              Ready
            </span>
          </div>
        </div>

        {canReceiveNotifications && (
          <button
            onClick={onTestNotification}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Test Push Notification
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          PWA Features
        </h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-gray-900">Offline First</div>
              <div className="text-sm text-gray-600">
                Works without internet connection
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-gray-900">Background Sync</div>
              <div className="text-sm text-gray-600">
                Sync data when connection returns
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-gray-900">
                Push Notifications
              </div>
              <div className="text-sm text-gray-600">
                Receive updates even when app is closed
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-gray-900">
                App-like Experience
              </div>
              <div className="text-sm text-gray-600">
                Full screen, native app feel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageOptimizationSection() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Image Optimization Examples
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hero Image */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Hero Image</h3>
            <HeroImage
              src="https://picsum.photos/800/400"
              alt="Hero image example"
              width={400}
              height={200}
              className="rounded-lg"
            />
          </div>

          {/* Gallery Images */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Gallery Image</h3>
            <GalleryImage
              src="https://picsum.photos/400/300"
              alt="Gallery image example"
              width={400}
              height={300}
              className="rounded-lg"
            />
          </div>

          {/* Avatar */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Avatar</h3>
            <AvatarImage
              src="https://picsum.photos/100/100"
              alt="Avatar example"
              size={100}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lazy Loaded Images
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <LazyImage
              key={i}
              src={`https://picsum.photos/300/200?random=${i}`}
              alt={`Lazy loaded image ${i + 1}`}
              width={300}
              height={200}
              className="rounded-lg"
              preset="card"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function LazyLoadingSection({ items }: { items: any[] }) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lazy Loading Components
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lazy Video */}
          <LazyContainer>
            <h3 className="font-medium text-gray-900 mb-2">Lazy Video</h3>
            <LazyVideo
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://picsum.photos/400/300"
              className="w-full rounded-lg"
              controls
            />
          </LazyContainer>

          {/* Lazy Component */}
          <LazyContainer>
            <h3 className="font-medium text-gray-900 mb-2">Lazy Component</h3>
            <LazyComponent
              importComponent={() =>
                import('@/components/ui/OptimizedImage').then(m => ({
                  default: m.default,
                }))
              }
              componentProps={{
                src: 'https://picsum.photos/400/300',
                alt: 'Dynamic component',
                width: 400,
                height: 300,
              }}
            />
          </LazyContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Virtual Scrolling List
        </h2>
        <LazyList
          items={items}
          renderItem={item => (
            <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          )}
          itemHeight={80}
          batchSize={20}
          className="max-h-96 overflow-y-auto border border-gray-200 rounded"
        />
      </div>
    </div>
  )
}

function BundleAnalysisSection() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bundle Analysis
        </h2>
        <p className="text-gray-600 mb-6">
          Upload your webpack stats.json file to analyze your bundle composition
          and identify optimization opportunities.
        </p>
        <BundleAnalyzer />
      </div>
    </div>
  )
}
