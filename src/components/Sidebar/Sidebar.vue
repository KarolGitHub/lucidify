<template>
  <nav
    class="relative z-10 flex flex-wrap items-center justify-between px-6 py-4 bg-white shadow-xl md:left-0 dark:bg-black md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden md:w-64">
    <div
      class="flex flex-wrap items-center justify-between w-full px-0 mx-auto md:flex-col md:items-stretch md:min-h-full md:flex-nowrap">
      <!-- Toggler -->
      <button
        class="px-3 py-1 text-xl leading-none text-black bg-transparent border border-transparent border-solid rounded opacity-50 cursor-pointer md:hidden"
        type="button" @click="toggleCollapseShow('bg-white m-2 py-3 px-6')">
        <i class="fas fa-bars"></i>
      </button>
      <!-- Brand -->
      <router-link
        class="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block dark:text-white md:pb-2 text-blueGray-600 whitespace-nowrap"
        to="/">
        Lucidifier
      </router-link>
      <!-- User -->
      <ul class="flex flex-wrap items-center list-none md:hidden">
        <li class="relative inline-block">
          <notification-dropdown />
        </li>
        <li class="relative inline-block">
          <user-dropdown />
        </li>
      </ul>
      <!-- Collapse -->
      <div
        class="absolute top-0 left-0 right-0 z-40 items-center flex-1 h-auto overflow-x-hidden overflow-y-auto rounded shadow md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none"
        :class="collapseShow">
        <hr class="my-4 md:min-w-full" />
        <ul class="flex-col items-center hidden mr-2 list-none md:flex-row md:flex">
          <select-theme-dropdown></select-theme-dropdown>
        </ul>
        <!-- Collapse header -->
        <div class="block pb-4 mb-4 border-b border-solid md:min-w-full md:hidden border-blueGray-200">
          <div class="flex flex-wrap">
            <div class="w-6/12">
              <router-link
                class="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block md:pb-2 text-blueGray-600 whitespace-nowrap"
                to="/">
                Lucidifier
              </router-link>
            </div>
            <div class="flex justify-end w-6/12">
              <button type="button"
                class="px-3 py-1 text-xl leading-none text-black bg-transparent border border-transparent border-solid rounded opacity-50 cursor-pointer md:hidden"
                @click="toggleCollapseShow('hidden')">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        <!-- Form -->
        <form class="mt-6 mb-4 md:hidden">
          <div class="pt-0 mb-3">
            <input type="text" placeholder="Search"
              class="w-full h-12 px-3 py-2 text-base font-normal leading-snug bg-white border border-solid rounded shadow-none outline-none border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 focus:outline-none" />
          </div>
        </form>

        <hr class="my-4 md:min-w-full" />

        <ul class="flex flex-col list-none md:flex-col md:min-w-full">
          <li class="inline-flex">
            <router-link v-slot="{ href, navigate, isActive }" to="/dashboard">
              <a :href="href" class="block py-3 text-xs font-bold uppercase" :class="[
                isActive
                  ? 'text-emerald-500 hover:text-emerald-600'
                  : 'text-blueGray-700 dark:text-white hover:text-blueGray-500',
              ]" @click="navigate">
                <i class="mr-2 text-sm fas fa-tv" :class="[isActive ? 'opacity-75' : 'text-blueGray-300']"></i>
                Dashboard
              </a>
            </router-link>
          </li>

          <li class="inline-flex">
            <router-link v-slot="{ href, navigate, isActive }" to="/settings">
              <a :href="href" class="block py-3 text-xs font-bold uppercase" :class="[
                isActive
                  ? 'text-emerald-500 hover:text-emerald-600'
                  : 'text-blueGray-700 dark:text-white hover:text-blueGray-500',
              ]" @click="navigate">
                <i class="mr-2 text-sm fas fa-tools" :class="[isActive ? 'opacity-75' : 'text-blueGray-300']"></i>
                Settings
              </a>
            </router-link>
          </li>
        </ul>

        <!-- <ul class="flex flex-col list-none md:flex-col md:min-w-full md:mb-4">
          <li class="inline-flex">
            <router-link
              class="block py-3 text-xs font-bold uppercase text-blueGray-700 dark:text-white hover:text-blueGray-500"
              to="/about">
              <i class="mr-2 text-sm fas fa-newspaper text-blueGray-300"></i>
              About
            </router-link>
          </li>
        </ul> -->

        <hr class="my-4 md:min-w-full" />

        <!-- Test Notification Button (remove in production) -->
        <div class="px-4 py-2">
          <button @click="testNotification"
            class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Test Notification
          </button>
        </div>

        <hr class="my-4 md:min-w-full" />
      </div>
    </div>
  </nav>
