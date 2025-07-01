<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block font-semibold">Title</label>
      <input v-model="form.title" type="text" class="input" maxlength="100" required />
    </div>
    <div>
      <label class="block font-semibold">Message</label>
      <input v-model="form.message" type="text" class="input" maxlength="200" required />
    </div>
    <div>
      <label class="block font-semibold">Frequency</label>
      <select v-model="form.frequency" class="input" required>
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
      <label class="block font-semibold">Custom Interval (minutes)</label>
      <input v-model.number="form.customInterval" type="number" min="1" class="input" required />
    </div>
    <div>
      <label class="block font-semibold">Start Time</label>
      <input v-model="form.startTime" type="time" class="input" required />
    </div>
    <div>
      <label class="block font-semibold">End Time</label>
      <input v-model="form.endTime" type="time" class="input" required />
    </div>
    <div>
      <label class="block font-semibold">Days of Week</label>
      <div class="flex flex-wrap gap-2">
        <label v-for="day in daysOfWeekOptions" :key="day" class="flex items-center gap-1">
          <input type="checkbox" :value="day" v-model="form.daysOfWeek" /> {{ day.charAt(0).toUpperCase() + day.slice(1)
          }}
        </label>
      </div>
    </div>
    <div>
      <label class="block font-semibold">Timezone</label>
      <input v-model="form.timezone" type="text" class="input" required />
    </div>
    <div class="flex items-center gap-2">
      <input type="checkbox" v-model="form.enabled" id="enabled" />
      <label for="enabled">Enabled</label>
    </div>
    <div class="flex gap-2 mt-4">
      <button type="submit" class="btn btn-success">Save</button>
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
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

<style scoped>
.input {
  @apply border rounded px-2 py-1 w-full;
}
</style>
