/**
 * Client Layout with Sidebar
 * 
 * This layout is used for authenticated pages that need the sidebar
 */

'use client'

import React from 'react'
import MainLayout from '@/components/layout/MainLayout'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return <MainLayout>{children}</MainLayout>
}

export default ClientLayout