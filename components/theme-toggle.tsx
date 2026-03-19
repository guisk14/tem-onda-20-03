"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-[42px] h-[42px] rounded-xl bg-white/5 border border-white/5 animate-pulse" />
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className={`
        group relative flex items-center justify-center w-[42px] h-[42px] rounded-xl
        border transition-all duration-300 overflow-hidden
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${isDark
          ? "bg-white/5 border-white/8 hover:bg-white/10 hover:border-white/15"
          : "bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300 shadow-sm"
        }
      `}
    >
      {/* Active theme indicator strip */}
      <span
        className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-all duration-300 ${
          isDark ? "bg-primary" : "bg-sky-500"
        }`}
      />

      {/* Sun icon - shown in dark mode (click to go light) */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"
        }`}
      >
        <Sun className="h-[18px] w-[18px] text-primary" />
      </span>

      {/* Moon icon - shown in light mode (click to go dark) */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isDark ? "opacity-0 scale-50 -rotate-90" : "opacity-100 scale-100 rotate-0"
        }`}
      >
        <Moon className="h-[18px] w-[18px] text-sky-600" />
      </span>
    </button>
  )
}
