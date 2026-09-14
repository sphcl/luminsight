import type { LessonDocument, ModuleDocument } from '@/types/module.types'

// Id do documento em "modules" e prefixo usado pelas lições em
// "modules/{id}/lessons". Único ponto de verdade do id, o script de seed e
// (futuramente) as rotas da Fase 7 importam daqui em vez de reescrever a
// string "modulo-04" espalhada pelo código.
export const MODULE_04_ID = 'modulo-04'

export const module04: ModuleDocument = {
  title: '',
  description: '',
  order: 4,
  icon: '',
  color: '',
  difficulty: 'intermediario',
  estimatedMinutes: 0,
  totalLessons: 3,
  isActive: false,
  requiredModuleId: null,
}

export interface Module04LessonEntry {
  id: string
  data: LessonDocument
}

export const module04Lessons: Module04LessonEntry[] = [
  {
    id: 'licao-01',
    data: { title: '', order: 1, content: [], estimatedMinutes: 0, readingTimeSeconds: 0 },
  },
  {
    id: 'licao-02',
    data: { title: '', order: 2, content: [], estimatedMinutes: 0, readingTimeSeconds: 0 },
  },
  {
    id: 'licao-03',
    data: { title: '', order: 3, content: [], estimatedMinutes: 0, readingTimeSeconds: 0 },
  },
]
