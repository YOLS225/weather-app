"use client"

import { useState } from "react"
import { GripVertical, Pin, PinOff, Star, Trash2 } from "lucide-react"
import { useCityWeather } from "@/hooks/use-city-weather"
import { useWeatherStore, type SavedCity } from "@/core/stores/weather.store"
import { getWmoInfo } from "@/core/utils/wmo-codes"
import { formatLocalTime, round } from "@/core/utils/weather-helpers"
import { cn } from "@/lib/utils"

interface CityCardProps {
  city: SavedCity
  isDragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function CityCard({ city, isDragging, dragHandleProps }: CityCardProps) {
  const { removeCity, pinCity, setActiveCity } = useWeatherStore()
  const { data, isLoading, error } = useCityWeather(city)
  const [hovered, setHovered] = useState(false)

  const cur = data?.current
  const today = data?.daily
  const wmo = cur ? getWmoInfo(cur.weather_code) : null
  const isDay = cur?.is_day === 1
  const time = data ? formatLocalTime(data.timezone) : "--:--"
  const tMin = today ? round(today.temperature_2m_min[0]) : null
  const tMax = today ? round(today.temperature_2m_max[0]) : null
  const unitSymbol = data?.current_units.temperature_2m?.replace("°C", "°").replace("°F", "°F") ?? "°"

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card overflow-hidden transition-all duration-200",
        isDragging && "shadow-2xl scale-[1.02] opacity-90 z-50",
        !isDragging && "hover:shadow-md hover:-translate-y-0.5",
        city.isPinned && "ring-2 ring-primary/40",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute top-3 left-3 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-opacity opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="size-4" />
      </div>

      {/* Pin badge */}
      {city.isPinned && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
          <Star className="size-3 fill-primary text-primary" />
          <span className="text-[10px] font-medium text-primary">Principal</span>
        </div>
      )}

      {/* Card body — clickable to select city */}
      <button
        className="w-full text-left p-5 pt-8"
        onClick={() => setActiveCity(city)}
      >
        {/* City name + time */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-base leading-tight">{city.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
            </p>
          </div>
          <span className="text-sm font-mono text-muted-foreground tabular-nums shrink-0">{time}</span>
        </div>

        {/* Weather */}
        {isLoading && (
          <div className="animate-pulse space-y-2">
            <div className="h-10 w-24 rounded-lg bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        )}

        {error && (
          <p className="text-xs text-muted-foreground">Données indisponibles</p>
        )}

        {!isLoading && !error && cur && wmo && (
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-start gap-1">
                <span className="text-4xl font-bold leading-none">
                  {round(cur.temperature_2m)}{unitSymbol}
                </span>
                <span className="text-3xl mt-0.5">{wmo.icon}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5">{wmo.labelFr}</p>
            </div>
            {tMin !== null && tMax !== null && (
              <div className="text-right text-sm">
                <span className="font-medium">{tMax}°</span>
                <span className="text-muted-foreground mx-1">/</span>
                <span className="text-muted-foreground">{tMin}°</span>
              </div>
            )}
          </div>
        )}
      </button>

      {/* Action bar — visible on hover */}
      <div
        className={cn(
          "flex items-center gap-1 px-4 pb-3 transition-all duration-150",
          hovered ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <button
          onClick={() => pinCity(city.id)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title={city.isPinned ? "Désépingler" : "Épingler comme ville principale"}
        >
          {city.isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
          {city.isPinned ? "Désépingler" : "Épingler"}
        </button>
        <button
          onClick={() => removeCity(city.id)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-auto"
          title="Supprimer"
        >
          <Trash2 className="size-3.5" />
          Supprimer
        </button>
      </div>
    </div>
  )
}
