"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Waves, Menu, X } from "lucide-react"

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Previsao", href: "/#forecast-content" },
  { label: "Comunidade", href: "/comunidade" },
  { label: "Contato", href: "/contato" },
]

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Check if link is active
  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href.startsWith("/#")) return pathname === "/"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header 
      className={`sticky top-0 z-50 flex items-center justify-between backdrop-blur-[10px] bg-[rgba(10,15,25,0.6)] px-6 border-b border-[rgba(255,255,255,0.06)] lg:px-8 lg:justify-start lg:gap-8 transition-all duration-300 ${
        scrolled ? "py-3" : "py-4"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center rounded-full border-2 border-primary bg-primary/10 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all duration-300 ${
          scrolled ? "h-9 w-9" : "h-10 w-10"
        }`}>
          <Waves className={`text-primary transition-all duration-300 ${scrolled ? "h-4 w-4" : "h-5 w-5"}`} />
        </div>
        <h1 className={`font-extrabold uppercase tracking-tight transition-all duration-300 ${
          scrolled ? "text-base" : "text-lg"
        }`}>
          <span className="text-white">TEM</span>{" "}
          <span className="text-primary">ONDA</span>
        </h1>
      </div>

      <button
        className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-white/5 lg:hidden ml-auto transition-colors hover:bg-white/10"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </button>

      <nav
        className={`${
          menuOpen
            ? "absolute top-full left-0 right-0 flex flex-col items-center bg-[rgba(24,24,27,0.95)] backdrop-blur-xl border-b border-border"
            : "hidden"
        } lg:relative lg:top-auto lg:flex lg:bg-transparent lg:border-none lg:flex-1 lg:justify-center`}
      >
        <ul className="flex flex-col items-center lg:flex-row lg:gap-8">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href)
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`relative block px-6 py-4 text-center lg:py-2 lg:px-3 text-sm font-semibold uppercase transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {/* Active indicator - underline */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-primary rounded-full transition-all duration-300 ${
                      isActive ? "w-6 opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                  {/* Mobile active background */}
                  {isActive && (
                    <span className="absolute inset-0 bg-primary/10 rounded-lg lg:hidden -z-10" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
