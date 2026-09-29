import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import type { QuizSummary } from '@/features/quiz/engine/scoring'
import type { QuizQuestion } from '@/types/quiz.types'
import { cn } from '@/utils/helpers/classnames'

export type SaveStatus = 'saving' | 'saved' | 'error'

interface ResultScreenProps {
  summary: QuizSummary
  questions: QuizQuestion[]
  saveStatus: SaveStatus
  backTo: string
  onRetry: () => void
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
        <p className="text-sm text-slate-500">Sua nota</p>
        <p className="text-5xl font-extrabold text-slate-900">{summary.score}</p>
        <Badge variant={summary.passed ? 'success' : 'danger'}>
          {summary.passed ? 'Aprovado' : 'Reprovado'}
        </Badge>
        <p className="text-sm text-slate-600">
          {summary.correctAnswers} de {summary.totalQuestions} corretas em{' '}
          {formatDuration(summary.timeSpentSeconds)}.{' '}
          {summary.passed
            ? 'Mandou bem!'
            : `A nota mínima é ${QUIZ_PASSING_SCORE}. Revise as lições e tente de novo quando quiser.`}
        </p>

        {saveStatus === 'saving' && <p className="text-sm text-slate-500">Salvando resultado...</p>}
        {saveStatus === 'error' && (
          <p role="alert" className="rounded-lg bg-warning-50 p-3 text-sm text-slate-800">
            Não conseguimos salvar este resultado, então seu progresso pode não ter sido registrado.
            Sua nota continua aqui na tela.
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onRetry} disabled={saveStatus === 'saving'}>
            Refazer quiz
          </Button>
          <Link
            to={backTo}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Voltar ao módulo
          </Link>
        </div>
      </Card>

      <section aria-labelledby="review-title" className="flex flex-col gap-3">
        <h2 id="review-title" className="text-lg font-semibold text-slate-900">
          Revisão das questões
        </h2>
        <ol className="flex flex-col gap-3">
          {questions.map((question, index) => {
            const answer = answersById.get(question.id)
            const selected = question.options.find(
              (option) => option.id === answer?.selectedOptionId
            )
            const correct = question.options.find(
              (option) => option.id === question.correctOptionId
            )
            const isCorrect = answer?.correct ?? false

            return (
              <li key={question.id}>
                <Card className="flex flex-col gap-2">
                  <p className="font-medium text-slate-900">
                    {index + 1}. {question.prompt}
                  </p>
                  <p className={cn('text-sm', isCorrect ? 'text-success-700' : 'text-danger-700')}>
                    {isCorrect ? 'Acertou' : 'Errou'}: sua resposta foi "
                    {selected?.text ?? 'sem resposta'}"
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-slate-700">Resposta correta: "{correct?.text}"</p>
                  )}
                  <p className="text-sm leading-relaxed text-slate-600">{question.explanation}</p>
                </Card>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
