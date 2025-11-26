import React from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    // Return a simple console-based implementation if context is not available
    return {
      toast: ({ title, description, variant }: Omit<Toast, 'id'>) => {
        const message = `${title || 'Notification'}${description ? `: ${description}` : ''}`
        if (variant === 'destructive') {
          console.error(message)
        } else if (variant === 'warning') {
          console.warn(message)
        } else {
          console.log(message)
        }
      },
      dismiss: () => {},
      toasts: [],
    }
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toastData,
    }

    setToasts(prev => [...prev, newToast])

    // Auto dismiss after duration
    setTimeout(() => {
      dismiss(id)
    }, newToast.duration)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}