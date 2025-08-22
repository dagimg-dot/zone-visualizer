import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useZonesStore } from '@/stores/zones'

export function requireZones(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const zonesStore = useZonesStore()

  if (!zonesStore.hasZones) {
    // Redirect to home with query parameter to show notification
    next({
      path: '/',
      query: {
        message: 'You need to upload a JSON file to access the map view.',
        type: 'warning',
      },
    })
  }
  else {
    next()
  }
}
