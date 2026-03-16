import { Topbar } from "@/components/topbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Politica de Privacidade | Tem Onda",
  description: "Politica de privacidade e protecao de dados do Tem Onda - Previsao Costeira",
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Topbar />
      
      <main className="flex-1 px-6 py-12 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Politica de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-8">Ultima atualizacao: 11 de marco de 2026</p>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Informacoes que Coletamos</h2>
              <p className="mb-3">
                O Tem Onda coleta diferentes tipos de informacoes para fornecer e melhorar nosso servico:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-foreground">Dados de cadastro:</strong> nome, email e preferencias de praias</li>
                <li><strong className="text-foreground">Dados de localizacao:</strong> para mostrar previsoes relevantes da sua regiao</li>
                <li><strong className="text-foreground">Dados de uso:</strong> paginas visitadas, recursos utilizados e interacoes</li>
                <li><strong className="text-foreground">Dados do dispositivo:</strong> tipo de navegador, sistema operacional e IP</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Como Usamos suas Informacoes</h2>
              <p className="mb-3">
                Utilizamos as informacoes coletadas para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fornecer previsoes personalizadas para suas praias favoritas</li>
                <li>Enviar alertas de condicoes de ondas (se solicitado)</li>
                <li>Melhorar a experiencia do usuario e desenvolver novos recursos</li>
                <li>Comunicar atualizacoes importantes sobre o servico</li>
                <li>Garantir a seguranca e prevenir fraudes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Compartilhamento de Dados</h2>
              <p>
                O Tem Onda nao vende suas informacoes pessoais. Podemos compartilhar dados apenas com prestadores de servicos essenciais (hospedagem, analytics) que estao obrigados a proteger suas informacoes, ou quando exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Armazenamento e Seguranca</h2>
              <p>
                Seus dados sao armazenados em servidores seguros com criptografia. Implementamos medidas tecnicas e organizacionais para proteger suas informacoes contra acesso nao autorizado, alteracao ou destruicao.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Seus Direitos (LGPD)</h2>
              <p className="mb-3">
                De acordo com a Lei Geral de Protecao de Dados (LGPD), voce tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Confirmar a existencia de tratamento de seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusao de seus dados</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar a portabilidade dos dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Retencao de Dados</h2>
              <p>
                Mantemos seus dados pessoais pelo tempo necessario para fornecer nossos servicos ou conforme exigido por lei. Voce pode solicitar a exclusao de sua conta e dados a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Menores de Idade</h2>
              <p>
                O Tem Onda nao coleta intencionalmente dados de menores de 13 anos. Se tomarmos conhecimento de que coletamos dados de uma crianca, excluiremos essas informacoes imediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Alteracoes nesta Politica</h2>
              <p>
                Podemos atualizar esta Politica de Privacidade periodicamente. Notificaremos voce sobre alteracoes significativas atraves do email cadastrado ou aviso em nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Contato</h2>
              <p>
                Para exercer seus direitos ou tirar duvidas sobre privacidade, entre em contato: privacidade@temonda.com.br
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
