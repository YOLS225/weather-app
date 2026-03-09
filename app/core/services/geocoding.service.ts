import { apiFetch } from "@/app/core/utils/api-fetch"
import { GEOCODING_BASE_URL } from "@/app/core/utils/constants"

export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  country_code: string
  admin1?: string // region/state
  timezone: string
  elevation: number
  population?: number
}

interface GeocodingResponse {
  results?: GeocodingResult[]
}

export async function searchCities(query: string, count = 8): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return []

  const data = await apiFetch<GeocodingResponse>(`${GEOCODING_BASE_URL}/search`, {
    params: { name: query, count, language: "fr", format: "json" },
  })

  return data.results ?? []
}