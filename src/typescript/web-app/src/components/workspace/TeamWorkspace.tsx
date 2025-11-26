/**
 * Team Workspace Management
 * Manage team workspaces, members, and collaboration settings
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'

// Types
interface WorkspaceMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: string
  lastActive: string
}

interface Workspace {
  id: string
  name: string
  description: string
  avatar?: string
  members: WorkspaceMember[]
  settings: WorkspaceSettings
  createdAt: string
  updatedAt: string
}

interface WorkspaceSettings {
  visibility: 'private' | 'public' | 'organization'
  allowInvites: boolean
  requireApproval: boolean
  defaultRole: 'editor' | 'viewer'
  allowGuestAccess: boolean
  retention: number // days
}

interface TeamWorkspaceProps {
  workspaces: Workspace[]
  currentWorkspace?: Workspace
  currentUser: WorkspaceMember
  onCreateWorkspace: (workspace: Partial<Workspace>) => void
  onUpdateWorkspace: (id: string, updates: Partial<Workspace>) => void
  onDeleteWorkspace: (id: string) => void
  onInviteMember: (
    workspaceId: string,
    email: string,
    role: WorkspaceMember['role']
  ) => void
  onUpdateMemberRole: (
    workspaceId: string,
    memberId: string,
    role: WorkspaceMember['role']
  ) => void
  onRemoveMember: (workspaceId: string, memberId: string) => void
  onSwitchWorkspace: (workspaceId: string) => void
}

export function TeamWorkspace({
  workspaces,
  currentWorkspace,
  currentUser,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  onSwitchWorkspace,
}: TeamWorkspaceProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  )

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    visibility: 'private' as WorkspaceSettings['visibility'],
  })

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'editor' as WorkspaceMember['role'],
  })

  // Create workspace
  const handleCreateWorkspace = useCallback(() => {
    if (!createForm.name) return

    const newWorkspace: Partial<Workspace> = {
      name: createForm.name,
      description: createForm.description,
      settings: {
        visibility: createForm.visibility,
        allowInvites: true,
        requireApproval: false,
        defaultRole: 'editor',
        allowGuestAccess: false,
        retention: 365,
      },
    }

    onCreateWorkspace(newWorkspace)
    setCreateForm({ name: '', description: '', visibility: 'private' })
    setShowCreateModal(false)
  }, [createForm, onCreateWorkspace])

  // Invite member
  const handleInviteMember = useCallback(() => {
    if (!inviteForm.email || !currentWorkspace) return

    onInviteMember(currentWorkspace.id, inviteForm.email, inviteForm.role)
    setInviteForm({ email: '', role: 'editor' })
    setShowInviteModal(false)
  }, [inviteForm, currentWorkspace, onInviteMember])

  // Update workspace settings
  const handleUpdateSettings = useCallback(
    (updates: Partial<WorkspaceSettings>) => {
      if (!selectedWorkspace) return

      const updatedSettings = { ...selectedWorkspace.settings, ...updates }
      onUpdateWorkspace(selectedWorkspace.id, { settings: updatedSettings })
      setSelectedWorkspace({ ...selectedWorkspace, settings: updatedSettings })
    },
    [selectedWorkspace, onUpdateWorkspace]
  )

  const getRoleColor = (role: WorkspaceMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: WorkspaceMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canManageWorkspace = (workspace: Workspace) => {
    const userMember = workspace.members.find(m => m.id === currentUser.id)
    return userMember && ['owner', 'admin'].includes(userMember.role)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Workspaces</h1>
          <p className="text-gray-600">Manage your team collaboration spaces</p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          Create Workspace
        </Button>
      </div>

      {/* Workspace Selector */}
      {workspaces.length > 1 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Switch Workspace</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map(workspace => (
                <div
                  key={workspace.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    currentWorkspace?.id === workspace.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onSwitchWorkspace(workspace.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {workspace.avatar ? (
                        <img
                          src={workspace.avatar}
                          alt={workspace.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{workspace.name}</h4>
                      <p className="text-sm text-gray-500">
                        {workspace.members.length} members
                      </p>
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <Badge variant="solid" className="bg-blue-500 text-white">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Current Workspace Details */}
      {currentWorkspace && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workspace Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Workspace Details</h3>
              {canManageWorkspace(currentWorkspace) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedWorkspace(currentWorkspace)
                    setShowSettingsModal(true)
                  }}
                >
                  Settings
                </Button>
              )}
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm text-gray-600">{currentWorkspace.name}</p>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600">
                  {currentWorkspace.description || 'No description provided'}
                </p>
              </div>

              <div>
                <Label>Visibility</Label>
                <Badge variant="outline">
                  {currentWorkspace.settings.visibility}
                </Badge>
              </div>

              <div>
                <Label>Created</Label>
                <p className="text-sm text-gray-600">
                  {new Date(currentWorkspace.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Workspace Stats</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentWorkspace.members.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      currentWorkspace.members.filter(
                        m => m.status === 'active'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {
                      currentWorkspace.members.filter(m =>
                        ['owner', 'admin'].includes(m.role)
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Admins</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      currentWorkspace.members.filter(
                        m => m.status === 'pending'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Members Management */}
      {currentWorkspace && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold">
              Members ({currentWorkspace.members.length})
            </h3>
            {canManageWorkspace(currentWorkspace) && (
              <Button size="sm" onClick={() => setShowInviteModal(true)}>
                Invite Member
              </Button>
            )}
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {currentWorkspace.members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <p className="text-xs text-gray-400">
                        Last active:{' '}
                        {new Date(member.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>

                    {canManageWorkspace(currentWorkspace) &&
                      member.id !== currentUser.id && (
                        <div className="flex space-x-1">
                          <select
                            value={member.role}
                            onChange={e =>
                              onUpdateMemberRole(
                                currentWorkspace.id,
                                member.id,
                                e.target.value as WorkspaceMember['role']
                              )
                            }
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            aria-label={`Change role for ${member.name}`}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                            {member.role === 'owner' && (
                              <option value="owner">Owner</option>
                            )}
                          </select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onRemoveMember(currentWorkspace.id, member.id)
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Create New Workspace
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={createForm.name}
                    onChange={e =>
                      setCreateForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter workspace name"
                  />
                </div>

                <div>
                  <Label htmlFor="workspace-description">
                    Description (Optional)
                  </Label>
                  <textarea
                    id="workspace-description"
                    value={createForm.description}
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe your workspace"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="workspace-visibility">Visibility</Label>
                  <select
                    id="workspace-visibility"
                    value={createForm.visibility}
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        visibility: e.target
                          .value as WorkspaceSettings['visibility'],
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Workspace visibility"
                  >
                    <option value="private">Private</option>
                    <option value="organization">Organization</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={!createForm.name}
                >
                  Create Workspace
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteForm.email}
                    onChange={e =>
                      setInviteForm(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="colleague@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    value={inviteForm.role}
                    onChange={e =>
                      setInviteForm(prev => ({
                        ...prev,
                        role: e.target.value as WorkspaceMember['role'],
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Member role"
                  >
                    <option value="viewer">Viewer - Can view documents</option>
                    <option value="editor">Editor - Can edit documents</option>
                    <option value="admin">Admin - Can manage workspace</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteMember}
                  disabled={!inviteForm.email}
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Settings Modal */}
      {showSettingsModal && selectedWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Workspace Settings</h3>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="default-role">
                    Default Role for New Members
                  </Label>
                  <select
                    id="default-role"
                    value={selectedWorkspace.settings.defaultRole}
                    onChange={e =>
                      handleUpdateSettings({
                        defaultRole: e.target.value as 'editor' | 'viewer',
                      })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Default role for new members"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-invites">
                        Allow member invitations
                      </Label>
                      <p className="text-sm text-gray-500">
                        Members can invite others to join
                      </p>
                    </div>
                    <input
                      id="allow-invites"
                      type="checkbox"
                      checked={selectedWorkspace.settings.allowInvites}
                      onChange={e =>
                        handleUpdateSettings({ allowInvites: e.target.checked })
                      }
                      className="rounded"
                      aria-describedby="allow-invites-desc"
                      aria-label="Allow member invitations"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-approval">
                        Require approval for new members
                      </Label>
                      <p className="text-sm text-gray-500">
                        Admin approval needed for invitations
                      </p>
                    </div>
                    <input
                      id="require-approval"
                      type="checkbox"
                      checked={selectedWorkspace.settings.requireApproval}
                      onChange={e =>
                        handleUpdateSettings({
                          requireApproval: e.target.checked,
                        })
                      }
                      className="rounded"
                      aria-describedby="require-approval-desc"
                      aria-label="Require approval for new members"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-guest">Allow guest access</Label>
                      <p className="text-sm text-gray-500">
                        External users can view public documents
                      </p>
                    </div>
                    <input
                      id="allow-guest"
                      type="checkbox"
                      checked={selectedWorkspace.settings.allowGuestAccess}
                      onChange={e =>
                        handleUpdateSettings({
                          allowGuestAccess: e.target.checked,
                        })
                      }
                      className="rounded"
                      aria-describedby="allow-guest-desc"
                      aria-label="Allow guest access"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowSettingsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamWorkspace
