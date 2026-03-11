"use client"

import { ChevronDown } from "lucide-react"

export function HeroSection() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 80,
      behavior: "smooth"
    })
  }

  return (
    <section className="relative flex min-h-[50vh] md:min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 py-12 md:py-16">
      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 md:h-48 opacity-20"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(56,189,248,0.3) 100%)"
          }}
        />
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-24 md:h-32 opacity-30 animate-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            fill="url(#heroWaveGradient)"
          />
          <defs>
            <linearGradient id="heroWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-20 md:h-28 opacity-20 animate-wave-slow"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 C360,20 720,100 1080,40 C1260,10 1380,50 1440,80 L1440,120 L0,120 Z"
            fill="#0ea5e9"
          />
        </svg>
      </div>

      {/* Glow effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)"
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Main headline */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6">
          <span className="text-sky-400" style={{ textShadow: '0 0 30px rgba(56,189,248,0.5)' }}>
            Previsao de Ondas
          </span>
        </h1>

        {/* Tagline */}
        <p className="max-w-md md:max-w-lg text-base md:text-xl text-muted-foreground/80 leading-relaxed mb-3">
          Dados em tempo real para o litoral paulista
        </p>
        
        {/* Subtitle metrics */}
        <p className="text-sm md:text-base text-muted-foreground/60 mb-8 md:mb-10">
          Altura <span className="mx-1.5 text-sky-400/60">·</span> 
          Periodo <span className="mx-1.5 text-sky-400/60">·</span> 
          Vento <span className="mx-1.5 text-sky-400/60">·</span> 
          Mare
        </p>

        {/* CTA Button */}
        <button
          onClick={scrollToContent}
          className="group flex flex-col items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
        >
          <span className="text-sm font-medium tracking-wide uppercase">Ver Previsao</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 md:h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(18,18,20,1) 0%, transparent 100%)"
        }}
      />

      <style jsx>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes wave-slow {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-wave {
          animation: wave 15s linear infinite;
        }
        .animate-wave-slow {
          animation: wave-slow 20s linear infinite;
        }
      `}</style>
    </section>
  )
}
