import { cn } from '@/utils/helpers/classnames'

interface AnswerFeedbackProps {
  isCorrect: boolean
  correctOptionText: string
  explanation: string
}

export function AnswerFeedback({ isCorrect, correctOptionText, explanation }: AnswerFeedbackProps) {
  return (
    <div
      role="status"
      // Revelação do feedback: entra com o mesmo movimento curto das lições, e nada com reduced motion.
      className={cn(
        'reading rounded-card p-5 motion-safe:animate-enter',
        isCorrect ? 'bg-success-soft' : 'bg-danger-soft'
      )}
    >
      <p className={cn('font-semibold', isCorrect ? 'text-success' : 'text-danger')}>
        {isCorrect ? 'Você acertou!' : 'Não foi dessa vez.'}
      </p>
      {!isCorrect && (
        <p className="mt-1 text-[0.9em] text-ink">
          Resposta correta: <span className="font-semibold">{correctOptionText}</span>
        </p>
      )}
      <p className="mt-2 text-[0.9em] text-ink-soft">{explanation}</p>
    </div>
  )
}
