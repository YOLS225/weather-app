"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { searchCities, type GeocodingResult } from "@/core/services/geocoding.service"
import { getCurrentPosition, reverseGeocode } from "@/core/services/geolocation.service"
import { useWeatherStore } from "@/core/stores/weather.store"
import { cn } from "@/lib/utils"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { setActiveCity, setError } = useWeatherStore()

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const cities = await searchCities(query)
        setResults(cities)
        setIsOpen(true)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function handleSelect(city: GeocodingResult) {
    setActiveCity(city)
    setQuery("")
    setIsOpen(false)
    setResults([])
  }

  async function handleGeolocate() {
    setIsGeolocating(true)
    try {
      const { lat, lon } = await getCurrentPosition()
      const city = await reverseGeocode(lat, lon)
      setActiveCity(city)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de géolocalisation")
    } finally {
      setIsGeolocating(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une ville..."
          className={cn(
            "w-full pl-9 pr-10 py-2 text-sm rounded-lg border bg-background",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "placeholder:text-muted-foreground",
          )}
        />
        <button
          onClick={handleGeolocate}
          disabled={isGeolocating}
          className="absolute right-2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Utiliser ma position"
        >
          {isGeolocating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MapPin className="size-4" />
          )}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 w-full rounded-lg border bg-popover shadow-lg z-50 overflow-hidden">
          {isSearching && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Recherche...
            </div>
          )}
          {!isSearching && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat.</div>
          )}
          {results.map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className="w-full flex items-start gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            >
              <MapPin className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <span className="font-medium">{city.name}</span>
                <span className="text-muted-foreground ml-1">
                  {city.admin1 ? `${city.admin1}, ` : ""}
                  {city.country}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
