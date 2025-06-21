# 🌙 Lucidify - AI-Powered Dream Journal

> A modern, feature-rich dream journal application with AI-powered analysis, voice-to-text capabilities, and comprehensive dream tracking.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5.16-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)

## ✨ Features

### 🧠 AI-Powered Dream Analysis

- **Automatic Tagging**: AI suggests relevant tags based on dream content
- **Emotion Detection**: Identifies emotions experienced in dreams
- **Theme Recognition**: Detects recurring themes and motifs
- **Symbol Identification**: Recognizes symbolic elements and objects
- **Psychological Analysis**: Provides insights into dream meanings
- **Pattern Analysis**: Analyzes patterns across multiple dreams

### 🎤 Voice-to-Text Integration

- **Real-time voice recognition** using Web Speech API
- **Automatic text conversion** from speech to text
- **Continuous recording mode** for longer dream descriptions
- **Multiple language support** (English, Spanish, French, German)
- **Recording timer** and visual feedback

### 👤 User Management

- **Configurable Avatars**: Upload custom profile pictures via URL
- **User Authentication**: Secure login with Firebase Auth
- **Profile Management**: Comprehensive user settings
- **Dark Mode Support**: Toggle between light and dark themes

### 📱 Modern Web App Features

- **Progressive Web App (PWA)**: Installable with offline support
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live synchronization across devices
- **Push Notifications**: Stay updated with dream reminders

### 🗂️ Dream Journal Features

- **Dream Entry Creation**: Rich text editor with AI assistance
- **Dream Categorization**: Tags, emotions, themes, and symbols
- **Search & Filter**: Find specific dreams quickly
- **Dream History**: Track patterns over time
- **Export Functionality**: Backup your dream data

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Firebase project (for authentication)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/lucidify.git
   cd lucidify
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create `.env` file in the backend directory:

   ```bash
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Firebase
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Server
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the development servers**

   Terminal 1 (Backend):

   ```bash
   cd backend
   npm start
   ```

   Terminal 2 (Frontend):

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📚 Documentation

### Setup Guides

- [MongoDB Atlas Setup](./docs/MONGODB_ATLAS_SETUP.md) - Configure cloud database
- [MongoDB Local Setup](./docs/MONGODB_LOCAL_SETUP.md) - Set up local database
- [Firebase Auth Setup](./docs/FIREBASE_AUTH_SETUP.md) - Configure authentication
- [Dream Journal Setup](./docs/DREAM_JOURNAL_SETUP.md) - Complete setup guide
- [Backend API Documentation](./docs/BACKEND_API.md) - Backend API documentation

### Feature Documentation

- [AI Features](./docs/AI_FEATURES.md) - AI-powered dream analysis
- [Voice-to-Text Feature](./docs/VOICE_TO_TEXT_FEATURE.md) - Speech recognition
- [Avatar Feature](./docs/AVATAR_FEATURE.md) - User profile pictures
- [User Settings](./docs/USER_SETTINGS_DOCUMENTATION.md) - User preferences

### API Documentation

- [JWT Migration Guide](./docs/JWT_MIGRATION_GUIDE.md) - Authentication updates
- [JWT Usage Examples](./docs/JWT_USAGE_EXAMPLES.md) - Implementation examples

## 🛠️ Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues

# Backend
cd backend
npm start           # Start backend server
npm run dev         # Start with nodemon (development)
```

### Project Structure

```
lucidify/
├── src/                    # Frontend source code
│   ├── components/         # Vue components
│   ├── views/             # Page components
│   ├── router/            # Vue Router configuration
│   ├── store/             # State management
│   ├── services/          # API services
│   ├── interface/         # TypeScript interfaces
│   └── assets/            # Static assets
├── backend/               # Backend server
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── docs/                  # Documentation
├── public/                # Public assets
└── dist/                  # Build output
```

### Technology Stack

**Frontend:**

- Vue 3 with Composition API
- TypeScript for type safety
- Tailwind CSS for styling
- Vue Router for navigation
- Vite for build tooling
- PWA support with Workbox

**Backend:**

- Node.js with Express
- MongoDB with Mongoose
- Firebase Authentication
- JWT for session management
- OpenAI API integration

**DevOps:**

- ESLint + Prettier for code formatting
- Netlify for frontend deployment
- Railway for backend deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all linting checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI analysis capabilities
- Firebase for authentication services
- Vue.js team for the amazing framework
- Tailwind CSS for the utility-first styling approach
- MongoDB for the flexible database solution

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs/) first
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information
4. Join our community discussions

---

**Made with ❤️ for dreamers everywhere**
