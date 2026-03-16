import { Topbar } from "@/components/topbar"
import { Footer } from "@/components/footer"
import { Waves, Users, MapPin, TrendingUp } from "lucide-react"

export const metadata = {
  title: "Sobre | Tem Onda",
  description: "Conheca o Tem Onda - A plataforma de previsao costeira para surfistas brasileiros",
}

const stats = [
  { icon: MapPin, value: "50+", label: "Praias monitoradas" },
  { icon: Users, value: "10k+", label: "Surfistas ativos" },
  { icon: TrendingUp, value: "99%", label: "Precisao das previsoes" },
  { icon: Waves, value: "24/7", label: "Atualizacoes em tempo real" },
]

const team = [
  { name: "Rafael Costa", role: "Fundador & CEO", description: "Surfista ha 15 anos e desenvolvedor apaixonado por tecnologia" },
  { name: "Marina Santos", role: "Meteorologista", description: "Especialista em oceanografia e modelos de previsao de ondas" },
  { name: "Pedro Lima", role: "Desenvolvedor", description: "Engenheiro de software focado em experiencia do usuario" },
]

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Topbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-16 lg:px-8 border-b border-border">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                <Waves className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Sobre o Tem Onda</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Nascemos da paixao pelo surf e da frustracao de chegar na praia e encontrar o mar flat. 
              Nossa missao e ajudar surfistas a aproveitar cada sessao ao maximo.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 py-12 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nossa Historia */}
        <section className="px-6 py-16 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Nossa Historia</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                O Tem Onda nasceu em 2024, quando um grupo de surfistas do litoral paulista decidiu resolver 
                um problema que todo surfista conhece: a dificuldade de saber se "tem onda" antes de ir para a praia.
              </p>
              <p>
                Combinando tecnologia de ponta com conhecimento local, desenvolvemos uma plataforma que analisa 
                dados de swell, vento, mare e outros fatores para entregar previsoes precisas e faceis de entender.
              </p>
              <p>
                Hoje, atendemos milhares de surfistas em todo o litoral brasileiro, desde iniciantes ate 
                profissionais, todos unidos pelo mesmo objetivo: pegar as melhores ondas.
              </p>
            </div>
          </div>
        </section>

        {/* Equipe */}
        <section className="px-6 py-16 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Nossa Equipe</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((member) => (
                <div 
                  key={member.name} 
                  className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{member.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Missao */}
        <section className="px-6 py-16 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-6">Nossa Missao</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Democratizar o acesso a informacoes de qualidade sobre as condicoes do mar, 
              ajudando surfistas de todos os niveis a tomarem melhores decisoes e aproveitarem 
              cada sessao com seguranca e diversao.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
