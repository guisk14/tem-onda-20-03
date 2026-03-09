import type { Beach } from "./beach-data"

export function safeParseDate(isoStr: string): Date {
  if (!isoStr) return new Date()
  const s = String(isoStr)
  const y = parseInt(s.slice(0, 4))
  const m = parseInt(s.slice(5, 7)) - 1
  const d = parseInt(s.slice(8, 10))
  const h = parseInt(s.slice(11, 13)) || 0
  return new Date(y, m, d, h)
}

export function formatNum(x: number | null | undefined, d: number = 1): string {
  if (typeof x !== "number" || Number.isNaN(x)) return "--"
  return x.toFixed(d)
}

export function normDeg(deg: number): number {
  deg = Number(deg)
  if (Number.isNaN(deg)) return NaN
  deg = deg % 360
  return deg < 0 ? deg + 360 : deg
}

export function degInRange(deg: number, min: number, max: number): boolean {
  deg = normDeg(deg)
  min = normDeg(min)
  max = normDeg(max)
  if (Number.isNaN(deg) || Number.isNaN(min) || Number.isNaN(max)) return false
  if (min <= max) return deg >= min && deg <= max
  return deg >= min || deg <= max
}

export function inRanges(angle: number, ranges: [number, number][]): boolean {
  for (const [min, max] of ranges) {
    if (degInRange(angle, min, max)) return true
  }
  return false
}

export function swellEntraNaPraia(beach: Beach, swellFromDeg: number): boolean {
  const ranges = beach.inletRanges
  if (!ranges || !ranges.length) return true
  return ranges.some(([min, max]) => degInRange(swellFromDeg, min, max))
}

export function degToCompass(deg: number): string {
  if (typeof deg !== "number" || Number.isNaN(deg)) return "--"
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"]
  const idx = Math.round(normDeg(deg) / 22.5) % 16
  return dirs[idx]
}

export function classifyWind(windDir: number, inletRanges: [number, number][]): string {
  windDir = normDeg(windDir)
  if (inRanges(windDir, inletRanges)) return "MARAL"
  const opp = normDeg(windDir + 180)
  if (inRanges(opp, inletRanges)) return "TERRAL"
  return "LATERAL"
}

export function classifyIntensity(speed: number): string {
  if (!Number.isFinite(speed)) return "--"
  if (speed < 5) return "FRACO"
  if (speed < 20) return "MODERADO"
  return "FORTE"
}

export function windColor(type: string, intensity: string): string {
  if (intensity === "FRACO" || type === "TERRAL") return "#10b981"
  if (type === "MARAL" || intensity === "FORTE") return "#ef4444"
  return "#f59e0b"
}

export function findClosestHourIndex(times: string[]): number {
  const now = Date.now()
  let bestIdx = 0
  let bestDiff = Infinity
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(safeParseDate(times[i]).getTime() - now)
    if (diff < bestDiff) {
      bestDiff = diff
      bestIdx = i
    }
  }
  return bestIdx
}

export interface ChartDataPoint {
  time: string
  waveHeight: number
  wavePeriod: number
  waveDirDeg: number
  windSpeed: number
  windDirDeg: number
}

export interface ForecastData {
  currentHeight: number
  currentPeriod: number
  currentDirection: number
  currentDirectionCompass: string
  currentWindSpeed: number
  currentWindDir: number
  currentWindGust: number
  currentWindType: string
  currentWindIntensity: string
  currentWindColor: string
  chartData: ChartDataPoint[]
  tableData: {
    time: string
    timeISO: string
    height: number
    period: number
    direction: number
    windSpeed: number
    windDirDeg: number
  }[]
  windTableData: {
    day: string
    hour: string
    timeISO: string
    speed: number
    direction: string
    type: string
    intensity: string
    color: string
  }[]
  swellEnters: boolean
}

