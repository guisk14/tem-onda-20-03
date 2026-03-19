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
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/5 bg-[rgba(20,20,30,0.6)] backdrop-blur-xl text-white/40 font-medium">
        Carregando grafico...
      </div>
    )
  }

  const point = data[activeIdx]

  return (
    <div className="rounded-3xl border border-white/5 bg-[rgba(20,20,30,0.6)] backdrop-blur-xl overflow-hidden">
      {/* Title */}
      <div className="px-5 pt-5 pb-3 md:px-6 md:pt-6 text-center md:text-left">
        <h3 className="text-lg md:text-xl font-black tracking-tight text-foreground flex items-center justify-center md:justify-start gap-2">
          <div className="p-1.5 rounded-lg bg-[#00d4ff]/10">
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-[#00d4ff]">
              <path d="M2 12c2-3 4-4 6-4s4 1 6 4 4 4 6 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M2 18c2-3 4-4 6-4s4 1 6 4 4 4 6 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>
          Condições das Ondas
        </h3>
        <p className="text-xs text-white/40 mt-2 font-medium">
          Altura <span className="mx-1.5 text-white/20">•</span> Período <span className="mx-1.5 text-white/20">•</span> Vento
        </p>
      </div>

      {/* Day tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto px-2">
        {dayGroups.map((g, i) => {
          const isToday = nowIdx >= g.startIdx && nowIdx <= g.endIdx
          const isSelected = selectedDay === i
          return (
            <button
              key={g.key}
              onClick={() => setSelectedDay(i)}
              className={`flex-1 min-w-0 px-2 py-2.5 text-[10px] md:px-3 md:py-3 md:text-xs font-bold text-center whitespace-nowrap transition-all rounded-t-xl ${
                isSelected
                  ? "bg-[#00d4ff]/10 text-[#00d4ff] border-b-2 border-[#00d4ff]"
                  : isToday
                    ? "text-[#ff3d7f]/80 border-b-2 border-[#ff3d7f]/50"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
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
          {/* Gradient definition for wave - Gen Z colors */}
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(0,212,255,0.4)" />
              <stop offset="50%" stopColor="rgba(0,212,255,0.15)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.05)" />
            </linearGradient>
            <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(0,212,255,0.5)" />
            </filter>
          </defs>

          {/* Wind area - subtle */}
          <path d={windAreaPath} fill="#84cc16" opacity={0.25} />

          {/* Wave layer - gradient cyan with glow */}
          <path d={waveAreaPath2} fill="url(#waveGradient)" filter="url(#waveGlow)" />

          {/* Wave top line - cyan highlight */}
          <path d={waveLinePath} fill="none" stroke="#00d4ff" strokeWidth={2.5} opacity={0.9} />

          {/* Period line - pink */}
          <path d={periodLinePath} fill="none" stroke="#ff3d7f" strokeWidth={2} opacity={0.8} />

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
                stroke="url(#hoverLineGrad)"
                strokeWidth={2}
                opacity={0.8}
              />
              <defs>
                <linearGradient id="hoverLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#ff3d7f" />
                </linearGradient>
              </defs>
              {/* Wave dot */}
              <circle
                cx={activeX}
                cy={interpY(wavePoints2, activeX)}
                r={5}
                fill="#00d4ff"
                stroke="#fff"
                strokeWidth={2}
              />
              {/* Period dot */}
              <circle
                cx={activeX}
                cy={interpY(periodPoints, activeX)}
                r={4}
                fill="#ff3d7f"
                stroke="#fff"
                strokeWidth={2}
              />
              {/* Wind dot */}
              <circle
                cx={activeX}
                cy={interpY(windPoints, activeX)}
                r={4}
                fill="#84cc16"
                stroke="#fff"
                strokeWidth={2}
              />
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 px-3 pb-2 md:gap-5 md:px-5 md:pb-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2 md:w-3 md:h-2.5 rounded-full" style={{ backgroundColor: "#00d4ff" }} />
          <span className="text-[9px] md:text-[11px] text-white/50 font-medium">Altura</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2 md:w-3 md:h-2.5 rounded-full" style={{ backgroundColor: "#84cc16" }} />
          <span className="text-[9px] md:text-[11px] text-white/50 font-medium">Vento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-1 md:w-3 rounded-full" style={{ backgroundColor: "#ff3d7f" }} />
          <span className="text-[9px] md:text-[11px] text-white/50 font-medium">Periodo</span>
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="flex items-center justify-between border-t border-white/5 px-2 py-3 gap-1 md:px-4 md:py-4 md:gap-2">
        <MetricItem
          label="ALTURA"
          value={`${formatNum(point?.waveHeight, 1)} m`}
          color="text-[#00d4ff]"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-[#00d4ff] md:w-4 md:h-4">
              <path d="M2 12c2-3 4-4 6-4s4 1 6 4 4 4 6 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M2 18c2-3 4-4 6-4s4 1 6 4 4 4 6 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            </svg>
          }
        />
        <MetricItem
          label="PERIODO"
          value={`${formatNum(point?.wavePeriod, 1)} s`}
          color="text-[#ff3d7f]"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-[#ff3d7f] md:w-4 md:h-4">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <MetricItem
          label="DIRECAO"
          value={degToCompass(point?.waveDirDeg)}
          color="text-[#a855f7]"
          showArrow
          arrowDeg={point?.waveDirDeg}
        />
        <div className="flex flex-col items-center text-center min-w-0 flex-1">
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-wide text-[#84cc16] leading-tight">
            VENTO
          </span>
          <div className="flex items-center gap-1 mt-1">
            {typeof point?.windDirDeg === "number" && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                className="text-[#84cc16] shrink-0 md:w-4 md:h-4"
                style={{ transform: `rotate(${point.windDirDeg}deg)` }}
              >
                <path d="M12 2l0 20M12 2l-5 5M12 2l5 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span className="text-sm md:text-lg font-black text-foreground leading-none">
              {Math.round(point?.windSpeed ?? 0)}
            </span>
            <span className="text-sm md:text-lg font-bold text-white/50 leading-none">
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
      <div className="flex items-center gap-1.5">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-wide ${color} leading-tight`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        {showArrow && typeof arrowDeg === "number" && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            className={`${color} shrink-0 md:w-4 md:h-4`}
            style={{ transform: `rotate(${arrowDeg}deg)` }}
          >
            <path d="M12 2l0 20M12 2l-5 5M12 2l5 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="text-sm md:text-lg font-black text-foreground leading-none">{value}</span>
      </div>
    </div>
  )
}
