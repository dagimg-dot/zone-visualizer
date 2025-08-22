export interface ZoneRecord {
  col: number
  row: number
  created_at?: string
  updated_at?: string
  boundary: PolygonGeoJSON // GeoJSON Polygon with lon/lat order
  center: PointGeoJSON // GeoJSON Point with lon/lat order
  city_id: string
  id: string
}

export interface PointGeoJSON {
  type: 'Point'
  crs?: { type: 'name', properties: { name: string } }
  coordinates: [number, number] // [lon, lat]
}

export interface PolygonGeoJSON {
  type: 'Polygon'
  crs?: { type: 'name', properties: { name: string } }
  coordinates: [[[number, number]]] // rings of [lon, lat]
}
