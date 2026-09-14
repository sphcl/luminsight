import type { Timestamp, FieldValue } from 'firebase/firestore'

export type QuestionType = 'multiple_choice' | 'true_false' | 'scenario' | 'visual'

export interface QuizOption {
  id: string
  text: string
}

// Conteúdo do quiz (perguntas, alternativas e gabarito) vive só no bundle do
// app, em src/content/quizzes/, nunca no Firestore. Ver README do módulo de
// conteúdo para a justificativa de segurança e os limites dessa mitigação.
export interface QuizQuestion {
  id: string
  type: QuestionType
  prompt: string
  options: QuizOption[]
  correctOptionId: string
  explanation: string
  // Só preenchido para perguntas do tipo 'visual'
  imageSrc?: string
  scenario?: string
}

export interface QuizAnswer {
  questionId: string
  selectedOptionId: string
  correct: boolean
}

// Documento da coleção "quizResults": histórico de tentativas, gravado pelo
// client mas nunca editável depois de criado (ver firestore.rules).
export interface QuizResultDocument {
  userId: string
  moduleId: string
  completedAt: Timestamp | FieldValue
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpentSeconds: number
  passed: boolean
  answers: QuizAnswer[]
}
