"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Loader2, MapPin } from "lucide-react"
import { useWeather } from "@/hooks/use-weather"
import { useWeatherStore } from "@/core/stores/weather.store"
import { getCurrentPosition, reverseGeocode } from "@/core/services/geolocation.service"
import { Hero } from "@/features/dashboard/components/hero"
import { HeroSkeleton } from "@/features/dashboard/components/hero/skeleton"
import { HourlyForecast } from "@/features/dashboard/components/hourly-forecast"
import { DailyForecast } from "@/features/dashboard/components/daily-forecast"
import { DetailWidgets } from "@/features/dashboard/components/detail-widgets"

export function Dashboard() {
  const { activeCity, setActiveCity } = useWeatherStore()
  const { data, isLoading, error, refetch } = useWeather()
  const [isGeolocating, setIsGeolocating] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Auto-géoloc à chaque démarrage de l'app
  useEffect(() => {
    setIsGeolocating(true)
    setGeoError(null)

    getCurrentPosition()
      .then((coords) => reverseGeocode(coords.lat, coords.lon))
      .then((city) => setActiveCity(city))
      .catch((err: unknown) => {
        setGeoError(err instanceof Error ? err.message : "Géolocalisation impossible.")
      })
      .finally(() => setIsGeolocating(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Géoloc en cours (premier chargement)
  if (isGeolocating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <Loader2 className="size-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Détection de votre position…</p>
      </div>
    )
  }

  // Aucune ville + erreur géoloc (permission refusée, etc.)
  if (!activeCity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="size-9 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Bienvenue sur Nimbus</h2>
          {geoError ? (
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">{geoError}</p>
          ) : null}
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Recherchez une ville ou activez la géolocalisation.
          </p>
        </div>
      </div>
    )
  }

  // Erreur API météo
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="size-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
          <AlertCircle className="size-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Erreur de chargement</h2>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      {isLoading || !data ? (
        <HeroSkeleton />
      ) : (
        <Hero data={data} city={activeCity} onRefetch={refetch} />
      )}

      {data && <HourlyForecast data={data} />}
      {data && <DailyForecast data={data} />}
      {data && <DetailWidgets data={data} />}
    </div>
  )
}
