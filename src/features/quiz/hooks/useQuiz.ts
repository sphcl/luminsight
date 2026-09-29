import { useRef, useState } from 'react'
import { gradeAnswer, summarizeResult, type QuizSummary } from '@/features/quiz/engine/scoring'
import type { QuizAnswer, QuizQuestion } from '@/types/quiz.types'

interface UseQuizOptions {
  onFinish?: (summary: QuizSummary) => void
}

interface UseQuizReturn {
  currentQuestion: QuizQuestion | undefined
  questionNumber: number
  totalQuestions: number
  selectedOptionId: string | null
  hasAnswered: boolean
  isCorrect: boolean | null
  selectOption: (optionId: string) => void
  confirmAnswer: () => void
  goToNext: () => void
  isFinished: boolean
  result: QuizSummary | null
}

export function useQuiz(
  questions: QuizQuestion[],
  { onFinish }: UseQuizOptions = {}
): UseQuizReturn {
  const [startedAt] = useState(() => Date.now())
  const [index, setIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [result, setResult] = useState<QuizSummary | null>(null)
  // Ref e não state porque dois cliques no mesmo render leriam o mesmo valor antigo e salvariam duas vezes.
  const hasFinishedRef = useRef(false)

  // eslint-disable-next-line security/detect-object-injection -- índice numérico controlado pelo hook
  const currentQuestion = questions[index]
  const currentAnswer = currentQuestion
    ? answers.find((answer) => answer.questionId === currentQuestion.id)
    : undefined
  const hasAnswered = currentAnswer !== undefined
  const isFinished = result !== null

  function selectOption(optionId: string) {
    if (!currentQuestion || hasAnswered || isFinished) return
    if (!currentQuestion.options.some((option) => option.id === optionId)) return
    setSelectedOptionId(optionId)
  }

  function confirmAnswer() {
    if (!currentQuestion || !selectedOptionId || hasAnswered || isFinished) return

    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId,
      correct: gradeAnswer(currentQuestion, selectedOptionId),
    }
    setAnswers((previous) =>
      previous.some((item) => item.questionId === answer.questionId)
        ? previous
        : [...previous, answer]
    )
  }

  function goToNext() {
    if (!hasAnswered || isFinished) return

    if (index < questions.length - 1) {
      setIndex(index + 1)
      setSelectedOptionId(null)
      return
    }

    if (hasFinishedRef.current) return
    hasFinishedRef.current = true

    const summary = summarizeResult(answers, questions, (Date.now() - startedAt) / 1000)
    setResult(summary)
    onFinish?.(summary)
  }

  return {
    currentQuestion,
    questionNumber: index + 1,
    totalQuestions: questions.length,
    selectedOptionId: currentAnswer?.selectedOptionId ?? selectedOptionId,
    hasAnswered,
    isCorrect: currentAnswer?.correct ?? null,
    selectOption,
    confirmAnswer,
    goToNext,
    isFinished,
    result,
  }
}
