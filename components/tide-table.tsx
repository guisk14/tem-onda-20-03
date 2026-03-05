"use client"

import { useMemo } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

interface TideEvent {
  type: "alta" | "baixa"
  time: string
  hour: number
  height: number
}

function computeTideExtremes(lat: number): { events: TideEvent[]; curve: { x: number; y: number }[] } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const baseMean = 1.8
  const m2Amp = 1.2 + Math.abs(lat + 23.5) * 0.03
  const s2Amp = 0.35 + Math.abs(lat + 23.5) * 0.01
  const m2Period = 12.42 * 3600 * 1000
  const s2Period = 12.0 * 3600 * 1000
  const phaseOffset = (lat * 0.7 + now.getDate() * 0.3) * Math.PI / 12

  function tideAt(t: number): number {
    const elapsed = t - today.getTime()
    const m2 = m2Amp * Math.cos((2 * Math.PI * elapsed) / m2Period + phaseOffset)
    const s2 = s2Amp * Math.cos((2 * Math.PI * elapsed) / s2Period + phaseOffset * 0.8)
    return baseMean + m2 + s2
  }

  const step = 10 * 60 * 1000
  const dayStart = today.getTime()
  const dayEnd = dayStart + 24 * 3600 * 1000

  // Build smooth curve for the mini chart
  const curve: { x: number; y: number }[] = []
  for (let t = dayStart; t <= dayEnd; t += 15 * 60 * 1000) {
    const hoursFromStart = (t - dayStart) / (3600 * 1000)
    curve.push({ x: hoursFromStart, y: tideAt(t) })
  }

  const extremes: TideEvent[] = []
  let prevH = tideAt(dayStart - step)
  let prevDir: "up" | "down" | null = null

  for (let t = dayStart; t <= dayEnd; t += step) {
    const h = tideAt(t)
    const dir = h > prevH ? "up" : "down"
    if (prevDir && dir !== prevDir) {
      const extremeTime = new Date(t - step)
      const extremeH = tideAt(t - step)
      const isHigh = prevDir === "up"
      extremes.push({
        type: isHigh ? "alta" : "baixa",
        time: `${String(extremeTime.getHours()).padStart(2, "0")}:${String(extremeTime.getMinutes()).padStart(2, "0")}`,
        hour: extremeTime.getHours() + extremeTime.getMinutes() / 60,
        height: parseFloat(extremeH.toFixed(1)),
      })
    }
    prevDir = dir
    prevH = h
  }

  return { events: extremes.slice(0, 4), curve }
}

interface TideTableProps {
  lat: number
}

export function TideTable({ lat }: TideTableProps) {
  const { events: tides, curve } = useMemo(() => computeTideExtremes(lat), [lat])

  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60

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
  const nextTide = tides.find(t => t.hour > currentHour)

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-0.5">
            Mares
          </p>
          <h3 className="text-sm md:text-lg font-bold text-foreground">
            Tabela de Mares de Hoje
          </h3>
        </div>
        {nextTide && (
          <div className="text-right">
            <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Proxima
            </p>
            <p className="text-xs md:text-sm font-bold text-foreground">
              Mare {nextTide.type === "alta" ? "Alta" : "Baixa"} {nextTide.time}
            </p>
          </div>
        )}
      </div>

      {/* Mini tide curve */}
      <div className="relative mb-4 rounded-lg overflow-hidden bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-14 md:h-16"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Fill */}
          <path d={areaPath} fill="url(#tideFill)" />

          {/* Curve line */}
          <path
            d={linePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

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

          {/* Current time indicator */}
          <line
            x1={nowX}
            y1={pad}
            x2={nowX}
            y2={svgH - pad}
            stroke="#f43f5e"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <circle
            cx={nowX}
            cy={nowY}
            r="3"
            fill="#f43f5e"
            stroke="#121214"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Tide cards */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {tides.map((tide, i) => {
          const isHigh = tide.type === "alta"
          const isPast = tide.hour < currentHour
          return (
            <div
              key={i}
              className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-3 md:px-4 md:py-4 transition-all ${
                isPast
                  ? "border-border/50 bg-secondary/30 opacity-60"
                  : "border-border bg-secondary/50"
              }`}
            >
              {!isPast && tide === nextTide && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-primary text-[7px] md:text-[8px] font-bold uppercase tracking-wider text-primary-foreground">
                  Proxima
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
                {isHigh ? "Mare Alta" : "Mare Baixa"}
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
