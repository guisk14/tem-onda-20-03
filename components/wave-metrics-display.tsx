"use client"

import { useEffect, useState } from "react"

interface WaveMetricsDisplayProps {
  height?: number
  period?: number
  wind?: number
}

export function WaveMetricsDisplay({ height, period, wind }: WaveMetricsDisplayProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const metrics = [
    { 
      label: "Altura", 
      value: height?.toFixed(1) ?? "—", 
      unit: "m",
      color: "#38bdf8",
      delay: "0s"
    },
    { 
      label: "Periodo", 
      value: period?.toFixed(0) ?? "—", 
      unit: "s",
      color: "#22d3ee",
      delay: "0.5s"
    },
    { 
      label: "Vento", 
      value: wind?.toFixed(0) ?? "—", 
      unit: "km/h",
      color: "#06b6d4",
      delay: "1s"
    },
  ]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[rgba(0,0,0,0.4)] backdrop-blur-xl border border-white/10">
      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <svg 
          className="absolute bottom-0 left-0 w-[200%] h-full"
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#0e7490" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Wave 1 - Front */}
          <path 
            className="animate-wave-1"
            d="M0,224 C120,260 240,180 360,200 C480,220 600,280 720,260 C840,240 960,180 1080,200 C1200,220 1320,280 1440,260 L1440,320 L0,320 Z"
            fill="url(#waveGradient1)"
          />
          
          {/* Wave 2 - Middle */}
          <path 
            className="animate-wave-2"
            d="M0,256 C180,200 360,280 540,240 C720,200 900,280 1080,240 C1260,200 1380,260 1440,240 L1440,320 L0,320 Z"
            fill="url(#waveGradient2)"
          />
          
          {/* Wave 3 - Back */}
          <path 
            className="animate-wave-3"
            d="M0,288 C240,240 480,300 720,270 C960,240 1200,300 1440,280 L1440,320 L0,320 Z"
            fill="url(#waveGradient3)"
          />
        </svg>
      </div>

      {/* Glow effects */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-around py-6 px-4 md:py-8 md:px-8">
        {metrics.map((metric, index) => (
          <div 
            key={metric.label}
            className={`flex flex-col items-center text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: metric.delay }}
          >
            {/* Animated ring */}
            <div className="relative mb-3">
              <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                />
                {/* Animated progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={metric.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset={mounted ? 66 : 264}
                  className="transition-all duration-1000 ease-out origin-center -rotate-90"
                  style={{ 
                    transitionDelay: `calc(${metric.delay} + 0.3s)`,
                    filter: `drop-shadow(0 0 8px ${metric.color})`
                  }}
                />
              </svg>
              {/* Value inside ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span 
                  className="text-xl md:text-2xl font-bold text-white"
                  style={{ textShadow: `0 0 20px ${metric.color}` }}
                >
                  {metric.value}
                </span>
                <span className="text-[10px] md:text-xs text-white/60 font-medium">
                  {metric.unit}
                </span>
              </div>
            </div>
            
            {/* Label */}
            <span 
              className="text-xs md:text-sm font-semibold uppercase tracking-wider"
              style={{ color: metric.color }}
            >
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Separator lines with glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-sky-500/50 to-transparent" />
      <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-sky-500/50 to-transparent" />

      <style jsx>{`
        @keyframes wave1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes wave2 {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(-75%); }
        }
        @keyframes wave3 {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-wave-1 {
          animation: wave1 8s ease-in-out infinite;
        }
        .animate-wave-2 {
          animation: wave2 10s ease-in-out infinite;
        }
        .animate-wave-3 {
          animation: wave3 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
