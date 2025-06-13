# VoiceToTextDemo Component - Multi-File Structure

## Overview

The VoiceToTextDemo component has been refactored into a multi-file structure to demonstrate the VoiceToText component functionality with various examples and settings.

## File Structure

```
src/components/VoiceToTextDemo/
├── VoiceToTextDemo.vue              # Main component file (imports other files)
├── VoiceToTextDemo.template.html    # Template section
├── VoiceToTextDemo.script.ts        # Script section (TypeScript)
├── VoiceToTextDemo.style.css        # Style section (Tailwind CSS)
├── index.ts                         # Export file for easier imports
└── README.md                        # This documentation
```

## Purpose

This demo component showcases:

1. **Basic Voice Input** - Simple usage example
2. **Advanced Voice Input** - With settings panel and event handling
3. **Dream Description Example** - Real-world use case
4. **Usage Instructions** - Step-by-step guide
5. **Browser Requirements** - Compatibility information

## Usage

### Import the Component

```typescript
// Using the index file (recommended)
import VoiceToTextDemo from '@/components/VoiceToTextDemo';

// Or directly from the Vue file
import VoiceToTextDemo from '@/components/VoiceToTextDemo/VoiceToTextDemo.vue';
```

### Basic Usage

```vue
<template>
  <div>
    <VoiceToTextDemo />
  </div>
</template>
```

## Examples Demonstrated

### 1. Basic Voice Input

```vue
<VoiceToText
  :model-value="basicText"
  @update:model-value="basicText = $event"
  placeholder="Start speaking..."
/>
```

### 2. Advanced Voice Input with Settings

```vue
<VoiceToText
  :model-value="advancedText"
  @update:model-value="advancedText = $event"
  placeholder="Start speaking..."
  :show-settings="true"
  :continuous="true"
  :interim-results="true"
  @recording-start="handleRecordingStart"
  @recording-stop="handleRecordingStop"
/>
```

### 3. Dream Description Example

```vue
<VoiceToText
  :model-value="dreamDescription"
  @update:model-value="dreamDescription = $event"
  placeholder="Start describing your dream..."
  :continuous="true"
  :interim-results="true"
/>
```

## Dependencies

- **VoiceToText Component**: The main component being demonstrated
- **Vue 3**: Composition API and reactive system
- **Tailwind CSS**: Styling framework

## File Descriptions

### `VoiceToTextDemo.vue`

The main component file that imports and combines all other files:

```vue
<template src="./VoiceToTextDemo.template.html"></template>
<script lang="ts" src="./VoiceToTextDemo.script.ts"></script>
<style scoped src="./VoiceToTextDemo.style.css"></style>
```

### `VoiceToTextDemo.template.html`

Contains the demo interface with multiple examples and instructional content.

### `VoiceToTextDemo.script.ts`

Contains the component logic, reactive data, and event handlers for the demo.

### `VoiceToTextDemo.style.css`

Contains Tailwind CSS classes for the demo layout and styling.

### `index.ts`

Simple export file for easier imports:

```typescript
export { default } from './VoiceToTextDemo.vue';
```

## Benefits of Multi-File Structure for Demo

### 🎯 **Clear Separation**

- **Template**: Demo layout and examples
- **Script**: Demo logic and state management
- **Style**: Demo-specific styling

### 🔧 **Maintainability**

- Easy to update individual sections
- Clear organization of demo features
- Better code navigation

### 📚 **Documentation**

- Each file serves as documentation
- Easy to understand component structure
- Clear examples for developers

## Integration with VoiceToText

This demo component imports and uses the VoiceToText component:

```typescript
import VoiceToText from '../VoiceToText';

export default defineComponent({
  components: {
    VoiceToText,
  },
  // ...
});
```

## Future Enhancements

The multi-file structure makes it easy to:

1. **Add More Examples**: New demo sections can be added to the template
2. **Improve Documentation**: Each section can have detailed explanations
3. **Add Interactive Features**: More complex demo interactions
4. **Create Variations**: Different demo layouts for different use cases
5. **Add Testing**: Unit tests for demo functionality

## Best Practices for Demo Components

### ✅ **Do's**

- Keep examples simple and clear
- Provide comprehensive documentation
- Show real-world use cases
- Include error handling examples
- Demonstrate all major features

### ❌ **Don'ts**

- Don't make examples too complex
- Don't forget to handle edge cases
- Don't skip important features
- Don't use outdated patterns

## Related Files

- **VoiceToText Component**: The component being demonstrated
- **DreamJournal**: Real-world implementation example
- **VOICE_TO_TEXT_FEATURE.md**: Complete feature documentation
