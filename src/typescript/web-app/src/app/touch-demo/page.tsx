/**
 * Touch Optimization Demo Page
 *
 * Demonstrates all touch-optimized components and features
 */

'use client'

import React, { useState } from 'react'
import { HomeLayout } from '@/components/layout/HomeLayout'
import {
  TouchButton,
  SwipeableCard,
  PinchableImage,
  TouchNav,
  DoubleTapLike,
  TouchDeviceInfo,
  TouchForm,
} from '@/components/touch/TouchComponents'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'

export default function TouchDemoPage() {
  const [likedItems, setLikedItems] = useState<number[]>([])
  const [currentNavItem, setCurrentNavItem] = useState('home')
  const [swipeResults, setSwipeResults] = useState<string[]>([])

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  const demoImages = [
    'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Pinch+to+Zoom+1',
    'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Pinch+to+Zoom+2',
    'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Pinch+to+Zoom+3',
  ]

  const handleLike = (index: number, liked: boolean) => {
    setLikedItems(prev =>
      liked ? [...prev, index] : prev.filter(i => i !== index)
    )
  }

  const handleSwipe = (direction: 'left' | 'right', index: number) => {
    const action = direction === 'left' ? 'archived' : 'deleted'
    setSwipeResults(prev => [...prev, `Card ${index + 1} ${action}`])
  }

  const handleFormSubmit = (data: any) => {
    alert(`Form submitted:\n${JSON.stringify(data, null, 2)}`)
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Touch Optimization Demo
            </h1>
            <p className="text-gray-600 mt-2">
              Interactive examples of touch-optimized components
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Touch Device Info */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Device Information</h2>
            <TouchDeviceInfo />
          </section>

          {/* Touch Buttons */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Touch Buttons</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Primary Actions</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <TouchButton variant="primary" size="sm">
                    Small Button
                  </TouchButton>
                  <TouchButton variant="primary" size="md">
                    Medium Button
                  </TouchButton>
                  <TouchButton variant="primary" size="lg">
                    Large Button
                  </TouchButton>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Secondary Actions</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <TouchButton variant="secondary" size="md">
                    Cancel
                  </TouchButton>
                  <TouchButton variant="danger" size="md">
                    Delete
                  </TouchButton>
                  <TouchButton variant="primary" size="md" disabled>
                    Disabled
                  </TouchButton>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Haptic Feedback</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <TouchButton
                    variant="primary"
                    size="md"
                    hapticFeedback={true}
                  >
                    With Haptic
                  </TouchButton>
                  <TouchButton
                    variant="secondary"
                    size="md"
                    hapticFeedback={false}
                  >
                    No Haptic
                  </TouchButton>
                </CardBody>
              </Card>
            </div>
          </section>

          {/* Swipeable Cards */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Swipeable Cards</h2>
            <p className="text-gray-600 mb-4">
              Swipe left to archive, swipe right to delete
            </p>

            <div className="space-y-4">
              {[1, 2, 3].map((item, index) => (
                <SwipeableCard
                  key={item}
                  onSwipeLeft={() => handleSwipe('left', index)}
                  onSwipeRight={() => handleSwipe('right', index)}
                  className="bg-white p-6 rounded-lg shadow-sm border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Swipeable Card {item}</h3>
                      <p className="text-gray-600">
                        Try swiping this card left or right
                      </p>
                    </div>
                    <div className="flex space-x-2 text-xl">
                      <span>📁</span>
                      <span>🗑️</span>
                    </div>
                  </div>
                </SwipeableCard>
              ))}
            </div>

            {swipeResults.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Swipe Results:</h4>
                <ul className="text-blue-800 mt-2">
                  {swipeResults.map((result, index) => (
                    <li key={index}>• {result}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Pinchable Images */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Pinch to Zoom Images
            </h2>
            <p className="text-gray-600 mb-4">
              Use two fingers to pinch and zoom on touch devices
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoImages.map((src, index) => (
                <Card key={index}>
                  <CardBody className="p-0">
                    <div className="h-48 relative">
                      <PinchableImage
                        src={src}
                        alt={`Demo image ${index + 1}`}
                        className="w-full h-full"
                      />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>

          {/* Double Tap to Like */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Double Tap to Like</h2>
            <p className="text-gray-600 mb-4">
              Double tap on the cards to like them
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item, index) => (
                <DoubleTapLike
                  key={item}
                  isLiked={likedItems.includes(index)}
                  onToggle={liked => handleLike(index, liked)}
                  className="cursor-pointer"
                >
                  <Card className="transition-all duration-200 hover:shadow-md">
                    <CardBody className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Post {item}</h3>
                          <p className="text-gray-600">
                            Double tap to like this post
                          </p>
                        </div>
                        <span
                          className={`text-2xl ${
                            likedItems.includes(index)
                              ? 'text-red-500'
                              : 'text-gray-400'
                          }`}
                        >
                          {likedItems.includes(index) ? '❤️' : '🤍'}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </DoubleTapLike>
              ))}
            </div>
          </section>

          {/* Touch Navigation */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Touch Navigation</h2>
            <Card>
              <CardBody className="p-6">
                <p className="text-gray-600 mb-4">
                  Current section: <strong>{currentNavItem}</strong>
                </p>
                <TouchNav
                  items={navItems}
                  onItemClick={setCurrentNavItem}
                  className="justify-center"
                />
              </CardBody>
            </Card>
          </section>

          {/* Touch-Optimized Form */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Touch-Optimized Form
            </h2>
            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-lg font-semibold">Contact Form</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Form with touch-optimized inputs and spacing
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <TouchForm onSubmit={handleFormSubmit} />
              </CardBody>
            </Card>
          </section>
        </div>

        {/* Fixed bottom navigation for mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
          <TouchNav
            items={navItems}
            onItemClick={setCurrentNavItem}
            className="px-4 py-2"
          />
        </div>
      </div>
    </HomeLayout>
  )
}
