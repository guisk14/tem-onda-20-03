"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"

const navLinks = [
  { label: "Inicio", href: "#", active: true },
  { label: "Previsao", href: "#" },
  { label: "Comunidade", href: "#" },
  { label: "Contato", href: "#" },
]

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-[rgba(24,24,27,0.8)] backdrop-blur-xl px-6 py-3 border-b border-border lg:px-8 lg:justify-start lg:gap-8">
      <div className="flex items-center">
        <Image
          src="/images/logo-temonda.png"
          alt="Tem Onda"
          width={140}
          height={50}
          className="h-10 md:h-12 w-auto"
          priority
        />
      </div>

      <button
        className="flex flex-col gap-1.5 lg:hidden p-2 ml-auto"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-foreground" />
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
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-6 py-4 text-center lg:py-0 lg:px-0 text-sm font-semibold uppercase transition-colors ${
                  link.active
                    ? "text-primary lg:text-primary"
                    : "text-muted-foreground hover:text-primary"
                } lg:border-none ${
                  link.active ? "border-b-[3px] border-primary bg-primary/10 lg:bg-transparent lg:border-b-0" : "border-b-[3px] border-transparent"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
