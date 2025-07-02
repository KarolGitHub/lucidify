<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-blueGray-700 dark:text-white">
        Custom Notifications
      </h2>
      <button @click="openAddModal"
        class="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105">
        <i class="mr-2 fas fa-plus"></i>
        Add Notification
      </button>
    </div>
    <!-- Loading/Empty State -->
    <div v-if="loading" class="mb-4">Loading...</div>
    <div v-else-if="notificationsList.length === 0" class="flex flex-1 justify-center items-center py-12">
      <div class="text-center">
        <i class="mb-4 text-6xl text-gray-300 fas fa-bell-slash dark:text-gray-600"></i>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          No custom notifications yet. Add your first notification!
        </p>
      </div>
    </div>
    <!-- Notification List -->
    <div v-else class="space-y-4">
      <div v-for="n in notificationsList" :key="n._id"
        class="flex justify-between items-start p-4 bg-gray-50 rounded-lg transition duration-300 dark:bg-gray-700 hover:shadow-md group">
        <div class="flex-1">
          <div class="mb-1 text-lg font-semibold text-blueGray-700 dark:text-white">{{ n.title }}</div>
          <div class="mb-1 text-sm text-gray-600 dark:text-gray-300">{{ n.message }}</div>
          <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Frequency: {{ n.frequency }}<span v-if="n.frequency === 'custom'"> ({{ n.customInterval }} min)</span> |
            Time: {{ n.startTime }} - {{ n.endTime }} |
            Days: {{ n.daysOfWeek?.join(', ') }} |
            Timezone: {{ n.timezone }}
          </div>
        </div>
        <div class="flex items-center mt-2 space-x-2 md:mt-0">
          <button @click="openEditModal(n)"
            class="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Edit notification">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="deleteNotification(n._id)"
            class="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Delete notification">
            <i class="fas fa-trash"></i>
          </button>
          <button @click="toggleEnabled(n)"
            :class="n.enabled ? 'p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300' : 'p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'"
            :title="n.enabled ? 'Disable notification' : 'Enable notification'">
            <i :class="n.enabled ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50"
      @click.self="closeModal">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-blueGray-700 dark:text-white">
            {{ editingNotification ? 'Edit Notification' : 'New Notification' }}
          </h3>
          <button @click="closeModal"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <i class="text-xl fas fa-times"></i>
          </button>
        </div>
        <CustomNotificationForm :notification="editingNotification" @save="handleSave" @cancel="closeModal" />
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CustomNotificationForm from './CustomNotificationForm.vue';
import { notifications } from '@/store';
import notificationService from '@/services/notifications';

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
    const data = await notificationService.getCustomNotifications();
    notificationsList.value = data;
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
      await notificationService.updateCustomNotification(editingNotification.value._id, formData);
      showToast('Notification updated');
    } else {
      await notificationService.addCustomNotification(formData);
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
    await notificationService.deleteCustomNotification(id);
    showToast('Notification deleted');
    await fetchNotifications();
  } catch (err) {
    showToast('Failed to delete notification', 'error');
  }
};

const toggleEnabled = async (n) => {
  try {
    await notificationService.updateCustomNotification(n._id, { enabled: !n.enabled });
    showToast(n.enabled ? 'Notification disabled' : 'Notification enabled');
    await fetchNotifications();
  } catch (err) {
    showToast('Failed to update notification', 'error');
  }
};

onMounted(fetchNotifications);
</script>

<style scoped>
/* Card and modal styling matches Dream Journal */
</style>
