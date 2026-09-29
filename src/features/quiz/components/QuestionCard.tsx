import { forwardRef } from 'react'
import { Badge } from '@/components/ui'
import { hasPendingText } from '@/content/validate'
import type { PublicQuestion } from '@/features/quiz/types/public-question'
import type { QuestionType } from '@/types/quiz.types'
import { cn } from '@/utils/helpers/classnames'

interface QuestionCardProps {
  question: PublicQuestion
  selectedOptionId: string | null
  isLocked: boolean
  // Só chega preenchido depois da resposta confirmada; antes disso o card não sabe qual é a certa.
  revealedCorrectOptionId: string | null
  onSelect: (optionId: string) => void
}

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Múltipla escolha',
  true_false: 'Verdadeiro ou falso',
  scenario: 'Cenário',
  visual: 'Imagem',
}

function getOptionState(
  optionId: string,
  selectedOptionId: string | null,
  revealedCorrectOptionId: string | null
): 'idle' | 'selected' | 'correct' | 'wrong' {
  if (revealedCorrectOptionId !== null) {
    if (optionId === revealedCorrectOptionId) return 'correct'
    if (optionId === selectedOptionId) return 'wrong'
    return 'idle'
  }
  return optionId === selectedOptionId ? 'selected' : 'idle'
}

const optionStateStyles = {
  idle: 'border-surface-border bg-white',
  selected: 'border-primary-500 bg-primary-50',
  correct: 'border-success-500 bg-success-50',
  wrong: 'border-danger-500 bg-danger-50',
}

export const QuestionCard = forwardRef<HTMLLegendElement, QuestionCardProps>(
  ({ question, selectedOptionId, isLocked, revealedCorrectOptionId, onSelect }, legendRef) => {
    return (
      <div className="flex flex-col gap-4">
        <Badge className="self-start">{TYPE_LABELS[question.type]}</Badge>

        {question.type === 'scenario' && (
          <aside className="rounded-card border-l-4 border-primary-500 bg-primary-50 p-4 leading-relaxed text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
              Cenário
            </p>
            <p className="mt-1">{question.scenario}</p>
          </aside>
        )}

        {question.type === 'visual' &&
          (hasPendingText(question.imageSrc) ? (
            <div
              role="img"
              aria-label={question.imageAlt}
              className="flex h-48 items-center justify-center rounded-card border border-dashed border-surface-border bg-surface-muted p-4 text-center text-sm text-slate-500"
            >
              Imagem ainda em produção: {question.imageAlt}
            </div>
          ) : (
            <img
              src={question.imageSrc}
              alt={question.imageAlt}
              className="max-h-80 w-full rounded-card border border-surface-border object-contain"
            />
          ))}

        <fieldset disabled={isLocked} className="flex flex-col gap-2">
          <legend
            ref={legendRef}
            tabIndex={-1}
            className="mb-3 text-lg font-semibold text-slate-900 focus:outline-none"
          >
            {question.prompt}
          </legend>
          <div className={cn('grid gap-2', question.type === 'true_false' && 'sm:grid-cols-2')}>
            {question.options.map((option) => {
              const state = getOptionState(option.id, selectedOptionId, revealedCorrectOptionId)
              return (
                <label
                  key={option.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-sm text-slate-800 transition-colors',
                    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500',
                    isLocked ? 'cursor-default' : 'cursor-pointer hover:bg-surface-muted',
                    // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
                    optionStateStyles[state]
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => onSelect(option.id)}
                    className="accent-primary-600"
                  />
                  <span className="flex-1">{option.text}</span>
                  {state === 'correct' && (
                    <span className="text-xs font-semibold text-success-700">Correta</span>
                  )}
                  {state === 'wrong' && (
                    <span className="text-xs font-semibold text-danger-700">Sua resposta</span>
                  )}
                </label>
              )
            })}
          </div>
        </fieldset>
      </div>
    )
  }
)

QuestionCard.displayName = 'QuestionCard'
