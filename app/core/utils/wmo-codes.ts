export interface WmoInfo {
  label: string
  labelFr: string
  icon: string // emoji fallback, will be replaced by animated SVG
  severity: "clear" | "cloudy" | "rain" | "storm" | "snow" | "fog"
}

export const WMO_CODES: Record<number, WmoInfo> = {
  0: { label: "Clear sky", labelFr: "Ciel dégagé", icon: "☀️", severity: "clear" },
  1: { label: "Mainly clear", labelFr: "Peu nuageux", icon: "🌤️", severity: "clear" },
  2: { label: "Partly cloudy", labelFr: "Partiellement nuageux", icon: "⛅", severity: "cloudy" },
  3: { label: "Overcast", labelFr: "Couvert", icon: "☁️", severity: "cloudy" },
  45: { label: "Foggy", labelFr: "Brouillard", icon: "🌫️", severity: "fog" },
  48: { label: "Icy fog", labelFr: "Brouillard givrant", icon: "🌫️", severity: "fog" },
  51: { label: "Light drizzle", labelFr: "Bruine légère", icon: "🌦️", severity: "rain" },
  53: { label: "Moderate drizzle", labelFr: "Bruine modérée", icon: "🌦️", severity: "rain" },
  55: { label: "Dense drizzle", labelFr: "Bruine dense", icon: "🌧️", severity: "rain" },
  61: { label: "Slight rain", labelFr: "Pluie légère", icon: "🌧️", severity: "rain" },
  63: { label: "Moderate rain", labelFr: "Pluie modérée", icon: "🌧️", severity: "rain" },
  65: { label: "Heavy rain", labelFr: "Pluie forte", icon: "🌧️", severity: "rain" },
  71: { label: "Slight snow", labelFr: "Neige légère", icon: "🌨️", severity: "snow" },
  73: { label: "Moderate snow", labelFr: "Neige modérée", icon: "❄️", severity: "snow" },
  75: { label: "Heavy snow", labelFr: "Neige forte", icon: "❄️", severity: "snow" },
  77: { label: "Snow grains", labelFr: "Grésil", icon: "🌨️", severity: "snow" },
  80: { label: "Slight showers", labelFr: "Averses légères", icon: "🌦️", severity: "rain" },
  81: { label: "Moderate showers", labelFr: "Averses modérées", icon: "🌧️", severity: "rain" },
  82: { label: "Violent showers", labelFr: "Averses violentes", icon: "🌧️", severity: "rain" },
  85: { label: "Slight snow showers", labelFr: "Averses de neige légères", icon: "🌨️", severity: "snow" },
  86: { label: "Heavy snow showers", labelFr: "Averses de neige fortes", icon: "❄️", severity: "snow" },
  95: { label: "Thunderstorm", labelFr: "Orage", icon: "⛈️", severity: "storm" },
  96: { label: "Thunderstorm with hail", labelFr: "Orage avec grêle", icon: "⛈️", severity: "storm" },
  99: { label: "Thunderstorm with heavy hail", labelFr: "Orage avec forte grêle", icon: "⛈️", severity: "storm" },
}

export function getWmoInfo(code: number): WmoInfo {
  return WMO_CODES[code] ?? { label: "Unknown", labelFr: "Inconnu", icon: "🌡️", severity: "cloudy" }
}

export type WeatherSeverity = WmoInfo["severity"]

export const SEVERITY_GRADIENTS: Record<WeatherSeverity, { day: string; night: string }> = {
  clear: {
    day: "from-sky-400 via-blue-300 to-blue-200",
    night: "from-indigo-950 via-blue-950 to-slate-900",
  },
  cloudy: {
    day: "from-slate-400 via-gray-300 to-zinc-200",
    night: "from-slate-800 via-gray-900 to-zinc-900",
  },
  rain: {
    day: "from-slate-600 via-blue-700 to-slate-500",
    night: "from-slate-900 via-blue-950 to-slate-800",
  },
  storm: {
    day: "from-gray-800 via-slate-700 to-gray-600",
    night: "from-gray-950 via-slate-900 to-gray-800",
  },
  snow: {
    day: "from-blue-100 via-slate-200 to-white",
    night: "from-slate-800 via-blue-900 to-slate-700",
  },
  fog: {
    day: "from-gray-300 via-slate-300 to-gray-200",
    night: "from-gray-800 via-slate-800 to-gray-700",
  },
}