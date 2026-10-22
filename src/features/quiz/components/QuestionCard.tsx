import { forwardRef } from 'react'
import { hasPendingText } from '@/content/validate'
import type { PublicQuestion } from '@/features/quiz/types/public-question'
import type { QuestionType } from '@/types/quiz.types'
import { cn } from '@/utils/helpers/classnames'

interface QuestionCardProps {
  question: PublicQuestion
  selectedOptionIds: string[]
  isLocked: boolean
  // Só chega preenchido depois da resposta confirmada; antes disso o card não sabe qual é a certa.
  revealedCorrectOptionIds: string[] | null
  onSelect: (optionId: string) => void
}

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Múltipla escolha',
  true_false: 'Verdadeiro ou falso',
  scenario: 'Cenário',
  visual: 'Imagem',
  multiple_answer: 'Múltipla resposta',
}

function getOptionState(
  optionId: string,
  selectedOptionIds: string[],
  revealedCorrectOptionIds: string[] | null
): 'idle' | 'selected' | 'correct' | 'wrong' {
  const isSelected = selectedOptionIds.includes(optionId)
  if (revealedCorrectOptionIds !== null) {
    if (revealedCorrectOptionIds.includes(optionId)) return 'correct'
    if (isSelected) return 'wrong'
    return 'idle'
  }
  return isSelected ? 'selected' : 'idle'
}

// Selecionado é régua de 3px à esquerda, nunca preenchimento; certo e errado ganham fundo tonal e rótulo em texto.
const optionStateStyles = {
  idle: 'border-l-transparent',
  selected: 'border-l-accent',
  correct: 'border-l-success bg-success-soft',
  wrong: 'border-l-danger bg-danger-soft',
}

export const QuestionCard = forwardRef<HTMLLegendElement, QuestionCardProps>(
  ({ question, selectedOptionIds, isLocked, revealedCorrectOptionIds, onSelect }, legendRef) => {
    const isMultiple = question.type === 'multiple_answer'
    const scenario = question.type === 'scenario' || isMultiple ? question.scenario : undefined
    const hintId = `question-${question.id}-hint`

    return (
      <div className="reading flex flex-col gap-5">
        <p className="eyebrow">{TYPE_LABELS[question.type]}</p>

        {scenario && (
          <aside className="rounded-card bg-surface-muted p-5 text-ink">
            <p className="eyebrow">Cenário</p>
            <p className="mt-2 whitespace-pre-line">{scenario}</p>
          </aside>
        )}

        {question.type === 'visual' &&
          (hasPendingText(question.imageSrc) ? (
            <div
              role="img"
              aria-label={question.imageAlt}
              className="flex h-48 items-center justify-center rounded-card border border-dashed border-rule bg-surface-muted p-4 text-center text-sm text-ink-muted"
            >
              Imagem ainda em produção: {question.imageAlt}
            </div>
          ) : (
            <img
              src={question.imageSrc}
              alt={question.imageAlt}
              className="max-h-80 w-full rounded-card border border-rule object-contain"
            />
          ))}

        <fieldset
          disabled={isLocked}
          aria-describedby={isMultiple ? hintId : undefined}
          className="flex flex-col gap-2"
        >
          <legend
            ref={legendRef}
            tabIndex={-1}
            className="mb-4 font-serif text-[1.6875em] font-normal leading-snug tracking-[-0.015em] text-ink focus:outline-none"
          >
            {question.prompt}
          </legend>
          {isMultiple && (
            <p id={hintId} className="-mt-2 mb-3 text-[0.9em] font-medium text-accent">
              Mais de uma alternativa está correta. Marque as {question.expectedSelections}{' '}
              alternativas corretas.
            </p>
          )}
          <div
            className={cn(
              'grid border-t border-rule',
              question.type === 'true_false' && 'sm:grid-cols-2 sm:gap-x-6'
            )}
          >
            {question.options.map((option) => {
              const state = getOptionState(option.id, selectedOptionIds, revealedCorrectOptionIds)
              return (
                <label
                  key={option.id}
                  className={cn(
                    'flex min-h-14 items-center gap-3 border-b border-l-[3px] border-b-rule py-3 pl-4 pr-3 text-ink transition-colors motion-reduce:transition-none',
                    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent',
                    isLocked ? 'cursor-default' : 'cursor-pointer hover:bg-surface-muted',
                    // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
                    optionStateStyles[state]
                  )}
                >
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={selectedOptionIds.includes(option.id)}
                    onChange={() => onSelect(option.id)}
                    className="accent-accent"
                  />
                  <span className="flex-1">{option.text}</span>
                  {state === 'correct' && (
                    <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-success">
                      Correta
                    </span>
                  )}
                  {state === 'wrong' && (
                    <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-danger">
                      Sua resposta
                    </span>
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
