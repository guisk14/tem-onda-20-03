"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Waves, Menu, X, Bell, CheckCheck, Wind, Droplets, AlertTriangle } from "lucide-react"

type Notification = {
  id: number
  icon: React.ReactNode
  title: string
  desc: string
  time: string
  read: boolean
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    icon: <Wind className="h-4 w-4 text-primary" />,
    title: "Vento favoravel detectado",
    desc: "Condições ideais em Maresias nas próximas 3h.",
    time: "Agora",
    read: false,
  },
  {
    id: 2,
    icon: <Droplets className="h-4 w-4 text-cyan-400" />,
    title: "Ondas acima de 1.5m",
    desc: "Previsão de ondulação forte em Ubatuba amanhã.",
    time: "5 min",
    read: false,
  },
  {
    id: 3,
    icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    title: "Alerta de ressaca",
    desc: "IBAMA emitiu alerta para o litoral norte.",
    time: "1h",
    read: true,
  },
]

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Previsao", href: "/#forecast-content" },
  { label: "Comunidade", href: "/comunidade" },
  { label: "Contato", href: "/contato" },
]

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const notifRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
      className={`sticky top-0 z-50 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.7)] px-6 border-b border-white/5 lg:px-8 lg:justify-start lg:gap-8 transition-all duration-300 ${
        scrolled ? "py-3" : "py-4"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] p-0.5 transition-all duration-300 glow-cyan ${
          scrolled ? "h-9 w-9" : "h-10 w-10"
        }`}>
          <div className="flex items-center justify-center w-full h-full rounded-[14px] bg-[#0a0a0f]">
            <Waves className={`text-[#00d4ff] transition-all duration-300 ${scrolled ? "h-4 w-4" : "h-5 w-5"}`} />
          </div>
        </div>
        <h1 className={`font-black uppercase tracking-tight transition-all duration-300 ${
          scrolled ? "text-base" : "text-lg"
        }`}>
          <span className="text-white">TEM</span>{" "}
          <span className="text-[#00d4ff] text-glow-cyan">ONDA</span>
        </h1>
      </div>

      {/* Menu Button - Mobile only */}
      <button
        className="flex items-center justify-center w-[42px] h-[42px] rounded-2xl bg-white/5 lg:hidden ml-auto transition-all hover:bg-white/10 hover:scale-105 border border-white/5"
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
            ? "absolute top-full left-0 right-0 flex flex-col items-center bg-[rgba(10,10,15,0.98)] backdrop-blur-2xl border-b border-white/5"
            : "hidden"
        } lg:relative lg:top-auto lg:flex lg:bg-transparent lg:border-none lg:flex-1 lg:justify-center`}
      >
        <ul className="flex flex-col items-center lg:flex-row lg:gap-2">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href)
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`relative block px-6 py-4 text-center lg:py-2.5 lg:px-5 text-sm font-bold uppercase tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl ${
                    isActive
                      ? "text-[#00d4ff] lg:bg-[#00d4ff]/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {/* Active indicator - pill glow */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-[#00d4ff] to-[#a855f7] rounded-full transition-all duration-300 ${
                      isActive ? "w-8 opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                  {/* Mobile active background */}
                  {isActive && (
                    <span className="absolute inset-0 bg-[#00d4ff]/10 rounded-xl lg:hidden -z-10" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Notification Bell - Right side */}
      <div ref={notifRef} className="relative ml-auto">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          aria-label="Notificações"
          className="relative flex items-center justify-center w-[42px] h-[42px] rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105 border border-white/5"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#ff3d7f] to-[#ff6b35] text-[10px] font-black text-white leading-none shadow-lg">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {notifOpen && (
          <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 rounded-3xl border border-white/10 bg-[rgba(10,10,15,0.98)] shadow-2xl backdrop-blur-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <span className="text-base font-black text-foreground">Notificações</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar lidas
                </button>
              )}
            </div>

            {/* List */}
            <ul className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`flex gap-3 px-5 py-4 transition-all hover:bg-white/5 cursor-pointer ${
                    !notif.read ? "bg-[#00d4ff]/5" : ""
                  }`}
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                    )
                  }
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/5">
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-snug ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notif.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-2">{notif.desc}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{notif.time}</span>
                    {!notif.read && (
                      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#a855f7]" />
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-white/5 px-5 py-4 text-center">
              <button className="text-sm font-bold text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors">
                Ver todas
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
