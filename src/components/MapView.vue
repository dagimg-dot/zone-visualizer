<script setup lang="ts">
import type { ZoneRecord } from '@/types/zones'
import { LCircleMarker, LMap, LPolygon, LPopup, LTileLayer, LTooltip } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import { computed, ref, watch } from 'vue'
import { useZonesStore } from '@/stores/zones'
import { convertGeoJSONToLeaflet } from '@/utils/geo'

const zonesStore = useZonesStore()

// Map state
const mapRef = ref()
const selectedZoneId = ref<string | null>(null)

// Computed properties
const filteredZones = computed(() => zonesStore.filteredZones)
const mapBounds = computed(() => {
  if (filteredZones.value.length === 0)
    return null

  const bounds = L.latLngBounds([])
  filteredZones.value.forEach((zone) => {
    const leafletCoords = convertGeoJSONToLeaflet(zone.boundary.coordinates[0])
    leafletCoords.forEach(coord => bounds.extend(coord))
  })
  return bounds
})

// Convert colorByCityId Map to array for template iteration
const colorLegend = computed(() => {
  const colorMap = zonesStore.colorByCityId
  return Array.from(colorMap.entries()).map(([cityId, color]) => ({
    cityId,
    color,
    displayName: cityId.length > 8 ? `${cityId.slice(0, 8)}...` : cityId,
  }))
})

// Map options
const mapOptions = computed(() => {
  if (filteredZones.value.length > 0) {
    // Center on the first zone's center
    const firstZone = filteredZones.value[0]
    const centerCoords = convertGeoJSONToLeaflet([firstZone.center.coordinates])[0]
    return {
      zoom: 10,
      center: centerCoords as [number, number],
      zoomControl: true,
      attributionControl: true,
    }
  }

  // Fallback to default center
  return {
    zoom: 10,
    center: [0, 0] as [number, number],
    zoomControl: true,
    attributionControl: true,
  }
})

// Fit map to bounds when zones change
watch(mapBounds, (newBounds) => {
  if (newBounds && mapRef.value) {
    mapRef.value.leafletObject.fitBounds(newBounds, { padding: [20, 20] })
  }
}, { immediate: true })

// Center map on first zone when zones are loaded
watch(filteredZones, (newZones) => {
  if (newZones.length > 0 && mapRef.value) {
    const firstZone = newZones[0]
    const centerCoords = convertGeoJSONToLeaflet([firstZone.center.coordinates])[0]
    mapRef.value.leafletObject.setView(centerCoords, 10)
  }
}, { immediate: true })

// Handle zone selection
function selectZone(zoneId: string) {
  selectedZoneId.value = zoneId
  zonesStore.selectZone(zoneId)

  // Center map on selected zone
  const selectedZone = filteredZones.value.find(zone => zone.id === zoneId)
  if (selectedZone && mapRef.value) {
    const centerCoords = convertGeoJSONToLeaflet([selectedZone.center.coordinates])[0]
    mapRef.value.leafletObject.setView(centerCoords, 12, { animate: true })
  }
}

// Handle zone hover
function onZoneMouseOver(_zone: ZoneRecord) {
  // Highlight the zone (we'll implement this with CSS)
}

function onZoneMouseOut(_zone: ZoneRecord) {
  // Remove highlight
}

// Get zone color
function getZoneColor(zone: ZoneRecord) {
  const colorMap = zonesStore.colorByCityId
  return colorMap.get(zone.city_id) || '#666'
}

