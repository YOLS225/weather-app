"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, MapPin, Plus, Search } from "lucide-react"
import { useWeatherStore, type SavedCity } from "@/core/stores/weather.store"
import { searchCities, type GeocodingResult } from "@/core/services/geocoding.service"
import { CityCard } from "@/features/favorites/components/city-card"
import { cn } from "@/lib/utils"

export function FavoritesView() {
  const { savedCities, reorderCities, activeCity, addCity } = useWeatherStore()
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const dragOver = useRef<number | null>(null)

  const activeCityAlreadySaved = activeCity && savedCities.some((c) => c.id === activeCity.id)

  function handleDragStart(id: number) {
    setDraggingId(id)
  }

  function handleDragEnter(id: number) {
    dragOver.current = id
  }

  function handleDragEnd() {
    if (draggingId === null || dragOver.current === null || draggingId === dragOver.current) {
      setDraggingId(null)
      dragOver.current = null
      return
    }

    const next = [...savedCities]
    const fromIdx = next.findIndex((c) => c.id === draggingId)
    const toIdx = next.findIndex((c) => c.id === dragOver.current)
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    reorderCities(next)

    setDraggingId(null)
    dragOver.current = null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Favoris</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {savedCities.length} ville{savedCities.length !== 1 ? "s" : ""} sauvegardée{savedCities.length !== 1 ? "s" : ""}
          </p>
        </div>
        {activeCity && !activeCityAlreadySaved && (
          <button
            onClick={() => addCity(activeCity)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Plus className="size-4" />
            Ajouter {activeCity.name}
          </button>
        )}
      </div>

      {/* Add city search */}
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Ajouter une ville
        </p>
        <SearchBarAddMode onAdd={addCity} />
      </div>

      {/* Empty state */}
      {savedCities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Aucun favori</p>
            <p className="text-muted-foreground text-sm mt-1">
              Recherchez une ville ci-dessus pour l'ajouter.
            </p>
          </div>
        </div>
      )}

      {/* Cities grid */}
      {savedCities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedCities.map((city) => (
            <div
              key={city.id}
              draggable
              onDragStart={() => handleDragStart(city.id)}
              onDragEnter={() => handleDragEnter(city.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <CityCard city={city} isDragging={draggingId === city.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Inline search bar for adding cities to favorites ----

function SearchBarAddMode({ onAdd }: { onAdd: (city: GeocodingResult) => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); setIsOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        setResults(await searchCities(query))
        setIsOpen(true)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function handleSelect(city: GeocodingResult) {
    onAdd(city)
    setQuery("")
    setIsOpen(false)
    setResults([])
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher et ajouter une ville..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full rounded-lg border bg-popover shadow-lg z-50 overflow-hidden">
          {results.length === 0 && !isSearching && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat.</div>
          )}
          {results.map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            >
              <Plus className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{city.name}</span>
              <span className="text-muted-foreground text-xs">
                {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
