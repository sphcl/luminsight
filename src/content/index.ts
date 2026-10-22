import type { ModuleDocument } from '@/types/module.types'
import type { QuizQuestion } from '@/types/quiz.types'
import type { SimulationDocument } from '@/types/simulation.types'
import { estimateModuleMinutes, type LessonEntry, type ModuleContent } from '@/content/types'
import { MODULE_01_ID, module01, module01Lessons } from './modules/module-01'
import { MODULE_02_ID, module02, module02Lessons } from './modules/module-02'
import { MODULE_03_ID, module03, module03Lessons } from './modules/module-03'
import { MODULE_04_ID, module04, module04Lessons } from './modules/module-04'
import { MODULE_05_ID, module05, module05Lessons } from './modules/module-05'
import { quiz01Questions } from './quizzes/quiz-01'
import { quiz02Questions } from './quizzes/quiz-02'
import { quiz03Questions } from './quizzes/quiz-03'
import { quiz04Questions } from './quizzes/quiz-04'
import { quiz05Questions } from './quizzes/quiz-05'
import { simulation01 } from './simulations/simulation-01'
import { simulation02 } from './simulations/simulation-02'
import { simulation03 } from './simulations/simulation-03'

export interface ContentModuleEntry {
  id: string
  module: ModuleDocument
  lessons: LessonEntry[]
  quiz: QuizQuestion[]
}

export const CONTENT_SIMULATIONS: SimulationDocument[] = [simulation01, simulation02, simulation03]

function buildEntry(
  id: string,
  module: ModuleContent,
  lessons: LessonEntry[],
  quiz: QuizQuestion[]
): ContentModuleEntry {
  const simulation = CONTENT_SIMULATIONS.find((candidate) => candidate.moduleId === id)
  return {
    id,
    module: { ...module, estimatedMinutes: estimateModuleMinutes(lessons, quiz, simulation) },
    lessons,
    quiz,
  }
}

export const CONTENT_MODULES: ContentModuleEntry[] = [
  buildEntry(MODULE_01_ID, module01, module01Lessons, quiz01Questions),
  buildEntry(MODULE_02_ID, module02, module02Lessons, quiz02Questions),
  buildEntry(MODULE_03_ID, module03, module03Lessons, quiz03Questions),
  buildEntry(MODULE_04_ID, module04, module04Lessons, quiz04Questions),
  buildEntry(MODULE_05_ID, module05, module05Lessons, quiz05Questions),
]
