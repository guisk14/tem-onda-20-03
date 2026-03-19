"use client"

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import { safeParseDate, formatNum, degToCompass } from "@/lib/surf-utils"
import type { ChartDataPoint } from "@/lib/surf-utils"

interface WaveChartProps {
  data: ChartDataPoint[]
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

function dayKey(iso: string) {
  return String(iso).slice(0, 10)
}

function dayLabel(iso: string) {
  const d = safeParseDate(iso)
  return `${DIAS_SEMANA[d.getDay()]} ${d.getDate()}`
}

function hourOnly(iso: string) {
  const d = safeParseDate(iso)
  return `${d.getHours()}h`
}

interface DayGroup {
  key: string
  label: string
  startIdx: number
  endIdx: number
}

function groupByDay(data: ChartDataPoint[]): DayGroup[] {
  const groups: DayGroup[] = []
  if (!data.length) return groups
  let curKey = dayKey(data[0].time)
  let start = 0
  for (let i = 1; i < data.length; i++) {
    const k = dayKey(data[i].time)
    if (k !== curKey) {
      groups.push({ key: curKey, label: dayLabel(data[start].time), startIdx: start, endIdx: i - 1 })
      curKey = k
      start = i
    }
  }
  groups.push({ key: curKey, label: dayLabel(data[start].time), startIdx: start, endIdx: data.length - 1 })
  return groups
}

function findNowIndex(data: ChartDataPoint[]): number {
  const now = Date.now()
  let best = 0
  let diff = Infinity
  for (let i = 0; i < data.length; i++) {
    const d = Math.abs(safeParseDate(data[i].time).getTime() - now)
    if (d < diff) { diff = d; best = i }
  }
  return best
}

/* ── smooth bezier helpers ── */

function buildAreaPath(
  points: { x: number; y: number }[],
  baseY: number
): string {
  if (points.length < 2) return ""
  let d = `M${points[0].x},${baseY}`
  d += ` L${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const cpx1 = prev.x + (cur.x - prev.x) * 0.4
    const cpx2 = prev.x + (cur.x - prev.x) * 0.6
    d += ` C${cpx1},${prev.y} ${cpx2},${cur.y} ${cur.x},${cur.y}`
  }
  d += ` L${points[points.length - 1].x},${baseY} Z`
  return d
}

function buildLinePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ""
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const cpx1 = prev.x + (cur.x - prev.x) * 0.4
    const cpx2 = prev.x + (cur.x - prev.x) * 0.6
    d += ` C${cpx1},${prev.y} ${cpx2},${cur.y} ${cur.x},${cur.y}`
  }
  return d
}

function interpY(points: { x: number; y: number }[], xPos: number): number {
  if (!points.length) return 0
  if (xPos <= points[0].x) return points[0].y
  if (xPos >= points[points.length - 1].x) return points[points.length - 1].y
  for (let i = 1; i < points.length; i++) {
    if (xPos <= points[i].x) {
      const t = (xPos - points[i - 1].x) / (points[i].x - points[i - 1].x)
      return points[i - 1].y + t * (points[i].y - points[i - 1].y)
    }
  }
  return points[points.length - 1].y
}

export function WaveChart({ data }: WaveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dims, setDims] = useState({ width: 800, height: 200 })

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        setDims({ width: w, height: Math.max(160, Math.min(220, w * 0.28)) })
      }
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const dayGroups = useMemo(() => groupByDay(data), [data])
  const nowIdx = useMemo(() => findNowIndex(data), [data])

  useEffect(() => {
    if (dayGroups.length && selectedDay === null) {
      const idx = dayGroups.findIndex(g => nowIdx >= g.startIdx && nowIdx <= g.endIdx)
      setSelectedDay(idx >= 0 ? idx : 0)
    }
  }, [dayGroups, nowIdx, selectedDay])

  const activeIdx = hoveredIdx ?? nowIdx

  const maxWave = useMemo(() => {
    let m = 0
    for (const d of data) if (d.waveHeight > m) m = d.waveHeight
    return Math.max(m, 0.5)
  }, [data])

  const maxWind = useMemo(() => {
    let m = 0
    for (const d of data) if (d.windSpeed > m) m = d.windSpeed
    return Math.max(m, 5)
  }, [data])

  const maxPeriod = useMemo(() => {
    let m = 0
    for (const d of data) if (d.wavePeriod > m) m = d.wavePeriod
    return Math.max(m, 5)
  }, [data])

  const { width: W, height: H } = dims
  const PAD_T = 12
  const PAD_B = 6
  const chartH = H - PAD_T - PAD_B
  const baseY = PAD_T + chartH

  const step = data.length > 1 ? W / (data.length - 1) : W

  // Compute points for each series
  const windPoints = useMemo(() => data.map((d, i) => ({
    x: i * step,
    y: baseY - (d.windSpeed / maxWind) * chartH * 0.65,
  })), [data, step, baseY, maxWind, chartH])

  // Wave layer (smoothed for depth effect)
  const wavePoints2 = useMemo(() => data.map((d, i) => {
    const next = data[Math.min(i + 2, data.length - 1)]
    const avg = (d.waveHeight + next.waveHeight) / 2 * 0.85
    return {
      x: i * step,
      y: baseY - (avg / maxWave) * chartH * 0.8,
    }
  }), [data, step, baseY, maxWave, chartH])

  const periodPoints = useMemo(() => data.map((d, i) => ({
    x: i * step,
    y: PAD_T + chartH * 0.15 - (d.wavePeriod / maxPeriod) * chartH * 0.55 + chartH * 0.45,
  })), [data, step, maxPeriod, chartH])

  // SVG paths
  const windAreaPath = useMemo(() => buildAreaPath(windPoints, baseY), [windPoints, baseY])
  const waveAreaPath2 = useMemo(() => buildAreaPath(wavePoints2, baseY), [wavePoints2, baseY])
  const waveLinePath = useMemo(() => buildLinePath(wavePoints2), [wavePoints2])
  const periodLinePath = useMemo(() => buildLinePath(periodPoints), [periodPoints])

  const nowX = nowIdx * step
  const activeX = activeIdx * step

  const handlePointer = useCallback((clientX: number) => {
    if (!svgRef.current || !data.length) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const idx = Math.round((x / rect.width) * (data.length - 1))
    setHoveredIdx(Math.max(0, Math.min(data.length - 1, idx)))
  }, [data.length])

  const onMouseMove = useCallback((e: React.MouseEvent) => handlePointer(e.clientX), [handlePointer])
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    handlePointer(e.touches[0].clientX)
  }, [handlePointer])
  const onPointerLeave = useCallback(() => setHoveredIdx(null), [])

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
        Carregando grafico...
      </div>
    )
  }

  const point = data[activeIdx]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Title */}
      <div className="px-4 pt-4 pb-2 md:px-5 md:pt-5 text-center md:text-left">
        <h3 className="text-[18px] font-semibold tracking-wide text-foreground flex items-center justify-center md:justify-start gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" className="text-sky-400">
            <path d="M2 12c2-3 4-4 6-4s4 1 6 4 4 4 6 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M2 18c2-3 4-4 6-4s4 1 6 4 4 4 6 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
          </svg>
          Condição das Ondas
        </h3>
        <p className="text-[12px] text-muted-foreground/[0.65] mt-1">
          Altura <span className="mx-1 text-muted-foreground/40">•</span> Período <span className="mx-1 text-muted-foreground/40">•</span> Vento
        </p>
      </div>

      {/* Day tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {dayGroups.map((g, i) => {
          const isToday = nowIdx >= g.startIdx && nowIdx <= g.endIdx
          const isSelected = selectedDay === i
          return (
            <button
              key={g.key}
              onClick={() => setSelectedDay(i)}
              className={`flex-1 min-w-0 px-1 py-1.5 text-[10px] md:px-2 md:py-2.5 md:text-xs font-bold text-center whitespace-nowrap transition-colors border-b-2 ${
                isSelected
                  ? "border-red-500 text-foreground bg-[rgba(255,255,255,0.03)]"
                  : isToday
                    ? "border-red-500/50 text-foreground/80"
                    : "border-transparent text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* SVG chart */}
      <div ref={containerRef} className="relative px-2 pb-1 pt-3 touch-none">
        {/* Tooltip showing time near cursor */}
        {hoveredIdx !== null && point && (
          <div 
            className="absolute top-1 px-2 py-0.5 rounded bg-card/90 border border-border/50 text-[10px] md:text-xs text-muted-foreground pointer-events-none z-10 whitespace-nowrap"
            style={{ 
              left: `${Math.min(Math.max(activeX + 8, 40), W - 60)}px`,
              transform: 'translateX(-50%)'
            }}
          >
            {hourOnly(point.time)}
          </div>
        )}
        <svg
          ref={svgRef}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full cursor-crosshair select-none"
          onMouseMove={onMouseMove}
          onMouseLeave={onPointerLeave}
          onTouchMove={onTouchMove}
          onTouchEnd={onPointerLeave}
          preserveAspectRatio="none"
        >
          {/* Gradient definition for wave */}
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(56,189,248,0.35)" />
              <stop offset="50%" stopColor="rgba(56,189,248,0.15)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.03)" />
            </linearGradient>
            <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(56,189,248,0.6)" />
            </filter>
          </defs>

          {/* Wind area - gray */}
          <path d={windAreaPath} fill="#9ca3af" opacity={0.35} />

          {/* Wave layer - gradient blue with glow */}
          <path d={waveAreaPath2} fill="url(#waveGradient)" filter="url(#waveGlow)" />

          {/* Wave top line - blue highlight */}
          <path d={waveLinePath} fill="none" stroke="#38bdf8" strokeWidth={2} opacity={0.9} />

          {/* Period line - red */}
          <path d={periodLinePath} fill="none" stroke="#dc2626" strokeWidth={2} opacity={0.75} />

          {/* Day separator lines */}
          {dayGroups.slice(1).map((g, i) => (
            <line
              key={`sep-${i}`}
              x1={g.startIdx * step}
              y1={0}
              x2={g.startIdx * step}
              y2={H}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}

          {/* Now marker removed */}

          {/* Interactive hover line */}
          {hoveredIdx !== null && (
            <>
              <line
                x1={activeX}
                y1={0}
                x2={activeX}
                y2={H}
                stroke="#dc2626"
                strokeWidth={1.5}
                opacity={0.7}
              />
              {/* Wave dot */}
              <circle
                cx={activeX}
                cy={interpY(wavePoints2, activeX)}
                r={4}
                fill="#5bb8d4"
                stroke="#fff"
                strokeWidth={2}
              />
              {/* Period dot */}
              <circle
                cx={activeX}
                cy={interpY(periodPoints, activeX)}
                r={3}
                fill="#dc2626"
                stroke="#fff"
                strokeWidth={1.5}
              />
              {/* Wind dot */}
              <circle
                cx={activeX}
                cy={interpY(windPoints, activeX)}
                r={3}
                fill="#9ca3af"
                stroke="#fff"
                strokeWidth={1.5}
              />
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 px-2 pb-1 md:gap-4 md:px-4 md:pb-2">
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-1.5 md:w-3 md:h-2 rounded-sm" style={{ backgroundColor: "#5bb8d4" }} />
          <span className="text-[8px] md:text-[10px] text-muted-foreground">Altura</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-1.5 md:w-3 md:h-2 rounded-sm" style={{ backgroundColor: "#9ca3af" }} />
          <span className="text-[8px] md:text-[10px] text-muted-foreground">Vento</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-0.5 md:w-3 rounded-sm" style={{ backgroundColor: "#dc2626" }} />
          <span className="text-[8px] md:text-[10px] text-muted-foreground">Periodo</span>
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="flex items-center justify-between border-t border-border px-1 py-2 gap-0.5 md:px-2 md:py-3 md:gap-1">
        <MetricItem
          label="ALTURA"
          value={`${formatNum(point?.waveHeight, 1)} m`}
          color="text-sky-400"
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" className="text-sky-400 md:w-4 md:h-4">
              <path d="M2 12c2-3 4-4 6-4s4 1 6 4 4 4 6 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M2 18c2-3 4-4 6-4s4 1 6 4 4 4 6 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            </svg>
          }
        />
        <MetricItem
          label="PERIODO"
          value={`${formatNum(point?.wavePeriod, 1)} s`}
          color="text-red-400"
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" className="text-red-400 md:w-4 md:h-4">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <MetricItem
          label="DIRECAO"
          value={degToCompass(point?.waveDirDeg)}
          color="text-sky-400"
          showArrow
          arrowDeg={point?.waveDirDeg}
        />
        <div className="flex flex-col items-center text-center min-w-0 flex-1">
          <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-wide text-muted-foreground leading-tight">
            VENTO
          </span>
          <div className="flex items-center gap-0.5 mt-0.5">
            {typeof point?.windDirDeg === "number" && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                className="text-gray-400 shrink-0 md:w-3.5 md:h-3.5"
                style={{ transform: `rotate(${point.windDirDeg}deg)` }}
              >
                <path d="M12 2l0 20M12 2l-5 5M12 2l5 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span className="text-[11px] md:text-base font-extrabold text-foreground leading-none">
              {Math.round(point?.windSpeed ?? 0)}
            </span>
            <span className="text-[11px] md:text-lg font-black text-gray-300 leading-none">
              {degToCompass(point?.windDirDeg)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricItem({
  label,
  value,
  color,
  showArrow,
  arrowDeg,
  icon,
}: {
  label: string
  value: string
  color: string
  showArrow?: boolean
  arrowDeg?: number
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center text-center min-w-0 flex-1">
      <div className="flex items-center gap-1">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className={`text-[7px] md:text-[9px] font-bold uppercase tracking-wide ${color} leading-tight`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-0.5 mt-0.5">
        {showArrow && typeof arrowDeg === "number" && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            className={`${color} shrink-0 md:w-3 md:h-3`}
            style={{ transform: `rotate(${arrowDeg}deg)` }}
          >
            <path d="M12 2l0 20M12 2l-5 5M12 2l5 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="text-[11px] md:text-base font-extrabold text-foreground leading-none">{value}</span>
      </div>
    </div>
  )
}
