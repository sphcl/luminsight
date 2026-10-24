import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui'
import { Header } from '@/components/layout/Header/Header'
import { primaryLinkClass } from '@/components/ui/linkStyles'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/helpers/classnames'

const LandingCatalog = lazy(() =>
  import('./LandingCatalog').then((module) => ({ default: module.LandingCatalog }))
)

// Uma ação primária só, repetida no topo e no fim; quem já tem conta continua de onde parou.
function StartLink({ className }: { className?: string }) {
  const { isAuthenticated } = useAuth()
  return (
    <Link
      to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
      className={cn(primaryLinkClass, 'px-6 text-base', className)}
    >
      {isAuthenticated ? 'Continuar a trilha' : 'Começar a trilha'}
    </Link>
  )
}

// Uma coluna só, centralizada: todo bloco tem a mesma largura, então as duas bordas batem em tudo.
const COLUMN = 'mx-auto w-full max-w-3xl'

export function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />

      <main className="px-4 py-16 sm:px-8 sm:py-24">
        <div className={cn(COLUMN, 'flex flex-col gap-24')}>
          <section aria-labelledby="landing-title" className="flex flex-col gap-6">
            <p className="eyebrow">Educação em segurança digital</p>
            <h1
              id="landing-title"
              className="font-serif text-5xl font-normal leading-[1.05] tracking-[-0.025em] text-ink sm:text-6xl"
            >
              O golpe digital mira você, não o seu celular.
            </h1>
            <p className="text-lg leading-relaxed text-ink-soft">
              O LumInsight é uma trilha gratuita sobre engenharia social, phishing e golpes com
              inteligência artificial, como a voz clonada no WhatsApp e o falso gerente de banco.
              São lições curtas, quizzes e simulações de mensagens, e-mails e ligações para treinar
              sem risco.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <StartLink />
              <p className="text-sm text-ink-muted">Gratuito. Leva cerca de uma hora no total.</p>
            </div>
          </section>

          <figure className="border-y border-strong py-8">
            <blockquote className="font-serif text-3xl font-normal leading-snug text-ink">
              &ldquo;Quebrar a &lsquo;firewall humana&rsquo; quase sempre é fácil, não exige nenhum
              investimento além do custo de uma ligação telefônica e envolve um risco mínimo.&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-ink-muted">
              Kevin Mitnick, A Arte de Enganar. Ponto de partida do módulo 1.
            </figcaption>
          </figure>

          <section aria-labelledby="landing-why" className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Por que agora</p>
              <h2 id="landing-why" className="mt-2 font-serif text-4xl font-normal text-ink">
                A tecnologia mudou, o alvo continua sendo a pessoa
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              {/* Mesmo dado e mesma fonte da lição 3.2. */}
              <p>
                <span className="block font-serif text-6xl font-normal leading-none text-ink">
                  82%
                </span>
                <span className="mt-2 block text-ink-soft">
                  dos idosos no estado de São Paulo já foram alvo de tentativas de golpes digitais.
                </span>
                <span className="mt-1 block text-sm text-ink-muted">Fundação Seade, 2026.</span>
              </p>
              <p className="text-ink-soft">
                Ouvir a voz de um familiar já não prova quem está do outro lado. A trilha ensina a
                trocar de canal antes de agir, que é o hábito que desmonta a maior parte desses
                golpes.
              </p>
            </div>
          </section>

          <Suspense
            fallback={
              <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando módulos">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-20 w-full" />
                ))}
              </div>
            }
          >
            <LandingCatalog />
          </Suspense>

          <section
            aria-labelledby="landing-cta"
            className="flex flex-col items-start gap-6 border-t border-strong pt-12"
          >
            <h2 id="landing-cta" className="font-serif text-4xl font-normal text-ink">
              Comece pelo módulo 1. Leva poucos minutos.
            </h2>
            <StartLink />
          </section>
        </div>
      </main>

      <footer className="border-t border-rule px-4 sm:px-8">
        <div className={cn(COLUMN, 'py-8 text-sm text-ink-muted')}>
          Trabalho de Conclusão de Curso em Segurança da Informação, Fatec São Caetano do Sul.
        </div>
      </footer>
    </div>
  )
}
