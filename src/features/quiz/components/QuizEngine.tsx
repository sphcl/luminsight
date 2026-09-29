import { useEffect, useRef } from 'react'
import { Button, Card } from '@/components/ui'
import type { QuizSummary } from '@/features/quiz/engine/scoring'
import { useQuiz } from '@/features/quiz/hooks/useQuiz'
import { toPublicQuestion } from '@/features/quiz/types/public-question'
import type { QuizQuestion } from '@/types/quiz.types'
import { AnswerFeedback } from './AnswerFeedback'
import { QuestionCard } from './QuestionCard'
import { QuizProgress } from './QuizProgress'

interface QuizEngineProps {
  questions: QuizQuestion[]
  onFinish: (summary: QuizSummary) => void
}

export function QuizEngine({ questions, onFinish }: QuizEngineProps) {
  const quiz = useQuiz(questions, { onFinish })
  const legendRef = useRef<HTMLLegendElement>(null)
  const { currentQuestion } = quiz

  // Levo o foco pro enunciado a cada questão nova pro leitor de tela não ficar preso no botão anterior.
  useEffect(() => {
    legendRef.current?.focus()
  }, [currentQuestion?.id])

  if (!currentQuestion || quiz.isFinished) return null

  const isLastQuestion = quiz.questionNumber === quiz.totalQuestions
  const correctOption = quiz.hasAnswered
    ? currentQuestion.options.find((option) => option.id === currentQuestion.correctOptionId)
    : undefined

  return (
    <Card className="flex flex-col gap-6">
      <QuizProgress questionNumber={quiz.questionNumber} totalQuestions={quiz.totalQuestions} />

      <QuestionCard
        key={currentQuestion.id}
        ref={legendRef}
        question={toPublicQuestion(currentQuestion)}
        selectedOptionId={quiz.selectedOptionId}
        isLocked={quiz.hasAnswered}
        revealedCorrectOptionId={quiz.hasAnswered ? currentQuestion.correctOptionId : null}
        onSelect={quiz.selectOption}
      />

      {quiz.hasAnswered && quiz.isCorrect !== null && (
        <AnswerFeedback
          isCorrect={quiz.isCorrect}
          correctOptionText={correctOption?.text ?? ''}
          explanation={currentQuestion.explanation}
        />
      )}

      <div className="flex justify-end">
        {quiz.hasAnswered ? (
          <Button onClick={quiz.goToNext}>
            {isLastQuestion ? 'Ver resultado' : 'Próxima questão'}
          </Button>
        ) : (
          <Button onClick={quiz.confirmAnswer} disabled={quiz.selectedOptionId === null}>
            Confirmar resposta
          </Button>
        )}
      </div>
    </Card>
  )
}
