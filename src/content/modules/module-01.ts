import type { ContentBlock, ModuleDocument } from '@/types/module.types'
import { PLACEHOLDER_COLOR, PLACEHOLDER_ICON, type LessonEntry } from '@/content/types'

export const MODULE_01_ID = 'modulo-01'

export const module01: ModuleDocument = {
  title: 'Fundamentos da Engenharia Social',
  description: '[PENDENTE] Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  order: 1,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'iniciante',
  estimatedMinutes: 30,
  totalLessons: 3,
  isActive: false,
  requiredModuleId: null,
}

const pendingLessonContent: ContentBlock[] = [
  { type: 'heading', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { type: 'text', content: '[PENDENTE] Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { type: 'highlight', variant: 'info', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  {
    type: 'list',
    ordered: false,
    items: [
      '[PENDENTE] Lorem ipsum dolor sit amet.',
      '[PENDENTE] Consectetur adipiscing elit.',
      '[PENDENTE] Sed do eiusmod tempor incididunt.',
    ],
  },
  { type: 'example', title: '[PENDENTE] Lorem ipsum dolor sit amet.', content: '[PENDENTE] Lorem ipsum dolor sit amet.' },
  { type: 'fact', content: '[PENDENTE] Lorem ipsum dolor sit amet.', source: '[PENDENTE] Lorem ipsum.' },
]

export const module01Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: {
      title: 'O que é Engenharia Social',
      order: 1,
      estimatedMinutes: 10,
      readingTimeSeconds: 240,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-02',
    data: {
      title: 'Como golpistas pensam: os gatilhos psicológicos',
      order: 2,
      estimatedMinutes: 10,
      readingTimeSeconds: 240,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-03',
    data: {
      title: 'O fator humano: por que tecnologia não basta',
      order: 3,
      estimatedMinutes: 10,
      readingTimeSeconds: 240,
      content: pendingLessonContent,
    },
  },
]
