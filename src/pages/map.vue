<script setup lang="ts">
import { ArrowLeft, Layers, MapPin } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MapView from '@/components/MapView.vue'
import { Button } from '@/components/ui/button'
import { useZonesStore } from '@/stores/zones'

const router = useRouter()
const zonesStore = useZonesStore()
const mapViewRef = ref()
const filterMessage = ref('')
const filterError = ref('')
const showLayersDropdown = ref(false)

// Stable filter state to prevent flickering
const stableFilterText = ref('')
const stableFilterRow = ref<number | null>(null)
const stableFilterCol = ref<number | null>(null)

// Sync stable filters with store filters
watch(() => zonesStore.filterText, (newValue) => {
  stableFilterText.value = newValue
}, { immediate: true })

watch(() => zonesStore.filterRow, (newValue) => {
  stableFilterRow.value = newValue
}, { immediate: true })

watch(() => zonesStore.filterCol, (newValue) => {
  stableFilterCol.value = newValue
}, { immediate: true })

function goBack() {
  router.push('/')
}

function clearAllData() {
  zonesStore.clearAllData()
  // Redirect back to home after clearing data
  router.push('/')
}

function clearFiltersAndFitMap() {
  // Clear all filters
  zonesStore.clearFilters()

  // Show feedback message
  filterMessage.value = 'Filters cleared!'
  setTimeout(() => {
    filterMessage.value = ''
  }, 2000)

  // Fit map to all data after clearing filters
  setTimeout(() => {
    if (mapViewRef.value) {
      mapViewRef.value.fitBounds()
    }
  }, 100)
}

function getCurrentLayerName() {
  if (mapViewRef.value?.currentLayer && mapViewRef.value?.tileLayers) {
    const currentLayer = mapViewRef.value.currentLayer
    const layerName = mapViewRef.value.tileLayers[currentLayer]?.name
    return layerName || 'OpenStreetMap' // Default to a meaningful name
  }
  return 'OpenStreetMap' // Default fallback
}

function selectLayer(layerKey: string) {
  if (mapViewRef.value) {
    mapViewRef.value.changeLayer(layerKey)
    showLayersDropdown.value = false
  }
}

// Validate and set row filter
function setRowFilter(value: number | null) {
  // Handle empty/cleared input - reset to show all zones
  if (value === null || value === undefined || isNaN(value)) {
    zonesStore.setRowFilter(null)
    stableFilterRow.value = null
    filterError.value = ''
    return
  }
  
  // Check for negative values
  if (value < 0) {
    filterError.value = `Row cannot be negative. Please enter a value ≥ 0.`
    zonesStore.setRowFilter(null)
    stableFilterRow.value = null
    setTimeout(() => {
      filterError.value = ''
    }, 3000)
    return
  }
  
  // Check if row is within bounds
  const maxRow = Math.max(...zonesStore.zones.map(zone => zone.row))
  if (value > maxRow) {
    filterError.value = `Row ${value} is out of bounds. Maximum row is ${maxRow}.`
    // Clear the invalid filter
    zonesStore.setRowFilter(null)
    stableFilterRow.value = null
    setTimeout(() => {
      filterError.value = ''
    }, 3000)
    return
  }
  
  zonesStore.setRowFilter(value)
  filterError.value = ''
}

// Validate and set col filter
function setColFilter(value: number | null) {
  // Handle empty/cleared input - reset to show all zones
  if (value === null || value === undefined || isNaN(value)) {
    zonesStore.setColFilter(null)
    stableFilterCol.value = null
    filterError.value = ''
    return
  }
  
  // Check for negative values
  if (value < 0) {
    filterError.value = `Column cannot be negative. Please enter a value ≥ 0.`
    zonesStore.setColFilter(null)
    stableFilterCol.value = null
    setTimeout(() => {
      filterError.value = ''
    }, 3000)
    return
  }
  
  // Check if col is within bounds
  const maxCol = Math.max(...zonesStore.zones.map(zone => zone.col))
  if (value > maxCol) {
    filterError.value = `Column ${value} is out of bounds. Maximum column is ${maxCol}.`
    // Clear the invalid filter
    zonesStore.setColFilter(null)
    stableFilterCol.value = null
    setTimeout(() => {
      filterError.value = ''
    }, 3000)
    return
  }
  
  zonesStore.setColFilter(value)
  filterError.value = ''
}

