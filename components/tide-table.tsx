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

  // SVG chart dimensions - altura maior para melhor legibilidade
  const svgW = 400
  const svgH = 80
  const pad = 10

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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header - Mobile: empilhado / Desktop: lado a lado */}
      <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5">
        {/* Desktop: layout lado a lado */}
        <div className="hidden md:flex md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-0.5">
              Mares
            </p>
            <h3 className="text-lg font-bold text-foreground">
              Tabela de Marés de Hoje
            </h3>
          </div>
          {nextTide && (
            <div className="text-right min-w-[140px]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Próxima
              </p>
              <p className="text-sm font-bold">
                <span className={nextTide.type === "alta" ? "text-sky-400" : "text-teal-400"}>
                  {nextTide.type === "alta" ? "Maré Alta" : "Maré Baixa"} em:
                </span>
                <span className="text-foreground">
                  {" "}{countdown.hours > 0 ? `${countdown.hours}h ${countdown.minutes}m` : `${countdown.minutes}m`}
                </span>
              </p>
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
                <div className="relative h-[4px] w-[180px] bg-muted-foreground/20 rounded-full">
                  {(() => {
                    const prevTideIndex = tides.findIndex(t => t === nextTide) - 1
                    const prevTide = prevTideIndex >= 0 ? tides[prevTideIndex] : { ...tides[tides.length - 1], hour: tides[tides.length - 1].hour - 24 }
                    const totalDuration = nextTide.hour - prevTide.hour
                    const elapsed = currentHour - prevTide.hour
                    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
                    const tideColor = nextTide.type === "alta" ? "sky" : "teal"
                    return (
                      <>
                        <div 
                          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-[600ms] ease-out ${tideColor === "sky" ? "bg-sky-400/45" : "bg-teal-400/45"}`}
                          style={{ width: `${progress}%` }}
                        />
                        <div 
                          className="absolute left-0 top-0 h-full overflow-hidden rounded-full"
                          style={{ width: `${progress}%` }}
                        >
                          <div 
                            className="wave-animation h-full w-[200%]"
                            style={{ 
                              background: tideColor === "sky" 
                                ? 'linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(56,189,248,0.8) 60%, rgba(255,255,255,1) 100%)'
                                : 'linear-gradient(90deg, rgba(45,212,191,0) 0%, rgba(45,212,191,0.8) 60%, rgba(255,255,255,1) 100%)'
                            }}
                          />
                        </div>
                        <div 
                          className={`absolute top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full border-2 border-card z-10 transition-all duration-[600ms] ease-out ${tideColor === "sky" ? "bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.6)]" : "bg-teal-400 shadow-[0_0_8px_2px_rgba(45,212,191,0.6)]"}`}
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

        {/* Mobile: layout empilhado e centralizado */}
        <div className="md:hidden flex flex-col items-center text-center">
          <h3 className="text-sm font-bold text-foreground mb-2">
            Marés Hoje
          </h3>
          {nextTide && (
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-normal uppercase tracking-[0.08em] text-muted-foreground/65">
                Próxima Maré
              </p>
              <p className="text-base font-bold mt-[2px]">
                <span className={nextTide.type === "alta" ? "text-sky-400" : "text-teal-400"}>
                  {nextTide.type === "alta" ? "Cheia" : "Seca"} em
                </span>
                <span className="text-foreground">
                  {" "}{countdown.hours > 0 ? `${countdown.hours}h ${countdown.minutes}m` : `${countdown.minutes}m`}
                </span>
              </p>
              <style>{`
                @keyframes waveFlowMobile {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(0%); }
                }
                .wave-animation-mobile {
                  animation: waveFlowMobile 2s ease-in-out infinite;
                }
              `}</style>
              <div className="mt-2">
                <div className="relative h-[4px] w-[150px] bg-muted-foreground/20 rounded-full">
                  {(() => {
                    const prevTideIndex = tides.findIndex(t => t === nextTide) - 1
                    const prevTide = prevTideIndex >= 0 ? tides[prevTideIndex] : { ...tides[tides.length - 1], hour: tides[tides.length - 1].hour - 24 }
                    const totalDuration = nextTide.hour - prevTide.hour
                    const elapsed = currentHour - prevTide.hour
                    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
                    const tideColor = nextTide.type === "alta" ? "sky" : "teal"
                    return (
                      <>
                        <div 
                          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-[600ms] ease-out ${tideColor === "sky" ? "bg-sky-400/45" : "bg-teal-400/45"}`}
                          style={{ width: `${progress}%` }}
                        />
                        <div 
                          className="absolute left-0 top-0 h-full overflow-hidden rounded-full"
                          style={{ width: `${progress}%` }}
                        >
                          <div 
                            className="wave-animation-mobile h-full w-[200%]"
                            style={{ 
                              background: tideColor === "sky" 
                                ? 'linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(56,189,248,0.8) 60%, rgba(255,255,255,1) 100%)'
                                : 'linear-gradient(90deg, rgba(45,212,191,0) 0%, rgba(45,212,191,0.8) 60%, rgba(255,255,255,1) 100%)'
                            }}
                          />
                        </div>
                        <div 
                          className={`absolute top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full border-2 border-card z-10 transition-all duration-[600ms] ease-out ${tideColor === "sky" ? "bg-sky-400" : "bg-teal-400"}`}
                          style={{ 
                            left: `calc(${progress}% - 6px)`,
                            boxShadow: tideColor === "sky" 
                              ? '0 0 6px rgba(56,189,248,0.6), 0 0 14px rgba(56,189,248,0.3)' 
                              : '0 0 6px rgba(45,212,191,0.6), 0 0 14px rgba(45,212,191,0.3)'
                          }}
                        />
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mini tide curve - sem bordas arredondadas nas laterais */}
      <div className="relative mb-4 overflow-hidden bg-[rgba(0,0,0,0.2)] border-y border-[rgba(255,255,255,0.05)]">
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
          className="w-full h-24 md:h-28"
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



          {/* Hour markers - apenas linhas verticais */}
          {[0, 6, 12, 18, 24].map(h => (
            <line
              key={h}
              x1={toSvgX(h)}
              y1={pad}
              x2={toSvgX(h)}
              y2={svgH - pad}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.5"
            />
          ))}

        </svg>
        {/* Highlighted segment overlay - SVG separado com aspect ratio preservado */}
        {nextTide && (() => {
          const activePoints = curve.filter(p => p.x >= currentHour && p.x <= nextTide.hour)
          if (activePoints.length < 2) return null
          
          // Calcula o bounding box do segmento ativo
          const startX = (pad / svgW * 100) + (currentHour / 24) * ((svgW - pad * 2) / svgW * 100)
          const endX = (pad / svgW * 100) + (nextTide.hour / 24) * ((svgW - pad * 2) / svgW * 100)
          
          return (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 100 100`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="activeSegmentOverlay" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d={activePoints.map((p, i) => {
                  const x = (pad / svgW * 100) + (p.x / 24) * ((svgW - pad * 2) / svgW * 100)
                  const y = (pad / svgH * 100) + (1 - (p.y - minY) / rangeY) * ((svgH - pad * 2) / svgH * 100)
                  return `${i === 0 ? 'M' : 'L'}${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="url(#activeSegmentOverlay)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.6))' }}
              />
            </svg>
          )
        })()}
        {/* Tide extreme dots - fora do SVG para nao distorcer */}
        {tides.map((t, i) => {
          const xPercent = (pad / svgW * 100) + (t.hour / 24) * ((svgW - pad * 2) / svgW * 100)
          const yPercent = (pad / svgH * 100) + (1 - (t.height - minY) / rangeY) * ((svgH - pad * 2) / svgH * 100)
          return (
            <div
              key={i}
              className={`absolute w-[6px] h-[6px] md:w-[7px] md:h-[7px] rounded-full border border-[#121214] ${t.type === "alta" ? "bg-sky-400" : "bg-teal-400"}`}
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )
        })}
        {/* Current time indicator - fora do SVG */}
        <div
          className="absolute top-[12.5%] bottom-[12.5%] w-[2px] now-line"
          style={{
            left: `${(pad / svgW * 100) + (currentHour / 24) * ((svgW - pad * 2) / svgW * 100)}%`,
            background: 'repeating-linear-gradient(to bottom, #f43f5e 0px, #f43f5e 3px, transparent 3px, transparent 6px)',
            transform: 'translateX(-50%)'
          }}
        />
        <div
          className="absolute w-[8px] h-[8px] md:w-[10px] md:h-[10px] rounded-full bg-[#f43f5e] border-2 border-[#121214] now-line"
          style={{
            left: `${(pad / svgW * 100) + (currentHour / 24) * ((svgW - pad * 2) / svgW * 100)}%`,
            top: `${(pad / svgH * 100) + (1 - (curve[closestIdx].y - minY) / rangeY) * ((svgH - pad * 2) / svgH * 100)}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        {/* Hour labels fora do SVG para nao distorcer */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-[2.5%] pb-0.5">
          {[0, 6, 12, 18, 24].map(h => (
            <span key={h} className="text-[7px] md:text-[10px] text-muted-foreground/40">
              {h === 24 ? "00" : String(h).padStart(2, "0")}h
            </span>
          ))}
        </div>
      </div>

      {/* Tide cards - com padding interno */}
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-3 px-4 pb-4 md:px-5 md:pb-5">
        {tides.map((tide, i) => {
          const isHigh = tide.type === "alta"
          const isPast = mounted && tide.hour < currentHour
          const isNext = mounted && !isPast && tide === nextTide
          return (
            <div
              key={i}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 md:px-4 md:py-4 transition-all ${
                isPast
                  ? "border-border/50 bg-secondary/30 opacity-60"
                  : isNext
                    ? isHigh 
                      ? "border-sky-400/40 bg-sky-400/10 ring-1 ring-sky-400/20"
                      : "border-teal-400/40 bg-teal-400/10 ring-1 ring-teal-400/20"
                    : "border-border bg-secondary/50"
              }`}
            >
              {isNext && (
                <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[6px] md:text-[8px] font-bold uppercase tracking-wider text-white ${isHigh ? "bg-sky-500" : "bg-teal-500"}`}>
                  Próxima
                </div>
              )}
              <div
                className={`flex h-5 w-5 md:h-9 md:w-9 items-center justify-center rounded-full ${
                  isHigh
                    ? "bg-sky-500/15 text-sky-400"
                    : "bg-teal-500/15 text-teal-400"
                }`}
              >
                {isHigh ? (
                  <ArrowUp className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                  <ArrowDown className="h-3 w-3 md:h-4 md:w-4" />
                )}
              </div>
              <span className={`text-[8px] md:text-[11px] font-bold uppercase tracking-wide ${
                isHigh ? "text-sky-400/80" : "text-teal-400/80"
              }`}>
                {isHigh ? "Maré Alta" : "Maré Baixa"}
              </span>
              <span className="text-sm md:text-xl font-black text-foreground leading-none">
                {tide.time}
              </span>
              <span className="text-[10px] md:text-sm text-muted-foreground font-semibold">
                {tide.height}m
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
