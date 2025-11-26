/**
 * Permission Management System
 * Fine-grained permission control for documents and workspaces
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'

// Types
interface Permission {
  id: string
  resource: 'document' | 'workspace' | 'folder'
  resourceId: string
  resourceName: string
  subject: 'user' | 'group' | 'role'
  subjectId: string
  subjectName: string
  permissions: PermissionAction[]
  granted: boolean
  grantedBy: string
  grantedAt: string
  expiresAt?: string
  inherited: boolean
  inheritedFrom?: string
}

type PermissionAction =
  | 'read'
  | 'write'
  | 'delete'
  | 'share'
  | 'admin'
  | 'comment'
  | 'suggest'
  | 'export'
  | 'print'
  | 'manage_permissions'
  | 'manage_members'

interface PermissionTemplate {
  id: string
  name: string
  description: string
  permissions: PermissionAction[]
}

interface PermissionGroup {
  id: string
  name: string
  description: string
  members: string[]
  permissions: Permission[]
  createdBy: string
  createdAt: string
}

interface PermissionManagerProps {
  resourceType: 'document' | 'workspace' | 'folder'
  resourceId: string
  resourceName: string
  permissions: Permission[]
  groups: PermissionGroup[]
  templates: PermissionTemplate[]
  currentUser: {
    id: string
    name: string
    role: 'owner' | 'admin' | 'editor' | 'viewer'
  }
  onGrantPermission: (
    permission: Omit<Permission, 'id' | 'grantedBy' | 'grantedAt'>
  ) => void
  onRevokePermission: (permissionId: string) => void
  onUpdatePermission: (
    permissionId: string,
    updates: Partial<Permission>
  ) => void
  onCreateGroup: (
    group: Omit<PermissionGroup, 'id' | 'createdBy' | 'createdAt'>
  ) => void
  onUpdateGroup: (groupId: string, updates: Partial<PermissionGroup>) => void
  onDeleteGroup: (groupId: string) => void
}

const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Can view and comment',
    permissions: ['read', 'comment'],
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can view, edit, and comment',
    permissions: ['read', 'write', 'comment', 'suggest'],
  },
  {
    id: 'collaborator',
    name: 'Collaborator',
    description: 'Can view, edit, comment, and share',
    permissions: ['read', 'write', 'comment', 'suggest', 'share', 'export'],
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access including permission management',
    permissions: [
      'read',
      'write',
      'delete',
      'share',
      'admin',
      'comment',
      'suggest',
      'export',
      'print',
      'manage_permissions',
    ],
  },
]

export function PermissionManager({
  resourceType,
  resourceId,
  resourceName,
  permissions,
  groups,
  templates = PERMISSION_TEMPLATES,
  currentUser,
  onGrantPermission,
  onRevokePermission,
  onUpdatePermission,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
}: PermissionManagerProps) {
  const [activeTab, setActiveTab] = useState<
    'permissions' | 'groups' | 'templates'
  >('permissions')
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<PermissionGroup | null>(
    null
  )

  // Form states
  const [grantForm, setGrantForm] = useState({
    subject: 'user' as 'user' | 'group' | 'role',
    subjectId: '',
    subjectName: '',
    template: 'viewer',
    customPermissions: [] as PermissionAction[],
    expiresAt: '',
  })

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    members: [] as string[],
  })

  // Permission helpers
  const getPermissionColor = (action: PermissionAction) => {
    const colors = {
      read: 'bg-blue-100 text-blue-800',
      write: 'bg-green-100 text-green-800',
      delete: 'bg-red-100 text-red-800',
      share: 'bg-purple-100 text-purple-800',
      admin: 'bg-orange-100 text-orange-800',
      comment: 'bg-gray-100 text-gray-800',
      suggest: 'bg-yellow-100 text-yellow-800',
      export: 'bg-indigo-100 text-indigo-800',
      print: 'bg-pink-100 text-pink-800',
      manage_permissions: 'bg-red-100 text-red-800',
      manage_members: 'bg-purple-100 text-purple-800',
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const canManagePermissions = () => {
    return (
      currentUser.role === 'owner' ||
      currentUser.role === 'admin' ||
      permissions.some(
        p =>
          p.subjectId === currentUser.id &&
          p.permissions.includes('manage_permissions')
      )
    )
  }

  // Grant permission
  const handleGrantPermission = useCallback(() => {
    if (!grantForm.subjectId || !grantForm.subjectName) return

    const template = templates.find(t => t.id === grantForm.template)
    const permissionActions = template
      ? template.permissions
      : grantForm.customPermissions

    const newPermission: Omit<Permission, 'id' | 'grantedBy' | 'grantedAt'> = {
      resource: resourceType,
      resourceId,
      resourceName,
      subject: grantForm.subject,
      subjectId: grantForm.subjectId,
      subjectName: grantForm.subjectName,
      permissions: permissionActions,
      granted: true,
      ...(grantForm.expiresAt && { expiresAt: grantForm.expiresAt }),
      inherited: false,
    }

    onGrantPermission(newPermission)
    setGrantForm({
      subject: 'user',
      subjectId: '',
      subjectName: '',
      template: 'viewer',
      customPermissions: [],
      expiresAt: '',
    })
    setShowGrantModal(false)
  }, [
    grantForm,
    resourceType,
    resourceId,
    resourceName,
    templates,
    onGrantPermission,
  ])

  // Create group
  const handleCreateGroup = useCallback(() => {
    if (!groupForm.name) return

    const newGroup: Omit<PermissionGroup, 'id' | 'createdBy' | 'createdAt'> = {
      name: groupForm.name,
      description: groupForm.description,
      members: groupForm.members,
      permissions: [],
    }

    onCreateGroup(newGroup)
    setGroupForm({ name: '', description: '', members: [] })
    setShowGroupModal(false)
  }, [groupForm, onCreateGroup])

  // Toggle custom permission
  const toggleCustomPermission = (action: PermissionAction) => {
    setGrantForm(prev => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(action)
        ? prev.customPermissions.filter(p => p !== action)
        : [...prev.customPermissions, action],
    }))
  }

  const directPermissions = permissions.filter(p => !p.inherited)
  const inheritedPermissions = permissions.filter(p => p.inherited)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Permissions for {resourceName}
          </h2>
          <p className="text-gray-600">
            Manage access control for this {resourceType}
          </p>
        </div>

        {canManagePermissions() && (
          <Button onClick={() => setShowGrantModal(true)}>
            Grant Permission
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {(['permissions', 'groups', 'templates'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Direct Permissions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Direct Permissions ({directPermissions.length})
              </h3>
            </CardHeader>
            <CardBody>
              {directPermissions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No direct permissions set
                </p>
              ) : (
                <div className="space-y-4">
                  {directPermissions.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">
                              {permission.subjectName}
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">
                              {permission.subject} • Granted by{' '}
                              {permission.grantedBy}
                            </p>
                            {permission.expiresAt && (
                              <p className="text-xs text-red-500">
                                Expires:{' '}
                                {new Date(
                                  permission.expiresAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {permission.permissions.map(action => (
                            <Badge
                              key={action}
                              className={getPermissionColor(action)}
                            >
                              {action.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {canManagePermissions() && (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              /* Edit permission */
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRevokePermission(permission.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Revoke
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Inherited Permissions */}
          {inheritedPermissions.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  Inherited Permissions ({inheritedPermissions.length})
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {inheritedPermissions.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">
                              {permission.subjectName}
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">
                              {permission.subject} • Inherited from{' '}
                              {permission.inheritedFrom}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {permission.permissions.map(action => (
                            <Badge
                              key={action}
                              variant="outline"
                              className="opacity-75"
                            >
                              {action.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        Inherited
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Permission Groups</h3>
            {canManagePermissions() && (
              <Button onClick={() => setShowGroupModal(true)}>
                Create Group
              </Button>
            )}
          </div>

          {groups.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-gray-500 text-center py-8">
                  No permission groups created yet
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(group => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className="text-sm text-gray-500">
                          {group.description}
                        </p>
                      </div>
                      {canManagePermissions() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedGroup(group)
                            setShowGroupModal(true)
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      <div>
                        <Label>Members ({group.members.length})</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {group.members.slice(0, 3).map(memberId => (
                            <Badge
                              key={memberId}
                              variant="outline"
                              className="text-xs"
                            >
                              {memberId}
                            </Badge>
                          ))}
                          {group.members.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{group.members.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Permissions ({group.permissions.length})</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {group.permissions.slice(0, 4).map(permission => (
                            <Badge
                              key={permission.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {permission.resourceName}
                            </Badge>
                          ))}
                          {group.permissions.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{group.permissions.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Permission Templates</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-500">
                    {template.description}
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-wrap gap-2">
                    {template.permissions.map(action => (
                      <Badge
                        key={action}
                        className={getPermissionColor(action)}
                      >
                        {action.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Grant Permission Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Grant Permission</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject-type">Subject Type</Label>
                    <select
                      id="subject-type"
                      value={grantForm.subject}
                      onChange={e =>
                        setGrantForm(prev => ({
                          ...prev,
                          subject: e.target.value as 'user' | 'group' | 'role',
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Subject type"
                    >
                      <option value="user">User</option>
                      <option value="group">Group</option>
                      <option value="role">Role</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="subject-name">Subject Name</Label>
                    <Input
                      id="subject-name"
                      value={grantForm.subjectName}
                      onChange={e =>
                        setGrantForm(prev => ({
                          ...prev,
                          subjectName: e.target.value,
                          subjectId: e.target.value,
                        }))
                      }
                      placeholder="Enter name or email"
                    />
                  </div>
                </div>

                <div>
                  <Label>Permission Template</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {templates.map(template => (
                      <label
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer ${
                          grantForm.template === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={grantForm.template === template.id}
                          onChange={e =>
                            setGrantForm(prev => ({
                              ...prev,
                              template: e.target.value,
                            }))
                          }
                          className="sr-only"
                        />
                        <div className="font-medium text-sm">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {template.description}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="expires-at">Expires At (Optional)</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={grantForm.expiresAt}
                    onChange={e =>
                      setGrantForm(prev => ({
                        ...prev,
                        expiresAt: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowGrantModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGrantPermission}
                  disabled={!grantForm.subjectId || !grantForm.subjectName}
                >
                  Grant Permission
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedGroup ? 'Edit Group' : 'Create Permission Group'}
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    value={groupForm.name}
                    onChange={e =>
                      setGroupForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <Label htmlFor="group-description">Description</Label>
                  <textarea
                    id="group-description"
                    value={groupForm.description}
                    onChange={e =>
                      setGroupForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the group purpose"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowGroupModal(false)
                    setSelectedGroup(null)
                    setGroupForm({ name: '', description: '', members: [] })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup} disabled={!groupForm.name}>
                  {selectedGroup ? 'Update Group' : 'Create Group'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PermissionManager
