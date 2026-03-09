import { apiFetch } from "@/core/utils/api-fetch"
import { OPEN_METEO_BASE_URL, WEATHER_PARAMS } from "@/core/utils/constants"

// --- Types ---

export interface CurrentWeather {
  time: string
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  precipitation: number
  weather_code: number
  wind_speed_10m: number
  wind_direction_10m: number
  wind_gusts_10m: number
  surface_pressure: number
  visibility: number
  cloud_cover: number
  uv_index: number
  is_day: number
}

export interface HourlyWeather {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  precipitation_probability: number[]
  precipitation: number[]
  weather_code: number[]
  wind_speed_10m: number[]
  wind_direction_10m: number[]
  visibility: number[]
  uv_index: number[]
  is_day: number[]
}

export interface DailyWeather {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  apparent_temperature_max: number[]
  apparent_temperature_min: number[]
  sunrise: string[]
  sunset: string[]
  uv_index_max: number[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
  wind_speed_10m_max: number[]
  wind_gusts_10m_max: number[]
  wind_direction_10m_dominant: number[]
  sunshine_duration: number[]
}

export interface WeatherData {
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current: CurrentWeather
  current_units: Record<string, string>
  hourly: HourlyWeather
  hourly_units: Record<string, string>
  daily: DailyWeather
  daily_units: Record<string, string>
}

// --- Service ---

export interface WeatherFetchOptions {
  lat: number
  lon: number
  temperatureUnit?: "celsius" | "fahrenheit"
  windSpeedUnit?: "kmh" | "mph" | "ms"
  precipitationUnit?: "mm" | "inch"
  timezone?: string
}

export async function fetchWeather({
  lat,
  lon,
  temperatureUnit = "celsius",
  windSpeedUnit = "kmh",
  precipitationUnit = "mm",
  timezone = "auto",
}: WeatherFetchOptions): Promise<WeatherData> {
  return apiFetch<WeatherData>(`${OPEN_METEO_BASE_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      current: WEATHER_PARAMS.current,
      hourly: WEATHER_PARAMS.hourly,
      daily: WEATHER_PARAMS.daily,
      temperature_unit: temperatureUnit,
      wind_speed_unit: windSpeedUnit,
      precipitation_unit: precipitationUnit,
      timezone,
      forecast_days: 16,
    },
  })
}