// Handle blur events to catch when inputs are cleared
function handleRowBlur() {
  // Check if the input is effectively empty and reset the filter
  if (stableFilterRow.value === null || stableFilterRow.value === undefined || isNaN(stableFilterRow.value)) {
    stableFilterRow.value = null
    zonesStore.setRowFilter(null)
    // Fit map to show all zones after clearing filter
    setTimeout(() => {
      if (mapViewRef.value) {
        mapViewRef.value.fitBounds()
      }
    }, 100)
  }
}

function handleColBlur() {
  // Check if the input is effectively empty and reset the filter
  if (stableFilterCol.value === null || stableFilterCol.value === undefined || isNaN(stableFilterCol.value)) {
    stableFilterCol.value = null
    zonesStore.setColFilter(null)
    // Fit map to show all zones after clearing filter
    setTimeout(() => {
      if (mapViewRef.value) {
        mapViewRef.value.fitBounds()
      }
    }, 100)
  }
}

// Handle when input becomes empty string (from backspace)
function handleRowInput() {
  // If the input becomes empty, reset the filter and fit map to data
  if (stableFilterRow.value === null || stableFilterRow.value === undefined || isNaN(stableFilterRow.value)) {
    stableFilterRow.value = null
    zonesStore.setRowFilter(null)
    // Fit map to show all zones after clearing filter
    setTimeout(() => {
      if (mapViewRef.value) {
        mapViewRef.value.fitBounds()
      }
    }, 100)
    return
  }
  setRowFilter(stableFilterRow.value)
}

function handleColInput() {
  // If the input becomes empty, reset the filter and fit map to data
  if (stableFilterCol.value === null || stableFilterCol.value === undefined || isNaN(stableFilterCol.value)) {
    stableFilterCol.value = null
    zonesStore.setColFilter(null)
    // Fit map to show all zones after clearing filter
    setTimeout(() => {
      if (mapViewRef.value) {
        mapViewRef.value.fitBounds()
      }
    }, 100)
    return
  }
  setColFilter(stableFilterCol.value)
}

// Click outside handler to close dropdown
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.layers-dropdown')) {
    showLayersDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for significant changes in filtered zones and auto-fit map
