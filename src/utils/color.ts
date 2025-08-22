/**
 * Generate a consistent color from a string (city_id) using FNV-1a hash
 */
export function hashString(str: string): number {
  let hash = 0x811C9DC5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return hash >>> 0
}

/**
 * Convert hash to HSL color with fixed saturation and lightness
 */
export function hashToColor(str: string, saturation = 70, lightness = 50): string {
  const hash = hashString(str)
  const hue = hash % 360
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Generate a color palette for multiple city IDs
 */
export function generateColorPalette(cityIds: string[]): Map<string, string> {
  const colorMap = new Map<string, string>()

  cityIds.forEach((cityId, index) => {
    // Vary saturation and lightness slightly for better distinction
    const saturation = 65 + (index % 20)
    const lightness = 45 + (index % 20)
    colorMap.set(cityId, hashToColor(cityId, saturation, lightness))
  })

  return colorMap
}
