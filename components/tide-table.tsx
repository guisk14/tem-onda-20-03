"use client"

import { useMemo, useState, useEffect } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import tideData from "@/lib/mare-santos-2026.json"

interface TideEvent {
  type: "alta" | "baixa"
  time: string
  hour: number
  height: number
}

interface TideDataEntry {
  hora: string
  altura: number
}

interface TideDataFile {
  mares: {
    [date: string]: TideDataEntry[]
  }
}

function getTodayTides(): { events: TideEvent[]; curve: { x: number; y: number }[] } {
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  
  const data = tideData as TideDataFile
  const todayData = data.mares[todayKey] || []

  // Convert JSON data to TideEvent format
  const events: TideEvent[] = []
  
  for (let i = 0; i < todayData.length; i++) {
    const entry = todayData[i]
    const [hours, minutes] = entry.hora.split(":").map(Number)
    const hour = hours + minutes / 60
    
    // Determine if it's high or low tide based on comparing with neighbors
    let isHigh = false
    if (todayData.length > 1) {
      const prevHeight = i > 0 ? todayData[i - 1].altura : entry.altura
      const nextHeight = i < todayData.length - 1 ? todayData[i + 1].altura : entry.altura
      isHigh = entry.altura >= prevHeight && entry.altura >= nextHeight
    }
    
    events.push({
      type: isHigh ? "alta" : "baixa",
      time: entry.hora,
      hour,
      height: entry.altura,
    })
  }

  // Build smooth curve for the mini chart based on the actual tide events
  const curve: { x: number; y: number }[] = []
  
  if (events.length >= 2) {
    // Create interpolated curve between tide events
    for (let h = 0; h <= 24; h += 0.25) {
      // Find the two events that bracket this hour
      let before = events[0]
      let after = events[events.length - 1]
      
      for (let i = 0; i < events.length - 1; i++) {
        if (events[i].hour <= h && events[i + 1].hour >= h) {
          before = events[i]
          after = events[i + 1]
          break
        }
      }
      
      // Handle edge cases (before first event or after last event)
      if (h < events[0].hour) {
        before = { ...events[events.length - 1], hour: events[events.length - 1].hour - 24 }
        after = events[0]
      } else if (h > events[events.length - 1].hour) {
        before = events[events.length - 1]
        after = { ...events[0], hour: events[0].hour + 24 }
      }
      
      // Sinusoidal interpolation for smooth tide curve
      const t = (h - before.hour) / (after.hour - before.hour || 1)
      const smoothT = (1 - Math.cos(t * Math.PI)) / 2
      const height = before.height + (after.height - before.height) * smoothT
      
      curve.push({ x: h, y: height })
    }
  } else if (events.length === 1) {
    // Single event - create a flat line
    for (let h = 0; h <= 24; h += 0.25) {
      curve.push({ x: h, y: events[0].height })
    }
  }

  return { events: events.slice(0, 6), curve }
}

interface TideTableProps {
  lat?: number
}

