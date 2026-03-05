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
  ReferenceLine,
  ReferenceArea,
  Label,
} from "recharts"
import { safeParseDate, formatNum, degToCompass } from "@/lib/surf-utils"
import type { ChartDataPoint } from "@/lib/surf-utils"

interface WaveChartProps {
  data: ChartDataPoint[]
}

function dayKey(iso: string) {
  return String(iso).slice(0, 10)
}

function dayLabelShort(iso: string) {
  const d = safeParseDate(iso)
  const dias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]
  return dias[d.getDay()]
}

function dayNumber(iso: string) {
  const d = safeParseDate(iso)
  return String(d.getDate()).padStart(2, "0")
}

function hourOnly(iso: string) {
  const d = safeParseDate(iso)
  return `${String(d.getHours()).padStart(2, "0")}h`
}

interface DayBoundary {
  index: number
  label: string
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

  // Build chart data with composite label for XAxis
  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        index: i,
        label: hourOnly(d.time),
      })),
    [data]
  )

  // Find day boundaries for reference lines and header (max 5 days)
  const dayBoundaries = useMemo(() => {
    const boundaries: DayBoundary[] = []
    if (!data.length) return boundaries
    let curKey = dayKey(data[0].time)
    boundaries.push({ index: 0, label: `${dayLabelShort(data[0].time)} ${dayNumber(data[0].time)}` })
    for (let i = 1; i < data.length; i++) {
      if (boundaries.length >= 5) break
      const k = dayKey(data[i].time)
      if (k !== curKey) {
        boundaries.push({ index: i, label: `${dayLabelShort(data[i].time)} ${dayNumber(data[i].time)}` })
        curKey = k
      }
    }
    return boundaries
  }, [data])

  // Custom XAxis tick: show day label at boundaries, hour every 6h
  const xTickFormatter = useCallback(
    (_val: string, index: number) => {
      const boundary = dayBoundaries.find((b) => b.index === index)
      if (boundary) return boundary.label
      const d = safeParseDate(data[index]?.time ?? "")
      const h = d.getHours()
      if (h % 6 === 0) return `${String(h).padStart(2, "0")}h`
      return ""
    },
    [dayBoundaries, data]
  )

  // Compute end index for each day boundary
  const dayRanges = useMemo(() => {
    return dayBoundaries.map((b, idx) => {
      const endIdx = idx < dayBoundaries.length - 1
        ? dayBoundaries[idx + 1].index - 1
        : chartData.length - 1
      return { ...b, endIdx }
    })
  }, [dayBoundaries, chartData.length])

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
    <div className="rounded-xl border border-border bg-card p-5">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} onMouseMove={handleMouseMove} margin={{ top: 28, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="seaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          {/* Day header labels rendered inside chart as ReferenceAreas */}
          {dayRanges.map((range, idx) => (
            <ReferenceArea
              key={range.index}
              x1={range.index}
              x2={range.endIdx}
              y1={0}
              y2={0}
              ifOverflow="extendDomain"
              fill="transparent"
              fillOpacity={0}
            >
              <Label
                value={`${range.label.split(" ")[0]} (${range.label.split(" ")[1]})`}
                position="top"
                offset={12}
                style={{
                  fill: idx === 0 ? "#38bdf8" : "#a1a1aa",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              />
            </ReferenceArea>
          ))}
          {/* Day separator lines */}
          {dayBoundaries.slice(1).map((b) => (
            <ReferenceLine
              key={b.index}
              x={b.index}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1}
              strokeDasharray="3 3"
              label=""
            />
          ))}
          <XAxis dataKey="index" hide />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="waveHeight"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#seaGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#38bdf8", strokeWidth: 2, stroke: "#121214" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Active point metrics */}
      {activePoint && (
        <div className="mt-2 grid grid-cols-4 gap-1 sm:gap-1.5">
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
  return (
    <div className="rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] px-1 sm:px-2 py-1 sm:py-1.5 text-center">
      <p className={`text-[0.4rem] sm:text-[0.5rem] font-bold uppercase tracking-wide ${color}`}>{label}</p>
      <p className="mt-0.5 text-[0.65rem] sm:text-xs font-bold text-foreground leading-none">{value}</p>
    </div>
  )
}