</template>

<script>
import NotificationDropdown from '@/components/Dropdowns/NotificationDropdown/NotificationDropdown.vue';
import UserDropdown from '@/components/Dropdowns/UserDropdown/UserDropdown.vue';
import SelectThemeDropdown from "@/components/Dropdowns/SelectThemeDropdown/SelectThemeDropdown.vue";
import { messaging } from '@/server/firebase/firebase';
import { onMessage, getToken } from 'firebase/messaging';
import { firebaseConfig } from '@/config';

export default {
  components: {
    NotificationDropdown,
    UserDropdown,
    SelectThemeDropdown,
  },
  data() {
    return {
      collapseShow: 'hidden',
      fcmToken: null,
      notifications: [],
    };
  },
  async mounted() {
    console.debug("💪 ~ Sidebar mounted ~ messaging:", messaging);

    // Set up message listener for foreground messages
    this.setupMessageListener();

    // Get FCM token
    await this.getFCMToken();

    // Request notification permission
    this.requestNotificationPermission();
  },
  methods: {
    toggleCollapseShow(classes) {
      this.collapseShow = classes;
    },

    setupMessageListener() {
      onMessage(messaging, (payload) => {
        console.debug("💪 ~ Sidebar ~ onMessage ~ payload:", payload);

        // Add notification to the list
        this.notifications.unshift({
          id: Date.now(),
          title: payload.notification?.title || 'New Message',
          body: payload.notification?.body || 'You have a new notification',
          timestamp: new Date(),
          data: payload.data
        });

        // Show browser notification if permission is granted
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'New Message', {
            body: payload.notification?.body,
            icon: '/favicon.ico', // You can customize this
            data: payload.data
          });
        }
      });
    },

    async getFCMToken() {
      try {
        // Option 1: With VAPID key (recommended for production)
        const currentToken = await getToken(messaging, {
          vapidKey: firebaseConfig.vapidKey
        });

        // Option 2: Without VAPID key (for testing only - remove this in production)
        // const currentToken = await getToken(messaging);

        if (currentToken) {
          this.fcmToken = currentToken;
          console.debug("💪 ~ Sidebar ~ FCM Token:", currentToken);

          // Send this token to your backend to store it
          await this.sendTokenToServer(currentToken);
        } else {
          console.debug("No registration token available. Request permission to generate one.");
        }
      } catch (err) {
        console.debug("💪 ~ Sidebar ~ Error getting token:", err);

        // If VAPID key fails, try without it (for testing)
        if (err.message.includes('applicationServerKey')) {
          console.debug("Trying without VAPID key...");
          try {
            const fallbackToken = await getToken(messaging);
            if (fallbackToken) {
              this.fcmToken = fallbackToken;
              console.debug("💪 ~ Sidebar ~ Fallback FCM Token:", fallbackToken);
            }
          } catch (fallbackErr) {
            console.debug("💪 ~ Sidebar ~ Fallback error:", fallbackErr);
          }
        }
      }
    },

    async requestNotificationPermission() {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log("Notification permission granted.");
          // Retry getting token after permission is granted
          await this.getFCMToken();
        } else {
          console.log("Notification permission denied.");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    },

    // Method to send token to your backend
    async sendTokenToServer(token) {
      try {
        // Get current user info if you have authentication
        const user = this.$store?.state?.auth?.user || null;

        const tokenData = {
          token: token,
          userId: user?.uid || null,
          userEmail: user?.email || null,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            timestamp: new Date().toISOString()
          }
        };

        // Determine API URL based on environment
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiBaseUrl = isDevelopment
          ? 'http://localhost:3001'
          : 'https://your-backend-url.com'; // Replace with your actual backend URL

        const response = await fetch(`${apiBaseUrl}/api/fcm-tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add authentication header if needed
            // 'Authorization': `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify(tokenData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('FCM token sent to server successfully:', result);
        } else {
          console.error('Failed to send FCM token to server:', response.status);
        }
      } catch (error) {
        console.error('Error sending FCM token to server:', error);
      }
    },

    testNotification() {
      // Test browser notification
      if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from Lucidifier!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'test-notification',
          requireInteraction: false
        });
      } else {
        alert('Notification permission not granted. Please enable notifications.');
      }

      // Log current FCM token
      if (this.fcmToken) {
        console.log('Current FCM Token:', this.fcmToken);
        console.log('Copy this token to test with Firebase Console or your backend');
      } else {
        console.log('No FCM token available');
      }
    }
  }
};
</script>
