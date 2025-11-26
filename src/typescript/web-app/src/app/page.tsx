'use client'

import React from 'react'
import Link from 'next/link'
import { Button, Card, CardBody } from '@/components'
import HomeLayout from '@/components/layout/HomeLayout'
import ProductTour from '@/components/tour/ProductTour'
import { useTour } from '@/hooks/useTour'
import { homepageTourSteps } from '@/config/tourSteps'

/**
 * SyncCoreAI Home Page
 *
 * Landing page showcasing the platform's features and encouraging users to sign up or login
 */
export default function HomePage() {
  const tour = useTour(homepageTourSteps, {
    storageKey: 'homepage-tour-completed',
    autoStart: true,
  })

  return (
    <HomeLayout>
      <div
        className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50"
        data-tour="main-content"
      >
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md"></header>

        {/* Hero Section */}
        <section className="py-20 px-4" data-tour="hero-section">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
              Collaborative Document Editing
              <span className="text-primary-600 block mt-2">Powered by AI</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Create, edit, and collaborate on documents in real-time with
              intelligent AI suggestions, advanced conflict resolution, and
              seamless synchronization across all your devices.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              data-tour="demo-buttons"
            >
              <Link href="/register">
                <Button variant="solid" colorScheme="primary" size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demos/media-player">
                <Button variant="outline" colorScheme="primary" size="lg">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Quick Access Navigation */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-neutral-700 mb-6">
                🚀 Quick Access - Explore Our Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard" className="group">
                  <Card className="h-full transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    <CardBody className="text-center p-4">
                      <div className="text-3xl mb-2">📊</div>
                      <h4 className="font-semibold text-sm text-neutral-800 group-hover:text-primary-600">
                        Dashboard
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">Main Hub</p>
                    </CardBody>
                  </Card>
                </Link>

                <Link href="/documents" className="group">
                  <Card className="h-full transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    <CardBody className="text-center p-4">
                      <div className="text-3xl mb-2">📝</div>
                      <h4 className="font-semibold text-sm text-neutral-800 group-hover:text-primary-600">
                        Documents
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">
                        Edit & Manage
                      </p>
                    </CardBody>
                  </Card>
                </Link>

                <Link href="/demos/media-player" className="group">
                  <Card className="h-full transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    <CardBody className="text-center p-4">
                      <div className="text-3xl mb-2">🎬</div>
                      <h4 className="font-semibold text-sm text-neutral-800 group-hover:text-primary-600">
                        Media Player
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">Demo</p>
                    </CardBody>
                  </Card>
                </Link>

                <Link href="/design-system" className="group">
                  <Card className="h-full transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    <CardBody className="text-center p-4">
                      <div className="text-3xl mb-2">🎨</div>
                      <h4 className="font-semibold text-sm text-neutral-800 group-hover:text-primary-600">
                        Design System
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">
                        Components
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              </div>

              {/* More Features */}
              <div className="mt-8">
                <h4 className="text-sm font-medium text-neutral-600 mb-4">
                  🛠️ Development & Testing
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Link href="/file-upload-demo" className="group">
                    <div className="text-center p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
                      <div className="text-lg mb-1">📁</div>
                      <span className="text-xs font-medium text-neutral-700 group-hover:text-primary-600">
                        File Upload
                      </span>
                    </div>
                  </Link>

                  <Link href="/image-editor-demo" className="group">
                    <div className="text-center p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
                      <div className="text-lg mb-1">🖼️</div>
                      <span className="text-xs font-medium text-neutral-700 group-hover:text-primary-600">
                        Image Editor
                      </span>
                    </div>
                  </Link>

                  <Link href="/touch-demo" className="group">
                    <div className="text-center p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
                      <div className="text-lg mb-1">👆</div>
                      <span className="text-xs font-medium text-neutral-700 group-hover:text-primary-600">
                        Touch Demo
                      </span>
                    </div>
                  </Link>

                  <Link href="/test" className="group">
                    <div className="text-center p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
                      <div className="text-lg mb-1">🧪</div>
                      <span className="text-xs font-medium text-neutral-700 group-hover:text-primary-600">
                        Testing
                      </span>
                    </div>
                  </Link>

                  <Link href="/routes" className="group">
                    <div className="text-center p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all">
                      <div className="text-lg mb-1">🗺️</div>
                      <span className="text-xs font-medium text-neutral-700 group-hover:text-primary-600">
                        Route Status
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
              Why Choose SyncCoreAI?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="elevated" size="lg" className="text-center">
                <CardBody>
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    Real-time Collaboration
                  </h3>
                  <p className="text-neutral-600">
                    Work together seamlessly with your team. See changes
                    instantly, leave comments, and maintain perfect sync across
                    all devices.
                  </p>
                </CardBody>
              </Card>

              <Card variant="elevated" size="lg" className="text-center">
                <CardBody>
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    AI-Powered Suggestions
                  </h3>
                  <p className="text-neutral-600">
                    Get intelligent writing suggestions, grammar corrections,
                    and content improvements powered by advanced AI technology.
                  </p>
                </CardBody>
              </Card>

              <Card variant="elevated" size="lg" className="text-center">
                <CardBody>
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    Smart Conflict Resolution
                  </h3>
                  <p className="text-neutral-600">
                    Never lose your work again. Our CRDT technology
                    automatically resolves conflicts and maintains document
                    integrity.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary-600">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using SyncCoreAI to create better
              documents faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  variant="solid"
                  colorScheme="neutral"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-neutral-50"
                >
                  Start Your Free Trial
                </Button>
              </Link>
              <Button
                variant="outline"
                colorScheme="neutral"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-neutral-900 text-neutral-300 py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-xl font-bold text-white mb-4">
                  SyncCoreAI
                </h4>
                <p className="text-neutral-400">
                  The future of collaborative document editing, powered by AI.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Product</h5>
                <ul className="space-y-2">
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Features
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Pricing
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Security
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      API
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Company</h5>
                <ul className="space-y-2">
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      About
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Blog
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Careers
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Contact
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Support</h5>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href={{ pathname: '/help' }}
                      className="hover:text-white transition-colors"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Documentation
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Community
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Status
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="border-t border-neutral-800 mt-8 pt-8 text-center"
              data-tour="responsive-info"
            >
              <p className="text-neutral-400">
                © 2024 SyncCoreAI. All rights reserved.
              </p>

              {/* Tour restart button */}
              {tour.isCompleted && (
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={tour.resetTour}
                    className="text-neutral-500 hover:text-white"
                  >
                    🎯 重新開始導覽
                  </Button>
                </div>
              )}
            </div>
          </div>
        </footer>

        {/* Product Tour */}
        <ProductTour
          steps={homepageTourSteps}
          isActive={tour.isActive}
          onStart={tour.startTour}
          onComplete={tour.completeTour}
          onSkip={tour.skipTour}
          showProgress={true}
          theme="light"
        />
      </div>
    </HomeLayout>
  )
}
