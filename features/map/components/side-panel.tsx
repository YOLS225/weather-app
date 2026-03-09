"use client"

import { X, Wind, Droplets, Eye, Thermometer, Loader2 } from "lucide-react"
import type { WeatherData } from "@/core/services/weather.service"
import type { GeocodingResult } from "@/core/services/geocoding.service"
import { getWmoInfo } from "@/core/utils/wmo-codes"
import { windDegToCardinal, formatVisibility, round } from "@/core/utils/weather-helpers"
import { useWeatherStore } from "@/core/stores/weather.store"
import { WeatherIcon } from "@/core/components/widgets/weather-icon"
import { cn } from "@/lib/utils"

interface SidePanelProps {
  city: GeocodingResult | null
  data: WeatherData | null
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
  onSetActive: () => void
}

export function SidePanel({ city, data, isLoading, isOpen, onClose, onSetActive }: SidePanelProps) {
  const { temperatureUnit } = useWeatherStore()
  const unitSymbol = temperatureUnit === "celsius" ? "°C" : "°F"

  const cur = data?.current
  const wmo = cur ? getWmoInfo(cur.weather_code) : null

  return (
    <div className={cn(
      "absolute top-4 right-4 z-[1000] w-80 rounded-2xl border bg-background/95 backdrop-blur-md shadow-xl transition-all duration-300",
      isOpen ? "translate-x-0 opacity-100" : "translate-x-[110%] opacity-0 pointer-events-none",
    )}>
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b">
        <div>
          {city ? (
            <>
              <h3 className="font-semibold">{city.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Cliquez sur la carte</p>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors">
          <X className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && !data && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Cliquez n'importe où sur la carte pour voir la météo locale.
          </p>
        )}

        {!isLoading && cur && wmo && (
          <div className="space-y-4">
            {/* Main temp + icon */}
            <div className="flex items-center gap-3">
              <WeatherIcon severity={wmo.severity} isDay={cur.is_day === 1} size={52} />
              <div>
                <p className="text-3xl font-bold">{round(cur.temperature_2m)}{unitSymbol}</p>
                <p className="text-sm text-muted-foreground">{wmo.labelFr}</p>
                <p className="text-xs text-muted-foreground">Ressenti {round(cur.apparent_temperature)}{unitSymbol}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              <StatItem icon={<Droplets className="size-3.5" />} label="Humidité" value={`${cur.relative_humidity_2m}%`} />
              <StatItem icon={<Wind className="size-3.5" />} label="Vent" value={`${round(cur.wind_speed_10m)} ${data?.current_units.wind_speed_10m ?? "km/h"} ${windDegToCardinal(cur.wind_direction_10m)}`} />
              <StatItem icon={<Eye className="size-3.5" />} label="Visibilité" value={formatVisibility(cur.visibility)} />
              <StatItem icon={<Thermometer className="size-3.5" />} label="Pression" value={`${round(cur.surface_pressure)} hPa`} />
            </div>

            {/* Min/max today */}
            {data?.daily && (
              <div className="flex justify-between text-sm rounded-xl bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">Aujourd'hui</span>
                <span>
                  <span className="text-muted-foreground">{round(data.daily.temperature_2m_min[0])}</span>
                  <span className="mx-1 text-muted-foreground">/</span>
                  <span className="font-medium">{round(data.daily.temperature_2m_max[0])}{unitSymbol}</span>
                </span>
              </div>
            )}

            {/* Set as active */}
            <button
              onClick={onSetActive}
              className="w-full rounded-xl bg-primary text-primary-foreground text-sm font-medium py-2 hover:bg-primary/90 transition-colors"
            >
              Voir la météo complète
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}