// Get zone popup content
function getZonePopupContent(zone: ZoneRecord) {
  const boundaryCoords = zone.boundary.coordinates[0]
  const centerCoords = zone.center.coordinates

  // Format coordinates for display
  const formatCoordinate = (coord: [number, number]) => `${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}`

  // Get boundary corners (first 4 points, excluding the closing point)
  const corners = boundaryCoords.slice(0, 4)

  return `
    <div class="zone-popup p-4">
      <h3 class="font-semibold mb-3 text-lg">Zone Details</h3>
      
      <div class="space-y-3">
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="font-medium">ID:</span>
            <span class="text-muted-foreground">${zone.id}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="font-medium">City ID:</span>
            <span class="text-muted-foreground">${zone.city_id}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="font-medium">Row:</span>
            <span class="text-muted-foreground">${zone.row}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="font-medium">Col:</span>
            <span class="text-muted-foreground">${zone.col}</span>
          </div>
          ${zone.created_at
            ? `
          <div class="flex justify-between text-sm">
            <span class="font-medium">Created:</span>
            <span class="text-muted-foreground">${new Date(zone.created_at).toLocaleDateString()}</span>
          </div>
          `
            : ''}
        </div>
        
        <div class="border-t pt-3">
          <h4 class="font-medium mb-2 text-sm">Center Coordinates</h4>
          <div class="bg-muted/50 p-2 rounded text-xs font-mono">
            ${formatCoordinate(centerCoords)}
          </div>
          <button 
            class="copy-btn mt-2 w-full px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            data-coords="${centerCoords.join(',')}"
            onclick="navigator.clipboard.writeText('${centerCoords.join(',')}').then(() => this.textContent='Copied!').then(() => setTimeout(() => this.textContent='Copy', 1000))"
          >
            Copy Coordinates
          </button>
        </div>
        
        <div class="border-t pt-3">
          <h4 class="font-medium mb-2 text-sm">Boundary Corners</h4>
          <div class="space-y-2">
            ${corners.map((coord, index) => `
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Corner ${index + 1}:</span>
                <div class="flex items-center gap-2">
                  <span class="bg-muted/50 px-2 py-1 rounded text-xs font-mono">
                    ${formatCoordinate(coord)}
                  </span>
                  <button 
                    class="copy-btn px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
                    data-coords="${coord.join(',')}"
                    onclick="navigator.clipboard.writeText('${coord.join(',')}').then(() => this.textContent='Copied!').then(() => setTimeout(() => this.textContent='Copy', 1000))"
                  >
                    Copy
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="mt-3 pt-3 border-t">
            <button 
              class="copy-btn w-full px-3 py-2 text-sm bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
              onclick="navigator.clipboard.writeText('${corners.map(coord => coord.join(',')).join('\\n')}').then(() => this.textContent='All Copied!').then(() => setTimeout(() => this.textContent='Copy All Corners', 1000))"
            >
              Copy All Corners
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

// Get center marker popup content (simplified)
function getCenterPopupContent(zone: ZoneRecord) {
  const centerCoords = zone.center.coordinates
  const formatCoordinate = (coord: [number, number]) => `${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}`

  return `
    <div class="center-popup">
      <h3 class="font-semibold mb-2 text-base">Zone Center</h3>
      
      <div class="space-y-2">
        <div class="text-sm">
          <span class="font-medium">Zone:</span> ${zone.id}
        </div>
        <div class="text-sm">
          <span class="font-medium">Position:</span> ${zone.row}, ${zone.col}
        </div>
        
        <div class="border-t pt-2">
          <h4 class="font-medium mb-2 text-sm">Coordinates</h4>
          <div class="bg-muted/50 p-2 rounded text-xs font-mono mb-2">
            ${formatCoordinate(centerCoords)}
          </div>
          <button 
            class="copy-btn w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            data-coords="${centerCoords.join(',')}"
            onclick="navigator.clipboard.writeText('${centerCoords.join(',')}').then(() => this.textContent='Copied!').then(() => setTimeout(() => this.textContent='Copy Coordinates', 1000))"
          >
            Copy Coordinates
          </button>
        </div>
      </div>
    </div>
  `
}

// Fit map to bounds
function fitBounds() {
  if (mapBounds.value && mapRef.value) {
    mapRef.value.leafletObject.fitBounds(mapBounds.value, { padding: [20, 20] })
  }
}

// Expose methods to parent component
defineExpose({
  fitBounds,
  centerOnData,
  centerOnSelection,
})

// Center map on selected zone
function centerOnSelection() {
  if (selectedZoneId.value && mapRef.value) {
    const selectedZone = filteredZones.value.find(zone => zone.id === selectedZoneId.value)
    if (selectedZone) {
      const centerCoords = convertGeoJSONToLeaflet([selectedZone.center.coordinates])[0]
      mapRef.value.leafletObject.setView(centerCoords, 12, { animate: true })
    }
  }
}

// Center map on data (first zone)
function centerOnData() {
  if (filteredZones.value.length > 0 && mapRef.value) {
    const firstZone = filteredZones.value[0]
    const centerCoords = convertGeoJSONToLeaflet([firstZone.center.coordinates])[0]
    mapRef.value.leafletObject.setView(centerCoords, 10, { animate: true })
  }
}
</script>

<template>
  <div class="w-full h-full relative">
    <!-- Map Container -->
    <LMap
      ref="mapRef"
      v-model:zoom="mapOptions.zoom"
      v-model:center="mapOptions.center"
      :options="mapOptions"
      class="w-full h-full"
    >
      <!-- OpenStreetMap Tiles -->
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        layer-type="base"
        name="OpenStreetMap"
      />

      <!-- Zone Polygons -->
      <LPolygon
        v-for="zone in filteredZones"
        :key="zone.id"
        :lat-lngs="convertGeoJSONToLeaflet(zone.boundary.coordinates[0])"
        :fill-color="getZoneColor(zone)"
        :fill-opacity="0.3"
        :color="getZoneColor(zone)"
        :weight="2"
        :opacity="0.8"
        class="zone-polygon" :class="{ selected: selectedZoneId === zone.id }"
        @click="selectZone(zone.id)"
        @mouseover="onZoneMouseOver(zone)"
        @mouseout="onZoneMouseOut(zone)"
      >
        <LPopup>
          <div v-html="getZonePopupContent(zone)" />
        </LPopup>
        <LTooltip :content="`Zone ${zone.row},${zone.col} - ${zone.city_id.slice(0, 8)}...`" />
      </LPolygon>

      <!-- Center Markers -->
      <LCircleMarker
        v-for="zone in filteredZones"
        :key="`center-${zone.id}`"
        :lat-lng="convertGeoJSONToLeaflet([zone.center.coordinates])[0]"
        :radius="6"
        :fill-color="getZoneColor(zone)"
        :color="getZoneColor(zone)"
        :weight="2"
        :opacity="0.8"
        class="zone-center" :class="{ selected: selectedZoneId === zone.id }"
        @click="selectZone(zone.id)"
      >
        <LPopup>
          <div v-html="getCenterPopupContent(zone)" />
        </LPopup>
        <LTooltip :content="`Center: ${zone.center.coordinates[0].toFixed(4)}, ${zone.center.coordinates[1].toFixed(4)}`" />
      </LCircleMarker>
    </LMap>

    <!-- Map Controls Overlay -->
    <div class="absolute top-4 right-4 z-[1000] space-y-2 space-x-2">
      <button
        class="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Fit to data"
        @click="fitBounds"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      <button
        class="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Center on data"
        @click="centerOnData"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <button
        v-if="selectedZoneId"
        class="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Center on selection"
        @click="centerOnSelection"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 8.965l-2.898-.777M13.95 13.95l-2.898.777M21.761 7.188l-2.897-.777M16.035 5.136l.777-2.898M10.05 10.05l.777 2.897M2.239 21.761l2.898-.777M8.965 16.035l2.897.777M13.95 10.05l2.897-.777M21.761 2.239l-2.897.777M16.035 8.965l-2.898.777M10.05 13.95l-2.897.777" />
        </svg>
      </button>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
      <h3 class="font-semibold mb-3 text-sm">
        City Zones
      </h3>
      <div class="space-y-2">
        <div
          v-for="item in colorLegend"
          :key="item.cityId"
          class="flex items-center gap-2 text-xs"
        >
          <div
            class="w-4 h-4 rounded border border-gray-300"
            :style="{ backgroundColor: item.color, opacity: 0.3 }"
          />
          <span class="truncate">{{ item.displayName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.zone-polygon {
  transition: all 0.2s ease;
}

.zone-polygon:hover {
  fill-opacity: 0.5;
}

.zone-polygon.selected {
  fill-opacity: 0.6;
  opacity: 1;
}

.zone-center {
  transition: all 0.2s ease;
}

.zone-center.selected {
  opacity: 1;
}

/* Leaflet popup customization */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-popup-content) {
  margin: 0;
  min-width: 280px;
  max-width: 320px;
}

:deep(.leaflet-popup-tip) {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-top: none;
  border-left: none;
}

.dark :deep(.leaflet-popup-content-wrapper) {
  background: #1f2937;
  color: #f9fafb;
  border-color: #374151;
}

.dark :deep(.leaflet-popup-tip) {
  background: #1f2937;
  border-color: #374151;
}

.zone-popup {
  font-family: inherit;
  padding: 16px;
}

.center-popup {
  font-family: inherit;
  padding: 16px;
}

.copy-btn {
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.copy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.copy-btn:active {
  transform: translateY(0);
}
</style>
