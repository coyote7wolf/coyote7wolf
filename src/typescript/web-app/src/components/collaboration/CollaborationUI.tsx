/**
 * Collaborative UI Components
 * Real-time collaboration indicators and visual elements
 */

/* eslint-disable react/forbid-dom-props, @typescript-eslint/no-explicit-any */
import React from 'react'
import { Badge } from '@/components/ui/Badge'
import type { Participant, CursorPosition } from '@/services/collaboration'

// User presence indicator colors
const PRESENCE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FECA57',
  '#FF9FF3',
  '#54A0FF',
  '#5F27CD',
  '#00D2D3',
  '#FF9F43',
  '#10AC84',
  '#EE5A24',
  '#0984E3',
  '#A29BFE',
  '#FD79A8',
] as const

const getColorForUser = (userId: string): string => {
  const hash = userId.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  const index = Math.abs(hash) % PRESENCE_COLORS.length
  return PRESENCE_COLORS[index] as string
}

export interface UserPresenceProps {
  participants: Participant[]
  maxVisible?: number
  showStatus?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function UserPresence({
  participants,
  maxVisible = 5,
  showStatus = true,
  size = 'md',
}: UserPresenceProps) {
  const visibleParticipants = participants.slice(0, maxVisible)
  const hiddenCount = participants.length - maxVisible

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'away':
        return 'bg-gray-400'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {visibleParticipants.map(participant => (
        <div key={participant.id} className="relative group">
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium`}
            style={{ backgroundColor: getColorForUser(participant.id) }}
            title={`${participant.name} (${participant.status || 'active'})`}
          >
            {participant.name.slice(0, 2).toUpperCase()}
          </div>
          {showStatus && (
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(participant.status)}`}
            />
          )}

          {/* Hover tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {participant.name} ({participant.status || 'active'})
            {participant.activity && (
              <div className="text-gray-300">{participant.activity}</div>
            )}
          </div>
        </div>
      ))}

      {hiddenCount > 0 && (
        <div
          className={`${sizeClasses[size]} bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-600 group relative`}
          title={participants
            .slice(maxVisible)
            .map(p => p.name)
            .join(', ')}
        >
          +{hiddenCount}
          {/* Hover tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {participants
              .slice(maxVisible)
              .map(p => p.name)
              .join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}

export interface TypingIndicatorProps {
  typingUsers: string[]
  participants: Participant[]
}

export function TypingIndicator({
  typingUsers,
  participants,
}: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const typingParticipants = participants.filter(p =>
    typingUsers.includes(p.id)
  )

  const getTypingText = () => {
    if (typingParticipants.length === 0) return ''

    if (typingParticipants.length === 1) {
      return `${typingParticipants[0]?.name || 'Someone'} is typing...`
    } else if (typingParticipants.length === 2) {
      return `${typingParticipants[0]?.name || 'Someone'} and ${typingParticipants[1]?.name || 'someone else'} are typing...`
    } else {
      return `${typingParticipants[0]?.name || 'Someone'} and ${typingParticipants.length - 1} others are typing...`
    }
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-0" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-150" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-300" />
      </div>
      <span>{getTypingText()}</span>
    </div>
  )
}

export interface CursorOverlayProps {
  cursors: CursorPosition[]
  containerRef: React.RefObject<HTMLElement>
}

export function CursorOverlay({ cursors, containerRef }: CursorOverlayProps) {
  const [cursorPositions, setCursorPositions] = React.useState<
    Array<{
      cursor: CursorPosition
      x: number
      y: number
    }>
  >([])

  React.useEffect(() => {
    if (!containerRef.current) return

    const updatePositions = () => {
      const container = containerRef.current
      if (!container) return

      const positions = cursors.map(cursor => {
        // This is a simplified position calculation
        // In a real editor, you'd calculate based on text position
        const rect = container.getBoundingClientRect()
        const x = rect.left + (cursor.position % 100) * 2 // Simplified
        const y = rect.top + Math.floor(cursor.position / 100) * 20 // Simplified

        return { cursor, x, y }
      })

      setCursorPositions(positions)
    }

    updatePositions()

    // Update positions when cursors change
    const resizeObserver = new ResizeObserver(updatePositions)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [cursors, containerRef])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {cursorPositions.map(({ cursor, x, y }) => {
        const userColor = getColorForUser(cursor.user.id)
        return (
          // eslint-disable-next-line react/forbid-dom-props
          <div
            key={cursor.user.id}
            className="absolute transform -translate-x-0.5"
            style={{ left: x, top: y }}
          >
            {/* Cursor line */}
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div className="w-0.5 h-5" style={{ backgroundColor: userColor }} />

            {/* User label */}
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div
              className="absolute top-0 left-1 px-2 py-1 text-xs text-white rounded whitespace-nowrap transform -translate-y-full"
              style={{ backgroundColor: userColor }}
            >
              {cursor.user.name}
            </div>

            {/* Selection highlight */}
            {cursor.selection && (
              // eslint-disable-next-line react/forbid-dom-props
              <div
                className="absolute top-0 opacity-30 h-5"
                style={{
                  backgroundColor: userColor,
                  left: 0,
                  width: (cursor.selection[1] - cursor.selection[0]) * 8, // Simplified width calculation
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export interface CollaborationStatusProps {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  participantCount: number
}

export function CollaborationStatus({
  isConnected,
  isConnecting,
  error,
  participantCount,
}: CollaborationStatusProps) {
  const getStatusColor = () => {
    if (error) return 'bg-red-500'
    if (isConnecting) return 'bg-yellow-500'
    if (isConnected) return 'bg-green-500'
    return 'bg-gray-400'
  }

  const getStatusText = () => {
    if (error) return `Connection error: ${error}`
    if (isConnecting) return 'Connecting...'
    if (isConnected) return `Connected (${participantCount} participants)`
    return 'Disconnected'
  }

  return (
    <div className="group relative">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        {isConnecting && (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {getStatusText()}
      </div>
    </div>
  )
}

export interface CollaborationToolbarProps {
  participants: Participant[]
  typingUsers: string[]
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  onReconnect?: () => void
}

export function CollaborationToolbar({
  participants,
  typingUsers,
  isConnected,
  isConnecting,
  error,
  onReconnect,
}: CollaborationToolbarProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <CollaborationStatus
          isConnected={isConnected}
          isConnecting={isConnecting}
          error={error}
          participantCount={participants.length}
        />

        <UserPresence participants={participants} />

        {error && onReconnect && (
          <button
            onClick={onReconnect}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reconnect
          </button>
        )}
      </div>

      <div className="flex-1 flex justify-center">
        <TypingIndicator
          typingUsers={typingUsers}
          participants={participants}
        />
      </div>

      <div className="flex items-center space-x-2">
        {isConnected && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Live
          </Badge>
        )}
      </div>
    </div>
  )
}
