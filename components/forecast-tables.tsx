"use client"

import { formatNum, degToCompass } from "@/lib/surf-utils"
import type { ForecastData } from "@/lib/surf-utils"

interface ForecastTablesProps {
  data: ForecastData | null
  beachName: string
  loading: boolean
}

export function ForecastTables({ data, beachName, loading }: ForecastTablesProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Wind Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
          {"Direcao do Vento (Maral / Terral) — "}
          <span className="text-primary">{beachName}</span>
        </h3>
        <div className="overflow-x-auto rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Dia</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Hora</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Vento</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Direcao</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {loading || !data ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : (
                data.windTableData.map((row, i) => (
                  <tr key={i} className="border-t border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{row.day}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{row.hour}</td>
                    <td className="px-4 py-3 text-sm text-foreground font-semibold">{row.speed} km/h</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{row.direction}</td>
                    <td className="px-4 py-3 text-sm font-extrabold" style={{ color: row.color }}>
                      {row.type} {row.intensity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wave Forecast Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
          Previsao Detalhada de Ondas (Proximas 24h)
        </h3>
        <div className="overflow-x-auto rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Hora</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Altura (m)</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Periodo (s)</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground bg-[rgba(255,255,255,0.02)]">Direcao</th>
              </tr>
            </thead>
            <tbody>
              {loading || !data ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : (
                data.tableData.map((row, i) => (
                  <tr key={i} className="border-t border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">{row.time}</td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">{formatNum(row.height, 1)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatNum(row.period, 1)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {formatNum(row.direction, 0)}° {degToCompass(row.direction)}
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
