# Dashboard

The dashboard provides a comprehensive overview of the user's dream journaling progress and insights.

## Features

### 👁️ **Welcome Section**

- **Dynamic Greeting**: Shows "Good morning/afternoon/evening" based on time of day
- **Personalized Name**: Displays user's display name or email username
- **Last Dream Display**: Shows the most recent dream with title and date
- **Quick Actions**: View last dream or add new dream buttons

### 📊 **Progress Section**

- **Lucid Dreams Counter**: Total lucid dreams with monthly breakdown
- **Current Streak**: Consecutive days with recorded dreams
- **Total Dreams**: Overall count of recorded dreams
- **Visual Cards**: Colorful gradient cards with emojis for easy identification

### 🧠 **Dream Insights**

- **Common Emotions**: Most frequently recorded emotions in dreams
- **Common Themes**: Most recurring themes or topics in dreams
- **Tag-based Analysis**: Uses dream tags and themes for insights

### ⚡ **Quick Stats Sidebar**

- **Vivid Dreams**: Count of vivid dream experiences
- **Recurring Dreams**: Number of recurring dream patterns
- **Nightmares**: Count of nightmare experiences
- **Average Rating**: Overall dream rating average

### 📅 **Recent Activity**

- **Recent Dreams**: Last 5 recorded dreams with icons
- **Dream Type Indicators**: Visual icons for lucid (🌙), vivid (✨), and regular (💭) dreams
- **Quick Access**: Click to view dream details
- **Empty State**: Encourages first dream recording

## Data Sources

### User Information

- **Name**: From auth store user profile
- **Authentication**: Checks login status for data loading

### Dream Statistics

- **Dreams**: Loaded from dreams store
- **Stats**: Calculated from backend statistics
- **Real-time Updates**: Automatically refreshes when new dreams are added

### Calculations

#### Streak Calculation

```typescript
// Checks consecutive days with recorded dreams
// Looks back up to 30 days to find the current streak
```

#### Monthly Lucid Dreams

```typescript
// Filters lucid dreams from current month
// Uses JavaScript Date methods for month boundaries
```

#### Common Emotions/Themes

```typescript
// Sorts by frequency (count)
// Takes top 3 most common items
// Falls back to empty array if no data
```

## Responsive Design

- **Desktop**: Full layout with sidebar
- **Tablet**: Responsive grid adjustments
- **Mobile**: Stacked layout for better mobile experience

## Dark Mode Support

- **Automatic**: Follows system/user theme preference
- **Consistent**: All components support dark mode
- **Accessible**: Proper contrast ratios maintained

## Future Enhancements

- **Charts and Graphs**: Visual representations of dream patterns
- **Goal Setting**: Dream journaling goals and achievements
- **Export Features**: Download dream statistics and insights
- **Social Features**: Share achievements (optional)
- **AI Insights**: Personalized dream analysis and recommendations
- **Calendar View**: Monthly dream calendar with streak tracking
