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
      className={cn(
        'rounded-card border p-4',
        isCorrect ? 'border-success-200 bg-success-50' : 'border-danger-200 bg-danger-50'
      )}
    >
      <p className={cn('font-semibold', isCorrect ? 'text-success-700' : 'text-danger-700')}>
        {isCorrect ? 'Você acertou!' : 'Não foi dessa vez.'}
      </p>
      {!isCorrect && (
        <p className="mt-1 text-sm text-slate-800">
          Resposta correta: <span className="font-semibold">{correctOptionText}</span>
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{explanation}</p>
    </div>
  )
}