export async function fetchForecast(beach: Beach): Promise<ForecastData> {
  const [mRes, wRes] = await Promise.all([
    fetch(buildMarineUrl(beach.lat, beach.lon)),
    fetch(buildWindUrl(beach.lat, beach.lon)),
  ])

  if (!mRes.ok || !wRes.ok) throw new Error("Erro na API. Tente mais tarde.")

  const marine = await mRes.json()
  const weather = await wRes.json()

  const times: string[] = marine.hourly.time
  const hWave: number[] = marine.hourly.wave_height
  const pWave: number[] = marine.hourly.wave_period
  const dWave: number[] = marine.hourly.wave_direction
  const hSwell: number[] = marine.hourly.swell_wave_height
  const pSwell: number[] = marine.hourly.swell_wave_period
  const dSwell: number[] = marine.hourly.swell_wave_direction
  const windS: number[] = weather.hourly.wind_speed_10m
  const windD: number[] = weather.hourly.wind_direction_10m
  const windG: number[] = weather.hourly.wind_gusts_10m

  const idxNow = findClosestHourIndex(times)
  let factor = typeof beach.factor === "number" ? beach.factor : 1
  factor = Math.max(0.2, Math.min(1.2, factor))

  const swellFromNow = dSwell[idxNow]
  const entraNow = swellEntraNaPraia(beach, swellFromNow)
  let alturaOndaNow = (hSwell[idxNow] ?? 0) * factor
  if (!entraNow) alturaOndaNow = 0

  const wDirNow = windD[idxNow]
  const wSpeedNow = windS[idxNow]
  const wTypeNow = classifyWind(wDirNow, beach.inletRanges || [])
  const wIntNow = classifyIntensity(wSpeedNow)

  // Find start of today (00:00) for chart alignment
  const todayDate = safeParseDate(times[idxNow])
  const todayMidnight = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0).getTime()
  let idxMidnight = idxNow
  for (let i = 0; i < times.length; i++) {
    if (safeParseDate(times[i]).getTime() >= todayMidnight) {
      idxMidnight = i
      break
    }
  }

  // Chart data (starts at 00:00 of today, 5 full days = 120h)
  const chartData: ChartDataPoint[] = []
  const endChart = Math.min(times.length, idxMidnight + 120)
  for (let i = idxMidnight; i < endChart; i++) {
    if (hWave[i] == null) continue
    const entra = swellEntraNaPraia(beach, dWave[i])
    chartData.push({
      time: times[i],
      waveHeight: entra ? hWave[i] * factor : 0,
      wavePeriod: pWave[i],
      waveDirDeg: dWave[i],
      windSpeed: windS[i],
      windDirDeg: windD[i],
    })
  }

  // Table data (same range as chart - all days, every 3h, starting from today 00:00)
  const endTable = Math.min(times.length, idxMidnight + 120)
  const tableData = []
  // Align start to next multiple of 3h from midnight
  const startTable = idxMidnight + ((3 - (idxMidnight % 3)) % 3)
  for (let i = startTable; i < endTable; i += 3) {
    const entra = swellEntraNaPraia(beach, dWave[i])
    tableData.push({
      time: String(times[i]).slice(11, 16),
      timeISO: times[i],
      height: entra ? hWave[i] * factor : 0,
      period: pWave[i],
      direction: dWave[i],
      windSpeed: windS[i] ?? 0,
      windDirDeg: windD[i] ?? 0,
    })
  }

  // Wind table data (all days, every 3h - same range as chart, starting from today 00:00)
  const windTableData: ForecastData["windTableData"] = []
  const windStartTable = idxMidnight + ((3 - (idxMidnight % 3)) % 3)
  const endWind = Math.min(weather.hourly.time.length, idxMidnight + 120)
  for (let i = windStartTable; i < endWind; i += 3) {
    const d = safeParseDate(weather.hourly.time[i])
    const day = d.toLocaleDateString("pt-BR", { weekday: "short" })
    const hh = String(d.getHours()).padStart(2, "0") + ":00"
    const type = classifyWind(windD[i], beach.inletRanges || [])
    const intensity = classifyIntensity(windS[i])
    windTableData.push({
      day,
      hour: hh,
      timeISO: weather.hourly.time[i],
      speed: Math.round(windS[i]),
      direction: degToCompass(windD[i]),
      type,
      intensity,
      color: windColor(type, intensity),
    })
  }

  return {
    currentHeight: alturaOndaNow,
    currentPeriod: pSwell[idxNow],
    currentDirection: swellFromNow,
    currentDirectionCompass: degToCompass(swellFromNow),
    currentWindSpeed: wSpeedNow,
    currentWindDir: wDirNow,
    currentWindGust: windG?.[idxNow] ?? wSpeedNow,
    currentWindType: wTypeNow,
    currentWindIntensity: wIntNow,
    currentWindColor: windColor(wTypeNow, wIntNow),
    chartData,
    tableData,
    windTableData,
    swellEnters: entraNow,
  }
}

function buildMarineUrl(lat: number, lon: number): string {
  return `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction&timezone=America/Sao_Paulo&forecast_days=6`
}

function buildWindUrl(lat: number, lon: number): string {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh&timezone=America/Sao_Paulo&forecast_days=6`
}
