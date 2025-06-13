# User Settings Documentation

## Overview

The Lucidifier app now includes a comprehensive user settings system that allows users to manage their profile information, preferences, and account settings. The settings are split into two main components: **CardSettings** for editing user data and **CardProfile** for viewing statistics and account information.

## Features

### Profile Management

- **Display Name**: Customizable display name (max 100 characters)
- **Bio**: Personal description and lucid dreaming journey (max 500 characters)
- **Experience Level**: Beginner, Intermediate, Advanced, or Expert
- **Goals**: Dynamic list of personal lucid dreaming goals
- **Interests**: Dynamic list of interests and hobbies

### Preferences

- **Theme**: Light, Dark, or Auto theme selection
- **Timezone**: Timezone selection for proper time display
- **Default Dream Visibility**: Private, Friends Only, or Public

### Notification Settings

- **Dream Reminders**: Enable/disable dream recording reminders
- **Lucid Dream Tips**: Enable/disable lucid dreaming tips
- **Weekly Statistics**: Enable/disable weekly progress reports

### Account Management

- **Data Export**: Download all user data as JSON
- **Account Deletion**: Permanently delete account and all data
- **Profile Statistics**: View lucid dreaming progress and achievements

## Backend API Endpoints

### User Profile

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### User Settings

- `GET /api/users/settings` - Get user settings
- `PUT /api/users/settings` - Update user settings

### Account Management

- `DELETE /api/users/account` - Delete user account
- `GET /api/users/export` - Export user data

## Frontend Components

### CardSettings Component

Located at `src/components/Cards/CardSettings/`

**Features:**

- Form-based editing of user profile and settings
- Real-time validation and error handling
- Change detection with save/reset functionality
- Dynamic goals and interests management
- Responsive design with modern UI

**Key Methods:**

- `loadUserData()` - Loads user profile and settings
- `saveProfile()` - Saves changes to backend
- `addGoal()`, `removeGoal()` - Manage goals list
- `addInterest()`, `removeInterest()` - Manage interests list
- `resetForm()` - Reset form to original values

### CardProfile Component

Located at `src/components/Cards/CardProfile/`

**Features:**

- Displays user statistics and progress
- Shows lucid dreaming achievements
- Account information and member details
- Data export and account deletion options

**Key Methods:**

- `loadUserProfile()` - Loads user profile data
- `exportUserData()` - Exports user data as JSON file
- `deleteAccount()` - Deletes user account

## User Service

Located at `src/services/userService.ts`

**Main Methods:**

- `getProfile()` - Fetch user profile
- `updateProfile(updates)` - Update profile data
- `getSettings()` - Fetch user settings
- `updateSettings(settings)` - Update settings
- `deleteAccount()` - Delete account
- `exportData()` - Export user data

## Data Models

### UserProfile Interface

```typescript
interface UserProfile {
  firebaseUid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  preferences: {
    defaultDreamVisibility: 'private' | 'public' | 'friends';
    notificationSettings: {
      dreamReminders: boolean;
      lucidDreamTips: boolean;
      weeklyStats: boolean;
      realityCheckScheduler: {
        enabled: boolean;
        frequency: string;
        customInterval: number;
        startTime: string;
        endTime: string;
        message: string;
        daysOfWeek: string[];
        timezone: string;
      };
    };
    theme: 'light' | 'dark' | 'auto';
    timezone: string;
  };
  lucidProgress: {
    totalDreams: number;
    lucidDreams: number;
    firstLucidDream?: Date;
    lastLucidDream?: Date;
    currentStreak: number;
    longestStreak: number;
    techniques: Array<{
      name: string;
      lastUsed: Date;
      successRate: number;
    }>;
  };
  profile: {
    bio?: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    goals: string[];
    interests: string[];
  };
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserSettings Interface

```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  defaultDreamVisibility: 'private' | 'public' | 'friends';
  notifications: {
    dreamReminders: boolean;
    lucidDreamTips: boolean;
    weeklyStats: boolean;
  };
}
```

## Validation

### Backend Validation

- Uses `express-validator` for input validation
- Validates display name length (max 100 characters)
- Validates bio length (max 500 characters)
- Validates experience level enum values
- Validates arrays for goals and interests
- Validates theme, timezone, and notification settings

### Frontend Validation

- Real-time form validation
- Character count limits
- Required field validation
- Change detection for efficient saving

## Error Handling

### Backend Error Handling

- Comprehensive try-catch blocks
- Detailed error messages
- HTTP status codes
- Validation error details

### Frontend Error Handling

- Loading states
- Error message display
- Success message feedback
- Network error handling

## Security Features

- Authentication required for all endpoints
- Input sanitization and validation
- XSS protection through proper escaping
- CSRF protection through authentication tokens

## Usage Examples

### Updating Display Name

```typescript
await userService.updateDisplayName('New Display Name');
```

### Updating Theme

```typescript
await userService.updateTheme('dark');
```

### Adding a Goal

```typescript
// In the component
addGoal() {
  const goal = prompt("Enter a new goal:");
  if (goal && goal.trim()) {
    formData.goals.push(goal.trim());
  }
}
```

### Exporting Data

```typescript
const data = await userService.exportData();
// Creates downloadable JSON file
```

## Future Enhancements

1. **Profile Picture Upload**: Add avatar/profile picture functionality
2. **Social Features**: Friend connections and sharing
3. **Advanced Statistics**: More detailed progress analytics
4. **Custom Themes**: User-defined color schemes
5. **Notification Scheduling**: More granular notification controls
6. **Data Import**: Import data from other dream journal apps
7. **Privacy Controls**: More detailed privacy settings
8. **Account Recovery**: Enhanced account recovery options

## Testing

### Manual Testing Checklist

- [ ] Load user profile data correctly
- [ ] Save profile changes successfully
- [ ] Validate form inputs properly
- [ ] Handle network errors gracefully
- [ ] Export data functionality works
- [ ] Account deletion with confirmation
- [ ] Responsive design on different screen sizes
- [ ] Theme changes apply correctly
- [ ] Notification settings save properly

### Automated Testing

- Unit tests for service methods
- Component testing for form validation
- Integration tests for API endpoints
- E2E tests for complete user flows

## Troubleshooting

### Common Issues

1. **Profile not loading**

   - Check authentication status
   - Verify API endpoint availability
   - Check network connectivity

2. **Changes not saving**

   - Verify form validation
   - Check backend validation errors
   - Ensure proper API permissions

3. **Export not working**
   - Check browser download settings
   - Verify file size limits
   - Ensure proper JSON formatting

### Debug Information

- Check browser console for errors
- Verify API responses in Network tab
- Check backend logs for validation errors
- Ensure proper CORS configuration

## Dependencies

### Backend

- `express-validator`: Input validation
- `mongoose`: Database operations
- `express`: API framework

### Frontend

- `vue`: Component framework
- `axios`: HTTP client
- `tailwindcss`: Styling

## Performance Considerations

- Lazy loading of profile data
- Efficient change detection
- Optimized API calls
- Minimal re-renders
- Proper error boundaries
