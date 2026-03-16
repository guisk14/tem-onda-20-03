import { Topbar } from "@/components/topbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Politica de Cookies | Tem Onda",
  description: "Politica de cookies do Tem Onda - Como utilizamos cookies em nosso site",
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Topbar />
      
      <main className="flex-1 px-6 py-12 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Politica de Cookies</h1>
          <p className="text-sm text-muted-foreground mb-8">Ultima atualizacao: 11 de marco de 2026</p>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">O que sao Cookies?</h2>
              <p>
                Cookies sao pequenos arquivos de texto armazenados no seu dispositivo quando voce visita um site. 
                Eles sao amplamente utilizados para fazer os sites funcionarem de forma mais eficiente e fornecer 
                informacoes aos proprietarios do site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Como Usamos Cookies</h2>
              <p className="mb-3">
                O Tem Onda utiliza cookies para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Lembrar suas preferencias e configuracoes</li>
                <li>Manter voce conectado a sua conta</li>
                <li>Entender como voce usa nosso site</li>
                <li>Melhorar a performance e experiencia do usuario</li>
                <li>Fornecer conteudo personalizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Tipos de Cookies que Utilizamos</h2>
              
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg border border-border bg-card/50">
                  <h3 className="font-semibold text-foreground mb-2">Cookies Essenciais</h3>
                  <p className="text-sm">
                    Necessarios para o funcionamento basico do site. Incluem cookies de sessao e autenticacao. 
                    Nao podem ser desativados.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card/50">
                  <h3 className="font-semibold text-foreground mb-2">Cookies de Preferencias</h3>
                  <p className="text-sm">
                    Lembram suas escolhas como praia favorita, unidades de medida e configuracoes de exibicao. 
                    Melhoram sua experiencia mas nao sao essenciais.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card/50">
                  <h3 className="font-semibold text-foreground mb-2">Cookies de Analiticos</h3>
                  <p className="text-sm">
                    Nos ajudam a entender como os visitantes interagem com o site, coletando informacoes anonimas. 
                    Utilizamos Google Analytics para esta finalidade.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card/50">
                  <h3 className="font-semibold text-foreground mb-2">Cookies de Marketing</h3>
                  <p className="text-sm">
                    Utilizados para rastrear visitantes em diferentes sites e exibir anuncios relevantes. 
                    Atualmente o Tem Onda nao utiliza cookies de marketing.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Cookies de Terceiros</h2>
              <p>
                Alguns cookies sao colocados por servicos de terceiros que aparecem em nossas paginas. 
                Nao controlamos esses cookies. Os principais terceiros que podem definir cookies incluem 
                Google Analytics e servicos de CDN.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Como Gerenciar Cookies</h2>
              <p className="mb-3">
                Voce pode controlar e gerenciar cookies de varias formas:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-foreground">Configuracoes do navegador:</strong> A maioria dos navegadores permite bloquear ou excluir cookies</li>
                <li><strong className="text-foreground">Modo anonimo/privado:</strong> Cookies sao excluidos ao fechar a janela</li>
                <li><strong className="text-foreground">Extensoes:</strong> Existem extensoes que bloqueiam cookies de rastreamento</li>
              </ul>
              <p className="mt-3 text-sm">
                Nota: Bloquear todos os cookies pode afetar a funcionalidade do site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Retencao de Cookies</h2>
              <p>
                Cookies de sessao sao excluidos quando voce fecha o navegador. Cookies persistentes permanecem 
                por um periodo definido (geralmente 1 ano) ou ate serem excluidos manualmente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Atualizacoes desta Politica</h2>
              <p>
                Podemos atualizar esta Politica de Cookies periodicamente. Recomendamos que voce revise 
                esta pagina regularmente para se manter informado sobre como usamos cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contato</h2>
              <p>
                Se voce tiver duvidas sobre nossa Politica de Cookies, entre em contato: contato@temonda.com.br
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
