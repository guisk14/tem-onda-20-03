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

      {/* Menu Button - Mobile only */}
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

      {/* Notification Bell - Right side */}
      <div ref={notifRef} className="relative ml-auto">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          aria-label="Notificações"
          className="relative flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-black leading-none">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {notifOpen && (
          <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 rounded-2xl border border-white/10 bg-[rgba(18,18,20,0.95)] shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Notificações</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* List */}
            <ul className="divide-y divide-white/6 max-h-72 overflow-y-auto">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-white/5 cursor-pointer ${
                    !notif.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                    )
                  }
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8">
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notif.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">{notif.desc}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-white/8 px-4 py-3 text-center">
              <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                Ver todas as notificações
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
