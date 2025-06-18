# MongoDB Atlas Setup Guide for Lucidify

## 🚀 Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create an account or sign in with Google

### Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `lucidify`

### Step 6: Update Environment Variables

Create or update your `backend/.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/lucidify?retryWrites=true&w=majority

# Other configurations
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
```

### Step 7: Test Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```
2. Check the console for "✅ MongoDB connected successfully"

## 🔧 Advanced Configuration

### Database Collections

MongoDB Atlas will automatically create these collections when you first use them:

- `dreams` - Dream journal entries
- `users` - User profiles and progress

### Security Best Practices

1. **Use Environment Variables**: Never commit passwords to git
2. **Network Security**: Restrict IP access in production
3. **Database Users**: Use specific users with minimal privileges
4. **Regular Backups**: Atlas provides automatic backups

### Monitoring

- Use Atlas dashboard to monitor database performance
- Set up alerts for unusual activity
- Monitor connection counts and query performance

## 🚨 Troubleshooting

### Connection Issues

- **"ECONNREFUSED"**: Check if your IP is whitelisted
- **"Authentication failed"**: Verify username/password
- **"DNS resolution"**: Check internet connection

### Performance Issues

- **Slow queries**: Add database indexes
- **Connection limits**: Upgrade cluster tier
- **Memory issues**: Optimize queries and add pagination

## 📊 Database Schema Preview

Your database will contain:

```javascript
// dreams collection
{
  _id: ObjectId,
  title: "Flying Over the City",
  description: "I was flying over a beautiful city...",
  date: ISODate("2024-01-15"),
  isLucid: true,
  isVivid: true,
  tags: ["flying", "city", "freedom"],
  emotions: ["Joy", "Peace", "Wonder"],
  userId: "user123",
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}

// users collection
{
  _id: ObjectId,
  firebaseUid: "user123",
  email: "user@example.com",
  displayName: "Dream Explorer",
  lucidProgress: {
    totalDreams: 15,
    lucidDreams: 3,
    currentStreak: 2
  },
  createdAt: ISODate("2024-01-01T00:00:00Z")
}
```

## 🎯 Next Steps

1. **Test the Connection**: Start your backend and check logs
2. **Add Your First Dream**: Use the Dream Journal interface
3. **Monitor Performance**: Check Atlas dashboard
4. **Set Up Backups**: Configure automatic backups
5. **Scale Up**: Upgrade cluster when needed

## 💡 Pro Tips

- **Free Tier Limits**: 512MB storage, shared RAM
- **Development vs Production**: Use different clusters
- **Backup Strategy**: Atlas provides automatic backups
- **Cost Optimization**: Monitor usage and optimize queries
- **Security**: Regularly rotate passwords and review access

---

**Your MongoDB Atlas is now ready for Lucidify! 🌙✨**
