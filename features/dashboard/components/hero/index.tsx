"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Wind, Droplets, Eye, Thermometer, Star } from "lucide-react"
import type { WeatherData } from "@/core/services/weather.service"
import type { GeocodingResult } from "@/core/services/geocoding.service"
import { getWmoInfo, SEVERITY_GRADIENTS } from "@/core/utils/wmo-codes"
import {
  windDegToCardinal,
  formatVisibility,
  formatLocalTime,
  formatLocalDate,
  round,
} from "@/core/utils/weather-helpers"
import { useWeatherStore } from "@/core/stores/weather.store"
import { WeatherIcon } from "@/core/components/widgets/weather-icon"
import { cn } from "@/lib/utils"

interface HeroProps {
  data: WeatherData
  city: GeocodingResult
  onRefetch: () => void
}

export function Hero({ data, city, onRefetch }: HeroProps) {
  const { temperatureUnit, savedCities, addCity, removeCity } = useWeatherStore()
  const isFavorite = savedCities.some((c) => c.id === city.id)
  const [time, setTime] = useState(() => formatLocalTime(data.timezone))
  const [date, setDate] = useState(() => formatLocalDate(data.timezone))

  // Live clock
  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatLocalTime(data.timezone))
      setDate(formatLocalDate(data.timezone))
    }, 1000)
    return () => clearInterval(id)
  }, [data.timezone])

  const cur = data.current
  const wmo = getWmoInfo(cur.weather_code)
  const isDay = cur.is_day === 1
  const gradients = SEVERITY_GRADIENTS[wmo.severity]
  const gradient = isDay ? gradients.day : gradients.night
  const unitSymbol = temperatureUnit === "celsius" ? "°C" : "°F"
  const windUnit = data.current_units.wind_speed_10m ?? "km/h"

  return (
    <section
      className={cn(
        "relative rounded-2xl overflow-hidden bg-gradient-to-br",
        gradient,
        "transition-all duration-1000",
      )}
    >
      {/* Subtle animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl",
            isDay ? "bg-white" : "bg-indigo-400",
            "animate-pulse",
          )}
        />
        <div
          className={cn(
            "absolute -bottom-20 -left-10 w-64 h-64 rounded-full opacity-15 blur-3xl",
            isDay ? "bg-yellow-200" : "bg-blue-600",
          )}
        />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        {/* Top row: city + time + refresh */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow">
              {city.name}
              {city.admin1 ? `, ${city.admin1}` : ""}
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              {city.country} · {data.timezone_abbreviation}
            </p>
            <p className="text-white/60 text-sm capitalize mt-1">{date}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-lg font-mono tabular-nums">{time}</span>
            <button
              onClick={() => isFavorite ? removeCity(city.id) : addCity(city)}
              className={cn(
                "p-2 rounded-full transition-colors text-white",
                isFavorite ? "bg-yellow-400/30 hover:bg-yellow-400/50" : "bg-white/10 hover:bg-white/20",
              )}
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Star className={cn("size-4", isFavorite && "fill-yellow-300 text-yellow-300")} />
            </button>
            <button
              onClick={onRefetch}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Rafraîchir"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>

        {/* Main: icon + temperature */}
        <div className="flex items-center gap-6 md:gap-10 mb-8">
          {/* Animated weather icon */}
          <div style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.25))" }}>
            <WeatherIcon severity={wmo.severity} isDay={isDay} size={100} />
          </div>

          <div>
            {/* Temperature XXL */}
            <div className="flex items-start">
              <span className="text-7xl md:text-9xl font-bold text-white leading-none drop-shadow-lg tabular-nums">
                {round(cur.temperature_2m)}
              </span>
              <span className="text-3xl md:text-4xl font-light text-white/80 mt-2 ml-1">
                {unitSymbol}
              </span>
            </div>

            {/* Description + apparent */}
            <p className="text-white text-xl font-medium mt-1">{wmo.labelFr}</p>
            <p className="text-white/70 text-sm mt-0.5">
              Ressenti {round(cur.apparent_temperature)}{unitSymbol}
            </p>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickStat
            icon={<Droplets className="size-4" />}
            label="Humidité"
            value={`${cur.relative_humidity_2m} %`}
          />
          <QuickStat
            icon={<Wind className="size-4" />}
            label="Vent"
            value={`${round(cur.wind_speed_10m)} ${windUnit} ${windDegToCardinal(cur.wind_direction_10m)}`}
          />
          <QuickStat
            icon={<Eye className="size-4" />}
            label="Visibilité"
            value={formatVisibility(cur.visibility)}
          />
          <QuickStat
            icon={<Thermometer className="size-4" />}
            label="Ressenti"
            value={`${round(cur.apparent_temperature)}${unitSymbol}`}
          />
        </div>
      </div>
    </section>
  )
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 border border-white/10">
      <span className="text-white/70">{icon}</span>
      <div className="min-w-0">
        <p className="text-white/60 text-xs leading-none mb-1">{label}</p>
        <p className="text-white font-medium text-sm truncate">{value}</p>
      </div>
    </div>
  )
}
