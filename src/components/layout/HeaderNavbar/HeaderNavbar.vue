<template>
  <nav class="bg-gray-50">
    <div class="px-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button-->
          <button type="button"
            class="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <!--
                        Icon when menu is closed.

                        Heroicon name: outline/menu

                        Menu open: "hidden", Menu closed: "block"
                      -->
            <svg class="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!--
                        Icon when menu is open.

                        Heroicon name: outline/x

                        Menu open: "block", Menu closed: "hidden"
                      -->
            <svg class="hidden w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex items-center justify-center flex-1 sm:items-stretch sm:justify-start">
          <div class="flex items-center flex-shrink-0">
            <!--                    <img class="block w-auto h-8 lg:hidden" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow">-->
            <!--                    <img class="hidden w-auto h-8 lg:block" src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg" alt="Workflow">-->
          </div>
          <!--                <div class="hidden sm:block sm:ml-6">-->
          <!--                    <div class="flex space-x-4 ">-->
          <!--                        &lt;!&ndash; Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" &ndash;&gt;-->
          <!--                        <a href="#" class="px-3 py-2 text-sm font-medium text-black text-white bg-gray-900 rounded-md">Dashboard</a>-->
          <!--                        <a href="#" class="px-3 py-2 text-sm font-medium text-black rounded-md hover:bg-gray-700 hover:text-white ">Team</a>-->
          <!--                        <a href="#" class="px-3 py-2 text-sm font-medium text-black rounded-md hover:bg-gray-700 hover:text-white">Projects</a>-->
          <!--                        <a href="#" class="px-3 py-2 text-sm font-medium text-black rounded-md hover:bg-gray-700 hover:text-white">Calendar</a>-->
          <!--                    </div>-->
          <!--                </div>-->
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <button
            class="p-1 text-gray-400 bg-gray-800 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
            <span class="sr-only">View notifications</span>
            <!-- Heroicon name: outline/bell -->
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <!-- Profile dropdown -->
          <div class="relative ml-3">
            <div>
              <button @click="changeStatusMenu" type="button"
                class="flex text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                id="user-menu" aria-expanded="false" aria-haspopup="true">
                <span class="sr-only">Open user menu</span>
                <img v-if="userProfile?.profilePicture" class="object-cover w-8 h-8 rounded-full"
                  :src="userProfile.profilePicture" :alt="userProfile.displayName || 'Profile'" />
                <div v-else
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-600">
                  {{ userProfile?.displayName?.charAt(0)?.toUpperCase() ||
                    userProfile?.email?.charAt(0)?.toUpperCase() || 'U' }}
                </div>
              </button>
            </div>

            <!--
                        Dropdown menu, show/hide based on menu state.

                        Entering: "transition ease-out duration-100"
                          From: "transform opacity-0 scale-95"
                          To: "transform opacity-100 scale-100"
                        Leaving: "transition ease-in duration-75"
                          From: "transform opacity-100 scale-100"
                          To: "transform opacity-0 scale-95"
                      -->
            <transition enter-active-class="transition duration-100 ease-out"
              enter-to-class="transform scale-100 opacity-100" enter-from-class="transform scale-95 opacity-0"
              leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0">
              <div v-if="isActiveMenuUser"
                class="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none"
                role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                <a href="#"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem">Your Profile</a>
                <a href="#"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem">Settings</a>
                <a href="#"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem">Sign out</a>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div class="sm:hidden bg-gray-50 dark:bg-gray-800 md:bg-black md:dark:bg-black" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
        <a href="#"
          class="block px-3 py-2 text-base font-medium text-white bg-gray-900 rounded-md dark:bg-gray-700">Dashboard</a>
        <a href="#"
          class="block px-3 py-2 text-base font-medium text-gray-700 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">Team</a>
        <a href="#"
          class="block px-3 py-2 text-base font-medium text-gray-700 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">Projects</a>
        <a href="#"
          class="block px-3 py-2 text-base font-medium text-gray-700 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">Calendar</a>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import userService, { UserProfile } from "@/services/userService";

export default defineComponent({
  setup() {
    const isActiveMenuUser = ref(false);
    const userProfile = ref<UserProfile | null>(null);
    const loading = ref(false);

    const changeStatusMenu = () =>
      (isActiveMenuUser.value = !isActiveMenuUser.value);

    const loadUserProfile = async () => {
      try {
        loading.value = true;
        userProfile.value = await userService.getProfile();
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadUserProfile();
    });

    return {
      isActiveMenuUser,
      changeStatusMenu,
      userProfile,
      loading,
    };
  },
});
</script>

<style scoped></style>
