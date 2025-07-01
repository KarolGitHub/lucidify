<template>
  <div class="custom-notifications">
    <h2 class="text-2xl font-bold mb-4">Custom Notifications</h2>
    <button class="btn btn-primary mb-4" @click="openAddModal">Add Notification</button>
    <div v-if="loading" class="mb-4">Loading...</div>
    <div v-else-if="notifications.length === 0" class="mb-4">No custom notifications yet.</div>
    <ul v-else class="space-y-4">
      <li v-for="n in notifications" :key="n._id"
        class="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div class="font-semibold">{{ n.title }}</div>
          <div class="text-gray-600 text-sm">{{ n.message }}</div>
          <div class="text-xs text-gray-500 mt-1">
            Frequency: {{ n.frequency }}<span v-if="n.frequency === 'custom'"> ({{ n.customInterval }} min)</span> |
            Time: {{ n.startTime }} - {{ n.endTime }} |
            Days: {{ n.daysOfWeek?.join(', ') }} |
            Timezone: {{ n.timezone }}
          </div>
        </div>
        <div class="flex items-center space-x-2 mt-2 md:mt-0">
          <button class="btn btn-sm" @click="openEditModal(n)">Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteNotification(n._id)">Delete</button>
          <button class="btn btn-sm" :class="n.enabled ? 'btn-success' : 'btn-secondary'" @click="toggleEnabled(n)">
            {{ n.enabled ? 'Enabled' : 'Disabled' }}
          </button>
        </div>
      </li>
    </ul>
    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal">
        <CustomNotificationForm :notification="editingNotification" @save="handleSave" @cancel="closeModal" />
      </div>
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CustomNotificationForm from './CustomNotificationForm.vue';
import { notifications } from '@/store';

const notificationsList = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingNotification = ref(null);

const showToast = (body, type = 'success') => {
  notifications.actions.presentToast({
    show: true,
    body,
    type,
  }, 2500);
};

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/notifications');
    notificationsList.value = res.data;
  } catch (err) {
    notificationsList.value = [];
    showToast('Failed to load notifications', 'error');
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  editingNotification.value = null;
  showModal.value = true;
};

const openEditModal = (n) => {
  editingNotification.value = { ...n };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingNotification.value = null;
};

const handleSave = async (formData) => {
  try {
    if (editingNotification.value && editingNotification.value._id) {
      await axios.put(`/api/notifications/${editingNotification.value._id}`, formData);
      showToast('Notification updated');
    } else {
      await axios.post('/api/notifications', formData);
      showToast('Notification added');
    }
    await fetchNotifications();
    closeModal();
  } catch (err) {
    showToast('Failed to save notification', 'error');
  }
};

const deleteNotification = async (id) => {
  if (!confirm('Delete this notification?')) return;
  try {
    await axios.delete(`/api/notifications/${id}`);
    showToast('Notification deleted');
    await fetchNotifications();
  } catch (err) {
    showToast('Failed to delete notification', 'error');
  }
};

const toggleEnabled = async (n) => {
  try {
    await axios.put(`/api/notifications/${n._id}`, { enabled: !n.enabled });
    showToast(n.enabled ? 'Notification disabled' : 'Notification enabled');
    await fetchNotifications();
  } catch (err) {
    showToast('Failed to update notification', 'error');
  }
};

onMounted(fetchNotifications);
</script>

<style scoped>
.custom-notifications {
  max-width: 600px;
  margin: 0 auto;
}

.btn {
  @apply px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition;
}

.btn-danger {
  @apply bg-red-500 hover:bg-red-600;
}

.btn-success {
  @apply bg-green-500 hover:bg-green-600;
}

.btn-secondary {
  @apply bg-gray-400 hover:bg-gray-500;
}

.btn-sm {
  @apply text-xs px-2 py-0.5;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
}
</style>
