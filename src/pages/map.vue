<script setup lang="ts">
import { ArrowLeft, Filter, Layers, MapPin } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useZonesStore } from '@/stores/zones'

const router = useRouter()
const zonesStore = useZonesStore()

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="h-16 flex items-center border-b border-border px-6">
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
        <Button variant="outline" size="sm">
          <Layers class="w-4 h-4 mr-2" />
          Layers
        </Button>
        <Button variant="outline" size="sm">
          <Filter class="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex">
      <!-- Sidebar -->
      <aside class="w-80 border-r border-border bg-muted/30">
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
              </div>
            </div>

            <div class="bg-background p-4 rounded-lg border">
              <h3 class="font-medium mb-2">
                Filters
              </h3>
              <div class="space-y-3">
                <input
                  v-model="zonesStore.filterText"
                  type="text"
                  placeholder="Search by city ID or zone ID..."
                  class="w-full px-3 py-2 text-sm border rounded-md bg-background"
                >
                <div class="flex gap-2">
                  <input
                    v-model.number="zonesStore.filterRow"
                    type="number"
                    placeholder="Row"
                    class="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                  >
                  <input
                    v-model.number="zonesStore.filterCol"
                    type="number"
                    placeholder="Col"
                    class="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Map Area -->
      <div class="flex-1 bg-muted/20 flex items-center justify-center">
        <div class="text-center space-y-4">
          <div class="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mx-auto">
            <MapPin class="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 class="text-lg font-medium mb-2">
              Map Coming Soon
            </h3>
            <p class="text-muted-foreground max-w-md">
              Interactive map visualization will be implemented here.
              Currently showing {{ zonesStore.totalCount }} zones from your uploaded data.
            </p>
          </div>

          <div class="flex items-center justify-center gap-4">
            <Button @click="goBack">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button variant="outline">
              <Layers class="w-4 h-4 mr-2" />
              View Zones List
            </Button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Map view specific styles */
</style>
