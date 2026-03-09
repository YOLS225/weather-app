export const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1"
export const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1"

export const WEATHER_PARAMS = {
  current: [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "surface_pressure",
    "visibility",
    "cloud_cover",
    "uv_index",
    "is_day",
  ],

  hourly: [
    "temperature_2m",
    "apparent_temperature",
    "precipitation_probability",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
    "wind_direction_10m",
    "visibility",
    "uv_index",
    "is_day",
  ],

  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "wind_gusts_10m_max",
    "wind_direction_10m_dominant",
    "sunshine_duration",
  ],
} as const

export const QUERY_KEYS = {
  weather: (lat: number, lon: number) => ["weather", lat, lon] as const,
  geocoding: (query: string) => ["geocoding", query] as const,
} as const
