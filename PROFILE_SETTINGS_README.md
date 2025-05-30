# Profile Settings Implementation

This document outlines the complete profile settings page implementation for the Friday calendar application.

## Features Implemented

### 1. Profile Management
- **User Profile Card**: Interactive component for managing personal information
- **Avatar Display**: Shows user initials with placeholder for future avatar upload
- **Inline Editing**: Edit profile information directly in the card
- **Real-time Updates**: Changes are immediately reflected in the UI

### 2. Preferences & Notifications
- **Email Notifications**: Toggle for receiving email notifications
- **AI Suggestions**: Toggle for AI-powered scheduling suggestions
- **Timezone Settings**: Comprehensive timezone selection
- **Form Validation**: Proper validation with error handling

### 3. Account Security
- **Security Overview**: Display last login, 2FA status, and connected devices
- **Security Actions**: Change password, manage 2FA, data export
- **Danger Zone**: Account deletion with clear warnings

### 4. Integrations
- **External Services**: Placeholders for Google Calendar, Outlook, Slack, Zoom
- **Coming Soon Badges**: Clear indication of future features

## Technical Implementation

### Backend Services

#### ProfileService (`services/profileService.ts`)
- `getUserProfile()`: Fetch user profile data
- `updateUserProfile()`: Update user name and email
- `getUserSettings()`: Fetch user preferences
- `updateUserSettings()`: Update notification and timezone preferences
- `createDefaultUserSettings()`: Initialize default settings for new users

#### API Routes
- `GET/PUT /api/profile`: Manage user profile information
- `GET/PUT /api/settings`: Manage user preferences and settings

### Database Schema

Updated `userSettings` table includes:
- `timezone`: User's preferred timezone
- `notificationsEnabled`: Email notification preference
- `aiSuggestionsEnabled`: AI suggestions preference
- `reminderTime`: Default reminder time (minutes before event)

### Frontend Components

#### Main Settings Page (`app/(dashboard)/settings/page.tsx`)
- Tabbed interface with 4 sections: Profile, Preferences, Security, Integrations
- State management for user data and form handling
- Proper loading states and error handling
- Toast notifications for user feedback

#### UserProfileCard (`components/settings/user-profile-card.tsx`)
- Modular component for profile management
- Inline editing functionality
- Avatar display with upload placeholder
- Proper form validation and error handling

#### AccountSecurityCard (`components/settings/account-security-card.tsx`)
- Security overview and management
- Action buttons for security features
- Danger zone for destructive actions

## Usage

### Accessing Settings
Navigate to `/dashboard/settings` to access the settings page.

### Updating Profile
1. Click "Edit Profile" in the Profile tab
2. Modify name or email fields
3. Click "Save Changes" to persist updates
4. Click "Cancel" to discard changes

### Managing Preferences
1. Navigate to the "Preferences" tab
2. Toggle notifications and AI suggestions as needed
3. Select your preferred timezone
4. Click "Save Settings" to apply changes

### Security Management
1. Navigate to the "Security" tab
2. Review security overview
3. Use action buttons to manage security features
4. Access danger zone for destructive actions

## API Usage

### Get User Profile
```typescript
const response = await fetch('/api/profile');
const profile = await response.json();
```

### Update User Profile
```typescript
const response = await fetch('/api/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email })
});
```

### Get User Settings
```typescript
const response = await fetch('/api/settings');
const settings = await response.json();
```

### Update User Settings
```typescript
const response = await fetch('/api/settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ timezone, notificationsEnabled, aiSuggestionsEnabled })
});
```

## Database Migration

Run the following SQL to add the new reminder_time column:

```sql
ALTER TABLE user_settings 
ADD COLUMN reminder_time INTEGER DEFAULT 30;
```

## Security Considerations

- All API routes require authentication
- Input validation on both client and server
- Proper error handling and user feedback
- Secure cookie-based authentication
- SQL injection prevention through parameterized queries

## Future Enhancements

1. **Avatar Upload**: File upload functionality for user avatars
2. **Two-Factor Authentication**: Implementation of 2FA system
3. **External Integrations**: Real integration with Google Calendar, Outlook, etc.
4. **Password Management**: Change password functionality
5. **Data Export**: User data export feature
6. **Account Deletion**: Proper account deletion workflow

## Error Handling

The implementation includes comprehensive error handling:
- API errors are caught and displayed as toast notifications
- Form validation prevents invalid data submission
- Loading states provide user feedback during operations
- Fallback data for when settings don't exist

## Accessibility

- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Responsive design for all screen sizes
