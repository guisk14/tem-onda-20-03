import { Waves } from "lucide-react"

const footerLinks = [
  {
    title: "Navegacao",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Sobre", href: "/sobre" },
      { label: "Comunidade", href: "/comunidade" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Dicas de surf", href: "#" },
      { label: "Mapa de praias", href: "#" },
      { label: "Alertas", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "/termos" },
      { label: "Privacidade", href: "/privacidade" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 bg-[rgba(10,10,15,0.9)] backdrop-blur-2xl">
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo e descricao */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] p-0.5 glow-cyan">
                <div className="flex items-center justify-center w-full h-full rounded-[14px] bg-[#0a0a0f]">
                  <Waves className="h-5 w-5 text-[#00d4ff]" />
                </div>
              </div>
              <span className="text-xl font-black uppercase tracking-tight text-foreground">
                TEM <span className="text-[#00d4ff]">ONDA</span>
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
              Previsão costeira em tempo real para surfistas. Dados de swell, vento e maré sempre atualizados.
            </p>
            {/* Social badges */}
            <div className="flex gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-[#00d4ff]">
                @temonda
              </div>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white/80">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-white/40 transition-all hover:text-[#00d4ff] hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-white/40 font-medium">
            {currentYear} Tem Onda. Todos os direitos reservados.
          </p>
          <p className="text-sm font-bold">
            <span className="text-white/40">Feito com </span>
            <span className="text-[#ff3d7f]">dedicacao</span>
            <span className="text-white/40"> para surfistas</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