watch(() => zonesStore.filteredCount, (newCount, oldCount) => {
  // If we went from a small number to a large number (filters cleared), fit map
  if (oldCount && newCount && newCount > oldCount * 2) {
    setTimeout(() => {
      if (mapViewRef.value) {
        mapViewRef.value.fitBounds()
      }
    }, 200)
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="h-16 flex items-center border-b border-border px-6 relative z-[9999]">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="sm" @click="goBack">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <div class="h-6 w-px bg-border" />
        <div class="flex items-center gap-2">
          <MapPin class="w-5 h-5 text-primary" />
          <span class="font-semibold">Map View</span>
        </div>
      </div>

      <div class="ml-auto flex items-center gap-3">
        <!-- Layers Dropdown -->
        <div class="relative layers-dropdown">
          <Button
            variant="outline"
            size="sm"
            class="flex items-center gap-2"
            @click="showLayersDropdown = !showLayersDropdown"
          >
            <Layers class="w-4 h-4" />
            <div class="hidden sm:flex items-center gap-2">
              <div class="w-2 h-2 bg-primary rounded-full" />
              <span>{{ getCurrentLayerName() }}</span>
            </div>
            <svg
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': showLayersDropdown }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>

          <!-- Dropdown Menu -->
          <div
            v-if="showLayersDropdown"
            class="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-[9999]"
          >
            <div class="p-2 space-y-1">
              <div
                v-for="(layer, key) in mapViewRef?.tileLayers || {}"
                :key="key"
                class="flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer hover:bg-muted transition-colors"
                :class="{ 'bg-muted': mapViewRef?.currentLayer === key }"
                @click="selectLayer(key as unknown as string)"
              >
                <div class="flex items-center gap-2">
                  <div
                    v-if="mapViewRef?.currentLayer === key"
                    class="w-3 h-3 bg-primary rounded-full"
                  />
                  <span :class="{ 'font-medium': mapViewRef?.currentLayer === key }">
                    {{ layer.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex h-[calc(100vh-4rem)]">
      <!-- Sidebar -->
      <aside class="w-80 border-r border-border bg-muted/30 overflow-y-auto relative z-[9999]">
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">
            Zone Information
          </h2>

          <div class="space-y-4">
            <div class="bg-background p-4 rounded-lg border">
              <h3 class="font-medium mb-2">
                Summary
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Total Zones:</span>
                  <span class="font-medium">{{ zonesStore.totalCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Cities:</span>
                  <span class="font-medium">{{ zonesStore.uniqueCityIds.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Visible:</span>
                  <span class="font-medium">{{ zonesStore.filteredCount }}</span>
                </div>
              </div>
            </div>

            <div class="bg-background p-4 rounded-lg border">
              <h3 class="font-medium mb-2">
                Filters
              </h3>

              <!-- Active filters summary -->
              <div v-if="zonesStore.filterText || zonesStore.filterRow !== null || zonesStore.filterCol !== null" class="mb-3 p-2 bg-muted/50 rounded text-xs">
                <p class="font-medium mb-1">
                  Active Filters:
                </p>
                <div class="space-y-1">
                  <div v-if="zonesStore.filterText" class="flex justify-between">
                    <span>Search:</span>
                    <span class="font-mono">{{ zonesStore.filterText }}</span>
                  </div>
                  <div v-if="zonesStore.filterRow !== null" class="flex justify-between">
                    <span>Row:</span>
                    <span class="font-mono">{{ zonesStore.filterRow }}</span>
                  </div>
                  <div v-if="zonesStore.filterCol !== null" class="flex justify-between">
                    <span>Col:</span>
                    <span class="font-mono">{{ zonesStore.filterCol }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <input
                  v-model="stableFilterText"
                  type="text"
                  placeholder="Search by city ID or zone ID..."
                  class="w-full px-3 py-2 text-sm border rounded-md bg-background"
                  @input="zonesStore.setFilter(stableFilterText)"
                >
                
                <!-- Row/Col Range Info -->
                <div class="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  <p class="font-medium mb-1">Valid Ranges:</p>
                  <div class="space-y-1">
                    <div class="flex justify-between">
                      <span>Row:</span>
                      <span class="font-mono">0 - {{ Math.max(...zonesStore.zones.map(zone => zone.row)) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Col:</span>
                      <span class="font-mono">0 - {{ Math.max(...zonesStore.zones.map(zone => zone.col)) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <input
                    v-model.number="stableFilterRow"
                    type="number"
                    min="0"
                    placeholder="Row"
                    class="w-full px-3 py-2 text-sm border rounded-md bg-background"
                    @input="handleRowInput"
                    @change="setRowFilter(stableFilterRow)"
                    @blur="handleRowBlur"
                  >
                  <input
                    v-model.number="stableFilterCol"
                    type="number"
                    min="0"
                    placeholder="Col"
                    class="w-full px-3 py-2 text-sm border rounded-md bg-background"
                    @input="handleColInput"
                    @change="setColFilter(stableFilterCol)"
                    @blur="handleColBlur"
                  >

                  <Button
                    variant="outline"
                    size="sm"
                    class="w-full"
                    @click="clearFiltersAndFitMap"
                  >
                    Clear Filters
                  </Button>

                  <!-- Filter feedback message -->
                  <div v-if="filterMessage" class="text-center">
                    <p class="text-xs text-green-600 dark:text-green-400 font-medium">
                      {{ filterMessage }}
                    </p>
                  </div>
                  
                  <!-- Filter error message -->
                  <div v-if="filterError" class="text-center">
                    <p class="text-xs text-red-600 dark:text-red-400 font-medium">
                      {{ filterError }}
                    </p>
                  </div>
                  
                  <!-- Filter behavior hint -->
                  <div class="text-center">
                    <p class="text-xs text-muted-foreground">
                      💡 Clear inputs to show all zones
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-background p-4 rounded-lg border">
              <h3 class="font-medium mb-2">
                Data Management
              </h3>
              <div class="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  class="w-full"
                  @click="clearAllData"
                >
                  Clear All Data
                </Button>
                <p class="text-xs text-muted-foreground">
                  This will remove all zones and filters from localStorage
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Map Area -->
      <div class="flex-1">
        <MapView ref="mapViewRef" />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Map view specific styles */
</style>
