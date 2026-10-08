import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui'
import type { DecisionEvaluation } from '@/features/simulations/engine/simulation'
import { cn } from '@/utils/helpers/classnames'

interface DecisionFeedbackProps {
  feedback: DecisionEvaluation
  correctOptionText: string | null
  isLastScene: boolean
  onContinue: () => void
}

export function DecisionFeedback({
  feedback,
  correctOptionText,
  isLastScene,
  onContinue,
}: DecisionFeedbackProps) {
  const titleRef = useRef<HTMLParagraphElement>(null)

  // Levo o foco pro feedback porque o botão clicado some da tela junto com o painel de opções.
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-3 rounded-card border p-4',
        feedback.isCorrect ? 'border-success-200 bg-success-50' : 'border-danger-200 bg-danger-50'
      )}
    >
      <p
        ref={titleRef}
        tabIndex={-1}
        className={cn(
          'font-semibold focus:outline-none',
          feedback.isCorrect ? 'text-success-700' : 'text-danger-700'
        )}
      >
        {feedback.isCorrect ? 'Boa decisão!' : 'Essa decisão favorecia o golpe.'}
      </p>
      {!feedback.isCorrect && correctOptionText && (
        <p className="text-sm text-slate-800">
          Melhor escolha: <span className="font-semibold">{correctOptionText}</span>
        </p>
      )}
      <p className="text-sm leading-relaxed text-slate-700">{feedback.feedback}</p>
      <Button className="self-end" onClick={onContinue}>
        {isLastScene ? 'Ver resultado' : 'Continuar'}
      </Button>
    </div>
  )
}
