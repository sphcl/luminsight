import type { ContentBlock, ModuleDocument } from '@/types/module.types'
import { PLACEHOLDER_COLOR, PLACEHOLDER_ICON, type LessonEntry } from '@/content/types'
import { MODULE_01_ID } from './module-01'

export const MODULE_02_ID = 'modulo-02'

export const module02: ModuleDocument = {
  title: 'Phishing: A Arte do Engano Digital',
  description: '[PENDENTE] Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  order: 2,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'iniciante',
  estimatedMinutes: 35,
  totalLessons: 3,
  isActive: false,
  requiredModuleId: MODULE_01_ID,
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

export const module02Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: {
      title: 'O que é Phishing e suas variantes',
      order: 1,
      estimatedMinutes: 12,
      readingTimeSeconds: 260,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-02',
    data: {
      title: 'Phishing, Vishing e Smishing na prática',
      order: 2,
      estimatedMinutes: 12,
      readingTimeSeconds: 260,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-03',
    data: {
      title: 'Como identificar uma tentativa de ataque',
      order: 3,
      estimatedMinutes: 11,
      readingTimeSeconds: 250,
      content: pendingLessonContent,
    },
  },
]
