"use client"

import { useState, useMemo } from "react"
import { formatNum, degToCompass, safeParseDate } from "@/lib/surf-utils"
import type { ForecastData } from "@/lib/surf-utils"
import { DaySelector } from "@/components/day-selector"

interface ForecastTablesProps {
  data: ForecastData | null
  beachName: string
  loading: boolean
}

interface DaySegment {
  key: string
  shortLabel: string
  number: string
  startIdx: number
  endIdx: number
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

function computeTableDaySegments(data: ForecastData["tableData"]): DaySegment[] {
  if (!data.length) return []
  const segs: DaySegment[] = []
  let start = 0
  let curKey = dayKey(data[0].timeISO)
  for (let i = 1; i < data.length; i++) {
    const k = dayKey(data[i].timeISO)
    if (k !== curKey) {
      segs.push({ key: curKey, shortLabel: dayLabelShort(data[start].timeISO), number: dayNumber(data[start].timeISO), startIdx: start, endIdx: i - 1 })
      start = i
      curKey = k
    }
  }
  segs.push({ key: curKey, shortLabel: dayLabelShort(data[start].timeISO), number: dayNumber(data[start].timeISO), startIdx: start, endIdx: data.length - 1 })
  return segs
}

function computeWindDaySegments(data: ForecastData["windTableData"]): DaySegment[] {
  if (!data.length) return []
  const segs: DaySegment[] = []
  let start = 0
  let curKey = dayKey(data[0].timeISO)
  for (let i = 1; i < data.length; i++) {
    const k = dayKey(data[i].timeISO)
    if (k !== curKey) {
      segs.push({ key: curKey, shortLabel: dayLabelShort(data[start].timeISO), number: dayNumber(data[start].timeISO), startIdx: start, endIdx: i - 1 })
      start = i
      curKey = k
    }
  }
  segs.push({ key: curKey, shortLabel: dayLabelShort(data[start].timeISO), number: dayNumber(data[start].timeISO), startIdx: start, endIdx: data.length - 1 })
  return segs
}

export function ForecastTables({ data, beachName, loading }: ForecastTablesProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [selectedWindDayIdx, setSelectedWindDayIdx] = useState(0)

  const segments = useMemo(() => {
    if (!data) return []
    return computeTableDaySegments(data.tableData)
  }, [data])

  const windSegments = useMemo(() => {
    if (!data) return []
    return computeWindDaySegments(data.windTableData)
  }, [data])

  const filteredTableData = useMemo(() => {
    if (!data || !segments.length) return []
    const seg = segments[selectedDayIdx] ?? segments[0]
    return data.tableData.slice(seg.startIdx, seg.endIdx + 1)
  }, [data, segments, selectedDayIdx])

  const filteredWindData = useMemo(() => {
    if (!data || !windSegments.length) return []
    const seg = windSegments[selectedWindDayIdx] ?? windSegments[0]
    return data.windTableData.slice(seg.startIdx, seg.endIdx + 1)
  }, [data, windSegments, selectedWindDayIdx])

  return (
    <div className="flex flex-col gap-4">
      {/* Wind Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        {/* Mobile title */}
        <div className="md:hidden mb-4 text-center">
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Vento <span className="text-muted-foreground/50 mx-1">•</span>
            <span className="text-sky-400" style={{ textShadow: '0 0 8px rgba(56,189,248,0.4)' }}>{beachName}</span>
          </h3>
          <p className="text-[12px] text-muted-foreground/60 mt-1">
            Condição do vento ao longo do dia
          </p>
        </div>
        {/* Desktop title */}
        <h3 className="hidden md:block mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
          {"Direção do Vento (Maral / Terral) — "}
          <span className="text-sky-400" style={{ textShadow: '0 0 8px rgba(56,189,248,0.4)' }}>{beachName}</span>
        </h3>

        {/* Wind Day selector */}
        <DaySelector segments={windSegments} selectedIdx={selectedWindDayIdx} onSelect={setSelectedWindDayIdx} />
        <div className="rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] md:overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="px-2 py-2 md:px-4 md:py-3 text-[10px] md:text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground/60 bg-[rgba(255,255,255,0.02)] text-center">Hora</th>
                <th className="px-2 py-2 md:px-4 md:py-3 text-[10px] md:text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground/60 bg-[rgba(255,255,255,0.02)] text-center">Vento</th>
                <th className="px-2 py-2 md:px-4 md:py-3 text-[10px] md:text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground/60 bg-[rgba(255,255,255,0.02)] text-center">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {loading || !data ? (
                <tr>
                  <td colSpan={3} className="px-2 py-4 md:px-4 md:py-6 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filteredWindData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-2 py-4 md:px-4 md:py-6 text-center text-muted-foreground">
                    Sem dados
                  </td>
                </tr>
              ) : (
                filteredWindData.map((row, i) => (
                  <tr key={i} className="border-t border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-2 py-1.5 md:px-4 md:py-3 text-[11px] md:text-sm text-muted-foreground text-center">{row.hour}</td>
                    <td className="px-2 py-1.5 md:px-4 md:py-3 text-[11px] md:text-sm text-center">
                      <span className="font-medium text-foreground/80 md:font-semibold md:text-foreground">{row.speed} km/h {row.direction}</span>
                    </td>
                    <td className="px-2 py-1.5 md:px-4 md:py-3 text-[11px] md:text-sm font-extrabold text-center" style={{ color: row.color }}>
                      {row.type} {row.intensity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wave Forecast Table - Daily */}
      <div className="rounded-xl border border-border bg-card p-5">
        {/* Mobile title */}
        <h3 className="md:hidden mb-4 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-foreground">Previsão de Ondas</span>
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-400/20">
            Tabela
          </span>
        </h3>
        {/* Desktop title */}
        <h3 className="hidden md:block mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
          Previsão Detalhada de Ondas (Diário)
        </h3>

        {/* Day selector */}
        <DaySelector segments={segments} selectedIdx={selectedDayIdx} onSelect={setSelectedDayIdx} />

        <div className="rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] md:overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="px-1.5 py-1.5 text-[10px] md:px-4 md:py-3 md:text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground/60 bg-[rgba(255,255,255,0.02)] text-center">Hora</th>
                <th className="px-1.5 py-1.5 text-[10px] md:px-4 md:py-3 md:text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground/60 bg-[rgba(255,255,255,0.02)] text-center">Altura</th>
                <th className="hidden md:table-cell px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground/60 bg-[rgba(255,255,255,0.02)] text-center">Periodo (s)</th>
                <th className="px-1.5 py-1.5 text-[10px] md:px-4 md:py-3 md:text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground/60 bg-[rgba(255,255,255,0.02)] text-center">Dir.</th>
                <th className="px-1.5 py-1.5 text-[10px] md:px-4 md:py-3 md:text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground/60 bg-[rgba(255,255,255,0.02)] text-center">Vento</th>
              </tr>
            </thead>
            <tbody>
              {loading || !data ? (
                <tr>
                  <td colSpan={5} className="px-2 py-4 md:px-4 md:py-6 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : (
                filteredTableData.map((row, i) => (
                  <tr key={i} className="border-t border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-1.5 py-1.5 text-[11px] md:px-4 md:py-3 md:text-sm text-foreground text-center">{row.time}</td>
                    <td className="px-1.5 py-1.5 text-[11px] md:px-4 md:py-3 md:text-sm font-bold text-sky-400 text-center">{formatNum(row.height, 1)} m</td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-foreground text-center">{formatNum(row.period, 1)}</td>
                    <td className="px-1.5 py-1.5 text-[11px] md:px-4 md:py-3 md:text-sm text-foreground text-center">
                      <span className="hidden md:inline">{formatNum(row.direction, 0)}° </span>{degToCompass(row.direction)}
                    </td>
                    <td className="px-1.5 py-1.5 text-[11px] md:px-4 md:py-3 md:text-sm text-foreground text-center">
                      {Math.round(row.windSpeed)} km/h {degToCompass(row.windDirDeg)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
