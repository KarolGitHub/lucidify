# Dashboard Actions

This document explains how the dashboard actions are connected to the dream journal functionality.

## Action Flow

### 🔁 **Add New Dream**

- **Trigger**: "Add New Dream" button in welcome section
- **Action**: Opens the new dream modal via `dreams.actions.setShowNewDreamModal(true)`
- **Result**: User can immediately start recording a new dream

### 👁️ **View Last Dream**

- **Trigger**: "View Dream" button next to last dream display
- **Action**: Navigates to dream journal with query parameters
- **URL**: `/dream-journal?view={dreamId}&highlight=last`
- **Result**: Opens the last dream in edit modal and highlights it

### 📅 **View Recent Dreams**

- **Trigger**: Click on any dream in the "Recent Activity" sidebar
- **Action**: Navigates to dream journal with query parameters
- **URL**: `/dream-journal?view={dreamId}&highlight=recent`
- **Result**: Opens the selected dream in edit modal and highlights it

### 🎯 **Record Your First Dream**

- **Trigger**: "Record Your First Dream" button in empty state
- **Action**: Opens the new dream modal (same as "Add New Dream")
- **Result**: Encourages new users to start their dream journal

## Navigation Integration

### Query Parameters

The dashboard uses URL query parameters to communicate with the dream journal:

- **`view`**: The ID of the dream to open
- **`highlight`**: Type of highlight to apply (`last`, `recent`)

### Visual Feedback

- **Highlighting**: Dreams navigated to are highlighted with a blue ring for 3 seconds
- **Modal Opening**: Selected dreams automatically open in the edit modal
- **Smooth Transition**: Navigation provides seamless user experience

## Technical Implementation

### Dashboard Component (`Dashboard.ts`)

```typescript
// Navigation methods
const viewLastDream = () => {
  router.push({
    path: '/dream-journal',
    query: {
      view: lastDream.value._id,
      highlight: 'last',
    },
  });
};

const viewDream = (dream: Dream) => {
  router.push({
    path: '/dream-journal',
    query: {
      view: dream._id,
      highlight: 'recent',
    },
  });
};
```

### Dream Journal Component (`DreamJournal.ts`)

```typescript
// Query parameter handling
const handleQueryParameters = () => {
  const viewDreamId = route.query.view as string;
  const highlight = route.query.highlight as string;

  if (viewDreamId && filteredDreams.value.length > 0) {
    const dreamToView = filteredDreams.value.find(
      (dream) => dream._id === viewDreamId
    );
    if (dreamToView) {
      viewDream(dreamToView); // Open in modal
      highlightedDreamId.value = viewDreamId; // Set highlight
    }
  }
};
```

## User Experience

### Seamless Navigation

1. User clicks action button on dashboard
2. Navigation occurs with query parameters
3. Dream journal loads and processes parameters
4. Selected dream opens in modal
5. Visual highlight provides feedback

### Error Handling

- If dream ID is invalid, no action is taken
- If dreams haven't loaded yet, parameters are processed when data becomes available
- Graceful fallback if navigation fails

## Future Enhancements

### Potential Improvements

- **Dedicated Dream View**: Separate page for viewing dreams (instead of modal)
- **Breadcrumb Navigation**: Show user's path from dashboard to dream
- **Quick Actions**: Add edit/delete buttons directly in dashboard
- **Search Integration**: Pre-populate search with dream title
- **Analytics**: Track which dreams are viewed most from dashboard
