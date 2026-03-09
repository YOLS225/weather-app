import type { GeocodingResult } from "@/app/core/services/geocoding.service"

export interface GeolocationCoords {
  lat: number
  lon: number
}

interface NominatimResult {
  address: {
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country?: string
    country_code?: string
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
    { headers: { "User-Agent": "Nimbus Weather App" } },
  )
  if (!res.ok) throw new Error("Reverse geocoding failed")

  const data = (await res.json()) as NominatimResult
  const addr = data.address
  const name = addr.city ?? addr.town ?? addr.village ?? addr.county ?? "Ma position"

  return {
    id: Math.round(lat * 1000 + lon * 1000),
    name,
    latitude: lat,
    longitude: lon,
    country: addr.country ?? "",
    country_code: addr.country_code?.toUpperCase() ?? "",
    admin1: addr.state,
    timezone: "auto",
    elevation: 0,
  }
}

export function getCurrentPosition(): Promise<GeolocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas supportée par ce navigateur."))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        const messages: Record<number, string> = {
          1: "Accès à la géolocalisation refusé.",
          2: "Position indisponible.",
          3: "La requête de géolocalisation a expiré.",
        }
        reject(new Error(messages[err.code] ?? "Erreur de géolocalisation."))
      },
      { timeout: 8000, maximumAge: 60_000 },
    )
  })
}