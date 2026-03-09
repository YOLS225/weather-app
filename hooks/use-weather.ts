"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchWeather, type WeatherData } from "@/app/core/services/weather.service"
import { useWeatherStore } from "@/app/core/stores/weather.store"

interface UseWeatherResult {
  data: WeatherData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useWeather(): UseWeatherResult {
  const { activeCity, temperatureUnit, windUnit } = useWeatherStore()
  const [data, setData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!activeCity) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchWeather({
        lat: activeCity.latitude,
        lon: activeCity.longitude,
        temperatureUnit,
        windSpeedUnit: windUnit,
        timezone: activeCity.timezone ?? "auto",
      })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement.")
    } finally {
      setIsLoading(false)
    }
  }, [activeCity?.id, temperatureUnit, windUnit]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load()
  }, [load])

  return { data, isLoading, error, refetch: load }
}
