"use client"

import Image from "next/image"
import { ChevronDown } from "lucide-react"

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
    <section className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-ocean.jpg"
          alt="Ocean wave"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Dark Overlay Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(10, 10, 12, 0.4) 0%,
              rgba(10, 10, 12, 0.5) 40%,
              rgba(10, 10, 12, 0.7) 70%,
              rgba(18, 18, 20, 0.95) 100%
            )
          `
        }}
      />

      {/* Side gradient for text readability */}
      <div 
        className="absolute inset-0 hidden md:block"
        style={{
          background: `
            linear-gradient(
              to right,
              rgba(10, 10, 12, 0.6) 0%,
              rgba(10, 10, 12, 0.3) 40%,
              transparent 70%
            )
          `
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-8 bg-sky-400"></span>
            <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Previsao de Ondas
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 text-balance">
            Veja quando as melhores ondas vao chegar
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8 max-w-lg">
            Dados atualizados de swell, vento e mare para acompanhar as condicoes do seu pico.
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToContent}
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm md:text-base transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:shadow-xl"
          >
            <span>Ver previsao</span>
            <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

        </div>
      </div>

      {/* Animated Waves at Bottom */}
      <div className="absolute -bottom-4 md:-bottom-6 left-0 right-0 h-28 md:h-36 overflow-hidden">
        {/* Wave 1 - Back */}
        <svg 
          className="absolute bottom-0 w-[200%] h-full animate-wave-slow opacity-15"
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" 
            fill="url(#waveGrad1)"
          />
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>

        {/* Wave 2 - Middle */}
        <svg 
          className="absolute bottom-0 w-[200%] h-full animate-wave-medium opacity-20"
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,80 C360,20 720,100 1080,40 C1260,10 1380,60 1440,80 L1440,120 L0,120 Z" 
            fill="url(#waveGrad2)"
          />
          <defs>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Wave 3 - Front */}
        <svg 
          className="absolute bottom-0 w-[200%] h-full animate-wave-fast opacity-25"
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,90 C180,60 360,100 540,70 C720,40 900,90 1080,60 C1260,30 1380,70 1440,90 L1440,120 L0,120 Z" 
            fill="url(#waveGrad3)"
          />
          <defs>
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Bottom gradient fade to page */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(18,18,20,1) 0%, transparent 100%)"
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
          animation: wave-slow 20s linear infinite;
        }
        .animate-wave-medium {
          animation: wave-medium 15s linear infinite;
        }
        .animate-wave-fast {
          animation: wave-fast 10s linear infinite;
        }
      `}</style>
    </section>
  )
}
