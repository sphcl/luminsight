import type { SimulationDecision } from '@/types/simulation.types'
import { cn } from '@/utils/helpers/classnames'

export type DecisionPanelVariant = 'quick-reply' | 'classify' | 'response'

interface DecisionPanelProps {
  decision: SimulationDecision
  variant: DecisionPanelVariant
  onChoose: (optionId: string) => void
}

const listStyles: Record<DecisionPanelVariant, string> = {
  'quick-reply': 'flex flex-wrap justify-end gap-2',
  classify: 'grid gap-2 sm:grid-cols-2',
  response: 'flex flex-col gap-2',
}

const optionStyles: Record<DecisionPanelVariant, string> = {
  'quick-reply':
    'rounded-full border border-primary-300 bg-white px-4 py-2 text-left text-sm text-primary-700 hover:bg-primary-50',
  classify:
    'rounded-lg border border-surface-border bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-surface-muted',
  response:
    'rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-left text-sm text-white hover:bg-slate-700',
}

export function DecisionPanel({ decision, variant, onChoose }: DecisionPanelProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend
        className={cn(
          'mb-2 text-sm font-semibold',
          variant === 'response' ? 'text-slate-100' : 'text-slate-900'
        )}
      >
        {decision.prompt}
      </legend>
      {/* eslint-disable-next-line security/detect-object-injection -- chave restrita por union type */}
      <div className={listStyles[variant]}>
        {decision.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChoose(option.id)}
            className={cn(
              'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
              optionStyles[variant]
            )}
          >
            {option.text}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
