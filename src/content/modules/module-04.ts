import type { ContentBlock, ModuleDocument } from '@/types/module.types'
import { PLACEHOLDER_COLOR, PLACEHOLDER_ICON, type LessonEntry } from '@/content/types'
import { MODULE_03_ID } from './module-03'

export const MODULE_04_ID = 'modulo-04'

export const module04: ModuleDocument = {
  title: 'Casos Reais e Golpes Modernos',
  description: '[PENDENTE] Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  order: 4,
  icon: PLACEHOLDER_ICON,
  color: PLACEHOLDER_COLOR,
  difficulty: 'intermediario',
  estimatedMinutes: 35,
  totalLessons: 3,
  isActive: false,
  hasSimulation: true,
  requiredModuleId: MODULE_03_ID,
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

export const module04Lessons: LessonEntry[] = [
  {
    id: 'licao-01',
    data: {
      title: 'O golpe do falso gerente bancário',
      order: 1,
      estimatedMinutes: 12,
      readingTimeSeconds: 260,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-02',
    data: {
      title: 'O crime organizado usa IA',
      order: 2,
      estimatedMinutes: 12,
      readingTimeSeconds: 260,
      content: pendingLessonContent,
    },
  },
  {
    id: 'licao-03',
    data: {
      title: 'Spear Phishing: o ataque feito sob medida',
      order: 3,
      estimatedMinutes: 11,
      readingTimeSeconds: 250,
      content: pendingLessonContent,
    },
  },
]
