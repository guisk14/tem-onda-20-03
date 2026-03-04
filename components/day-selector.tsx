"use client"

interface DaySelectorProps {
  segments: { key: string; shortLabel: string; number: string }[]
  selectedIdx: number
  onSelect: (idx: number) => void
}

export function DaySelector({ segments, selectedIdx, onSelect }: DaySelectorProps) {
  if (!segments.length) return null

  return (
    <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {segments.map((seg, idx) => {
        const isActive = idx === selectedIdx
        const isToday = idx === 0

        return (
          <button
            key={seg.key}
            type="button"
            onClick={() => onSelect(idx)}
            className={`
              relative flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[3.5rem]
              text-center font-bold uppercase transition-all duration-200 cursor-pointer
              ${isActive
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                : "bg-[rgba(255,255,255,0.04)] text-muted-foreground hover:bg-[rgba(255,255,255,0.08)] hover:text-foreground"
              }
            `}
          >
            {isToday && !isActive && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
            <span className="text-[0.65rem] sm:text-xs font-extrabold tracking-wider leading-none">
              {seg.shortLabel}
            </span>
            <span className={`text-base sm:text-lg font-black leading-none mt-0.5 ${isActive ? "text-primary-foreground" : "text-foreground/70"}`}>
              {seg.number}
            </span>
          </button>
        )
      })}
    </div>
  )
}
