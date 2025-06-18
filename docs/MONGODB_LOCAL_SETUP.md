# Local MongoDB Setup Guide for Lucidify

## 🖥️ Local MongoDB Installation

### Option A: MongoDB Community Server

#### Windows Installation

1. **Download MongoDB Community Server**:

   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select "Windows" and download the MSI installer

2. **Install MongoDB**:

   - Run the downloaded MSI file
   - Choose "Complete" installation
   - Install MongoDB Compass (GUI tool) when prompted
   - Complete the installation

3. **Start MongoDB Service**:
   - Open Command Prompt as Administrator
   - Run: `net start MongoDB`
   - Or use Services app to start "MongoDB" service

#### macOS Installation

1. **Using Homebrew** (recommended):

   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB Service**:

   ```bash
   brew services start mongodb-community
   ```

3. **Alternative: Manual Installation**:
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Extract and add to PATH

#### Linux Installation (Ubuntu/Debian)

1. **Import MongoDB GPG Key**:

   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB Repository**:

   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**:

   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB Service**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

### Option B: Docker (Recommended for Development)

1. **Install Docker**:

   - Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Install and start Docker

2. **Run MongoDB Container**:

   ```bash
   docker run -d \
     --name mongodb-lucidify \
     -p 27017:27017 \
     -v mongodb_data:/data/db \
     mongo:7.0
   ```

3. **Verify Installation**:
   ```bash
   docker ps
   ```

## 🔧 Configuration

### 1. Create Environment File

Create `backend/.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/lucidify

# Other configurations
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Test Connection

```bash
npm run dev
```

You should see: `✅ MongoDB connected successfully`

## 🛠️ Database Management

### Using MongoDB Compass (GUI)

1. **Download MongoDB Compass**:

   - Go to [MongoDB Compass](https://www.mongodb.com/try/download/compass)
   - Download and install

2. **Connect to Database**:

   - Open MongoDB Compass
   - Use connection string: `mongodb://localhost:27017`
   - Click "Connect"

3. **Browse Collections**:
   - Navigate to `lucidify` database
   - View `dreams` and `users` collections

### Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh

# Switch to lucidify database
use lucidify

# View collections
show collections

# View dreams
db.dreams.find()

# View users
db.users.find()
```

## 🚨 Troubleshooting

### Common Issues

#### MongoDB Won't Start

- **Windows**: Check if service is running in Services
- **macOS**: `brew services restart mongodb-community`
- **Linux**: `sudo systemctl restart mongod`

#### Connection Refused

- Check if MongoDB is running on port 27017
- Verify firewall settings
- Check MongoDB logs

#### Permission Issues

- **Windows**: Run as Administrator
- **Linux/macOS**: Check file permissions

### Useful Commands

#### Check MongoDB Status

```bash
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

#### View MongoDB Logs

```bash
# Windows
# Check Event Viewer or MongoDB logs directory

# macOS
tail -f /usr/local/var/log/mongodb/mongo.log

# Linux
sudo journalctl -u mongod -f
```

#### Reset Database (Development)

```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use lucidify

# Drop all collections
db.dreams.drop()
db.users.drop()
```

## 📊 Database Structure

Your local MongoDB will create:

```
lucidify/
├── dreams/          # Dream journal entries
├── users/           # User profiles
└── system.indexes/  # Database indexes
```

## 🔒 Security Notes

### Development vs Production

- **Development**: Local MongoDB is fine
- **Production**: Use MongoDB Atlas or secured MongoDB instance

### Security Best Practices

1. **Authentication**: Enable authentication for production
2. **Network Security**: Bind to localhost only
3. **Regular Updates**: Keep MongoDB updated
4. **Backups**: Set up regular backups

## 🎯 Next Steps

1. **Verify Connection**: Start backend and check logs
2. **Test API**: Use Dream Journal interface
3. **Monitor Performance**: Use MongoDB Compass
4. **Set Up Backups**: Configure backup strategy
5. **Scale Up**: Consider MongoDB Atlas for production

## 💡 Development Tips

- **Use Docker**: Easy to reset and manage
- **MongoDB Compass**: Great for debugging
- **Indexes**: Add indexes for better performance
- **Data Validation**: Use Mongoose schemas
- **Regular Cleanup**: Remove test data periodically

---

**Your local MongoDB is ready for Lucidify development! 🖥️✨**
