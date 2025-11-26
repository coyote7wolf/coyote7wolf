'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { store } from '../store'

/**
 * Redux Provider wrapper component
 *
 * This component wraps the entire application with the Redux Provider,
 * making the store available to all components in the component tree.
 */
interface ReduxProviderProps {
  children: React.ReactNode
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>
}

export default ReduxProvider
