# JWT Migration Guide

This guide explains how to switch from Firebase Authentication to JWT Authentication when needed.

## Current Status

- **Active**: Firebase Authentication
- **Available**: JWT Authentication (kept for future use)
- **Frontend**: Uses Firebase Identity Toolkit endpoints
- **Backend**: Uses Firebase middleware for dream routes

## To Switch to JWT Authentication

### 1. Backend Changes

#### Update Dream Routes (`backend/routes/dreams.js`)

```javascript
// Change this:
const { authenticateUser } = require('../middleware/auth');

// To this:
const { authenticateJWT } = require('../middleware/jwtAuth');

// Update all route middleware:
router.get('/', authenticateJWT, async (req, res) => {
  // Change user ID references:
  const query = { userId: req.user._id.toString() }; // instead of req.user.firebaseUid
});
```

#### Update User ID References

- Change `req.user.firebaseUid` to `req.user._id.toString()` in all dream routes
- Update Dream model queries to use MongoDB ObjectId instead of Firebase UID

### 2. Frontend Changes

#### Replace Firebase Auth with JWT Auth

```javascript
// Instead of Firebase login:
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Use JWT login:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();
```

#### Update API Calls

```javascript
// Add JWT token to all API requests:
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};
```

### 3. Environment Variables

Ensure `.env` file has:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 4. User Migration

For existing Firebase users, you'll need to:

1. Create passwords for them, or
2. Implement a password reset flow, or
3. Allow them to set passwords during first JWT login

## Testing the Migration

1. Register a new user: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Test dream endpoints with JWT token
4. Verify user data is properly associated

## Rollback Plan

If you need to rollback to Firebase:

1. Revert dream routes to use `authenticateUser`
2. Change user ID references back to `firebaseUid`
3. Update frontend to use Firebase auth again

## Benefits of JWT

- No external dependencies
- Full control over authentication
- Customizable token policies
- Works offline (with cached tokens)

## Benefits of Firebase

- Google-managed security
- Automatic token refresh
- Built-in rate limiting
- Industry standard
- Easy integration with other Firebase services
