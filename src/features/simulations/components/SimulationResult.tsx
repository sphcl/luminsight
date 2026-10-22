import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import type { SimulationSummary } from '@/features/simulations/engine/simulation'
import { ContentBlockRenderer } from '@/features/modules/components/ContentBlockRenderer'
import type { ContentBlock } from '@/types/module.types'
import type { SimulationScene } from '@/types/simulation.types'
import { cn } from '@/utils/helpers/classnames'
import { SimulationIndicator } from './SimulationIndicator'
import { primaryLinkClass } from '@/components/ui/linkStyles'

export type SaveStatus = 'saving' | 'saved' | 'error'

interface SimulationResultProps {
  summary: SimulationSummary
  scenes: SimulationScene[]
  conclusion?: ContentBlock[]
  saveStatus: SaveStatus
  backTo: string
  onRetry: () => void
  // Na conversa a faixa já vem da interface que fica na tela; aqui ela duplicaria.
  showIndicator?: boolean
}

export function SimulationResult({
  summary,
  scenes,
  conclusion,
  saveStatus,
  backTo,
  onRetry,
  showIndicator = true,
}: SimulationResultProps) {
  const decisionsByScene = new Map(summary.decisions.map((record) => [record.sceneId, record]))
  // Em simulação ramificada a pessoa não passa por todas as cenas, então só reviso as que ela viu.
  const reviewedScenes = summary.decisions.flatMap((record) => {
    const scene = scenes.find((candidate) => candidate.id === record.sceneId)
    return scene ? [scene] : []
  })

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-ink-muted">Simulação concluída</p>
        <p className="font-serif text-7xl font-normal leading-none tracking-[-0.03em] text-ink tabular-nums">
          {summary.correctDecisions}/{summary.totalDecisions}
        </p>
        <Badge variant={summary.isPerfect ? 'success' : 'warning'}>
          {summary.isPerfect ? 'Nenhum erro' : 'Vale revisar'}
        </Badge>
        <p className="text-sm text-ink-soft">
          {summary.isPerfect
            ? 'Você identificou todos os sinais do golpe.'
            : 'Confira abaixo os sinais que passaram despercebidos.'}
        </p>

        {saveStatus === 'saving' && <p className="text-sm text-ink-muted">Salvando progresso...</p>}
        {saveStatus === 'error' && (
          <p role="alert" className="rounded-card bg-warning-soft p-3 text-sm text-ink">
            Não conseguimos salvar a conclusão, então seu progresso pode não ter sido registrado.
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onRetry} disabled={saveStatus === 'saving'}>
            Refazer simulação
          </Button>
          <Link to={backTo} className={primaryLinkClass}>
            Voltar às simulações
          </Link>
        </div>
      </Card>

      {conclusion && conclusion.length > 0 && (
        <Card className="flex flex-col gap-3" aria-labelledby="conclusion-title">
          <h2 id="conclusion-title" className="text-lg font-semibold text-ink">
            O que esse golpe tinha
          </h2>
          {conclusion.map((block, index) => (
            <ContentBlockRenderer key={index} block={block} />
          ))}
        </Card>
      )}

      <section aria-labelledby="decisions-review-title" className="flex flex-col gap-3">
        <h2 id="decisions-review-title" className="text-lg font-semibold text-ink">
          Revisão das decisões
        </h2>
        <ol className="flex flex-col gap-3">
          {reviewedScenes.map((scene, index) => {
            const record = decisionsByScene.get(scene.id)
            const selected = scene.decision.options.find(
              (option) => option.id === record?.selectedOptionId
            )
            const correct = scene.decision.options.find((option) => option.isCorrect)
            const isCorrect = record?.isCorrect ?? false

            return (
              <li key={scene.id}>
                <Card className="flex flex-col gap-2">
                  <p className="font-medium text-ink">
                    {index + 1}. {scene.decision.prompt}
                  </p>
                  <p className={cn('text-sm', isCorrect ? 'text-success' : 'text-danger')}>
                    {isCorrect ? 'Acertou' : 'Errou'}: você escolheu "
                    {selected?.text ?? 'sem resposta'}"
                  </p>
                  {!isCorrect && correct && (
                    <p className="text-sm text-ink-soft">Melhor escolha: "{correct.text}"</p>
                  )}
                  {selected && (
                    <p className="text-sm leading-relaxed text-ink-soft">{selected.feedback}</p>
                  )}
                  {!isCorrect && correct && (
                    <p className="text-sm leading-relaxed text-ink-soft">{correct.feedback}</p>
                  )}
                </Card>
              </li>
            )
          })}
        </ol>
      </section>
      {showIndicator && <SimulationIndicator />}
    </div>
  )
}
