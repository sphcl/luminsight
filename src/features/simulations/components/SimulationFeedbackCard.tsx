import { forwardRef } from 'react'
import { cn } from '@/utils/helpers/classnames'

interface SimulationFeedbackCardProps {
  isCorrect: boolean
  feedback: string
  correctOptionText: string | null
}

// Cartão do LumInsight dentro da conversa: visual e papel diferentes dos balões, pra ninguém achar que o golpista disse isso.
export const SimulationFeedbackCard = forwardRef<HTMLLIElement, SimulationFeedbackCardProps>(
  ({ isCorrect, feedback, correctOptionText }, ref) => {
    const verdict = isCorrect ? 'Boa decisão!' : 'Essa decisão favorecia o golpe.'

    return (
      <li
        ref={ref}
        tabIndex={-1}
        role="note"
        aria-label={`Feedback do LumInsight: ${verdict}`}
        className={cn(
          'mx-auto w-full max-w-md rounded-card border border-rule p-4 font-sans text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:animate-enter',
          isCorrect ? 'bg-success-soft' : 'bg-danger-soft'
        )}
      >
        <p className="eyebrow">Feedback do LumInsight</p>
        <p className={cn('mt-1 font-semibold', isCorrect ? 'text-success' : 'text-danger')}>
          {verdict}
        </p>
        {correctOptionText && (
          <p className="mt-1">
            Melhor escolha: <span className="font-semibold">{correctOptionText}</span>
          </p>
        )}
        <p className="mt-1 text-ink-soft">{feedback}</p>
      </li>
    )
  }
)

SimulationFeedbackCard.displayName = 'SimulationFeedbackCard'
