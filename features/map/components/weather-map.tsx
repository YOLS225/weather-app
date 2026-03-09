"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, LayerGroup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { GeocodingResult } from "@/core/services/geocoding.service"
import type { WeatherData } from "@/core/services/weather.service"
import { fetchWeather } from "@/core/services/weather.service"
import { reverseGeocode } from "@/core/services/geolocation.service"
import { useWeatherStore } from "@/core/stores/weather.store"
import { getWmoInfo } from "@/core/utils/wmo-codes"
import { round } from "@/core/utils/weather-helpers"
import { SidePanel } from "./side-panel"
import { cn } from "@/lib/utils"

// Fix Leaflet default icon in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Weather marker as divIcon
function createWeatherIcon(temp: number, icon: string, isActive = false) {
  return L.divIcon({
    className: "",
    html: `<div style="
      display:flex;flex-direction:column;align-items:center;gap:2px;
      background:${isActive ? "hsl(var(--primary))" : "hsl(var(--background))"};
      color:${isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"};
      border:2px solid ${isActive ? "hsl(var(--primary))" : "hsl(var(--border))"};
      border-radius:12px;padding:4px 8px;font-size:11px;font-weight:600;
      box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;
    ">
      <span style="font-size:16px;line-height:1">${icon}</span>
      <span>${temp}°</span>
    </div>`,
    iconSize: [54, 48],
    iconAnchor: [27, 48],
  })
}

type Layer = "none" | "precipitation"

interface RainViewerFrame {
  time: number
  path: string
}

// ---- Click handler component ----
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) })
  return null
}

// ---- Fly-to active city ----
function FlyToCity({ city }: { city: GeocodingResult | null }) {
  const map = useMap()
  useEffect(() => {
    if (city) map.flyTo([city.latitude, city.longitude], 10, { duration: 1.2 })
  }, [city?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// ---- Layer selector ----
function LayerSelector({ active, onChange }: { active: Layer; onChange: (l: Layer) => void }) {
  const layers: { value: Layer; label: string; emoji: string }[] = [
    { value: "none", label: "Carte", emoji: "🗺️" },
    { value: "precipitation", label: "Précipitations", emoji: "🌧️" },
  ]
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 rounded-2xl border bg-background/95 backdrop-blur-md shadow-lg p-1.5">
      {layers.map((l) => (
        <button
          key={l.value}
          onClick={() => onChange(l.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
            active === l.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <span>{l.emoji}</span>
          {l.label}
        </button>
      ))}
    </div>
  )
}

// ---- Main map ----
export function WeatherMap() {
  const { activeCity, savedCities, setActiveCity, temperatureUnit, windUnit } = useWeatherStore()
  const [layer, setLayer] = useState<Layer>("none")
  const [radarUrl, setRadarUrl] = useState<string | null>(null)
  const [clickedCity, setClickedCity] = useState<GeocodingResult | null>(null)
  const [clickedData, setClickedData] = useState<WeatherData | null>(null)
  const [isPanelLoading, setIsPanelLoading] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [cityWeather, setCityWeather] = useState<Map<number, WeatherData>>(new Map())

  const center: [number, number] = activeCity
    ? [activeCity.latitude, activeCity.longitude]
    : [46.5, 2.5] // Centre France par défaut

  // Fetch RainViewer radar tiles
  useEffect(() => {
    if (layer !== "precipitation") { setRadarUrl(null); return }
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((d: { radar?: { past?: RainViewerFrame[] } }) => {
        const frames = d?.radar?.past ?? []
        if (frames.length > 0) {
          const latest = frames[frames.length - 1]
          setRadarUrl(`https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`)
        }
      })
      .catch(() => {})
  }, [layer])

  // Fetch weather for all saved cities + active city
  useEffect(() => {
    const cities = [...savedCities]
    if (activeCity && !cities.find((c) => c.id === activeCity.id)) cities.push(activeCity)

    cities.forEach((city) => {
      if (cityWeather.has(city.id)) return
      fetchWeather({
        lat: city.latitude, lon: city.longitude,
        temperatureUnit, windSpeedUnit: windUnit, timezone: city.timezone ?? "auto",
      }).then((data) => {
        setCityWeather((prev) => new Map(prev).set(city.id, data))
      }).catch(() => {})
    })
  }, [activeCity?.id, savedCities.length, temperatureUnit, windUnit]) // eslint-disable-line react-hooks/exhaustive-deps

  // Click on map → weather lookup
  async function handleMapClick(lat: number, lng: number) {
    setIsPanelOpen(true)
    setIsPanelLoading(true)
    setClickedData(null)
    try {
      const [city, data] = await Promise.all([
        reverseGeocode(lat, lng),
        fetchWeather({ lat, lon: lng, temperatureUnit, windSpeedUnit: windUnit, timezone: "auto" }),
      ])
      setClickedCity(city)
      setClickedData(data)
    } catch {
      setIsPanelOpen(false)
    } finally {
      setIsPanelLoading(false)
    }
  }

  function handleSetActive() {
    if (clickedCity) { setActiveCity(clickedCity); setIsPanelOpen(false) }
  }

  const allCities = [...savedCities]
  if (activeCity && !allCities.find((c) => c.id === activeCity.id)) allCities.push(activeCity)

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border">
      <MapContainer
        center={center}
        zoom={6}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Base tiles — Carto light/dark */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com">CARTO</a>'
          maxZoom={19}
        />

        {/* Precipitation radar overlay */}
        {layer === "precipitation" && radarUrl && (
          <TileLayer url={radarUrl} opacity={0.65} />
        )}

        {/* City markers */}
        <LayerGroup>
          {allCities.map((city) => {
            const data = cityWeather.get(city.id)
            if (!data) return null
            const wmo = getWmoInfo(data.current.weather_code)
            const temp = round(data.current.temperature_2m)
            const isActive = city.id === activeCity?.id
            return (
              <Marker
                key={city.id}
                position={[city.latitude, city.longitude]}
                icon={createWeatherIcon(temp, wmo.icon, isActive)}
                eventHandlers={{
                  click: () => {
                    setClickedCity(city)
                    setClickedData(data)
                    setIsPanelOpen(true)
                  },
                }}
              />
            )
          })}
        </LayerGroup>

        <MapClickHandler onMapClick={handleMapClick} />
        <FlyToCity city={activeCity} />
      </MapContainer>

      {/* Layer selector */}
      <LayerSelector active={layer} onChange={setLayer} />

      {/* Side panel */}
      <SidePanel
        city={clickedCity}
        data={clickedData}
        isLoading={isPanelLoading}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSetActive={handleSetActive}
      />
    </div>
  )
}