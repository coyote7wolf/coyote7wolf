import { Button, Input, Label, Card, CardBody } from '@/components'
import { HomeLayout } from '@/components/layout/HomeLayout'

/**
 * Design System Showcase Page
 *
 * This page demonstrates the UI components built with Design Token integration.
 * Perfect for testing component variations and Design System migration.
 */
export default function DesignSystemPage() {
  return (
    <HomeLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            SyncCoreAI Design System
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Professional UI components built with Design Token integration for
            easy Design System migration. All components are accessible,
            type-safe, and production-ready.
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic Button Examples */}
          <Card>
            <CardBody>
              <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Basic Buttons</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button>Default Button</Button>
                    <Button disabled>Disabled</Button>
                    <Button loading>Loading...</Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Form Controls */}
          <Card>
            <CardBody>
              <h2 className="text-2xl font-semibold mb-6">Form Controls</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="email" required>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <Label>With Error</Label>
                  <Input
                    placeholder="This field has an error"
                    errorMessage="This field is required"
                  />
                </div>

                <div>
                  <Label>With Helper Text</Label>
                  <Input
                    placeholder="Enter your username"
                    helperText="Username must be 3-20 characters long"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Design System Info */}
          <Card>
            <CardBody>
              <h2 className="text-2xl font-semibold text-primary-700 mb-4">
                🎨 Design System Migration Ready
              </h2>
              <div className="space-y-4">
                <p className="text-neutral-700">
                  All components are built with{' '}
                  <strong>Design Token integration</strong> and follow industry
                  best practices for easy migration to external Design Systems.
                </p>

                <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                  <h4 className="font-medium text-primary-800 mb-2">
                    Migration Benefits:
                  </h4>
                  <ul className="text-sm text-primary-700 space-y-1">
                    <li>• Consistent Design Token system</li>
                    <li>• Type-safe component props</li>
                    <li>• Variant-based styling with CVA</li>
                    <li>• Accessible components with ARIA support</li>
                    <li>• Easy theme customization</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </HomeLayout>
  )
}