export function TideTable({ lat }: TideTableProps) {
  const { events: tides, curve } = useMemo(() => getTodayTides(), [])

  const [currentHour, setCurrentHour] = useState(12)
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0 })

  // Calculate countdown to next tide
  const getCountdown = (nextTideHour: number, currentH: number) => {
    let diffMinutes = Math.round((nextTideHour - currentH) * 60)
    if (diffMinutes < 0) diffMinutes += 24 * 60 // wrap to next day
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return { hours, minutes }
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentHour(now.getHours() + now.getMinutes() / 60)
    }
    
    updateTime()
    setMounted(true)
    
    // Update every minute
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Update countdown when currentHour or tides change
  useEffect(() => {
    if (mounted && tides.length > 0) {
      const next = tides.find(t => t.hour > currentHour) || tides[0]
      setCountdown(getCountdown(next.hour, currentHour))
    }
  }, [currentHour, mounted, tides])

  if (!tides.length) return null

  // SVG chart dimensions
  const svgW = 400
  const svgH = 60
  const pad = 8

  const minY = Math.min(...curve.map(p => p.y))
  const maxY = Math.max(...curve.map(p => p.y))
  const rangeY = maxY - minY || 1

  const toSvgX = (h: number) => pad + (h / 24) * (svgW - pad * 2)
  const toSvgY = (v: number) => pad + (1 - (v - minY) / rangeY) * (svgH - pad * 2)

  // Build smooth curve path
  const pathPoints = curve.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`)
  const linePath = `M${pathPoints.join(" L")}`

  // Fill area path
  const areaPath = `${linePath} L${toSvgX(24)},${svgH} L${toSvgX(0)},${svgH} Z`

  // Current time position
  const nowX = toSvgX(currentHour)
  // Interpolate current tide height
  const closestIdx = curve.reduce((best, p, i) => Math.abs(p.x - currentHour) < Math.abs(curve[best].x - currentHour) ? i : best, 0)
  const nowY = toSvgY(curve[closestIdx].y)

  // Find next tide event
  const nextTide = mounted ? tides.find(t => t.hour > currentHour) : tides[0]

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-0.5">
            Mares
          </p>
          <h3 className="text-sm md:text-lg font-bold text-foreground">
            Tabela de Marés de Hoje
          </h3>
        </div>
        {nextTide && (
          <div className="text-right min-w-[140px]">
            <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Próxima
            </p>
            <p className="text-xs md:text-sm font-bold">
              <span className={nextTide.type === "alta" ? "text-sky-400" : "text-teal-400"}>
                {nextTide.type === "alta" ? "Maré Alta" : "Maré Baixa"} em:
              </span>
              <span className="text-foreground">
                {" "}{countdown.hours > 0 ? `${countdown.hours}h ${countdown.minutes}m` : `${countdown.minutes}m`}
              </span>
            </p>
            {/* Progress line com animacao de onda */}
            <style>{`
              @keyframes waveFlow {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0%); }
              }
              .wave-animation {
                animation: waveFlow 2s ease-in-out infinite;
              }
            `}</style>
            <div className="mt-2 flex items-center justify-end">
              <div className="relative h-[4px] w-[180px] bg-muted-foreground/20 rounded-full overflow-hidden">
                {(() => {
                  // Calculate progress between previous tide and next tide
                  const prevTideIndex = tides.findIndex(t => t === nextTide) - 1
                  const prevTide = prevTideIndex >= 0 ? tides[prevTideIndex] : { ...tides[tides.length - 1], hour: tides[tides.length - 1].hour - 24 }
                  const totalDuration = nextTide.hour - prevTide.hour
                  const elapsed = currentHour - prevTide.hour
                  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
                  const tideColor = nextTide.type === "alta" ? "sky" : "teal"
                  return (
                    <>
                      {/* Base fixa - cor clara */}
                      <div 
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-[600ms] ease-out ${tideColor === "sky" ? "bg-sky-400/50" : "bg-teal-400/50"}`}
                        style={{ width: `${progress}%` }}
                      />
                      {/* Wave animada - cor mais forte */}
                      <div 
                        className="absolute left-0 top-0 h-full overflow-hidden rounded-full"
                        style={{ width: `${progress}%` }}
                      >
                        <div 
                          className={`wave-animation h-full w-[200%] rounded-full ${tideColor === "sky" ? "bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500" : "bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500"}`}
                          style={{ 
                            filter: 'blur(0.5px)',
                            opacity: 0.9
                          }}
                        />
                      </div>
                      {/* Ponto circular com glow */}
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full border-2 border-card transition-all duration-[600ms] ease-out ${tideColor === "sky" ? "bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.6)]" : "bg-teal-400 shadow-[0_0_8px_2px_rgba(45,212,191,0.6)]"}`}
                        style={{ left: `calc(${progress}% - 6px)` }}
                      />
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mini tide curve */}
      <div className="relative mb-4 rounded-lg overflow-hidden bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
        <style>{`
          @keyframes pulse {
            0% { opacity: 0.4 }
            50% { opacity: 1 }
            100% { opacity: 0.4 }
          }
          .now-line {
            animation: pulse 2s infinite;
          }
        `}</style>
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-14 md:h-16"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradiente mais forte para sensacao de profundidade de agua */}
            <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
            {/* Gradiente para trecho ativo (agora -> proxima mare) */}
            <linearGradient id="activeSegment" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Fill */}
          <path d={areaPath} fill="url(#tideFill)" />

          {/* Curve line - mais fraca */}
          <path
            d={linePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.4"
          />

          {/* Highlighted segment: agora -> proxima mare */}
          {nextTide && (() => {
            const activePoints = curve
              .filter(p => p.x >= currentHour && p.x <= nextTide.hour)
              .map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`)
            if (activePoints.length < 2) return null
            const activePath = `M${activePoints.join(" L")}`
            return (
              <path
                d={activePath}
                fill="none"
                stroke="url(#activeSegment)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 0 3px rgba(56,189,248,0.5))"
              />
            )
          })()}

          {/* Hour markers */}
          {[0, 6, 12, 18, 24].map(h => (
            <g key={h}>
              <line
                x1={toSvgX(h)}
                y1={pad}
                x2={toSvgX(h)}
                y2={svgH - pad}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.5"
              />
              <text
                x={toSvgX(h)}
                y={svgH - 1}
                fill="rgba(255,255,255,0.3)"
                fontSize="6"
                textAnchor="middle"
              >
                {h === 24 ? "00" : String(h).padStart(2, "0")}h
              </text>
            </g>
          ))}

          {/* Tide extreme dots */}
          {tides.map((t, i) => (
            <circle
              key={i}
              cx={toSvgX(t.hour)}
              cy={toSvgY(t.height)}
              r="2.5"
              fill={t.type === "alta" ? "#38bdf8" : "#2dd4bf"}
              stroke="#121214"
              strokeWidth="1"
            />
          ))}

          {/* Current time indicator com animacao pulse */}
          <line
            x1={nowX}
            y1={pad}
            x2={nowX}
            y2={svgH - pad}
            stroke="#f43f5e"
            strokeWidth="1"
            strokeDasharray="2 2"
            className="now-line"
          />
          <circle
            cx={nowX}
            cy={nowY}
            r="3"
            fill="#f43f5e"
            stroke="#121214"
            strokeWidth="1.5"
            className="now-line"
          />
        </svg>
      </div>

      {/* Tide cards */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {tides.map((tide, i) => {
          const isHigh = tide.type === "alta"
          const isPast = mounted && tide.hour < currentHour
          return (
            <div
              key={i}
              className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-3 md:px-4 md:py-4 transition-all ${
                isPast
                  ? "border-border/50 bg-secondary/30 opacity-60"
                  : "border-border bg-secondary/50"
              }`}
            >
              {mounted && !isPast && tide === nextTide && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-primary text-[7px] md:text-[8px] font-bold uppercase tracking-wider text-primary-foreground">
                  Próxima
                </div>
              )}
              <div
                className={`flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full ${
                  isHigh
                    ? "bg-sky-500/15 text-sky-400"
                    : "bg-teal-500/15 text-teal-400"
                }`}
              >
                {isHigh ? (
                  <ArrowUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                )}
              </div>
              <span className={`text-[9px] md:text-[11px] font-bold uppercase tracking-wide ${
                isHigh ? "text-sky-400/80" : "text-teal-400/80"
              }`}>
                {isHigh ? "Maré Alta" : "Maré Baixa"}
              </span>
              <span className="text-base md:text-xl font-black text-foreground leading-none">
                {tide.time}
              </span>
              <span className="text-[11px] md:text-sm text-muted-foreground font-semibold">
                {tide.height}m
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
