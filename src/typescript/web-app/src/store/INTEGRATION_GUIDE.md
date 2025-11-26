# Redux Store Integration Guide

## Current Status

The Redux store is currently configured with the following slices:

- ✅ Auth slice (fully integrated)
- ✅ Documents slice (fully integrated)
- ✅ UI slice (fully integrated)
- ✅ Realtime slice (fully integrated)
- 🔄 User slice (created but not integrated)
- 🔄 Notifications slice (created but not integrated)

## User and Notifications Slice Integration

The User and Notifications slices have been created with full TypeScript support but are temporarily
disabled in the store configuration to avoid module resolution issues.

### To Enable User Slice:

1. **Uncomment in store/index.ts:**

```typescript
import userReducer from './slices/userSlice'

// In the reducer configuration:
user: userReducer,
```

2. **Uncomment user state tracking:**

```typescript
// Track user profile updates
if (currentState.user?.profile !== previousState.user?.profile) {
  // ... analytics tracking code
}
```

3. **Update hooks.ts:**

```typescript
export const useUserProfile = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user)

  return {
    profile: user.profile,
    isLoading: user.isLoading,
    isUpdating: user.isUpdating,
    error: user.error,
    uploadProgress: user.uploadProgress,
    hasUnsavedChanges: user.hasUnsavedChanges,
  }
}
```

### To Enable Notifications Slice:

1. **Uncomment in store/index.ts:**

```typescript
import notificationsReducer from './slices/notificationsSlice'

// In the reducer configuration:
notifications: notificationsReducer,
```

2. **Update hooks.ts:**

```typescript
export const useNotificationsEnhanced = () => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(state => state.notifications)

  return {
    items: notifications.items,
    unreadCount: notifications.unreadCount,
    isLoading: notifications.isLoading,
    error: notifications.error,
    preferences: notifications.preferences,
    isPermissionGranted: notifications.isPermissionGranted,
    unreadItems: notifications.items.filter(n => !n.read),
    highPriorityItems: notifications.items.filter(n => n.priority === 'high'),
  }
}
```

### Features Ready for Integration:

#### User Slice Features:

- Complete user profile management
- Profile picture upload with progress tracking
- User preferences and settings
- Async thunks for API integration
- Form validation state management

#### Notifications Slice Features:

- Real-time notification management
- Notification preferences and settings
- Browser notification permissions
- Notification categorization and priorities
- Read/unread state management
- Bulk operations support

### Usage in Components:

Once integrated, components can use these hooks:

```typescript
// User profile management
const { profile, isLoading, updateProfile } = useUserProfile()

// Enhanced notifications
const { items, unreadCount, unreadItems, highPriorityItems } = useNotificationsEnhanced()
```

### Integration Checklist:

- [ ] Ensure module resolution is working properly for the slice files
- [ ] Uncomment imports in store/index.ts
- [ ] Update the reducer configuration
- [ ] Restore the hooks functionality
- [ ] Test the integration with sample components
- [ ] Update the RootState type to include new slices
- [ ] Re-enable analytics tracking for user state changes

This gradual integration approach ensures the store remains functional while the new features are
being integrated.
