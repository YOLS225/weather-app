export function windDegToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]
  return dirs[Math.round(deg / 45) % 8]
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(0)} km`
  return `${meters} m`
}

export function formatPressureTrend(hPa: number): "↗" | "→" | "↘" {
  if (hPa > 1013) return "↗"
  if (hPa < 1000) return "↘"
  return "→"
}

export function uvIndexLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Faible", color: "text-green-500" }
  if (uv <= 5) return { label: "Modéré", color: "text-yellow-500" }
  if (uv <= 7) return { label: "Élevé", color: "text-orange-500" }
  if (uv <= 10) return { label: "Très élevé", color: "text-red-500" }
  return { label: "Extrême", color: "text-purple-500" }
}

export function formatLocalTime(timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date())
}

export function formatLocalDate(timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())
}

export function round(n: number): number {
  return Math.round(n)
}
