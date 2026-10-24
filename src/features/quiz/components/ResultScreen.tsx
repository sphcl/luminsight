import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import { getCorrectOptionIds, type QuizSummary } from '@/features/quiz/engine/scoring'
import type { QuizOption, QuizQuestion } from '@/types/quiz.types'
import { cn } from '@/utils/helpers/classnames'
import { primaryLinkClass } from '@/components/ui/linkStyles'

export type SaveStatus = 'saving' | 'saved' | 'error'

interface ResultScreenProps {
  summary: QuizSummary
  questions: QuizQuestion[]
  saveStatus: SaveStatus
  backTo: string
  onRetry: () => void
}

// Mantenho a ordem das alternativas da questão, não a ordem em que a pessoa clicou.
function textsOf(options: QuizOption[], ids: string[]): string {
  return options
    .filter((option) => ids.includes(option.id))
    .map((option) => option.text)
    .join(' / ')
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes} min ${seconds} s` : `${seconds} s`
}

export function ResultScreen({
  summary,
  questions,
  saveStatus,
  backTo,
  onRetry,
}: ResultScreenProps) {
  const answersById = new Map(summary.answers.map((answer) => [answer.questionId, answer]))

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-ink-muted">Sua nota</p>
        <p className="font-serif text-7xl font-normal leading-none tracking-[-0.03em] text-ink tabular-nums">
          {summary.score}
        </p>
        <Badge variant={summary.passed ? 'success' : 'danger'}>
          {summary.passed ? 'Aprovado' : 'Reprovado'}
        </Badge>
        <p className="text-sm text-ink-soft">
          {summary.correctAnswers} de {summary.totalQuestions} corretas em{' '}
          {formatDuration(summary.timeSpentSeconds)}.{' '}
          {summary.passed
            ? 'Mandou bem!'
            : `A nota mínima é ${QUIZ_PASSING_SCORE}. Revise as lições e tente de novo quando quiser.`}
        </p>

        {saveStatus === 'saving' && <p className="text-sm text-ink-muted">Salvando resultado...</p>}
        {saveStatus === 'error' && (
          <p role="alert" className="rounded-card bg-warning-soft p-3 text-sm text-ink">
            Não conseguimos salvar este resultado, então seu progresso pode não ter sido registrado.
            Sua nota continua aqui na tela.
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onRetry} disabled={saveStatus === 'saving'}>
            Refazer quiz
          </Button>
          <Link to={backTo} className={primaryLinkClass}>
            Voltar ao módulo
          </Link>
        </div>
      </Card>

      <section aria-labelledby="review-title" className="flex flex-col gap-3">
        <h2 id="review-title" className="text-lg font-semibold text-ink">
          Revisão das questões
        </h2>
        <ol className="flex flex-col gap-3">
          {questions.map((question, index) => {
            const answer = answersById.get(question.id)
            const selectedIds = answer?.selectedOptionIds ?? []
            const correctIds = getCorrectOptionIds(question)
            const selectedText = textsOf(question.options, selectedIds)
            const correctText = textsOf(question.options, correctIds)
            const isCorrect = answer?.correct ?? false

            return (
              <li key={question.id}>
                <Card className="flex flex-col gap-2">
                  <p className="font-medium text-ink">
                    {index + 1}. {question.prompt}
                  </p>
                  <p className={cn('text-sm', isCorrect ? 'text-success' : 'text-danger')}>
                    {isCorrect ? 'Acertou' : 'Errou'}: sua resposta foi "
                    {selectedText || 'sem resposta'}"
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-ink-soft">Resposta correta: "{correctText}"</p>
                  )}
                  <p className="text-sm leading-relaxed text-ink-soft">{question.explanation}</p>
                </Card>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
