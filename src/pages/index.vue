<script setup lang="ts">
import { MapPin, Upload } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import { Button } from '@/components/ui/button'
import { useZonesStore } from '@/stores/zones'

const zonesStore = useZonesStore()
const route = useRoute()
const router = useRouter()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const message = ref('')
const messageType = ref<'success' | 'warning' | 'error'>('success')

// Handle route query parameters for notifications
onMounted(() => {
  if (route.query.message) {
    message.value = route.query.message as string
    messageType.value = (route.query.type as 'success' | 'warning' | 'error') || 'warning'

    // Clear the query parameters
    router.replace({ path: '/', query: {} })
  }

  // Show message if zones are loaded from localStorage
  if (zonesStore.hasZones) {
    message.value = `Loaded ${zonesStore.totalCount} zones from previous session.`
    messageType.value = 'success'

    // Clear the message after 3 seconds
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
})

function openFilePicker() {
  fileInputRef.value?.click()
}

async function handleFiles(files: FileList | null) {
  if (!files || files.length === 0)
    return

  const file = files[0]
  if (!file.name.toLowerCase().endsWith('.json')) {
    message.value = 'Please select a JSON file.'
    messageType.value = 'error'
    return
  }

  try {
    const result = await zonesStore.loadFromFile(file)
    message.value = result.message

    if (result.success) {
      messageType.value = 'success'
      // Navigate to map view after successful upload
      setTimeout(() => {
        router.push('/map')
      }, 1000)
    }
    else {
      messageType.value = 'error'
    }
  }
  catch {
    message.value = 'Failed to process file.'
    messageType.value = 'error'
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  handleFiles(target.files)
  target.value = ''
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files || null
  handleFiles(files)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  // Check if we're actually leaving the main element
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX
  const y = e.clientY

  if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
    isDragging.value = false
  }
}

function onDragEnd() {
  isDragging.value = false
}

function clearAllData() {
  zonesStore.clearAllData()
  message.value = 'All data cleared successfully.'
  messageType.value = 'success'
}
</script>

<template>
  <div class="min-h-[100dvh] bg-background text-foreground flex flex-col">
    <!-- Header -->
    <header class="h-16 flex items-center border-b border-border">
      <div class="mx-auto w-full max-w-6xl px-6 flex items-center justify-between">
        <!-- Logo: Curly braces around pin icon -->
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-muted-foreground">{</span>
          <MapPin class="w-6 h-6 text-primary" />
          <span class="text-2xl font-bold text-muted-foreground">}</span>
          <span class="text-lg font-semibold tracking-tight ml-2">Zone Visualizer</span>
        </div>

        <!-- Dark mode toggle -->
        <DarkModeToggle />
      </div>
    </header>

    <!-- Main Hero Section -->
    <main
      class="relative flex-1 flex items-center justify-center"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @dragend="onDragEnd"
    >
      <!-- Drag overlay -->
      <div
        v-if="isDragging"
        class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
        aria-hidden="true"
      >
        <div class="text-center space-y-6 flex flex-col items-center justify-center">
          <div class="w-20 h-20 border-4 border-dashed border-white rounded-full flex items-center justify-center bg-white/10">
            <Upload class="w-10 h-10 text-white" />
          </div>
          <p class="text-white/90 text-lg">
            Release to upload your JSON file
          </p>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="text-center space-y-8 max-w-4xl mx-auto px-6">
        <!-- Logo Icon -->
        <div class="flex items-center justify-center gap-3 mb-8">
          <span class="text-4xl font-bold text-muted-foreground">{</span>
          <MapPin class="w-16 h-16 text-primary" />
          <span class="text-4xl font-bold text-muted-foreground">}</span>
        </div>

        <!-- Headline -->
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Visualize your zones
        </h1>

        <!-- Catchphrase -->
        <p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Load JSON files with polygon boundaries and center points. See them instantly on an interactive map.
        </p>

        <!-- CTA Button -->
        <div class="flex items-center justify-center gap-4 pt-4">
          <Button size="lg" class="text-lg px-8 py-6 h-auto" @click="openFilePicker">
            <Upload class="w-5 h-5 mr-2" />
            Upload JSON
          </Button>

          <input
            ref="fileInputRef"
            type="file"
            accept="application/json"
            class="hidden"
            @change="onFileChange"
          >
        </div>

        <!-- View Map Button (shown when zones are loaded) -->
        <div v-if="zonesStore.hasZones" class="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="lg"
            class="text-lg px-8 py-6 h-auto"
            @click="router.push('/map')"
          >
            <MapPin class="w-5 h-5 mr-2" />
            View Map
          </Button>

          <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-destructive"
            @click="clearAllData"
          >
            Clear Data
          </Button>
        </div>

        <!-- Message -->
        <div v-if="message" class="max-w-md mx-auto">
          <p
            class="text-sm px-4 py-2 rounded-md" :class="[
              messageType === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
              messageType === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
              messageType === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            ]"
          >
            {{ message }}
          </p>
        </div>

        <!-- Drag hint -->
        <p class="text-sm text-muted-foreground/60">
          Or drag and drop a JSON file anywhere on this page
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
