import { Topbar } from "@/components/topbar"
import { Footer } from "@/components/footer"
import { Mail, MapPin, Phone, Send } from "lucide-react"

export const metadata = {
  title: "Contato | Tem Onda",
  description: "Entre em contato com a equipe Tem Onda",
}

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Topbar />
      
      <main className="flex-1 px-4 py-12 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Fale Conosco
          </h1>
          <p className="text-white/70 text-[15px] leading-[1.6] mb-12 max-w-2xl">
            Tem alguma duvida, sugestao ou quer reportar um problema? Entre em contato com nossa equipe.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="md:col-span-2">
              <div className="bg-[rgba(30,35,50,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">Envie sua mensagem</h2>
                
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="nome" className="block text-sm text-white/70 mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        placeholder="Seu nome"
                        className="w-full bg-[rgba(10,15,25,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-foreground placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm text-white/70 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="seu@email.com"
                        className="w-full bg-[rgba(10,15,25,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-foreground placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="assunto" className="block text-sm text-white/70 mb-2">
                      Assunto
                    </label>
                    <select
                      id="assunto"
                      name="assunto"
                      className="w-full bg-[rgba(10,15,25,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="duvida">Duvida sobre previsoes</option>
                      <option value="sugestao">Sugestao de praia</option>
                      <option value="bug">Reportar problema</option>
                      <option value="parceria">Parceria comercial</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mensagem" className="block text-sm text-white/70 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      rows={5}
                      placeholder="Escreva sua mensagem aqui..."
                      className="w-full bg-[rgba(10,15,25,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-foreground placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>

            {/* Informacoes de contato */}
            <div className="space-y-6">
              <div className="bg-[rgba(30,35,50,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">Informacoes</h2>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 mb-1">Email</p>
                      <p className="text-foreground">contato@temonda.com.br</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 mb-1">Telefone</p>
                      <p className="text-foreground">(11) 99999-9999</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 mb-1">Localizacao</p>
                      <p className="text-foreground">Santos, SP - Brasil</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(30,35,50,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Horario de atendimento</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Segunda a Sexta: 9h as 18h<br />
                  Sabado: 9h as 13h<br />
                  Domingo: Fechado
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
