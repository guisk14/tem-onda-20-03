"use client"

interface DaySelectorProps {
  segments: { key: string; shortLabel: string; number: string }[]
  selectedIdx: number
  onSelect: (idx: number) => void
}

export function DaySelector({ segments, selectedIdx, onSelect }: DaySelectorProps) {
  if (!segments.length) return null

  return (
    <div
      className="mb-4 grid gap-2.5 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
    >
      {segments.map((seg, idx) => {
        const isActive = idx === selectedIdx
        const isToday = idx === 0

        return (
          <button
            key={seg.key}
            type="button"
            onClick={() => onSelect(idx)}
            className={`
              relative flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-3 py-2 sm:py-2.5
              text-center font-bold uppercase transition-all duration-200 cursor-pointer
              ${isActive
                ? "bg-sky-500 text-white shadow-[0_4px_12px_rgba(56,189,248,0.35)]"
                : "bg-[rgba(255,255,255,0.04)] text-muted-foreground hover:bg-[rgba(255,255,255,0.08)] hover:text-foreground"
              }
            `}
          >
            {isToday && !isActive && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
            )}
            <span className="text-[0.5rem] sm:text-xs font-extrabold tracking-wider leading-none">
              {seg.shortLabel}
            </span>
            <span className={`text-xs sm:text-lg font-black leading-none mt-0.5 ${isActive ? "text-white" : "text-foreground/70"}`}>
              {seg.number}
            </span>
          </button>
        )
      })}
    </div>
  )
}
