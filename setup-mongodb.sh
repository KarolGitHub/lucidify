#!/bin/bash

echo "🚀 Lucidify MongoDB Setup Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Backend directory found"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/lucidify

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# JWT Secret (change this in production!)
JWT_SECRET=lucidify-dev-secret-key-change-in-production

# Firebase Configuration (optional)
# FIREBASE_PROJECT_ID=your-firebase-project-id
# FIREBASE_PRIVATE_KEY=your-firebase-private-key
# FIREBASE_CLIENT_EMAIL=your-firebase-client-email
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."

# Test MongoDB connection
node test-mongodb.js

if [ $? -eq 0 ]; then
    echo "✅ MongoDB is working correctly!"
else
    echo "❌ MongoDB connection failed"
    echo ""
    echo "🔧 To fix this, you need to:"
    echo "   1. Install MongoDB locally, OR"
    echo "   2. Set up MongoDB Atlas (cloud)"
    echo ""
    echo "📖 See the setup guides:"
    echo "   - MONGODB_LOCAL_SETUP.md (for local installation)"
    echo "   - MONGODB_ATLAS_SETUP.md (for cloud setup)"
    echo ""
    echo "💡 Quick MongoDB Atlas setup:"
    echo "   1. Go to https://www.mongodb.com/atlas"
    echo "   2. Create free account"
    echo "   3. Create free cluster"
    echo "   4. Get connection string"
    echo "   5. Update MONGODB_URI in backend/.env"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Start the backend: cd backend && npm run dev"
echo "   2. Start the frontend: npm run dev"
echo "   3. Open http://localhost:3000"
echo "   4. Navigate to Dream Journal"
echo ""
echo "📚 Documentation:"
echo "   - DREAM_JOURNAL_SETUP.md"
echo "   - MONGODB_ATLAS_SETUP.md"
echo "   - MONGODB_LOCAL_SETUP.md"
echo ""
echo "✨ Happy Dream Journaling! 🌙"