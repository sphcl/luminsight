import { ProgressBar } from '@/components/ui'

interface QuizProgressProps {
  questionNumber: number
  totalQuestions: number
}

export function QuizProgress({ questionNumber, totalQuestions }: QuizProgressProps) {
  return (
    <ProgressBar
      value={questionNumber}
      max={totalQuestions}
      label={`Questão ${questionNumber} de ${totalQuestions}`}
    />
  )
}
