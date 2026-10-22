import { getDecisionCountRange } from '@/features/simulations/engine/simulation'
import type { ContentBlock, LessonDocument, ModuleDocument } from '@/types/module.types'
import type { QuizQuestion } from '@/types/quiz.types'
import type { SimulationDocument } from '@/types/simulation.types'

// O tempo do módulo não é escrito à mão: o index.ts calcula a partir do conteúdo real.
export type ModuleContent = Omit<ModuleDocument, 'estimatedMinutes'>

export interface LessonEntry {
  id: string
  data: LessonDocument
}

// Ícone e cor ainda não foram definidos pelo design, todo módulo usa o mesmo placeholder por enquanto.
export const PLACEHOLDER_ICON = 'placeholder'
export const PLACEHOLDER_COLOR = 'primary'

const WORDS_PER_MINUTE = 200
const MIN_LOCK_SECONDS = 30
const MAX_LOCK_SECONDS = 120

function blockText(block: ContentBlock): string[] {
  switch (block.type) {
    case 'text':
      return [block.content.split('**').join('')]
    case 'heading':
    case 'highlight':
      return [block.content]
    case 'list':
      return block.items
    case 'example':
      return [block.title, block.content]
    case 'fact':
      return [block.content, block.source]
    case 'video':
      return [block.title, block.caption ?? '']
    case 'link':
      return [block.title, block.description ?? '']
  }
}

export function countWords(content: ContentBlock[]): number {
  return content
    .flatMap(blockText)
    .join(' ')
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

// A trava do botão fica na metade da leitura estimada: ela só existe pra ninguém concluir sem ler.
export function buildLessonData(
  title: string,
  order: number,
  content: ContentBlock[]
): LessonDocument {
  const minutes = countWords(content) / WORDS_PER_MINUTE
  const lockSeconds = Math.round((minutes * 60) / 2)

  return {
    title,
    order,
    content,
    estimatedMinutes: Math.max(1, Math.ceil(minutes)),
    readingTimeSeconds: Math.min(MAX_LOCK_SECONDS, Math.max(MIN_LOCK_SECONDS, lockSeconds)),
  }
}

const QUIZ_SECONDS_PER_QUESTION = 30
const SIMULATION_SECONDS_PER_DECISION = 60

// Simulação ramificada conta pelo caminho mais longo, pra o site não prometer menos do que alguém pode levar.
export function estimateModuleMinutes(
  lessons: LessonEntry[],
  quiz: QuizQuestion[],
  simulation: SimulationDocument | undefined
): number {
  const readingSeconds = lessons.reduce(
    (total, lesson) => total + (countWords(lesson.data.content) / WORDS_PER_MINUTE) * 60,
    0
  )
  const quizSeconds = quiz.length * QUIZ_SECONDS_PER_QUESTION
  const simulationSeconds = simulation
    ? getDecisionCountRange(simulation.scenes).max * SIMULATION_SECONDS_PER_DECISION
    : 0

  return Math.max(1, Math.round((readingSeconds + quizSeconds + simulationSeconds) / 60))
}
