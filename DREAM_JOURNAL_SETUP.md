# Dream Journal Setup Guide

## 🎯 Overview

The Dream Journal is a comprehensive feature for tracking, analyzing, and improving lucid dreaming experiences. It includes:

- **Dream Entry Management**: Create, edit, and delete dream entries
- **Advanced Filtering**: Search by content, tags, emotions, and dream types
- **Lucid Dream Tracking**: Monitor lucid dream frequency and progress
- **Analytics**: View dream statistics and patterns
- **MongoDB Integration**: Persistent storage with flexible document structure

## 🚀 Quick Start

### 1. Backend Setup

1. **Install Dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Set up MongoDB**:

   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `lucidify`

3. **Environment Configuration**:
   Create a `.env` file in the `backend` directory:

   ```env
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/lucidify
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start the Backend**:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. **Install Dependencies** (if not already done):

   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory:

   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. **Start the Frontend**:
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Dream Model

```javascript
{
  title: String,           // Dream title
  description: String,     // Detailed dream description
  date: Date,             // When the dream occurred
  isLucid: Boolean,       // Was it a lucid dream?
  isVivid: Boolean,       // Was it vivid?
  isRecurring: Boolean,   // Is it recurring?
  isNightmare: Boolean,   // Was it a nightmare?
  tags: [String],         // Categorization tags
  emotions: [String],     // Emotions experienced
  lucidDetails: {         // Lucid dreaming specifics
    awarenessLevel: Number,
    controlLevel: Number,
    techniquesUsed: [String],
    dreamSigns: [String]
  },
  setting: {              // Dream environment
    location: String,
    timeOfDay: String,
    weather: String,
    colors: [String]
  },
  characters: [{          // Dream characters
    type: String,
    description: String,
    role: String,
    isFamiliar: Boolean
  }],
  interpretation: {       // Personal insights
    personalMeaning: String,
    symbols: [String],
    insights: String,
    lessons: String
  },
  sleepContext: {         // Sleep quality context
    sleepDuration: Number,
    sleepQuality: String,
    stressLevel: Number,
    medications: [String]
  },
  userId: String,         // User reference
  rating: Number,         // Dream rating (1-5)
  isPublic: Boolean       // Privacy setting
}
```

### User Model

```javascript
{
  firebaseUid: String,    // Firebase user ID
  email: String,          // User email
  displayName: String,    // Display name
  preferences: {          // User preferences
    defaultDreamVisibility: String,
    notificationSettings: Object,
    theme: String,
    timezone: String
  },
  lucidProgress: {        // Lucid dreaming progress
    totalDreams: Number,
    lucidDreams: Number,
    firstLucidDream: Date,
    lastLucidDream: Date,
    currentStreak: Number,
    longestStreak: Number,
    techniques: [Object]
  },
  profile: {              // User profile
    bio: String,
    experienceLevel: String,
    goals: [String],
    interests: [String]
  }
}
```

## 🔌 API Endpoints

### Dreams

- `GET /api/dreams` - Get all dreams for a user
- `GET /api/dreams/:id` - Get a specific dream
- `POST /api/dreams` - Create a new dream
- `PUT /api/dreams/:id` - Update a dream
- `DELETE /api/dreams/:id` - Delete a dream
- `GET /api/dreams/stats/user` - Get user's dream statistics
- `GET /api/dreams/search/advanced` - Advanced search

### Query Parameters

- `page` - Page number for pagination
- `limit` - Number of dreams per page
- `sort` - Sort field (e.g., `-date` for newest first)
- `filter` - Filter by type (`lucid`, `vivid`, `recurring`, `nightmare`)
- `search` - Text search in title, description, and tags
- `startDate` & `endDate` - Date range filter
- `tags` - Filter by tags (comma-separated)
- `emotions` - Filter by emotions (comma-separated)

## 🎨 Frontend Features

### Dream Journal Interface

- **Modern UI**: Clean, dream-themed interface with dark/light mode support
- **Quick Add**: Modal for adding new dream entries
- **Advanced Filters**: Search and filter by multiple criteria
- **Dream Cards**: Visual representation of dreams with key information
- **Statistics**: User progress and dream analytics

### Dream Entry Form

- **Basic Info**: Title, description, date
- **Dream Types**: Lucid, vivid, recurring, nightmare checkboxes
- **Tags**: Comma-separated tags for categorization
- **Emotions**: Multi-select emotion tracking
- **Advanced Fields**: Lucid details, setting, characters, interpretation

## 🔧 Customization

### Adding New Dream Types

1. Update the Dream model in `backend/models/Dream.js`
2. Add the field to the frontend form in `src/views/dream-journal/DreamJournal.html`
3. Update the TypeScript interface in `src/views/dream-journal/DreamJournal.ts`

### Adding New Emotions

1. Update the emotions array in `src/views/dream-journal/DreamJournal.ts`
2. Update the Dream model enum in `backend/models/Dream.js`

### Customizing the UI

- Modify `src/views/dream-journal/DreamJournal.html` for layout changes
- Update styles in your CSS/SCSS files
- Add new components as needed

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Update environment variables for production
3. Deploy to Railway, Heroku, or your preferred platform

### Frontend Deployment

1. Update `VITE_API_BASE_URL` to point to your production backend
2. Build and deploy to Netlify, Vercel, or your preferred platform

## 🔒 Security Considerations

- Implement proper Firebase authentication
- Add rate limiting for API endpoints
- Validate all user inputs
- Use HTTPS in production
- Implement proper CORS policies

## 📈 Future Enhancements

- **Dream Sharing**: Public dream sharing with privacy controls
- **Dream Analysis**: AI-powered dream interpretation
- **Lucid Dream Techniques**: Guided tutorials and exercises
- **Dream Patterns**: Advanced analytics and pattern recognition
- **Mobile App**: Native mobile application
- **Social Features**: Dream communities and discussions

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:

   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Ensure database exists

2. **CORS Errors**:

   - Check `CORS_ORIGIN` in backend `.env`
   - Ensure frontend URL matches

3. **Authentication Issues**:

   - Implement proper Firebase authentication
   - Check token validation in backend

4. **API Errors**:
   - Check backend logs for detailed error messages
   - Verify API endpoints and request format

## 📞 Support

For issues or questions:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection and database setup

---

**Happy Dream Journaling! 🌙✨**
