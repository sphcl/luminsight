import { MODULE_01_ID } from '@/content/modules/module-01'
import { MODULE_02_ID } from '@/content/modules/module-02'
import { MODULE_03_ID } from '@/content/modules/module-03'
import { MODULE_04_ID } from '@/content/modules/module-04'
import { MODULE_05_ID } from '@/content/modules/module-05'
import type { QuizQuestion } from '@/types/quiz.types'
import { quiz01Questions } from './quiz-01'
import { quiz02Questions } from './quiz-02'
import { quiz03Questions } from './quiz-03'
import { quiz04Questions } from './quiz-04'
import { quiz05Questions } from './quiz-05'

// Uso Map pra um moduleId vindo da URL nunca cair em propriedade herdada de objeto.
const QUIZZES_BY_MODULE = new Map<string, QuizQuestion[]>([
  [MODULE_01_ID, quiz01Questions],
  [MODULE_02_ID, quiz02Questions],
  [MODULE_03_ID, quiz03Questions],
  [MODULE_04_ID, quiz04Questions],
  [MODULE_05_ID, quiz05Questions],
])

export function getQuizForModule(moduleId: string): QuizQuestion[] | null {
  const questions = QUIZZES_BY_MODULE.get(moduleId)
  return questions && questions.length > 0 ? questions : null
}
