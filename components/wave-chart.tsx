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
  return `${DIAS_SEMANA[d.getDay()]} (${d.getDate()})`
}

function hourOnly(iso: string) {
  const d = safeParseDate(iso)
  return `${String(d.getHours()).padStart(2, "0")} horas`
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

  const wavePoints = useMemo(() => data.map((d, i) => ({
    x: i * step,
    y: baseY - (d.waveHeight / maxWave) * chartH * 0.8,
  })), [data, step, baseY, maxWave, chartH])

  // Secondary wave layer (shifted/smoothed for depth effect)
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
  const waveAreaPath = useMemo(() => buildAreaPath(wavePoints, baseY), [wavePoints, baseY])
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
      {/* Day tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {dayGroups.map((g, i) => {
          const isToday = nowIdx >= g.startIdx && nowIdx <= g.endIdx
          const isSelected = selectedDay === i
          return (
            <button
              key={g.key}
              onClick={() => setSelectedDay(i)}
              className={`flex-1 min-w-0 px-2 py-2.5 text-xs font-bold text-center whitespace-nowrap transition-colors border-b-2 ${
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

      {/* Day + hour label */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-sm text-muted-foreground">
          {point ? `${dayLabel(point.time)} - ${hourOnly(point.time)}` : ""}
        </p>
      </div>

      {/* SVG chart */}
      <div ref={containerRef} className="px-2 pb-1 touch-none">
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
          {/* Wind area - gray */}
          <path d={windAreaPath} fill="#9ca3af" opacity={0.35} />

          {/* Secondary wave layer - light blue */}
          <path d={waveAreaPath2} fill="#7ec8e3" opacity={0.55} />

          {/* Main wave layer - blue */}
          <path d={waveAreaPath} fill="#38a3c9" opacity={0.75} />

          {/* Period line - red */}
          <path d={periodLinePath} fill="none" stroke="#dc2626" strokeWidth={2} opacity={0.9} />

          {/* Day separator lines */}
          {dayGroups.slice(1).map((g, i) => (
            <line
              key={`sep-${i}`}
              x1={g.startIdx * step}
              y1={0}
              x2={g.startIdx * step}
              y2={H}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          ))}

          {/* Now marker - solid red vertical line */}
          <line x1={nowX} y1={0} x2={nowX} y2={H} stroke="#dc2626" strokeWidth={2} />

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
                cy={interpY(wavePoints, activeX)}
                r={4}
                fill="#38a3c9"
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
      <div className="flex items-center justify-center gap-4 px-4 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: "#38a3c9" }} />
          <span className="text-[10px] text-muted-foreground">Altura</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: "#9ca3af" }} />
          <span className="text-[10px] text-muted-foreground">Vento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 rounded-sm" style={{ backgroundColor: "#dc2626" }} />
          <span className="text-[10px] text-muted-foreground">Periodo</span>
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="flex items-center justify-between border-t border-border px-2 py-3 gap-1">
        <MetricItem
          label="ALTURA SIGNIFICATIVA"
          value={`${formatNum(point?.waveHeight, 1)} m`}
          color="text-sky-400"
        />
        <MetricItem
          label="PERIODO DE PICO"
          value={`${formatNum(point?.wavePeriod, 1)} s`}
          color="text-red-400"
        />
        <MetricItem
          label="DIRECAO DE PICO"
          value={degToCompass(point?.waveDirDeg)}
          color="text-sky-400"
          showArrow
          arrowDeg={point?.waveDirDeg}
        />
        <MetricItem
          label="VENTO"
          value={`${Math.round(point?.windSpeed ?? 0)} km/h`}
          color="text-muted-foreground"
          showArrow
          arrowDeg={point?.windDirDeg}
        />
        <MetricItem
          label="DIRECAO"
          value={degToCompass(point?.windDirDeg)}
          color="text-muted-foreground"
          showArrow
          arrowDeg={point?.windDirDeg}
        />
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
}: {
  label: string
  value: string
  color: string
  showArrow?: boolean
  arrowDeg?: number
}) {
  return (
    <div className="flex flex-col items-center text-center min-w-0 flex-1">
      <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wide ${color} leading-tight`}>
        {label}
      </span>
      <div className="flex items-center gap-0.5 mt-0.5">
        {showArrow && typeof arrowDeg === "number" && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            className={`${color} shrink-0`}
            style={{ transform: `rotate(${arrowDeg}deg)` }}
          >
            <path d="M12 2l0 20M12 2l-5 5M12 2l5 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="text-sm sm:text-base font-extrabold text-foreground leading-none">{value}</span>
      </div>
    </div>
  )
}
