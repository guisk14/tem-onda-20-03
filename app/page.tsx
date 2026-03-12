"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import useSWR from "swr"
import { BEACH_DATA } from "@/lib/beach-data"
import type { Beach } from "@/lib/beach-data"
import { fetchForecast, type ForecastData } from "@/lib/surf-utils"
import { Topbar } from "@/components/topbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { BeachSelector } from "@/components/beach-selector"
import { ForecastCards } from "@/components/forecast-cards"
import { WaveChart } from "@/components/wave-chart"
import { ForecastTables } from "@/components/forecast-tables"
import { TideTable } from "@/components/tide-table"
import { SurfMap } from "@/components/surf-map"
import { Loader2 } from "lucide-react"

function getBeach(cityId: string, beachId: string): Beach {
  const city = BEACH_DATA.find((c) => c.cityId === cityId) ?? BEACH_DATA[0]
  return city.beaches.find((b) => b.id === beachId) ?? city.beaches[0]
}

function getCityName(cityId: string): string {
  const city = BEACH_DATA.find((c) => c.cityId === cityId) ?? BEACH_DATA[0]
  return city.cityName
}

export default function HomePage() {
  const [cityId, setCityId] = useState(BEACH_DATA[0].cityId)
  const [beachId, setBeachId] = useState(BEACH_DATA[0].beaches[0].id)

  const beach = useMemo(() => getBeach(cityId, beachId), [cityId, beachId])
  const cityName = useMemo(() => getCityName(cityId), [cityId])

  const fetcher = useCallback(() => fetchForecast(beach), [beach])

  const { data, isLoading, error } = useSWR<ForecastData>(
    `forecast-${beach.id}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const handleCityChange = useCallback(
    (newCityId: string) => {
      setCityId(newCityId)
      const city = BEACH_DATA.find((c) => c.cityId === newCityId) ?? BEACH_DATA[0]
      setBeachId(city.beaches[0].id)
    },
    []
  )

  const handleBeachChange = useCallback((newBeachId: string) => {
    setBeachId(newBeachId)
  }, [])

  return (
    <div className="min-h-screen bg-background" style={{ background: "radial-gradient(circle at top center, #1f1f22, #121214)" }}>
      <Topbar />

      <HeroSection />

      <div id="forecast-content" className="mx-auto flex max-w-[1440px] flex-col gap-6 p-6 lg:flex-row lg:p-8">
        {/* Left panel */}
        <div className="flex flex-1 flex-col gap-5 lg:max-w-[55%]">
          <BeachSelector
            selectedCityId={cityId}
            selectedBeachId={beachId}
            onCityChange={handleCityChange}
            onBeachChange={handleBeachChange}
          />

          <ForecastCards data={data ?? null} loading={isLoading} />

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              Erro ao carregar dados. Verifique sua conexao e tente novamente.
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Buscando dados da API...</span>
            </div>
          )}

          <WaveChart data={data?.chartData ?? []} />

          <ForecastTables
            data={data ?? null}
            beachName={beach.name}
            loading={isLoading}
          />

          <TideTable lat={beach.lat} />

          <SurfMap beach={beach} cityName={cityName} data={data ?? null} />

          <p className="text-center text-sm font-semibold text-primary">
            {isLoading ? "Aguardando atualizacao..." : data ? "Atualizado" : "Aguardando atualizacao..."}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
