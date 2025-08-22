<script setup lang="ts">
// About page - this will be accessible at /about
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        About Zone Visualizer
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Zone Visualizer is a local-first web app for visualizing city zones on interactive maps.
      </p>
      <div class="space-y-4">
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-4"
        >
          Home
        </router-link>
        <router-link
          to="/map"
          class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Map View
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* About page specific styles */
</style>
