import type { ZoneRecord } from '@/types/zones'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { generateColorPalette } from '@/utils/color'
import { processZoneRecords } from '@/utils/geo'

export const useZonesStore = defineStore('zones', () => {
  // State
  const zones = ref<ZoneRecord[]>([])
  const selectedZoneId = ref<string | null>(null)
  const filterText = ref('')
  const filterRow = ref<number | null>(null)
  const filterCol = ref<number | null>(null)

  // Getters
  const validZones = computed(() => zones.value)

  const filteredZones = computed(() => {
    let filtered = zones.value

    if (filterText.value) {
      const search = filterText.value.toLowerCase()
      filtered = filtered.filter(zone =>
        zone.city_id.toLowerCase().includes(search)
        || zone.id.toLowerCase().includes(search),
      )
    }

    if (filterRow.value !== null) {
      filtered = filtered.filter(zone => zone.row === filterRow.value)
    }

    if (filterCol.value !== null) {
      filtered = filtered.filter(zone => zone.col === filterCol.value)
    }

    return filtered
  })

  const uniqueCityIds = computed(() =>
    [...new Set(zones.value.map(zone => zone.city_id))],
  )

  const colorByCityId = computed(() =>
    generateColorPalette(uniqueCityIds.value),
  )

  const totalCount = computed(() => zones.value.length)
  const filteredCount = computed(() => filteredZones.value.length)

  // Actions
  function loadFromFile(file: File): Promise<{ success: boolean, message: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const parsed = JSON.parse(text)

          // Handle both array and { data: array } formats
          const data = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.data) ? parsed.data : null

          if (!Array.isArray(data)) {
            resolve({ success: false, message: 'Invalid format. Expected an array or { data: [] }.' })
            return
          }

          const { valid, invalid } = processZoneRecords(data)
          zones.value = valid

          if (invalid.length > 0) {
            resolve({
              success: true,
              message: `Loaded ${valid.length} valid zones. ${invalid.length} invalid records skipped.`,
            })
          }
          else {
            resolve({
              success: true,
              message: `Successfully loaded ${valid.length} zones.`,
            })
          }
        }
        catch {
          resolve({ success: false, message: 'Failed to parse JSON file.' })
        }
      }

      reader.onerror = () => {
        resolve({ success: false, message: 'Failed to read file.' })
      }

      reader.readAsText(file)
    })
  }

  function selectZone(zoneId: string | null) {
    selectedZoneId.value = zoneId
  }

  function setFilter(text: string) {
    filterText.value = text
  }

  function setRowFilter(row: number | null) {
    filterRow.value = row
  }

  function setColFilter(col: number | null) {
    filterCol.value = col
  }

  function clearFilters() {
    filterText.value = ''
    filterRow.value = null
    filterCol.value = null
  }

  function clearZones() {
    zones.value = []
    selectedZoneId.value = null
    clearFilters()
  }

  return {
    // State
    zones,
    selectedZoneId,
    filterText,
    filterRow,
    filterCol,

    // Getters
    validZones,
    filteredZones,
    uniqueCityIds,
    colorByCityId,
    totalCount,
    filteredCount,

    // Actions
    loadFromFile,
    selectZone,
    setFilter,
    setRowFilter,
    setColFilter,
    clearFilters,
    clearZones,
  }
})
