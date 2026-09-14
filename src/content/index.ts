import type { ModuleDocument } from '@/types/module.types'
import type { QuizQuestion } from '@/types/quiz.types'
import type { SimulationDocument } from '@/types/simulation.types'
import type { LessonEntry } from '@/content/types'
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
import { simulation04 } from './simulations/simulation-04'

export interface ContentModuleEntry {
  id: string
  module: ModuleDocument
  lessons: LessonEntry[]
  quiz: QuizQuestion[]
}

export const CONTENT_MODULES: ContentModuleEntry[] = [
  { id: MODULE_01_ID, module: module01, lessons: module01Lessons, quiz: quiz01Questions },
  { id: MODULE_02_ID, module: module02, lessons: module02Lessons, quiz: quiz02Questions },
  { id: MODULE_03_ID, module: module03, lessons: module03Lessons, quiz: quiz03Questions },
  { id: MODULE_04_ID, module: module04, lessons: module04Lessons, quiz: quiz04Questions },
  { id: MODULE_05_ID, module: module05, lessons: module05Lessons, quiz: quiz05Questions },
]

export const CONTENT_SIMULATIONS: SimulationDocument[] = [
  simulation01,
  simulation02,
  simulation03,
  simulation04,
]
