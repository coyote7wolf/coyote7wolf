'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Avatar,
  Separator,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { TextArea } from '@/components/ui/TextArea'
import { useToast } from '@/hooks/use-toast'
import ClientLayout from '@/components/layout/ClientLayout'

// Simple icons
const UserIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const SettingsIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
)

const ShieldIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const BellIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

const SaveIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
)

const EditIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
)

interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  timezone: string
  language: string
  theme: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts'
    activityStatus: boolean
    dataSharing: boolean
  }
  preferences: {
    dateFormat: string
    timeFormat: '12h' | '24h'
    autoSave: boolean
    compactMode: boolean
  }
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setIsLoading(true)

        // Mock user data for now
        const mockProfile: UserProfile = {
          id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          avatar: '',
          bio: 'Software Developer passionate about creating great user experiences.',
          timezone: 'UTC+8',
          language: 'en',
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            desktop: false,
          },
          privacy: {
            profileVisibility: 'contacts',
            activityStatus: true,
            dataSharing: false,
          },
          preferences: {
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            autoSave: true,
            compactMode: false,
          },
        }

        setProfile(mockProfile)
      } catch (error) {
        console.error('Failed to initialize profile:', error)
        toast({
          title: 'Error Loading Profile',
          description: 'Failed to load profile data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeProfile()
  }, [toast])

  // Handle profile update
  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    try {
      setIsSaving(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setProfile(updatedProfile)
      setIsEditing(false)

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: 'Error Updating Profile',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle field change
  const handleFieldChange = (field: string, value: any) => {
    if (!profile) return

    const updatedProfile = { ...profile }
    const fieldPath = field.split('.')

    if (fieldPath.length === 1) {
      ;(updatedProfile as any)[field] = value
    } else if (fieldPath.length === 2 && fieldPath[0] && fieldPath[1]) {
      ;(updatedProfile as any)[fieldPath[0]][fieldPath[1]] = value
    }

    setProfile(updatedProfile)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Profile
          </h1>
          <p className="text-gray-600">
            Profile not found. Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ClientLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account settings and preferences
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'outline' : 'solid'}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <SettingsIcon />
                  Cancel
                </>
              ) : (
                <>
                  <EditIcon />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          {/* Profile Overview Card */}
          <Card>
            <CardBody className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {profile.name?.charAt(0)?.toUpperCase() ||
                    profile.email.charAt(0).toUpperCase()}
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.name || profile.email}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  {profile.bio && (
                    <p className="text-gray-600 mt-2">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="outline">
                      {profile.language.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{profile.timezone}</Badge>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Profile Settings Tabs */}
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <UserIcon />
                General
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <BellIcon />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <ShieldIcon />
                Privacy
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex items-center gap-2"
              >
                <SettingsIcon />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">General Settings</h3>
                  <p className="text-sm text-gray-600">
                    Update your personal information and basic settings
                  </p>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={e =>
                          handleFieldChange('name', e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={e =>
                          handleFieldChange('email', e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <TextArea
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleFieldChange('bio', e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={profile.language}
                        onValueChange={value =>
                          handleFieldChange('language', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="zh-tw">繁體中文</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={profile.timezone}
                        onChange={e =>
                          handleFieldChange('timezone', e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="UTC+0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={profile.theme}
                      onValueChange={value => handleFieldChange('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardBody>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <p className="text-sm text-gray-600">
                    Choose how you want to be notified
                  </p>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={profile.notifications.email}
                        onCheckedChange={checked =>
                          handleFieldChange('notifications.email', checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Receive push notifications on your device
                        </p>
                      </div>
                      <Switch
                        checked={profile.notifications.push}
                        onCheckedChange={checked =>
                          handleFieldChange('notifications.push', checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Desktop Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Show notifications on your desktop
                        </p>
                      </div>
                      <Switch
                        checked={profile.notifications.desktop}
                        onCheckedChange={checked =>
                          handleFieldChange('notifications.desktop', checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Privacy Settings</h3>
                  <p className="text-sm text-gray-600">
                    Control your privacy and data sharing preferences
                  </p>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <Select
                        value={profile.privacy.profileVisibility}
                        onValueChange={value =>
                          handleFieldChange(
                            'privacy.profileVisibility',
                            value as 'public' | 'private' | 'contacts'
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="contacts">
                            Contacts Only
                          </SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Activity Status</Label>
                        <p className="text-sm text-gray-600">
                          Show when you are online
                        </p>
                      </div>
                      <Switch
                        checked={profile.privacy.activityStatus}
                        onCheckedChange={checked =>
                          handleFieldChange('privacy.activityStatus', checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Data Sharing</Label>
                        <p className="text-sm text-gray-600">
                          Allow usage data to improve our services
                        </p>
                      </div>
                      <Switch
                        checked={profile.privacy.dataSharing}
                        onCheckedChange={checked =>
                          handleFieldChange('privacy.dataSharing', checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">User Preferences</h3>
                  <p className="text-sm text-gray-600">
                    Customize your application experience
                  </p>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select
                        value={profile.preferences.dateFormat}
                        onValueChange={value =>
                          handleFieldChange('preferences.dateFormat', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select
                        value={profile.preferences.timeFormat}
                        onValueChange={value =>
                          handleFieldChange(
                            'preferences.timeFormat',
                            value as '12h' | '24h'
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Save</Label>
                        <p className="text-sm text-gray-600">
                          Automatically save your work
                        </p>
                      </div>
                      <Switch
                        checked={profile.preferences.autoSave}
                        onCheckedChange={checked =>
                          handleFieldChange('preferences.autoSave', checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-gray-600">
                          Use a more compact interface
                        </p>
                      </div>
                      <Switch
                        checked={profile.preferences.compactMode}
                        onCheckedChange={checked =>
                          handleFieldChange('preferences.compactMode', checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end">
              <Button
                onClick={() => handleProfileUpdate(profile)}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}

export default ProfilePage
