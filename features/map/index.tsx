"use client"

import dynamic from "next/dynamic"

// Leaflet ne fonctionne pas en SSR — chargement dynamique côté client uniquement
const WeatherMap = dynamic(
  () => import("@/features/map/components/weather-map").then((m) => m.WeatherMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-2xl border bg-muted animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Chargement de la carte…</p>
      </div>
    ),
  },
)

export function MapView() {
  return (
    <div className="h-[calc(100vh-5rem)]">
      <WeatherMap />
    </div>
  )
}