"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Plus, Search, X } from "lucide-react"
import { searchCities, type GeocodingResult } from "@/core/services/geocoding.service"
import { cn } from "@/lib/utils"

interface ComparatorSearchProps {
  selectedCity: GeocodingResult | null
  onSelect: (city: GeocodingResult | null) => void
}

export function ComparatorSearch({ selectedCity, onSelect }: ComparatorSearchProps) {
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
      try { setResults(await searchCities(query)); setIsOpen(true) }
      finally { setIsSearching(false) }
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

  if (selectedCity) {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5">
        <span className="text-sm font-medium text-chart-2">⬤</span>
        <span className="text-sm font-medium">{selectedCity.name}</span>
        <span className="text-xs text-muted-foreground">{selectedCity.country}</span>
        <button onClick={() => onSelect(null)} className="ml-auto text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative flex items-center">
        <Plus className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Comparer avec une ville..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        {isSearching && <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-xl border bg-popover shadow-lg z-50 overflow-hidden">
          {results.map((city) => (
            <button
              key={city.id}
              onClick={() => { onSelect(city); setQuery(""); setIsOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            >
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{city.name}</span>
              <span className="text-muted-foreground text-xs">{city.admin1 ? `${city.admin1}, ` : ""}{city.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}