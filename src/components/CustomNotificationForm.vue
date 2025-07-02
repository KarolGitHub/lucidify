<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
        <input v-model="form.title" type="text" maxlength="100" required
          class="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
        <input v-model="form.message" type="text" maxlength="200" required
          class="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
        <select v-model="form.frequency" required
          class="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          <option value="hourly">Hourly</option>
          <option value="every_1_5_hours">Every 1.5 hours</option>
          <option value="every_2_hours">Every 2 hours</option>
          <option value="every_4_hours">Every 4 hours</option>
          <option value="every_6_hours">Every 6 hours</option>
          <option value="daily">Daily</option>
          <option value="custom">Custom (minutes)</option>
        </select>
      </div>
      <div v-if="form.frequency === 'custom'">
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Custom Interval (minutes)</label>
        <input v-model.number="form.customInterval" type="number" min="1" required
          class="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
        <input v-model="form.startTime" type="time" required
          class="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
        <input v-model="form.endTime" type="time" required
          class="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Days of Week</label>
        <div class="flex flex-wrap gap-2">
          <label v-for="day in daysOfWeekOptions" :key="day" class="flex items-center gap-1">
            <input type="checkbox" :value="day" v-model="form.daysOfWeek" />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ day.charAt(0).toUpperCase() + day.slice(1)
            }}</span>
          </label>
        </div>
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
        <input v-model="form.timezone" type="text" required
          class="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
      </div>
      <div class="flex items-center gap-2">
        <input type="checkbox" v-model="form.enabled" id="enabled" />
        <label for="enabled" class="text-sm text-gray-700 dark:text-gray-300">Enabled</label>
      </div>
    </div>
    <div class="flex justify-end pt-4 space-x-4">
      <button type="button" @click="$emit('cancel')"
        class="px-6 py-2 text-gray-700 rounded-lg border border-gray-300 transition duration-300 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
        Cancel
      </button>
      <button type="submit"
        class="px-6 py-2 text-white bg-blue-600 rounded-lg transition duration-300 hover:bg-blue-700 disabled:opacity-50">
        Save Notification
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch, toRefs } from 'vue';
const props = defineProps({
  notification: { type: Object, default: null },
});
const emit = defineEmits(['save', 'cancel']);

const daysOfWeekOptions = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

const defaultForm = () => ({
  title: '',
  message: '',
  frequency: 'every_4_hours',
  customInterval: 240,
  startTime: '09:00',
  endTime: '22:00',
  daysOfWeek: [...daysOfWeekOptions],
  timezone: 'UTC',
  enabled: true,
});

const form = reactive(defaultForm());

watch(
  () => props.notification,
  (val) => {
    if (val) {
      Object.assign(form, defaultForm(), val);
    } else {
      Object.assign(form, defaultForm());
    }
  },
  { immediate: true }
);

function handleSubmit() {
  // Basic validation
  if (!form.title.trim() || !form.message.trim()) return;
  if (form.frequency === 'custom' && (!form.customInterval || form.customInterval < 1)) return;
  if (!form.daysOfWeek.length) return;
  emit('save', { ...form });
}
</script>

<style scoped></style>
