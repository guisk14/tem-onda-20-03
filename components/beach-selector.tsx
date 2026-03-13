"use client"

import { useState, useRef, useEffect } from "react"
import { BEACH_DATA } from "@/lib/beach-data"
import type { Beach } from "@/lib/beach-data"
import { Search, MapPin } from "lucide-react"

interface BeachSelectorProps {
  selectedCityId: string
  selectedBeachId: string
  onCityChange: (cityId: string) => void
  onBeachChange: (beachId: string) => void
}

// Flatten all beaches with city info for search
const allBeaches = BEACH_DATA.flatMap((city) =>
  city.beaches.map((beach) => ({
    ...beach,
    cityId: city.cityId,
    cityName: city.cityName,
    fullName: `${beach.name}, ${city.cityName}`,
  }))
)

export function BeachSelector({
  selectedCityId,
  selectedBeachId,
  onCityChange,
  onBeachChange,
}: BeachSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Get current selected beach for display
  const selectedBeach = allBeaches.find(
    (b) => b.id === selectedBeachId && b.cityId === selectedCityId
  )

  // Filter beaches based on search query
  const filteredBeaches = searchQuery.trim()
    ? allBeaches.filter(
        (beach) =>
          beach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          beach.cityName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBeaches

  // Handle beach selection
  const handleSelect = (beach: typeof allBeaches[0]) => {
    onCityChange(beach.cityId)
    onBeachChange(beach.id)
    setSearchQuery("")
    setIsOpen(false)
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredBeaches.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredBeaches.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (filteredBeaches[highlightedIndex]) {
          handleSelect(filteredBeaches[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSearchQuery("")
        break
    }
  }

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Selecionar Pico
        </h2>
      </div>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Selecionar Pico"
            className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-xl"
          >
            {filteredBeaches.length > 0 ? (
              filteredBeaches.map((beach, index) => (
                <li
                  key={`${beach.cityId}-${beach.id}`}
                  onClick={() => handleSelect(beach)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground hover:bg-secondary"
                  } ${
                    beach.id === selectedBeachId && beach.cityId === selectedCityId
                      ? "border-l-2 border-l-primary"
                      : ""
                  }`}
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{beach.name}</span>
                    <span className="text-xs text-muted-foreground">{beach.cityName}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                Nenhuma praia encontrada
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
