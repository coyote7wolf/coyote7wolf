import type { Metadata, Viewport } from 'next'
import './globals.css'
import StoreProvider from '@/store/StoreProvider'
import GlobalNavigation from '@/components/navigation/GlobalNavigation'
import FloatingNavigation from '@/components/navigation/FloatingNavigation'
import I18nProvider from './providers/I18nProvider' // <-- 新增

export const metadata: Metadata = {
  title: 'SyncCoreAI - Collaborative Document Editing',
  description:
    'Intelligent collaborative document editing platform with AI assistance',
  keywords: ['collaboration', 'document editing', 'AI', 'real-time'],
  authors: [{ name: 'SyncCoreAI Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .main-content {
              padding-top: 80px;
              min-height: calc(100vh - 80px);
            }

            @media (max-width: 1023px) {
              .main-content {
                padding-top: 0;
                min-height: 100vh;
              }
            }
          `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* 包裹 i18n，但保留你原本 StoreProvider、導航、FloatingNavigation */}
        <I18nProvider>
          <StoreProvider>
            <GlobalNavigation />
            <main className="main-content">{children}</main>
            <FloatingNavigation />
          </StoreProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
