# Reality Check Notification Fixes

This document outlines the fixes implemented to resolve the reality check notification issues.

## Issues Fixed

### 1. Duplicate Notifications

**Problem**: Backend was sending reality check notifications twice, and users with multiple FCM tokens (browser + mobile) received multiple notifications.

**Solution**:

- Added a cooldown mechanism (5 minutes) to prevent duplicate notifications
- Modified notification service to send to only the most recent active FCM token per user
- Added tracking of last notification time per user

**Files Modified**:

- `backend/services/notificationService.js`

### 2. Overdue Notifications

**Problem**: The system was sending notifications outside the scheduled time window.

**Solution**:

- Added time window validation (`isWithinTimeWindow` method)
- Added day validation (`isAllowedDay` method)
- Cron jobs now check if current time is within allowed window before sending notifications
- Support for overnight schedules (e.g., 22:00 to 06:00)

**Files Modified**:

- `backend/services/notificationService.js`

### 3. PWA Mobile Notifications Not Working

**Problem**: Notifications only worked in browser, not in downloaded PWA on mobile.

**Solution**:

- Updated service worker (`src/sw.ts`) to properly integrate Firebase messaging
- Enhanced PWA manifest with proper notification permissions and Firebase configuration
- Improved Firebase messaging initialization with better error handling
- Added device info tracking for PWA detection

**Files Modified**:

- `src/sw.ts`
- `vite.config.js` (PWA manifest)
- `src/server/firebase/firebase.ts`
- `src/components/Cards/CardRealityCheckScheduler/CardRealityCheckScheduler.ts`

## Key Changes

### Backend Changes

#### Notification Service (`backend/services/notificationService.js`)

```javascript
// Added cooldown mechanism
this.lastNotificationTime = new Map();
this.notificationCooldown = 5 * 60 * 1000; // 5 minutes

// Send to only most recent token
const sortedTokens = activeTokens.sort((a, b) =>
  new Date(b.createdAt) - new Date(a.createdAt)
);
const mostRecentToken = sortedTokens[0];

// Time window validation
isWithinTimeWindow(settings) {
  // Check if current time is within start/end time
}

// Day validation
isAllowedDay(settings) {
  // Check if current day is in allowed days
}
```

### Frontend Changes

#### Service Worker (`src/sw.ts`)

```javascript
// Firebase messaging integration
messaging.onBackgroundMessage((payload) => {
  // Handle background notifications with proper actions
});

// Enhanced notification click handling
self.addEventListener('notificationclick', function (event) {
  // Handle different actions (check, record, dismiss)
});
```

#### PWA Manifest (`vite.config.js`)

```javascript
manifest: {
  permissions: ["notifications", "background"],
  gcm_sender_id: "1023426981171",
  // Enhanced manifest for better PWA support
}
```

## Testing

### Manual Testing

1. Enable reality check scheduler in the app
2. Set frequency to "hourly" for quick testing
3. Wait for scheduled notifications
4. Verify only one notification is received per scheduled time
5. Test on mobile PWA to ensure notifications work in background

### Automated Testing

Run the test script to verify fixes:

```bash
cd backend
node test-reality-check-fixes.js
```

## Configuration

### Cooldown Period

The notification cooldown period can be adjusted in `backend/services/notificationService.js`:

```javascript
this.notificationCooldown = 5 * 60 * 1000; // 5 minutes
```

### Time Window Validation

Time window validation is automatic based on user settings:

- `startTime`: When notifications can start (HH:MM format)
- `endTime`: When notifications should stop (HH:MM format)
- `daysOfWeek`: Which days notifications are allowed

## Troubleshooting

### Notifications Not Working on Mobile PWA

1. Ensure the app is installed as PWA
2. Check notification permissions are granted
3. Verify FCM token is properly stored
4. Check service worker is registered and active

### Duplicate Notifications Still Occurring

1. Check cooldown period is sufficient
2. Verify only one active FCM token per user
3. Ensure time window validation is working

### Notifications Outside Scheduled Time

1. Verify timezone settings are correct
2. Check start/end time configuration
3. Ensure day of week settings are correct

## Future Improvements

1. **Smart Token Management**: Implement automatic cleanup of old/inactive tokens
2. **Notification Analytics**: Track notification delivery and engagement
3. **Custom Notification Sounds**: Allow users to customize notification sounds
4. **Notification History**: Store and display notification history in the app
5. **Advanced Scheduling**: Support for more complex scheduling patterns

## Related Files

- `backend/services/notificationService.js` - Core notification logic
- `src/sw.ts` - Service worker for PWA notifications
- `vite.config.js` - PWA configuration
- `src/server/firebase/firebase.ts` - Firebase messaging setup
- `src/components/Cards/CardRealityCheckScheduler/` - Frontend scheduler UI
- `backend/test-reality-check-fixes.js` - Test script for verification
