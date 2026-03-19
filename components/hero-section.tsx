"use client"

import Image from "next/image"
import { ChevronDown, Sparkles } from "lucide-react"

export function HeroSection() {
  const scrollToContent = () => {
    const element = document.getElementById("forecast-content")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    } else {
      window.scrollTo({
        top: window.innerHeight - 80,
        behavior: "smooth"
      })
    }
  }

  return (
    <section className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-ocean.jpg"
          alt="Ocean wave"
          fill
          className="object-cover scale-105"
          priority
        />
      </div>

      {/* Gen Z Style Overlay - vibrant gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.5) 40%, rgba(0,212,255,0.08) 70%, rgba(255,61,127,0.12) 100%),
            linear-gradient(180deg, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.9) 100%)
          `
        }}
      />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#00d4ff]/20 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-40 left-20 w-96 h-96 bg-[#ff3d7f]/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          {/* Tag - Gen Z style pill */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[#00d4ff]" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#00d4ff]">
              Previsao em tempo real
            </span>
          </div>

          {/* Title - Bold Gen Z typography */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 text-balance">
            Encontre a{" "}
            <span className="gradient-text">onda perfeita</span>
            {" "}pro seu rolê
          </h1>

          {/* Description */}
          <p className="text-base md:text-xl text-white/70 leading-relaxed mb-10 max-w-[600px] font-medium">
            Dados de swell, vento e maré atualizados pra você nunca perder as melhores condições do seu pico favorito.
          </p>

          {/* CTA Buttons - Gen Z style */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={scrollToContent}
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-bold text-sm md:text-base transition-all duration-300 glow-cyan hover:scale-[1.02]"
            >
              <span>Ver previsão</span>
              <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
            </button>
            <button
              onClick={scrollToContent}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-sm md:text-base transition-all duration-300 backdrop-blur-sm"
            >
              <span>Explorar praias</span>
            </button>
          </div>

          {/* Stats - Gen Z style badges */}
          <div className="flex flex-wrap gap-3 mt-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm">
              <span className="text-xl font-black text-[#00d4ff]">50+</span>
              <span className="text-xs text-white/60 font-medium">praias</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm">
              <span className="text-xl font-black text-[#ff3d7f]">24/7</span>
              <span className="text-xs text-white/60 font-medium">atualizado</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm">
              <span className="text-xl font-black text-[#a855f7]">100%</span>
              <span className="text-xs text-white/60 font-medium">free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Waves at Bottom - Gen Z Gradient */}
      <div className="absolute -bottom-4 md:-bottom-6 left-0 right-0 h-32 md:h-40 overflow-hidden">
        {/* Wave 1 - Back */}
        <svg 
          className="absolute bottom-0 w-[200%] h-full animate-wave-slow opacity-20"
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" 
            fill="url(#waveGrad1)"
          />
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
        </svg>

        {/* Wave 2 - Middle */}
        <svg 
          className="absolute bottom-0 w-[200%] h-full animate-wave-medium opacity-25"
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,80 C360,20 720,100 1080,40 C1260,10 1380,60 1440,80 L1440,120 L0,120 Z" 
            fill="url(#waveGrad2)"
          />
          <defs>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff3d7f" />
              <stop offset="50%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#ff3d7f" />
            </linearGradient>
          </defs>
        </svg>

        {/* Wave 3 - Front */}
        <svg 
          className="absolute bottom-0 w-[200%] h-full animate-wave-fast opacity-30"
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,90 C180,60 360,100 540,70 C720,40 900,90 1080,60 C1260,30 1380,70 1440,90 L1440,120 L0,120 Z" 
            fill="url(#waveGrad3)"
          />
          <defs>
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Bottom gradient fade to page */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 100%)"
        }}
      />

      <style jsx>{`
        @keyframes wave-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes wave-medium {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes wave-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave-slow {
          animation: wave-slow 18s linear infinite;
        }
        .animate-wave-medium {
          animation: wave-medium 12s linear infinite;
        }
        .animate-wave-fast {
          animation: wave-fast 8s linear infinite;
        }
      `}</style>
    </section>
  )
}
