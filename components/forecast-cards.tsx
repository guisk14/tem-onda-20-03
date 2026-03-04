"use client"

import { formatNum, degToCompass } from "@/lib/surf-utils"
import type { ForecastData } from "@/lib/surf-utils"

interface ForecastCardsProps {
  data: ForecastData | null
  loading: boolean
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  )
}

function TimerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3L2 6" />
      <path d="M22 6l-3-3" />
    </svg>
  )
}

function WindIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}

function CardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-[#1e2a3a] p-5 min-h-[140px]">
      <div className="h-6 w-6 rounded-full bg-[#2a3a4e] animate-pulse mb-3" />
      <div className="h-3 w-16 rounded bg-[#2a3a4e] animate-pulse mb-3" />
      <div className="h-7 w-20 rounded bg-[#2a3a4e] animate-pulse mb-2" />
      <div className="h-3 w-10 rounded bg-[#2a3a4e] animate-pulse" />
    </div>
  )
}

export function ForecastCards({ data, loading }: ForecastCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  const windDir = degToCompass(data.currentWindDir)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Altura */}
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[#1e2a3a] p-5 min-h-[140px] transition-all hover:-translate-y-1 hover:bg-[#243345]">
        <WaveIcon className="h-6 w-6 text-[#5b9ec9] mb-2" />
        <span className="text-xs font-medium tracking-wide text-[#8ba4bd] uppercase">
          Altura
        </span>
        <span className="mt-1 text-3xl font-extrabold text-foreground leading-none">
          {formatNum(data.currentHeight, 1)}m
        </span>
      </div>

      {/* Periodo */}
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[#1e2a3a] p-5 min-h-[140px] transition-all hover:-translate-y-1 hover:bg-[#243345]">
        <TimerIcon className="h-6 w-6 text-[#5b9ec9] mb-2" />
        <span className="text-xs font-medium tracking-wide text-[#8ba4bd] uppercase">
          Periodo
        </span>
        <span className="mt-1 text-3xl font-extrabold text-foreground leading-none">
          {formatNum(data.currentPeriod, 0)}s
        </span>
      </div>

      {/* Vento */}
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[#1e2a3a] p-5 min-h-[140px] transition-all hover:-translate-y-1 hover:bg-[#243345]">
        <WindIcon className="h-6 w-6 text-[#5b9ec9] mb-2" />
        <span className="text-xs font-medium tracking-wide text-[#8ba4bd] uppercase">
          Vento
        </span>
        <span className="mt-1 text-3xl font-extrabold text-foreground leading-none">
          {Math.round(data.currentWindSpeed)} km/h
        </span>
        <span className="mt-1 text-sm font-medium text-[#8ba4bd]">
          {windDir}
        </span>
      </div>

      {/* Proxima Mare Baixa */}
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[#1e2a3a] p-5 min-h-[140px] transition-all hover:-translate-y-1 hover:bg-[#243345]">
        <ArrowDownIcon className="h-6 w-6 text-[#4db8a5] mb-2" />
        <span className="text-xs font-medium tracking-wide text-[#8ba4bd] uppercase">
          Rajada Vento
        </span>
        <span className="mt-1 text-3xl font-extrabold text-foreground leading-none">
          {Math.round(data.currentWindGust)} km/h
        </span>
        <span className="mt-1 text-xs font-bold" style={{ color: data.currentWindColor }}>
          {data.currentWindType} {data.currentWindIntensity}
        </span>
      </div>
    </div>
  )
}
