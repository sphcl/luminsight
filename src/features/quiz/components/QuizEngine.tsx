import { useEffect, useRef } from 'react'
import { Button, Card } from '@/components/ui'
import { getCorrectOptionIds, type QuizSummary } from '@/features/quiz/engine/scoring'
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
  const correctIds = quiz.hasAnswered ? getCorrectOptionIds(currentQuestion) : []
  const correctOptionText = currentQuestion.options
    .filter((option) => correctIds.includes(option.id))
    .map((option) => option.text)
    .join(' / ')

  return (
    <Card className="flex flex-col gap-6">
      <QuizProgress questionNumber={quiz.questionNumber} totalQuestions={quiz.totalQuestions} />

      <QuestionCard
        key={currentQuestion.id}
        ref={legendRef}
        question={toPublicQuestion(currentQuestion)}
        selectedOptionIds={quiz.selectedOptionIds}
        isLocked={quiz.hasAnswered}
        revealedCorrectOptionIds={quiz.hasAnswered ? correctIds : null}
        onSelect={quiz.selectOption}
      />

      {quiz.hasAnswered && quiz.isCorrect !== null && (
        <AnswerFeedback
          isCorrect={quiz.isCorrect}
          correctOptionText={correctOptionText}
          explanation={currentQuestion.explanation}
        />
      )}

      <div className="flex justify-end">
        {quiz.hasAnswered ? (
          <Button onClick={quiz.goToNext}>
            {isLastQuestion ? 'Ver resultado' : 'Próxima questão'}
          </Button>
        ) : (
          <Button onClick={quiz.confirmAnswer} disabled={quiz.selectedOptionIds.length === 0}>
            Confirmar resposta
          </Button>
        )}
      </div>
    </Card>
  )
}
