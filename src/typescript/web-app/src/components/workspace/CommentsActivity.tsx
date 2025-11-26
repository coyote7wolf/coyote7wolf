/**
 * Comments and Activity Feed System
 * Real-time commenting and activity tracking for collaborative documents
 */

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'

// Types
interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt?: string
  replies: Comment[]
  mentions: string[]
  reactions: Reaction[]
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  position?: {
    line: number
    column: number
    selection?: string
  }
  status: 'active' | 'archived' | 'deleted'
}

interface Reaction {
  id: string
  emoji: string
  userId: string
  userName: string
}

interface ActivityEvent {
  id: string
  type:
    | 'comment'
    | 'edit'
    | 'create'
    | 'delete'
    | 'share'
    | 'permission'
    | 'collaboration'
  user: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  description: string
  metadata?: Record<string, any>
  resourceId: string
  resourceType: 'document' | 'workspace' | 'folder'
}

interface CommentsActivityProps {
  documentId: string
  documentName: string
  comments: Comment[]
  activities: ActivityEvent[]
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
  onAddComment: (content: string, position?: Comment['position']) => void
  onReplyComment: (parentId: string, content: string) => void
  onUpdateComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
  onResolveComment: (commentId: string) => void
  onUnresolveComment: (commentId: string) => void
  onAddReaction: (commentId: string, emoji: string) => void
  onRemoveReaction: (commentId: string, reactionId: string) => void
  onMentionUser: (userId: string) => void
}

const EMOJI_REACTIONS = ['👍', '👎', '❤️', '😄', '😮', '😢', '🚀', '👀']

