import type { ContentBlock, LessonDocument } from '@/types/module.types'

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
