# Lucidifier Backend API

A Node.js backend API for managing Firebase Cloud Messaging (FCM) tokens and sending push notifications.

## Features

- ✅ Store and manage FCM tokens
- ✅ Send notifications to specific devices
- ✅ Broadcast notifications to all devices
- ✅ Firebase Admin SDK integration
- ✅ Rate limiting and security middleware
- ✅ CORS support for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Firebase Service Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`dashboard-6d5c0`)
3. Go to **Project Settings** (⚙️ icon)
4. Click on **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Copy the values to your `.env` file

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

Update the `.env` file with your Firebase service account details:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=dashboard-6d5c0
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@dashboard-6d5c0.iam.gserviceaccount.com

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check

```
GET /api/health
```

### FCM Token Management

#### Store FCM Token

```
POST /api/fcm-tokens
Content-Type: application/json

{
  "token": "fcm-token-here",
  "userId": "user-id-optional",
  "userEmail": "user@example.com",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "platform": "Win32"
  }
}
```

#### Get All FCM Tokens

```
GET /api/fcm-tokens
```

#### Delete FCM Token

```
DELETE /api/fcm-tokens/:token
```

### Notification Management

#### Send to Specific Device

```
POST /api/notifications/send
Content-Type: application/json

{
  "token": "fcm-token-here",
  "title": "Notification Title",
  "body": "Notification message",
  "data": {
    "customKey": "customValue"
  },
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Broadcast to All Devices

```
POST /api/notifications/broadcast
Content-Type: application/json

{
  "title": "Broadcast Title",
  "body": "Broadcast message",
  "data": {
    "customKey": "customValue"
  },
  "imageUrl": "https://example.com/image.jpg"
}
```

## Testing the API

### 1. Test Health Endpoint

```bash
curl http://localhost:3001/api/health
```

### 2. Store FCM Token

```bash
curl -X POST http://localhost:3001/api/fcm-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-fcm-token-here",
    "userEmail": "test@example.com"
  }'
```

### 3. Send Test Notification

```bash
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-fcm-token-here",
    "title": "Test Notification",
    "body": "This is a test notification from the backend!"
  }'
```

## Frontend Integration

Update your frontend API calls to point to the backend:

```javascript
// In your Sidebar.vue component
const response = await fetch('http://localhost:3001/api/fcm-tokens', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(tokenData),
});
```

## Production Considerations

1. **Database Storage**: Replace in-memory storage with a proper database (MongoDB, PostgreSQL, etc.)
2. **Authentication**: Add JWT or session-based authentication
3. **Environment Variables**: Use proper environment management
4. **HTTPS**: Enable HTTPS in production
5. **Monitoring**: Add logging and monitoring
6. **Rate Limiting**: Adjust rate limits for production traffic

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK Error**: Make sure your service account key is correct
2. **CORS Error**: Check that `CORS_ORIGIN` matches your frontend URL
3. **Invalid FCM Token**: Ensure the token is valid and not expired
4. **Port Already in Use**: Change the `PORT` in your `.env` file

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## License

MIT
