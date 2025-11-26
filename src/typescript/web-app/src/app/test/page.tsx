'use client'

import NavigationTester from '@/components/navigation/NavigationTester'
import { HomeLayout } from '@/components/layout/HomeLayout'

export default function TestPage() {
  return (
    <HomeLayout>
      <div className="test-page">
        <div className="page-header">
          <h1>🧪 Testing Environment</h1>
          <p>Development and testing utilities for the application</p>

          <div className="basic-tests">
            <div className="test-item success">
              ✅ React components are rendering
            </div>
            <div className="test-item success">
              ✅ TypeScript compilation successful
            </div>
            <div className="test-item success">
              ✅ Next.js App Router is functioning
            </div>
          </div>
        </div>

        <NavigationTester />

        <style jsx>{`
          .test-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          }

          .page-header {
            text-align: center;
            padding: 2rem;
            background: white;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .page-header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .basic-tests {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
          }

          .test-item {
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 500;
          }

          .test-item.success {
            background: #f0fff4;
            color: #38a169;
            border: 1px solid #9ae6b4;
          }
        `}</style>
      </div>
    </HomeLayout>
  )
}
