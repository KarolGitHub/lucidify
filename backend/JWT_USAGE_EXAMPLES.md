# JWT Authentication Usage Guide

## Overview

This guide shows you how to use the JWT_SECRET environment variable and JWT authentication system in your Lucidify application.

## Environment Setup

Make sure your `.env` file contains:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## API Endpoints

### 1. Register a New User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false,
    "isAdmin": false,
    "createdAt": "2023-09-06T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false,
    "isAdmin": false,
    "lastLogin": "2023-09-06T10:30:00.000Z",
    "createdAt": "2023-09-06T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User Profile

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Refresh Token

```bash
POST /api/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Logout

```bash
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Using JWT_SECRET in Your Code

### 1. Generate JWT Tokens

```javascript
const { generateToken } = require('./utils/jwt');

// Generate token for a user
const user = {
  _id: '64f8a1b2c3d4e5f6a7b8c9d0',
  email: 'user@example.com',
  displayName: 'John Doe',
  firebaseUid: 'firebase-uid-123',
  isAdmin: false,
};

const token = generateToken(user);
console.log('Generated token:', token);
```

### 2. Verify JWT Tokens

```javascript
const { verifyToken, isTokenExpired } = require('./utils/jwt');

// Check if token is expired
if (isTokenExpired(token)) {
  console.log('Token is expired');
  return;
}

// Verify and decode token
try {
  const decoded = verifyToken(token);
  console.log('Decoded token:', decoded);
  // decoded = {
  //   userId: '64f8a1b2c3d4e5f6a7b8c9d0',
  //   email: 'user@example.com',
  //   displayName: 'John Doe',
  //   firebaseUid: 'firebase-uid-123',
  //   isAdmin: false,
  //   iat: 1694005800,
  //   exp: 1694092200,
  //   iss: 'lucidify-backend',
  //   aud: 'lucidify-frontend'
  // }
} catch (error) {
  console.error('Token verification failed:', error.message);
}
```

### 3. Using JWT Middleware

```javascript
const {
  authenticateJWT,
  optionalJWT,
  requireAdminJWT,
} = require('./middleware/jwtAuth');

// Protected route - requires valid JWT token
app.get('/api/protected', authenticateJWT, (req, res) => {
  // req.user contains the authenticated user
  // req.jwtPayload contains the decoded token payload
  res.json({
    message: 'This is a protected route',
    user: req.user,
    payload: req.jwtPayload,
  });
});

// Optional authentication route
app.get('/api/optional', optionalJWT, (req, res) => {
  if (req.user) {
    res.json({ message: 'Authenticated user', user: req.user });
  } else {
    res.json({ message: 'Anonymous user' });
  }
});

// Admin-only route
app.get('/api/admin', requireAdminJWT, (req, res) => {
  res.json({ message: 'Admin access granted', user: req.user });
});
```

## Frontend Integration

### 1. Store Token

```javascript
// After successful login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
localStorage.setItem('jwt_token', data.token);
localStorage.setItem('user_data', JSON.stringify(data.user));
```

### 2. Use Token in Requests

```javascript
// Add token to all API requests
const token = localStorage.getItem('jwt_token');

const response = await fetch('/api/protected', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### 3. Handle Token Expiration

```javascript
// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Refresh token if needed
const refreshToken = async () => {
  const token = localStorage.getItem('jwt_token');

  if (isTokenExpired(token)) {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    localStorage.setItem('jwt_token', data.token);
    return data.token;
  }

  return token;
};
```

## Security Best Practices

1. **Use a Strong JWT_SECRET**: Generate a random, long secret key
2. **Set Appropriate Expiration**: Tokens expire in 24 hours by default
3. **Use HTTPS**: Always use HTTPS in production
4. **Validate Tokens**: Always verify tokens on protected routes
5. **Handle Expiration**: Implement token refresh logic
6. **Secure Storage**: Store tokens securely (HttpOnly cookies for web apps)

## JWT_SECRET Configuration

The JWT_SECRET is used to sign and verify JWT tokens. It should be:

- **Long and random**: At least 32 characters
- **Unique per environment**: Different for development, staging, production
- **Kept secret**: Never commit to version control

Example of generating a secure secret:

```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

### Common Issues

1. **"Token verification failed"**: Check if JWT_SECRET is set correctly
2. **"Token expired"**: Implement token refresh or re-authentication
3. **"User not found"**: User may have been deleted from database
4. **"Account deactivated"**: User account is inactive

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.
