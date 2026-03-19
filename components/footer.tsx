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
    <footer className="border-t backdrop-blur-[10px]
      border-[rgba(255,255,255,0.06)] bg-[rgba(10,15,25,0.8)]
      [.light_&]:border-slate-200 [.light_&]:bg-slate-50/90">
      <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo e descricao */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 shadow-[0_0_12px_rgba(56,189,248,0.35)] [.light_&]:shadow-[0_0_12px_rgba(3,105,161,0.2)]">
                <Waves className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-extrabold uppercase tracking-tight text-foreground">
                TEM ONDA
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Previsao costeira em tempo real para surfistas. Dados de swell, vento e mare atualizados.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
        <div className="my-8 h-px bg-[rgba(255,255,255,0.06)] [.light_&]:bg-slate-200" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {currentYear} Tem Onda. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito com dedicacao para a comunidade do surf.
          </p>
        </div>
      </div>
    </footer>
  )
}
