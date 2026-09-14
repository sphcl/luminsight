import type { QuizQuestion } from '@/types/quiz.types'

const pendingOptions = [
  { id: 'a', text: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'b', text: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'c', text: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'd', text: '[PENDENTE] Lorem ipsum dolor sit amet.' },
]

const trueFalseOptions = [
  { id: 'a', text: 'Verdadeiro' },
  { id: 'b', text: 'Falso' },
]

export const quiz03Questions: QuizQuestion[] = [
  { id: 'q1', type: 'multiple_choice', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: pendingOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q2', type: 'multiple_choice', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: pendingOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q3', type: 'multiple_choice', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: pendingOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q4', type: 'multiple_choice', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: pendingOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q5', type: 'true_false', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: trueFalseOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q6', type: 'true_false', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: trueFalseOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q7', type: 'scenario', scenario: '[PENDENTE] Lorem ipsum dolor sit amet.', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: pendingOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q8', type: 'scenario', scenario: '[PENDENTE] Lorem ipsum dolor sit amet.', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: pendingOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q9', type: 'scenario', scenario: '[PENDENTE] Lorem ipsum dolor sit amet.', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: pendingOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { id: 'q10', type: 'visual', imageSrc: '[PENDENTE] Lorem ipsum.', prompt: '[PENDENTE] Lorem ipsum dolor sit amet.', options: pendingOptions, correctOptionId: 'a', explanation: '[PENDENTE] Lorem ipsum dolor sit amet.' },
]
