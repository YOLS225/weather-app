"use client"

import { Droplets, Eye, Gauge, Sun, Thermometer, Wind } from "lucide-react"
import type { WeatherData } from "@/app/core/services/weather.service"
import {
  windDegToCardinal,
  formatVisibility,
  formatPressureTrend,
  uvIndexLabel,
  round,
} from "@/app/core/utils/weather-helpers"
import { useWeatherStore } from "@/app/core/stores/weather.store"
import { cn } from "@/lib/utils"

interface DetailWidgetsProps {
  data: WeatherData
}

export function DetailWidgets({ data }: DetailWidgetsProps) {
  const { temperatureUnit } = useWeatherStore()
  const cur = data.current
  const today = {
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
  }
  const unitSymbol = temperatureUnit === "celsius" ? "°C" : "°F"

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* Lever / Coucher soleil */}
      <SunWidget sunrise={today.sunrise} sunset={today.sunset} timezone={data.timezone} />

      {/* Vent */}
      <Widget icon={<Wind className="size-4" />} title="Vent">
        <p className="text-2xl font-bold">
          {round(cur.wind_speed_10m)}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {data.current_units.wind_speed_10m}
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Direction {windDegToCardinal(cur.wind_direction_10m)} · Rafales{" "}
          {round(cur.wind_gusts_10m)} {data.current_units.wind_gusts_10m}
        </p>
      </Widget>

      {/* Pression */}
      <Widget icon={<Gauge className="size-4" />} title="Pression">
        <p className="text-2xl font-bold">
          {round(cur.surface_pressure)}
          <span className="text-sm font-normal text-muted-foreground ml-1">hPa</span>
          <span className="text-lg ml-1">{formatPressureTrend(cur.surface_pressure)}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {cur.surface_pressure > 1013 ? "Anticyclone" : cur.surface_pressure < 1000 ? "Dépression" : "Stable"}
        </p>
      </Widget>

      {/* Humidité */}
      <Widget icon={<Droplets className="size-4" />} title="Humidité">
        <p className="text-2xl font-bold">{cur.relative_humidity_2m}%</p>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-sky-400 transition-all"
            style={{ width: `${cur.relative_humidity_2m}%` }}
          />
        </div>
      </Widget>

      {/* UV */}
      <Widget icon={<Sun className="size-4" />} title="Indice UV">
        <UvWidget uv={data.daily.uv_index_max[0]} />
      </Widget>

      {/* Visibilité */}
      <Widget icon={<Eye className="size-4" />} title="Visibilité">
        <p className="text-2xl font-bold">{formatVisibility(cur.visibility)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Nuages {cur.cloud_cover}%
        </p>
      </Widget>

      {/* Ressenti */}
      <Widget icon={<Thermometer className="size-4" />} title="Ressenti">
        <p className="text-2xl font-bold">
          {round(cur.apparent_temperature)}{unitSymbol}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Réel {round(cur.temperature_2m)}{unitSymbol}
        </p>
      </Widget>
    </div>
  )
}

// --- Sub-components ---

function Widget({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border bg-card p-4", className)}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
      </div>
      {children}
    </div>
  )
}

function SunWidget({ sunrise, sunset, timezone }: { sunrise: string; sunset: string; timezone: string }) {
  function fmt(iso: string) {
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso))
  }

  // Arc progress (0–1) based on current time
  const now = Date.now()
  const riseMs = new Date(sunrise).getTime()
  const setMs = new Date(sunset).getTime()
  const progress = Math.max(0, Math.min(1, (now - riseMs) / (setMs - riseMs)))

  // SVG arc params
  const r = 36
  const cx = 56
  const cy = 52
  const startAngle = -180
  const endAngle = 0
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const arcX = (a: number) => cx + r * Math.cos(toRad(a))
  const arcY = (a: number) => cy + r * Math.sin(toRad(a))
  const sunAngle = startAngle + progress * (endAngle - startAngle)

  return (
    <Widget icon={<Sun className="size-4" />} title="Lever / Coucher" className="col-span-1">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Lever</p>
          <p className="text-lg font-bold">{fmt(sunrise)}</p>
        </div>
        {/* Mini arc */}
        <svg width="112" height="56" className="shrink-0 -mb-1">
          {/* Track */}
          <path
            d={`M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 0 1 ${arcX(endAngle)} ${arcY(endAngle)}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Progress */}
          <path
            d={`M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 0 1 ${arcX(sunAngle)} ${arcY(sunAngle)}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Sun dot */}
          <circle cx={arcX(sunAngle)} cy={arcY(sunAngle)} r="5" fill="#f59e0b" />
        </svg>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Coucher</p>
          <p className="text-lg font-bold">{fmt(sunset)}</p>
        </div>
      </div>
    </Widget>
  )
}

const UV_STEPS = [
  { max: 2, label: "Faible", color: "#22c55e" },
  { max: 5, label: "Modéré", color: "#eab308" },
  { max: 7, label: "Élevé", color: "#f97316" },
  { max: 10, label: "Très élevé", color: "#ef4444" },
  { max: 12, label: "Extrême", color: "#a855f7" },
]

function UvWidget({ uv }: { uv: number }) {
  const { label, color } = uvIndexLabel(uv)
  const pct = Math.min((uv / 12) * 100, 100)

  return (
    <>
      <p className="text-2xl font-bold" style={{ color }}>
        {uv}
        <span className="text-sm font-normal text-muted-foreground ml-2">{label}</span>
      </p>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden flex">
        {UV_STEPS.map((s) => (
          <div
            key={s.max}
            className="flex-1 h-full"
            style={{ background: s.color, opacity: uv <= s.max ? 0.25 : 1 }}
          />
        ))}
      </div>
      <div
        className="mt-1 w-1 h-2 rounded-full"
        style={{ marginLeft: `calc(${pct}% - 2px)`, background: color }}
      />
    </>
  )
}
