"use client"

import { formatNum, degToCompass } from "@/lib/surf-utils"
import type { ForecastData } from "@/lib/surf-utils"

interface ForecastCardsProps {
  data: ForecastData | null
  loading: boolean
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  )
}

function TimerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3L2 6" />
      <path d="M22 6l-3-3" />
    </svg>
  )
}

function WindIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  )
}

function CompassIcon({ className, rotation }: { className?: string; rotation: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="m15 9-6 6" />
      <path d="M9 9l0 6 6 0" />
    </svg>
  )
}

function getHeightColor(height: number): { accent: string; bg: string; glow: string } {
  if (height >= 3) return { accent: "#ef4444", bg: "rgba(239,68,68,0.08)", glow: "rgba(239,68,68,0.15)" }
  if (height >= 2) return { accent: "#f59e0b", bg: "rgba(245,158,11,0.08)", glow: "rgba(245,158,11,0.15)" }
  if (height >= 1) return { accent: "#22c55e", bg: "rgba(34,197,94,0.08)", glow: "rgba(34,197,94,0.15)" }
  if (height >= 0.5) return { accent: "#38bdf8", bg: "rgba(56,189,248,0.08)", glow: "rgba(56,189,248,0.15)" }
  return { accent: "#94a3b8", bg: "rgba(148,163,184,0.06)", glow: "rgba(148,163,184,0.1)" }
}

const CARD_THEMES = {
  altura: { accent: "#38bdf8", label: "Altura" },
  periodo: { accent: "#a78bfa", label: "Periodo" },
  direcao: { accent: "#22d3ee", label: "Dir. Onda" },
  vento: { accent: "#34d399", label: "Vento" },
}

function CardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-card p-6 min-h-[160px] border border-border">
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse mb-3" />
      <div className="h-3 w-16 rounded bg-muted animate-pulse mb-3" />
      <div className="h-10 w-24 rounded bg-muted animate-pulse mb-2" />
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
  subtitle?: string
  accentColor: string
  glowBg?: string
}

function MetricCard({ icon, label, value, unit, subtitle, accentColor, glowBg }: MetricCardProps) {
  return (
    <div
      className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-6 min-h-[120px] sm:min-h-[170px] transition-all duration-300 ease-out hover:-translate-y-1 bg-card border border-border"
      style={{
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      {/* Glow background on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${glowBg || "rgba(56,189,248,0.08)"}, transparent 70%)`,
        }}
      />

      {/* Icon */}
      <div className="relative mb-1 sm:mb-3" style={{ color: accentColor }}>
        {icon}
      </div>

      {/* Label */}
      <span
        className="relative text-[0.55rem] sm:text-[0.65rem] font-semibold tracking-[0.12em] sm:tracking-[0.15em] uppercase"
        style={{ color: "rgba(139,164,189,0.7)" }}
      >
        {label}
      </span>

      {/* Value */}
      <div className="relative mt-0.5 sm:mt-2 flex items-baseline gap-0.5 sm:gap-1">
        <span
          className="text-3xl sm:text-[3rem] font-extrabold leading-none text-foreground"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-base sm:text-xl font-semibold text-muted-foreground opacity-50">
            {unit}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <span className="relative mt-1 sm:mt-1.5 text-[0.55rem] sm:text-xs font-medium text-muted-foreground opacity-70">
          {subtitle}
        </span>
      )}
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
  const heightColors = getHeightColor(data.currentHeight)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard
        icon={<WaveIcon className="h-5 w-5 sm:h-8 sm:w-8" />}
        label={CARD_THEMES.altura.label}
        value={formatNum(data.currentHeight, 1)}
        unit="m"
        accentColor={heightColors.accent}
        glowBg={heightColors.glow}
      />

      <MetricCard
        icon={<TimerIcon className="h-5 w-5 sm:h-8 sm:w-8" />}
        label={CARD_THEMES.periodo.label}
        value={formatNum(data.currentPeriod, 0)}
        unit="s"
        accentColor={CARD_THEMES.periodo.accent}
        glowBg="rgba(167,139,250,0.1)"
      />

      <MetricCard
        icon={<CompassIcon className="h-5 w-5 sm:h-8 sm:w-8" rotation={data.currentDirection} />}
        label={CARD_THEMES.direcao.label}
        value={data.currentDirectionCompass}
        accentColor={CARD_THEMES.direcao.accent}
        glowBg="rgba(34,211,238,0.1)"
      />

      <MetricCard
        icon={<WindIcon className="h-5 w-5 sm:h-8 sm:w-8" />}
        label={CARD_THEMES.vento.label}
        value={`${Math.round(data.currentWindSpeed)}`}
        unit="km/h"
        subtitle={`${windDir} · Raj. ${Math.round(data.currentWindGust)} km/h`}
        accentColor={CARD_THEMES.vento.accent}
        glowBg="rgba(52,211,153,0.1)"
      />
    </div>
  )
}
