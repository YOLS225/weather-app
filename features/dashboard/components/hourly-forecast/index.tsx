"use client"

import { useRef, useState } from "react"
import { Droplets } from "lucide-react"
import type { WeatherData } from "@/core/services/weather.service"
import { getWmoInfo } from "@/core/utils/wmo-codes"
import { round } from "@/core/utils/weather-helpers"
import { WeatherIcon } from "@/core/components/widgets/weather-icon"
import { useWeatherStore } from "@/core/stores/weather.store"
import { TempChart } from "./chart"
import { cn } from "@/lib/utils"

interface HourlyForecastProps {
  data: WeatherData
  /** 0 = today (default), 1 = tomorrow, 2 = day after */
  dayOffset?: number
}

function getCurrentHourIndex(times: string[], timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date())

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const hour = get("hour").padStart(2, "0")
  const currentStr = `${get("year")}-${get("month")}-${get("day")}T${hour}`

  const idx = times.findIndex((t) => t.startsWith(currentStr))
  return idx >= 0 ? idx : 0
}

function getDayStartIndex(times: string[], timezone: string, dayOffset: number): number {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date) // "YYYY-MM-DD"

  const idx = times.findIndex((t) => t.startsWith(dateStr))
  return idx >= 0 ? idx : 0
}

function formatHour(timeStr: string, timezone: string): string {
  const date = new Date(timeStr + ":00")
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

type HourRange = 24 | 48

export function HourlyForecast({ data, dayOffset = 0 }: HourlyForecastProps) {
  const { temperatureUnit } = useWeatherStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState<HourRange>(24)

  const { hourly, timezone } = data
  const unitSymbol = temperatureUnit === "celsius" ? "°C" : "°F"
  const isEmbedded = dayOffset > 0

  // Start index: current hour for today, day start for other days
  const startIdx = isEmbedded
    ? getDayStartIndex(hourly.time, timezone, dayOffset)
    : getCurrentHourIndex(hourly.time, timezone)

  const currentHourIdx = isEmbedded ? -1 : startIdx
  const endIdx = Math.min(startIdx + (isEmbedded ? 24 : range), hourly.time.length)
  const slice = hourly.time.slice(startIdx, endIdx)

  const chartPoints = slice.map((time, i) => ({
    hour: formatHour(time, timezone),
    temp: round(hourly.temperature_2m[startIdx + i]),
    isCurrent: startIdx + i === currentHourIdx,
  }))

  const wrapper = isEmbedded ? "rounded-xl overflow-hidden" : "rounded-2xl border bg-card overflow-hidden"

  return (
    <section className={wrapper}>
      {/* Header — only shown when standalone */}
      {!isEmbedded && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Prévisions horaires
          </h2>
          <div className="flex rounded-lg border overflow-hidden text-xs font-medium">
            {([24, 48] as HourRange[]).map((h) => (
              <button
                key={h}
                onClick={() => setRange(h)}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  range === h
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mini chart */}
      <div className="px-2">
        <TempChart points={chartPoints} unitSymbol={unitSymbol} />
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 pb-4 pt-2"
        style={{ scrollbarWidth: "none" }}
      >
        {slice.map((time, i) => {
          const idx = startIdx + i
          const wmo = getWmoInfo(hourly.weather_code[idx])
          const temp = round(hourly.temperature_2m[idx])
          const rain = hourly.precipitation_probability[idx] ?? 0
          const hour = formatHour(time, timezone)
          const isCurrent = !isEmbedded && i === 0

          return (
            <div
              key={time}
              className={cn(
                "flex-none flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 min-w-[62px]",
                "border transition-colors",
                isCurrent
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background hover:bg-accent border-border",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  isCurrent ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {isCurrent ? "Maintenant" : hour}
              </span>
              <WeatherIcon severity={wmo.severity} isDay={hourly.is_day[idx] === 1} size={28} />
              <span className={cn("text-sm font-bold", isCurrent && "text-primary-foreground")}>
                {temp}°
              </span>
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs",
                  isCurrent ? "text-primary-foreground/70" : "text-muted-foreground",
                  rain === 0 && "opacity-0",
                )}
              >
                <Droplets className="size-3" />
                <span>{rain}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
