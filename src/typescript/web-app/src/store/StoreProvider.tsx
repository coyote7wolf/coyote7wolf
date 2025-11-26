'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { store } from './index'

/**
 * Redux Provider 組件
 * 為整個應用提供 Redux store
 */
interface StoreProviderProps {
  children: React.ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
