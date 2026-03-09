"use client"

import { useState } from "react"
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
} from "recharts"
import { useWeather } from "@/hooks/use-weather"
import { useCityWeather } from "@/hooks/use-city-weather"
import { useWeatherStore } from "@/core/stores/weather.store"
import type { WeatherData } from "@/core/services/weather.service"
import type { GeocodingResult } from "@/core/services/geocoding.service"
import { ComparatorSearch } from "@/features/charts/components/comparator-search"
import { round } from "@/core/utils/weather-helpers"
import { cn } from "@/lib/utils"

// ---- Types ----

type Period = "1j" | "3j" | "7j" | "14j"

interface DayPoint {
  label: string
  tMax: number; tMin: number
  precipitation: number
  wind: number
  tMax2?: number; tMin2?: number
  precipitation2?: number
  wind2?: number
}

interface HourPoint {
  label: string
  temp: number
  precipitation: number
  wind: number
  temp2?: number
  precipitation2?: number
  wind2?: number
}

// ---- Data builders ----

function formatDayLabel(dateStr: string, i: number, timezone: string): string {
  if (i === 0) return "Auj."
  if (i === 1) return "Dem."
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
  }).format(new Date(dateStr + "T12:00"))
}

function getCurrentHourIdx(times: string[], timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false,
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  const str = `${get("year")}-${get("month")}-${get("day")}T${get("hour").padStart(2, "0")}`
  const idx = times.findIndex((t) => t.startsWith(str))
  return idx >= 0 ? idx : 0
}

function formatHourLabel(timeStr: string, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(timeStr + ":00"))
}

function buildDailyPoints(data: WeatherData, days: number, data2?: WeatherData | null): DayPoint[] {
  return data.daily.time.slice(0, days).map((date, i) => ({
    label: formatDayLabel(date, i, data.timezone),
    tMax: round(data.daily.temperature_2m_max[i]),
    tMin: round(data.daily.temperature_2m_min[i]),
    precipitation: Math.round(data.daily.precipitation_sum[i] * 10) / 10,
    wind: round(data.daily.wind_speed_10m_max[i]),
    ...(data2 && i < data2.daily.time.length ? {
      tMax2: round(data2.daily.temperature_2m_max[i]),
      tMin2: round(data2.daily.temperature_2m_min[i]),
      precipitation2: Math.round(data2.daily.precipitation_sum[i] * 10) / 10,
      wind2: round(data2.daily.wind_speed_10m_max[i]),
    } : {}),
  }))
}

function buildHourlyPoints(data: WeatherData, data2?: WeatherData | null): HourPoint[] {
  const idx = getCurrentHourIdx(data.hourly.time, data.timezone)
  const idx2 = data2 ? getCurrentHourIdx(data2.hourly.time, data2.timezone) : 0

  return data.hourly.time.slice(idx, idx + 24).map((time, i) => ({
    label: formatHourLabel(time, data.timezone),
    temp: round(data.hourly.temperature_2m[idx + i]),
    precipitation: Math.round((data.hourly.precipitation[idx + i] ?? 0) * 10) / 10,
    wind: round(data.hourly.wind_speed_10m[idx + i]),
    ...(data2 && idx2 + i < data2.hourly.time.length ? {
      temp2: round(data2.hourly.temperature_2m[idx2 + i]),
      precipitation2: Math.round((data2.hourly.precipitation[idx2 + i] ?? 0) * 10) / 10,
      wind2: round(data2.hourly.wind_speed_10m[idx2 + i]),
    } : {}),
  }))
}

// ---- Custom tooltip ----

function ChartTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active?: boolean
    label?: string
    payload?: Array<{ name: string; value: number; color: string; unit?: string }>
  }
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-popover shadow-lg px-3 py-2.5 text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-medium ml-auto pl-3">{p.value}{p.unit ?? ""}</span>
        </div>
      ))}
    </div>
  )
}

// ---- Period selector ----

const PERIODS: Period[] = ["1j", "3j", "7j", "14j"]

