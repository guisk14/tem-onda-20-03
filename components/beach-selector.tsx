"use client"

import { BEACH_DATA } from "@/lib/beach-data"
import type { City, Beach } from "@/lib/beach-data"
import { MapPin } from "lucide-react"

interface BeachSelectorProps {
  selectedCityId: string
  selectedBeachId: string
  onCityChange: (cityId: string) => void
  onBeachChange: (beachId: string) => void
}

export function BeachSelector({
  selectedCityId,
  selectedBeachId,
  onCityChange,
  onBeachChange,
}: BeachSelectorProps) {
  const selectedCity = BEACH_DATA.find((c) => c.cityId === selectedCityId) ?? BEACH_DATA[0]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Selecionar Pico
        </h2>
      </div>
      <div className="flex gap-2 md:gap-3">
        <select
          value={selectedCityId}
          onChange={(e) => onCityChange(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-border bg-secondary px-2 py-2 text-xs md:px-3 md:py-2.5 md:text-sm font-semibold text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
        >
          {BEACH_DATA.map((city) => (
            <option key={city.cityId} value={city.cityId}>
              {city.cityName}
            </option>
          ))}
        </select>
        <select
          value={selectedBeachId}
          onChange={(e) => onBeachChange(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-border bg-secondary px-2 py-2 text-xs md:px-3 md:py-2.5 md:text-sm font-semibold text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
        >
          {selectedCity.beaches.map((beach) => (
            <option key={beach.id} value={beach.id}>
              {beach.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
