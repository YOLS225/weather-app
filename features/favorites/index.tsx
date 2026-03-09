"use client"

import {useRef, useState } from "react"
import {MapPin, Plus} from "lucide-react"
import { useWeatherStore} from "@/core/stores/weather.store"
import {
  CityCard,
  SearchBarAddMode,
} from "@/features/favorites/components/favorite.common"

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
              {"Recherchez une ville ci-dessus pour l'ajouter."}
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


