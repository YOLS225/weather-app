"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GeocodingResult } from "@/app/core/services/geocoding.service"

export interface SavedCity extends GeocodingResult {
  isPinned?: boolean
}

export type TemperatureUnit = "celsius" | "fahrenheit"
export type WindUnit = "kmh" | "mph"
export type PressureUnit = "hPa" | "mmHg"

interface WeatherState {
  // Ville active
  activeCity: GeocodingResult | null
  setActiveCity: (city: GeocodingResult) => void

  // Favoris
  savedCities: SavedCity[]
  addCity: (city: GeocodingResult) => void
  removeCity: (id: number) => void
  pinCity: (id: number) => void
  reorderCities: (cities: SavedCity[]) => void

  // Unités
  temperatureUnit: TemperatureUnit
  windUnit: WindUnit
  pressureUnit: PressureUnit
  setTemperatureUnit: (unit: TemperatureUnit) => void
  setWindUnit: (unit: WindUnit) => void
  setPressureUnit: (unit: PressureUnit) => void

  // UI
  isLoading: boolean
  error: string | null
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      // Ville active
      activeCity: null,
      setActiveCity: (city) => set({ activeCity: city, error: null }),

      // Favoris
      savedCities: [],
      addCity: (city) =>
        set((state) => {
          if (state.savedCities.some((c) => c.id === city.id)) return state
          return { savedCities: [...state.savedCities, city] }
        }),
      removeCity: (id) =>
        set((state) => ({ savedCities: state.savedCities.filter((c) => c.id !== id) })),
      pinCity: (id) =>
        set((state) => ({
          savedCities: state.savedCities.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c,
          ),
        })),
      reorderCities: (cities) => set({ savedCities: cities }),

      // Unités
      temperatureUnit: "celsius",
      windUnit: "kmh",
      pressureUnit: "hPa",
      setTemperatureUnit: (temperatureUnit) => set({ temperatureUnit }),
      setWindUnit: (windUnit) => set({ windUnit }),
      setPressureUnit: (pressureUnit) => set({ pressureUnit }),

      // UI
      isLoading: false,
      error: null,
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "nimbus-weather-store",
      partialize: (state) => ({
        activeCity: state.activeCity,
        savedCities: state.savedCities,
        temperatureUnit: state.temperatureUnit,
        windUnit: state.windUnit,
        pressureUnit: state.pressureUnit,
      }),
    },
  ),
)
