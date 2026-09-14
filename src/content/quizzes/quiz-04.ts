import type { QuizQuestion } from '@/types/quiz.types'

// Conteúdo do quiz do Módulo 4: fica só aqui no bundle, nunca no Firestore.
// Ver o comentário de topo em src/types/quiz.types.ts (QuizQuestion) para a
// justificativa de segurança dessa decisão e os limites dela.
export const quiz04Questions: QuizQuestion[] = []
