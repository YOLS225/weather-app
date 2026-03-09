"use client"

import { useState } from "react"
import { ChevronDown, Droplets } from "lucide-react"
import type { WeatherData } from "@/core/services/weather.service"
import { getWmoInfo } from "@/core/utils/wmo-codes"
import { round } from "@/core/utils/weather-helpers"
import { useWeatherStore } from "@/core/stores/weather.store"
import { HourlyForecast } from "@/features/dashboard/components/hourly-forecast"
import { cn } from "@/lib/utils"

interface DailyForecastProps {
  data: WeatherData
}

function formatDay(dateStr: string, index: number): string {
  if (index === 0) return "Aujourd'hui"
  if (index === 1) return "Demain"
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "short" }).format(
    new Date(dateStr + "T12:00"),
  )
}

function TempBar({ min, max, globalMin, globalMax }: { min: number; max: number; globalMin: number; globalMax: number }) {
  const range = globalMax - globalMin || 1
  const left = ((min - globalMin) / range) * 100
  const width = ((max - min) / range) * 100

  return (
    <div className="relative h-1.5 w-24 rounded-full bg-muted overflow-hidden">
      <div
        className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-orange-400"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  )
}

export function DailyForecast({ data }: DailyForecastProps) {
  const { temperatureUnit } = useWeatherStore()
  const [expanded, setExpanded] = useState<number | null>(null)

  const { daily } = data
  const unitSymbol = temperatureUnit === "celsius" ? "°" : "°F"

  const globalMin = Math.min(...daily.temperature_2m_min)
  const globalMax = Math.max(...daily.temperature_2m_max)

  return (
    <section className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Prévisions 16 jours
        </h2>
      </div>

      <div className="divide-y">
        {daily.time.map((dateStr, i) => {
          const wmo = getWmoInfo(daily.weather_code[i])
          const tMin = round(daily.temperature_2m_min[i])
          const tMax = round(daily.temperature_2m_max[i])
          const rain = daily.precipitation_probability_max[i] ?? 0
          const canExpand = i < 3
          const isExpanded = expanded === i

          return (
            <div key={dateStr}>
              {/* Row */}
              <div
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5",
                  canExpand && "cursor-pointer hover:bg-accent/40 transition-colors",
                  i === 0 && "font-medium",
                )}
                onClick={() => canExpand && setExpanded(isExpanded ? null : i)}
              >
                {/* Day */}
                <span className="w-28 shrink-0 text-sm capitalize">{formatDay(dateStr, i)}</span>

                {/* Icon */}
                <span className="text-xl shrink-0">{wmo.icon}</span>

                {/* Description */}
                <span className="hidden sm:block flex-1 text-sm text-muted-foreground truncate">
                  {wmo.labelFr}
                </span>

                {/* Rain */}
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs text-primary w-12 shrink-0",
                    rain === 0 && "opacity-0",
                  )}
                >
                  <Droplets className="size-3" />
                  {rain}%
                </div>

                {/* Temp range */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-sm text-muted-foreground w-8 text-right">{tMin}{unitSymbol}</span>
                  <TempBar min={tMin} max={tMax} globalMin={globalMin} globalMax={globalMax} />
                  <span className="text-sm font-medium w-8">{tMax}{unitSymbol}</span>
                </div>

                {/* Expand chevron */}
                {canExpand && (
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
                      isExpanded && "rotate-180",
                    )}
                  />
                )}
              </div>

              {/* Expanded hourly detail */}
              {canExpand && isExpanded && (
                <div className="border-t bg-muted/30 px-3 py-3">
                  <HourlyForecast data={data} dayOffset={i} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
