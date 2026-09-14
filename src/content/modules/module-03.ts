import type { ContentBlock, ModuleDocument } from '@/types/module.types'
import { PLACEHOLDER_COLOR, PLACEHOLDER_ICON, type LessonEntry } from '@/content/types'
import { MODULE_02_ID } from './module-02'

export const MODULE_03_ID = 'modulo-03'

export const module03: ModuleDocument = {
  title: 'Inteligência Artificial nas Mãos dos Golpistas',
  description: '[PENDENTE] Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  order: 3,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'intermediario',
  estimatedMinutes: 40,
  totalLessons: 3,
  isActive: false,
  requiredModuleId: MODULE_02_ID,
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

export const module03Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: {
      title: 'Como a IA generativa mudou os golpes',
      order: 1,
      estimatedMinutes: 13,
      readingTimeSeconds: 280,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-02',
    data: {
      title: 'Deepfakes: quando ver não é acreditar',
      order: 2,
      estimatedMinutes: 14,
      readingTimeSeconds: 290,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-03',
    data: {
      title: 'Clonagem de voz: o golpe da voz familiar',
      order: 3,
      estimatedMinutes: 13,
      readingTimeSeconds: 280,
      content: pendingLessonContent,
    },
  },
]
