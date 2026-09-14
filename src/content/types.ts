import type { LessonDocument } from '@/types/module.types'

export interface LessonEntry {
  id: string
  data: LessonDocument
}

// Ícone e cor ainda não foram definidos pelo design, todo módulo usa o mesmo placeholder por enquanto.
export const PLACEHOLDER_ICON = 'placeholder'
export const PLACEHOLDER_COLOR = 'primary'
