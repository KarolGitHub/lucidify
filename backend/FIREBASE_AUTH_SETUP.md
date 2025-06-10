# Firebase Auth Setup Guide

## Overview

This guide explains how to properly integrate Firebase Authentication with your Lucidifier app, connecting Firebase Auth users to MongoDB users for the Dream Journal feature.

## Architecture

```
Frontend (Vue.js) → Firebase Auth → Backend (Node.js) → MongoDB
```

1. **Frontend**: User logs in with Firebase Auth
2. **Firebase**: Returns ID token
3. **Backend**: Verifies token and creates/updates MongoDB user
4. **MongoDB**: Stores user data and dreams

## Backend Setup

### 1. Firebase Admin SDK Configuration

Create a `.env` file in the backend directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/lucidifier

# Firebase Admin SDK (for auth verification and push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# CORS (your frontend URL)
CORS_ORIGIN=http://localhost:4001
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Copy the values to your `.env` file

### 3. Backend Authentication Flow

The backend now supports two modes:

#### Development Mode (Firebase not configured)

- Uses `userId` parameter from request
- Creates users with fallback data
- Good for testing without Firebase setup

#### Production Mode (Firebase configured)

- Verifies Firebase ID tokens
- Automatically creates/updates MongoDB users
- Syncs user data from Firebase

## Frontend Setup

### 1. Install Firebase SDK

```bash
cd frontend
npm install firebase
```

### 2. Firebase Configuration

Create `src/firebase/config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'your-app-id',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const messaging = getMessaging(app);
```

### 3. Authentication Service

Create `src/services/auth.js`:

```javascript
import { auth } from '@/firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateReady = false;

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authStateReady = true;
    });
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  async getIdToken() {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }
    return await this.currentUser.getIdToken();
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

export default new AuthService();
```

### 4. API Service with Auth

Update your API service to include authentication:

```javascript
import authService from '@/services/auth';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
  }

  async getAuthHeaders() {
    try {
      const token = await authService.getIdToken();
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.warn('No auth token available:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  async getDreams(params = {}) {
    const headers = await this.getAuthHeaders();
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${this.baseURL}/dreams?${queryString}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async createDream(dreamData) {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}/dreams`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dreamData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Add other API methods...
}

export default new ApiService();
```

### 5. Vue Router Guard

Add authentication guard to your router:

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import authService from '@/services/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/dreams',
    name: 'DreamJournal',
    component: () => import('@/views/DreamJournal.vue'),
    meta: { requiresAuth: true },
  },
  // ... other routes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Wait for auth state to be ready
  if (!authService.authStateReady) {
    await new Promise((resolve) => {
      const unsubscribe = authService.auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });
  }

  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    next('/login');
  } else if (to.meta.requiresGuest && authService.isAuthenticated()) {
    next('/dreams');
  } else {
    next();
  }
});

export default router;
```

## Testing the Integration

### 1. Test with Real Firebase Auth

1. Set up Firebase in your frontend
2. Log in through the frontend
3. Make API calls - the backend will automatically:
   - Verify the Firebase token
   - Create/update the MongoDB user
   - Associate dreams with the Firebase UID

### 2. Test with Development Mode

If Firebase isn't configured, you can still test by providing a `userId`:

```bash
curl "http://localhost:3001/api/dreams?userId=test-user-123" \
  -H "Authorization: Bearer mock-token"
```

## Benefits of This Setup

1. **Security**: Real Firebase token verification
2. **User Sync**: Automatic user creation/updates
3. **Flexibility**: Works with or without Firebase configured
4. **Push Notifications**: Ready for FCM integration
5. **Scalability**: Proper user management

## Next Steps

1. Set up Firebase project and get credentials
2. Configure frontend Firebase SDK
3. Implement login/register components
4. Test the full authentication flow
5. Add push notification support

## Troubleshooting

### Common Issues

1. **"Firebase Admin SDK not initialized"**

   - Check your `.env` file has correct Firebase credentials
   - Ensure the service account has proper permissions

2. **"Invalid token" errors**

   - Make sure you're using Firebase ID tokens, not custom tokens
   - Check that the token hasn't expired

3. **CORS errors**

   - Update `CORS_ORIGIN` in your `.env` to match your frontend URL

4. **User not found in MongoDB**
   - The backend automatically creates users on first authentication
   - Check that the Firebase UID is being passed correctly
