"use client"

import { useState, useEffect } from "react"
import { fetchWeather, type WeatherData } from "@/core/services/weather.service"
import { useWeatherStore } from "@/core/stores/weather.store"
import type { GeocodingResult } from "@/core/services/geocoding.service"

interface UseCityWeatherResult {
  data: WeatherData | null
  isLoading: boolean
  error: boolean
}

export function useCityWeather(city: GeocodingResult): UseCityWeatherResult {
  const { temperatureUnit, windUnit } = useWeatherStore()
  const [data, setData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(false)

    fetchWeather({
      lat: city.latitude,
      lon: city.longitude,
      temperatureUnit,
      windSpeedUnit: windUnit,
      timezone: city.timezone ?? "auto",
    })
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [city.id, temperatureUnit, windUnit]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, error }
}
