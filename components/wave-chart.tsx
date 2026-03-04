"use client"

import { useMemo, useState, useCallback } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { safeParseDate, formatNum, degToCompass } from "@/lib/surf-utils"
import type { ChartDataPoint } from "@/lib/surf-utils"

interface WaveChartProps {
  data: ChartDataPoint[]
}

function dayKey(iso: string) {
  return String(iso).slice(0, 10)
}

function dayLabelTop(iso: string) {
  const d = safeParseDate(iso)
  const dias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]
  return `${dias[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}`
}

function hourOnly(iso: string) {
  const d = safeParseDate(iso)
  return `${String(d.getHours()).padStart(2, "0")}h`
}

interface DaySegment {
  key: string
  label: string
  startIdx: number
  endIdx: number
}

function computeDaySegments(data: ChartDataPoint[]): DaySegment[] {
  if (!data.length) return []
  const segs: DaySegment[] = []
  let start = 0
  let curKey = dayKey(data[0].time)
  for (let i = 1; i < data.length; i++) {
    const k = dayKey(data[i].time)
    if (k !== curKey) {
      segs.push({ key: curKey, label: dayLabelTop(data[start].time), startIdx: start, endIdx: i - 1 })
      start = i
      curKey = k
    }
  }
  segs.push({ key: curKey, label: dayLabelTop(data[start].time), startIdx: start, endIdx: data.length - 1 })
  return segs
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-[rgba(24,24,27,0.95)] px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-xs font-bold uppercase text-primary">
        {hourOnly(point.time)}
      </p>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-foreground">
          <span className="font-bold">{formatNum(point.waveHeight, 1)}m</span>{" "}
          <span className="text-muted-foreground">altura</span>
        </span>
        <span className="text-sm text-foreground">
          <span className="font-bold">{formatNum(point.wavePeriod, 1)}s</span>{" "}
          <span className="text-muted-foreground">periodo</span>
        </span>
        <span className="text-sm text-foreground">
          <span className="font-bold">{degToCompass(point.waveDirDeg)}</span>{" "}
          <span className="text-muted-foreground">direcao</span>
        </span>
        <span className="text-sm text-foreground">
          <span className="font-bold">{Math.round(point.windSpeed)} km/h</span>{" "}
          <span className="text-muted-foreground">vento</span>
        </span>
      </div>
    </div>
  )
}

export function WaveChart({ data }: WaveChartProps) {
  const [activePoint, setActivePoint] = useState<ChartDataPoint | null>(null)

  const segments = useMemo(() => computeDaySegments(data), [data])

  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        index: i,
        label: hourOnly(d.time),
      })),
    [data]
  )

  const handleMouseMove = useCallback(
    (state: { activePayload?: Array<{ payload: ChartDataPoint }> }) => {
      if (state?.activePayload?.length) {
        setActivePoint(state.activePayload[0].payload)
      }
    },
    []
  )

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
        Carregando grafico...
      </div>
    )
  }

  return (
    <div className="relative rounded-xl border border-[rgba(56,189,248,0.08)] bg-card p-5" style={{ boxShadow: "0 0 30px rgba(56,189,248,0.03), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
      {/* Day header */}
      <div className="mb-5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}>
        {segments.map((seg, idx) => (
          <span
            key={seg.key}
            className={`truncate rounded-lg px-2 py-2 text-center text-[0.65rem] sm:text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
              idx === 0
                ? "neon-active neon-underline bg-primary/15 text-primary border border-primary/30"
                : "bg-[rgba(255,255,255,0.03)] text-muted-foreground border border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground hover:border-[rgba(255,255,255,0.1)]"
            }`}
          >
            {seg.label}
          </span>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} onMouseMove={handleMouseMove}>
          <defs>
            <linearGradient id="seaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
              <stop offset="40%" stopColor="#0ea5e9" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" hide />
          <YAxis
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="waveHeight"
            stroke="#38bdf8"
            strokeWidth={2.5}
            fill="url(#seaGradient)"
            dot={false}
            filter="url(#glow)"
            activeDot={{ r: 6, fill: "#38bdf8", strokeWidth: 3, stroke: "#121214", filter: "url(#glow)" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Active point metrics */}
      {activePoint && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricChip label="Altura" value={`${formatNum(activePoint.waveHeight, 1)}m`} color="text-primary" />
          <MetricChip label="Periodo" value={`${formatNum(activePoint.wavePeriod, 1)}s`} color="text-chart-2" />
          <MetricChip label="Dir. Onda" value={degToCompass(activePoint.waveDirDeg)} color="text-muted-foreground" />
          <MetricChip label="Vento" value={`${Math.round(activePoint.windSpeed)} km/h ${degToCompass(activePoint.windDirDeg)}`} color="text-chart-4" />
        </div>
      )}
    </div>
  )
}

function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  const isActive = color === "text-primary"
  return (
    <div
      className={`group relative overflow-hidden rounded-xl px-3 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 ${
        isActive
          ? "neon-active bg-primary/10 border border-primary/25"
          : "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(56,189,248,0.08), transparent 70%)",
        }}
      />
      <p className={`relative text-[0.6rem] sm:text-[0.65rem] font-extrabold uppercase tracking-widest ${color}`}>{label}</p>
      <p className="relative mt-1.5 text-lg sm:text-xl font-extrabold text-foreground leading-none">{value}</p>
    </div>
  )
}
