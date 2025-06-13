# Navbar Search Functionality

The navbar includes a powerful search feature that allows users to quickly navigate to different routes in the application.

## Features

### 🔍 **Global Search**

- Search across all available routes by name, description, path, or category
- Real-time filtering as you type
- Keyboard shortcuts for quick access

### 🎯 **Smart Filtering**

- **Authenticated users**: See all available routes
- **Non-authenticated users**: Only see public routes (Login, Register, Home, About)
- Routes are categorized for better organization

### ⌨️ **Keyboard Navigation**

- **⌘K / Ctrl+K**: Focus the search input
- **Arrow Up/Down**: Navigate through suggestions
- **Enter**: Select highlighted suggestion or first result
- **Escape**: Close suggestions dropdown

### 🎨 **Enhanced UI**

- Clear button to reset search
- Search results counter
- Route icons and descriptions
- Category and path information
- Quick access mode when no search query
- Dark mode support

## Route Categories

- **Main**: Core application pages (Dashboard, Dream Journal, Home)
- **Account**: User management (Settings)
- **Auth**: Authentication pages (Login, Register)
- **Info**: Information pages (About)

## Usage

1. **Quick Access**: Click the search input or press ⌘K/Ctrl+K
2. **Browse**: When no query is entered, see all available routes
3. **Search**: Type to filter routes by name, description, or category
4. **Navigate**: Click on a result or use keyboard navigation
5. **Clear**: Use the X button or Escape key to clear the search

## Technical Implementation

- **Component**: `src/components/Navbars/Navbar.vue`
- **Route Metadata**: `src/router/routesMeta.ts`
- **Authentication**: Integrates with auth store for route filtering
- **Responsive**: Hidden on mobile devices, visible on desktop

## Route Configuration

Routes are defined in `src/router/routesMeta.ts` with the following structure:

```typescript
interface RouteMeta {
  name: string;
  path: string;
  icon?: string;
  description?: string;
  category?: string;
  requiresAuth?: boolean;
}
```

## Future Enhancements

- Search within dream content
- Recent searches history
- Favorite/bookmarked routes
- Advanced filters
- Search analytics
