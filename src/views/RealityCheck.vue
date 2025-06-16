<template>
  <div
    class="reality-check-page min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-eye text-white text-2xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reality Check
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Ask yourself: Are you dreaming?
        </p>
      </div>

      <!-- Reality Check Questions -->
      <div class="space-y-6 mb-8">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Quick Reality Tests:
          </h3>
          <ul class="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-2 flex-shrink-0"></i>
              <span>Can you read text clearly? (Text is often blurry in dreams)</span>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-2 flex-shrink-0"></i>
              <span>Do your hands look normal? (Hands often look distorted)</span>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-2 flex-shrink-0"></i>
              <span>Can you count your fingers? (Usually impossible in dreams)</span>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-2 flex-shrink-0"></i>
              <span>Does gravity work normally? (Floating is common in dreams)</span>
            </li>
          </ul>
        </div>

        <!-- Current Status -->
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ isDreaming ? 'You are DREAMING!' : 'You are AWAKE' }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ isDreaming ? 'This is a lucid dream opportunity!' : 'You are in reality.' }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button @click="performRealityCheck"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
          <i class="fas fa-eye mr-2"></i>
          Perform Reality Check
        </button>

        <button @click="recordDream"
          class="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all duration-200">
          <i class="fas fa-book mr-2"></i>
          Record Dream
        </button>

        <button @click="goToDashboard"
          class="w-full bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-200">
          <i class="fas fa-home mr-2"></i>
          Go to Dashboard
        </button>
      </div>

      <!-- Tips -->
      <div class="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          <i class="fas fa-lightbulb mr-2"></i>
          Lucid Dreaming Tips:
        </h4>
        <ul class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• Practice reality checks throughout the day</li>
          <li>• Question your surroundings regularly</li>
          <li>• Keep a dream journal to improve recall</li>
          <li>• Set intentions before sleeping</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'RealityCheck',
  setup() {
    const router = useRouter();
    const isDreaming = ref(false);

    // Perform a reality check
    const performRealityCheck = () => {
      // Simple reality check - try to read text clearly
      // In dreams, text is often blurry or changes when you look away
      const testText = document.querySelector('h1')?.textContent || '';

      // Simulate reality check (in a real app, you'd have more sophisticated tests)
      const canReadClearly = testText.length > 0 && testText.includes('Reality Check');

      isDreaming.value = !canReadClearly;

      // Show result
      if (isDreaming.value) {
        alert('🎉 You are DREAMING! This is a lucid dream opportunity!');
      } else {
        alert('✅ You are AWAKE. This is reality.');
      }
    };

    // Record a dream
    const recordDream = () => {
      router.push({ path: '/dream-journal', query: { new: '1' } });
    };

    // Go to dashboard
    const goToDashboard = () => {
      router.push('/dashboard');
    };

    // Auto-perform reality check on page load
    onMounted(() => {
      // Small delay to let the page load
      setTimeout(() => {
        performRealityCheck();
      }, 1000);
    });

    return {
      isDreaming,
      performRealityCheck,
      recordDream,
      goToDashboard,
    };
  },
});
</script>

<style scoped>
.reality-check-page {
  background-attachment: fixed;
}

/* Animation for the eye icon */
.fa-eye {
  animation: blink 3s infinite;
}

@keyframes blink {

  0%,
  90%,
  100% {
    opacity: 1;
  }

  95% {
    opacity: 0.3;
  }
}
</style>
