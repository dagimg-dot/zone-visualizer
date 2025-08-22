import type { PointGeoJSON, PolygonGeoJSON, ZoneRecord } from '@/types/zones'

/**
 * Convert GeoJSON [lon, lat] coordinates to Leaflet [lat, lng] format
 */
export function swapCoordinates(coords: [number, number]): [number, number] {
  return [coords[1], coords[0]] // [lat, lng]
}

/**
 * Convert GeoJSON coordinates array to Leaflet format for MapView component
 */
export function convertGeoJSONToLeaflet(coords: [number, number][]): [number, number][] {
  return coords.map(coord => swapCoordinates(coord))
}

/**
 * Convert polygon coordinates from GeoJSON to Leaflet format
 */
export function convertPolygonCoordinates(polygon: PolygonGeoJSON): number[][][] {
  return polygon.coordinates.map(ring =>
    ring.map(coord => swapCoordinates(coord)),
  )
}

/**
 * Convert point coordinates from GeoJSON to Leaflet format
 */
export function convertPointCoordinates(point: PointGeoJSON): [number, number] {
  return swapCoordinates(point.coordinates)
}

/**
 * Ensure polygon outer ring is closed (first == last)
 */
export function closePolygonRing(coordinates: number[][][]): number[][][] {
  return coordinates.map((ring) => {
    if (ring.length > 0 && ring[0] !== ring[ring.length - 1]) {
      return [...ring, ring[0]]
    }
    return ring
  })
}

/**
 * Validate coordinate ranges
 */
export function validateCoordinates(coords: [number, number]): boolean {
  const [lon, lat] = coords
  return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90
}

/**
 * Process and validate zone records
 */
export function processZoneRecords(records: ZoneRecord[]): {
  valid: ZoneRecord[]
  invalid: { record: ZoneRecord, reason: string }[]
} {
  const valid: ZoneRecord[] = []
  const invalid: { record: ZoneRecord, reason: string }[] = []

  for (const record of records) {
    try {
      // Validate boundary coordinates
      const boundaryValid = record.boundary.coordinates.every(ring =>
        ring.every(validateCoordinates),
      )

      // Validate center coordinates
      const centerValid = validateCoordinates(record.center.coordinates)

      if (!boundaryValid || !centerValid) {
        invalid.push({ record, reason: 'Invalid coordinates' })
        continue
      }

      // Ensure polygon is closed - create a new record with closed coordinates
      const processedRecord = {
        ...record,
        boundary: {
          ...record.boundary,
          coordinates: closePolygonRing(record.boundary.coordinates) as [[[number, number]]],
        },
      }

      valid.push(processedRecord)
    }
    catch {
      invalid.push({ record, reason: 'Processing error' })
    }
  }

  return { valid, invalid }
}
