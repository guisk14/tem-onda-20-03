import { Waves, MapPin, Clock, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: MapPin,
    title: "Escolha sua praia",
    description: "Selecione entre diversas praias do litoral brasileiro para acompanhar as condicoes em tempo real.",
  },
  {
    icon: Waves,
    title: "Analise as ondas",
    description: "Veja altura, periodo e direcao do swell com dados atualizados de fontes meteorologicas confiaveis.",
  },
  {
    icon: Clock,
    title: "Previsao por hora",
    description: "Acompanhe a previsao detalhada hora a hora para planejar sua sessao no melhor momento.",
  },
  {
    icon: TrendingUp,
    title: "Tome a melhor decisao",
    description: "Com todas as informacoes em maos, escolha o momento perfeito para cair na agua.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center lg:mb-16">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
            Como funciona
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
            Previsao de surf simplificada
          </h2>
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-white/70">
            Em poucos passos voce tem acesso a todas as informacoes necessarias para aproveitar as melhores ondas do litoral.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-[rgba(255,255,255,0.05)]"
            >
              {/* Step Number */}
              <div className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-background">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                <step.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="#forecast-content"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            <Waves className="h-4 w-4" />
            Ver previsao agora
          </a>
        </div>
      </div>
    </section>
  )
}
