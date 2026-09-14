import type { ContentBlock, ModuleDocument } from '@/types/module.types'
import { PLACEHOLDER_COLOR, PLACEHOLDER_ICON, type LessonEntry } from '@/content/types'
import { MODULE_04_ID } from './module-04'

export const MODULE_05_ID = 'modulo-05'

export const module05: ModuleDocument = {
  title: 'Como se Proteger',
  description: '[PENDENTE] Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  order: 5,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'avancado',
  estimatedMinutes: 40,
  totalLessons: 3,
  isActive: false,
  requiredModuleId: MODULE_04_ID,
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

export const module05Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: {
      title: 'Boas práticas: o que fazer e o que nunca fazer',
      order: 1,
      estimatedMinutes: 13,
      readingTimeSeconds: 280,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-02',
    data: {
      title: 'Como verificar identidade por múltiplos canais',
      order: 2,
      estimatedMinutes: 14,
      readingTimeSeconds: 290,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-03',
    data: {
      title: 'Como reportar golpes e onde buscar ajuda',
      order: 3,
      estimatedMinutes: 13,
      readingTimeSeconds: 280,
      content: pendingLessonContent,
    },
  },
]
