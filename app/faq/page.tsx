"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import { Footer } from "@/components/footer"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    category: "Geral",
    questions: [
      {
        question: "O que e o Tem Onda?",
        answer: "O Tem Onda e uma plataforma de previsao costeira que fornece informacoes em tempo real sobre condicoes de ondas, vento e mare para surfistas. Nosso objetivo e ajudar voce a encontrar o melhor momento para surfar."
      },
      {
        question: "O servico e gratuito?",
        answer: "Sim! O Tem Onda oferece acesso gratuito a todas as previsoes basicas. Temos planos premium com recursos avancados como alertas personalizados e previsoes estendidas."
      },
      {
        question: "Quais praias estao disponiveis?",
        answer: "Atualmente cobrimos mais de 50 praias ao longo do litoral brasileiro, com foco inicial em Sao Paulo, Rio de Janeiro e Santa Catarina. Estamos constantemente expandindo nossa cobertura."
      },
    ]
  },
  {
    category: "Previsoes",
    questions: [
      {
        question: "Qual a precisao das previsoes?",
        answer: "Nossas previsoes tem precisao media de 90% para as proximas 24 horas. Utilizamos dados de multiplas fontes meteorologicas e modelos oceanograficos para garantir a melhor qualidade possivel."
      },
      {
        question: "Com que frequencia os dados sao atualizados?",
        answer: "Os dados de ondas e vento sao atualizados a cada hora. Os dados de mare sao calculados com base em tabuas de mare oficiais e atualizados diariamente."
      },
      {
        question: "O que significa o periodo da onda?",
        answer: "O periodo e o tempo em segundos entre duas ondas consecutivas. Periodos maiores (acima de 10s) geralmente indicam ondulacoes mais organizadas e com mais forca, ideais para o surf."
      },
      {
        question: "Como interpretar a direcao do swell?",
        answer: "A direcao indica de onde a ondulacao esta vindo. Por exemplo, 'S' significa que as ondas vem do sul. Cada praia funciona melhor com determinadas direcoes de swell, dependendo de sua orientacao."
      },
    ]
  },
  {
    category: "Conta e Configuracoes",
    questions: [
      {
        question: "Como criar uma conta?",
        answer: "Clique em 'Criar conta' no menu superior e preencha seus dados. Voce pode se cadastrar com email ou usar sua conta do Google."
      },
      {
        question: "Como configurar alertas de ondas?",
        answer: "Apos criar sua conta, acesse suas preferencias e configure alertas para suas praias favoritas. Voce pode definir condicoes minimas de altura, periodo e direcao para receber notificacoes."
      },
      {
        question: "Posso usar o Tem Onda offline?",
        answer: "Atualmente o Tem Onda requer conexao com internet para funcionar. Estamos trabalhando em um modo offline para consultar a ultima previsao baixada."
      },
    ]
  },
  {
    category: "Seguranca",
    questions: [
      {
        question: "As previsoes substituem a analise local?",
        answer: "Nao. As previsoes sao uma ferramenta de apoio, mas voce sempre deve avaliar as condicoes reais ao chegar na praia. Fatores locais como correntes, ventos e bancadas podem variar."
      },
      {
        question: "O Tem Onda indica se e seguro surfar?",
        answer: "Fornecemos dados objetivos sobre as condicoes, mas a decisao de entrar na agua e sempre sua. Avalie seu nivel de experiencia e as condicoes locais antes de surfar."
      },
    ]
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
      >
        <span className="font-medium text-foreground pr-4">{question}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Topbar />
      
      <main className="flex-1 px-6 py-12 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Perguntas Frequentes</h1>
          <p className="text-muted-foreground mb-10">Encontre respostas para as duvidas mais comuns sobre o Tem Onda.</p>
          
          <div className="space-y-10">
            {faqs.map((category) => (
              <section key={category.category}>
                <h2 className="text-lg font-semibold text-primary mb-4">{category.category}</h2>
                <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="divide-y divide-border px-6">
                    {category.questions.map((faq) => (
                      <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-center">
            <h3 className="font-semibold text-foreground mb-2">Ainda tem duvidas?</h3>
            <p className="text-muted-foreground mb-4">Nossa equipe esta pronta para ajudar voce.</p>
            <a 
              href="/contato" 
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Entre em contato
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