export function CommentsActivity({
  documentId,
  documentName,
  comments,
  activities,
  currentUser,
  onAddComment,
  onReplyComment,
  onUpdateComment,
  onDeleteComment,
  onResolveComment,
  onUnresolveComment,
  onAddReaction,
  onRemoveReaction,
  onMentionUser,
}: CommentsActivityProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>(
    'comments'
  )
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showResolved, setShowResolved] = useState(false)
  const [filterActivity, setFilterActivity] = useState<
    ActivityEvent['type'] | 'all'
  >('all')

  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  // Filter comments based on resolved status
  const filteredComments = comments.filter(comment =>
    showResolved ? true : !comment.resolved
  )

  // Filter activities based on type
  const filteredActivities = activities.filter(activity =>
    filterActivity === 'all' ? true : activity.type === filterActivity
  )

  // Auto-focus on reply input
  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus()
    }
  }, [replyingTo])

  // Handle add comment
  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return

    onAddComment(newComment.trim())
    setNewComment('')

    // Auto-focus back to input
    setTimeout(() => {
      commentInputRef.current?.focus()
    }, 100)
  }, [newComment, onAddComment])

  // Handle reply
  const handleReply = useCallback(() => {
    if (!replyContent.trim() || !replyingTo) return

    onReplyComment(replyingTo, replyContent.trim())
    setReplyContent('')
    setReplyingTo(null)
  }, [replyContent, replyingTo, onReplyComment])

  // Handle edit
  const handleEdit = useCallback(() => {
    if (!editContent.trim() || !editingComment) return

    onUpdateComment(editingComment, editContent.trim())
    setEditContent('')
    setEditingComment(null)
  }, [editContent, editingComment, onUpdateComment])

  // Start editing
  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Get activity icon
  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'comment':
        return '💬'
      case 'edit':
        return '✏️'
      case 'create':
        return '📄'
      case 'delete':
        return '🗑️'
      case 'share':
        return '🔗'
      case 'permission':
        return '🔐'
      case 'collaboration':
        return '👥'
      default:
        return '📝'
    }
  }

  // Render comment
  const renderComment = (
    comment: Comment,
    isReply = false,
    parentId?: string
  ) => (
    <div
      key={comment.id}
      className={`p-4 border rounded-lg ${
        comment.resolved
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-300'
      } ${isReply ? 'ml-6 mt-2' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          src={comment.author.avatar || ''}
          alt={comment.author.name}
          className="w-8 h-8"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(comment.createdAt)}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <Badge variant="outline" className="text-xs">
                edited
              </Badge>
            )}
            {comment.resolved && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                resolved
              </Badge>
            )}
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Edit your comment..."
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingComment(null)
                    setEditContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {comment.content}
              </div>

              {comment.position && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <span className="font-medium">Context:</span> Line{' '}
                  {comment.position.line}
                  {comment.position.selection && (
                    <div className="mt-1 italic">
                      "{comment.position.selection}"
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {Object.entries(
                comment.reactions.reduce(
                  (acc, reaction) => {
                    if (!acc[reaction.emoji]) acc[reaction.emoji] = []
                    acc[reaction.emoji]!.push(reaction)
                    return acc
                  },
                  {} as Record<string, Reaction[]>
                )
              ).map(([emoji, reactions]) => (
                <button
                  key={emoji}
                  onClick={() => {
                    const userReaction = reactions.find(
                      r => r.userId === currentUser.id
                    )
                    if (userReaction) {
                      onRemoveReaction(comment.id, userReaction.id)
                    } else {
                      onAddReaction(comment.id, emoji)
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded-full border ${
                    reactions.some(r => r.userId === currentUser.id)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {emoji} {reactions.length}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="hover:text-blue-600"
            >
              Reply
            </button>

            {/* Emoji reactions */}
            <div className="flex space-x-1">
              {EMOJI_REACTIONS.slice(0, 4).map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onAddReaction(comment.id, emoji)}
                  className="hover:scale-125 transition-transform"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {comment.author.id === currentUser.id && (
              <>
                <button
                  onClick={() => startEditing(comment)}
                  className="hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="hover:text-red-600"
                >
                  Delete
                </button>
              </>
            )}

            {!comment.resolved ? (
              <button
                onClick={() => onResolveComment(comment.id)}
                className="hover:text-green-600"
              >
                Resolve
              </button>
            ) : (
              <button
                onClick={() => onUnresolveComment(comment.id)}
                className="hover:text-orange-600"
              >
                Unresolve
              </button>
            )}
          </div>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <textarea
                ref={replyInputRef}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Write a reply..."
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleReply}>
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-2">
          {comment.replies.map(reply => renderComment(reply, true, comment.id))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Comments & Activity
          </h2>
          <p className="text-gray-600">Collaborate on {documentName}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {(['comments', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab} {tab === 'comments' && `(${filteredComments.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-6">
          {/* Add Comment */}
          <Card>
            <CardBody>
              <div className="space-y-3">
                <textarea
                  ref={commentInputRef}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add a comment..."
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showResolved}
                        onChange={e => setShowResolved(e.target.checked)}
                        className="rounded"
                      />
                      <span>Show resolved comments</span>
                    </label>
                  </div>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {filteredComments.length === 0 ? (
              <Card>
                <CardBody>
                  <p className="text-gray-500 text-center py-8">
                    {showResolved
                      ? 'No comments yet'
                      : 'No unresolved comments'}
                  </p>
                </CardBody>
              </Card>
            ) : (
              filteredComments.map(comment => renderComment(comment))
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Activity Filter */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Filter by:</label>
            <select
              value={filterActivity}
              onChange={e =>
                setFilterActivity(
                  e.target.value as ActivityEvent['type'] | 'all'
                )
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              aria-label="Filter activities"
            >
              <option value="all">All Activities</option>
              <option value="comment">Comments</option>
              <option value="edit">Edits</option>
              <option value="create">Created</option>
              <option value="delete">Deleted</option>
              <option value="share">Shared</option>
              <option value="permission">Permissions</option>
              <option value="collaboration">Collaboration</option>
            </select>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <Card>
                <CardBody>
                  <p className="text-gray-500 text-center py-8">
                    No activity to show
                  </p>
                </CardBody>
              </Card>
            ) : (
              filteredActivities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="text-lg">
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar
                        src={activity.user.avatar || ''}
                        alt={activity.user.name}
                        className="w-6 h-6"
                      />
                      <span className="font-medium text-sm">
                        {activity.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700">
                      {activity.description}
                    </p>

                    {activity.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(activity.metadata).map(
                          ([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{' '}
                              {String(value)}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CommentsActivity
