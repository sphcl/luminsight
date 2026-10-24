import { Timestamp } from 'firebase/firestore'
import type { LessonWithId, ModuleWithId } from '@/types/module.types'
import type { ProgressDocument } from '@/types/progress.types'
import type { AuthUser } from '@/types/user.types'

export const TEST_USER: AuthUser = {
  uid: 'user-1',
  email: 'teste@example.com',
  displayName: 'Teste',
  photoURL: null,
  emailVerified: true,
}

export function buildModule(overrides: Partial<ModuleWithId> = {}): ModuleWithId {
  return {
    id: 'modulo-01',
    title: 'Módulo',
    description: 'Descrição',
    order: 1,
    icon: 'placeholder',
    color: 'primary',
    difficulty: 'iniciante',
    estimatedMinutes: 30,
    totalLessons: 2,
    isActive: true,
    requiredModuleId: null,
    hasSimulation: true,
    ...overrides,
  }
}

// Cinco módulos encadeados como na trilha real: cada um exige o anterior.
export function buildTrail(): ModuleWithId[] {
  return Array.from({ length: 5 }, (_, index) =>
    buildModule({
      id: `modulo-0${index + 1}`,
      title: `Módulo ${index + 1}`,
      order: index + 1,
      requiredModuleId: index === 0 ? null : `modulo-0${index}`,
    })
  )
}

export function buildLesson(overrides: Partial<LessonWithId> = {}): LessonWithId {
  return {
    id: 'licao-01',
    title: 'Lição',
    order: 1,
    estimatedMinutes: 5,
    readingTimeSeconds: 240,
    content: [{ type: 'text', content: 'Conteúdo da lição' }],
    ...overrides,
  }
}

export function buildProgress(overrides: Partial<ProgressDocument> = {}): ProgressDocument {
  return {
    startedAt: Timestamp.now(),
    completedAt: null,
    lessonsCompleted: [],
    quizBestScore: null,
    quizAttempts: 0,
    simulationCompleted: false,
    lastUpdatedAt: Timestamp.now(),
    ...overrides,
  }
}