function PeriodSelector({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex rounded-xl border overflow-hidden text-xs font-medium">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "px-4 py-2 transition-colors",
            value === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

// ---- Chart wrapper ----

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ---- Main view ----

export function ChartsView() {
  const [period, setPeriod] = useState<Period>("7j")
  const [city2, setCity2] = useState<GeocodingResult | null>(null)

  const { activeCity, temperatureUnit, windUnit } = useWeatherStore()
  const { data: data1, isLoading: loading1 } = useWeather()
  const { data: data2, isLoading: loading2 } = useCityWeather(
    city2 ?? { id: -1, name: "", latitude: 0, longitude: 0, country: "", country_code: "", timezone: "auto", elevation: 0 }
  )

  const tempUnit = temperatureUnit === "celsius" ? "°C" : "°F"
  const wUnit = windUnit === "kmh" ? " km/h" : " mph"
  const isHourly = period === "1j"
  const days = period === "3j" ? 3 : period === "7j" ? 7 : 14

  const effectiveData2 = city2 ? data2 : null
  const points: (DayPoint | HourPoint)[] = data1
    ? isHourly
      ? buildHourlyPoints(data1, effectiveData2)
      : buildDailyPoints(data1, days, effectiveData2)
    : []

  const city1Label = activeCity?.name ?? "Ville 1"
  const city2Label = city2?.name ?? "Ville 2"

  const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" }
  const gridProps = { stroke: "hsl(var(--border))", strokeDasharray: "3 3" }

  if (!activeCity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
        Sélectionnez une ville pour afficher les graphiques.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Graphiques</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Analyse météo sur {period}</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Comparateur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-2.5">
          <span className="text-primary text-sm font-medium">⬤</span>
          <span className="text-sm font-medium">{city1Label}</span>
          {activeCity?.country && <span className="text-xs text-muted-foreground">{activeCity.country}</span>}
        </div>
        <ComparatorSearch selectedCity={city2} onSelect={setCity2} />
      </div>

      {(loading1 || (city2 && loading2)) && (
        <div className="text-center text-sm text-muted-foreground py-4">Chargement des données…</div>
      )}

      {data1 && (
        <>
          {/* Temperature */}
          <ChartCard title={`Température (${tempUnit})`}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={points} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} vertical={false} />
                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} unit={tempUnit} />
                <Tooltip content={<ChartTooltip />} />
                {points.length > 0 && (
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                )}
                {isHourly ? (
                  <>
                    <Area type="monotone" dataKey="temp" name={city1Label} stroke="hsl(var(--primary))" fill="url(#tGrad)" strokeWidth={2} dot={false} unit={tempUnit} />
                    {city2 && <Area type="monotone" dataKey="temp2" name={city2Label} stroke="hsl(var(--chart-2))" fill="url(#tGrad2)" strokeWidth={2} dot={false} unit={tempUnit} />}
                  </>
                ) : (
                  <>
                    <Area type="monotone" dataKey="tMax" name={`${city1Label} max`} stroke="hsl(var(--primary))" fill="url(#tGrad)" strokeWidth={2} dot={false} unit={tempUnit} />
                    <Line type="monotone" dataKey="tMin" name={`${city1Label} min`} stroke="hsl(var(--primary))" strokeWidth={1.5} strokeDasharray="4 3" dot={false} unit={tempUnit} />
                    {city2 && <>
                      <Area type="monotone" dataKey="tMax2" name={`${city2Label} max`} stroke="hsl(var(--chart-2))" fill="url(#tGrad2)" strokeWidth={2} dot={false} unit={tempUnit} />
                      <Line type="monotone" dataKey="tMin2" name={`${city2Label} min`} stroke="hsl(var(--chart-2))" strokeWidth={1.5} strokeDasharray="4 3" dot={false} unit={tempUnit} />
                    </>}
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Precipitation */}
          <ChartCard title="Précipitations (mm)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={points} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid {...gridProps} vertical={false} />
                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} unit=" mm" />
                <Tooltip content={<ChartTooltip />} />
                {city2 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                <Bar dataKey={isHourly ? "precipitation" : "precipitation"} name={city1Label} fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} unit=" mm" />
                {city2 && <Bar dataKey={isHourly ? "precipitation2" : "precipitation2"} name={city2Label} fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} unit=" mm" />}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Wind */}
          <ChartCard title={`Vent max (${wUnit.trim()})`}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={points} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} vertical={false} />
                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} unit={wUnit} />
                <Tooltip content={<ChartTooltip />} />
                {city2 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                <Area type="monotone" dataKey="wind" name={city1Label} stroke="hsl(var(--primary))" fill="url(#wGrad)" strokeWidth={2} dot={false} unit={wUnit} />
                {city2 && <Area type="monotone" dataKey="wind2" name={city2Label} stroke="hsl(var(--chart-2))" fill="url(#wGrad2)" strokeWidth={2} dot={false} unit={wUnit} />}
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  )
}