import { CONTENT_MODULES, CONTENT_SIMULATIONS } from '@/content'
import { ModuleNumber } from '@/features/modules/components/ModuleNumber'
import { formatMinutes } from '@/features/modules/labels'
import { FORMAT_LABELS } from '@/features/simulations/labels'

// Carregado sob demanda pela Landing: puxa o conteúdo da trilha sem pesar no pacote da primeira tela.
export function LandingCatalog() {
  const modules = CONTENT_MODULES.filter((entry) => entry.module.isActive)
  const moduleTitle = (moduleId: string) =>
    modules.find((entry) => entry.id === moduleId)?.module.title ?? ''

  return (
    <>
      <section aria-labelledby="landing-modules" className="flex flex-col gap-8">
        <div>
          <p className="eyebrow">A trilha</p>
          <h2 id="landing-modules" className="mt-2 font-serif text-4xl font-normal text-ink">
            {modules.length} módulos, do conceito ao caso real
          </h2>
          <p className="mt-3 text-ink-soft">
            Cada módulo libera o seguinte. Lições curtas, um quiz para fixar e, em três deles, uma
            simulação para treinar a decisão.
          </p>
        </div>
        <ol className="flex flex-col border-t border-rule">
          {modules.map(({ id, module }) => (
            <li key={id} className="border-b border-rule py-6">
              {/* Na home o número fica acima do título, pra lista começar na mesma margem do resto da página. */}
              <ModuleNumber
                order={module.order}
                className="mb-3 md:static md:w-auto md:text-left"
              />
              <h3 className="font-serif text-2xl font-normal text-ink">
                <span className="sr-only">{module.order}.</span> {module.title}
              </h3>
              <p className="mt-2 text-ink-soft">{module.description}</p>
              <p className="mt-2 text-sm text-ink-muted">
                {formatMinutes(module.estimatedMinutes)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="landing-simulations" className="flex flex-col gap-8">
        <div>
          <p className="eyebrow">As simulações</p>
          <h2 id="landing-simulations" className="mt-2 font-serif text-4xl font-normal text-ink">
            Treinar a decisão antes que ela custe dinheiro
          </h2>
          <p className="mt-3 text-ink-soft">
            Uma caixa de entrada, uma ligação e uma conversa por mensagens reproduzem golpes que já
            aconteceram. Você decide o que fazer em cada passo e vê, na hora, o sinal que entregava
            a fraude. Contatos, endereços e telefones são fictícios, e a tela avisa o tempo todo que
            é uma simulação.
          </p>
        </div>
        <ul className="grid gap-px border border-rule bg-rule sm:grid-cols-3">
          {CONTENT_SIMULATIONS.map((simulation) => (
            <li key={simulation.id} className="flex flex-col gap-2 bg-canvas p-5">
              <p className="eyebrow">{FORMAT_LABELS[simulation.format]}</p>
              <h3 className="text-lg font-semibold text-ink">{simulation.title}</h3>
              <p className="text-sm text-ink-muted">{moduleTitle(simulation.moduleId)}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
