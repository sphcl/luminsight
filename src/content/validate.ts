import type { SimulationDocument } from '@/types/simulation.types'
import type { ContentModuleEntry } from './index'

const PENDING_MARKER = '[PENDENTE]'

export function hasPendingText(value: unknown): boolean {
  if (typeof value === 'string') return value.includes(PENDING_MARKER)
  if (Array.isArray(value)) return value.some(hasPendingText)
  if (value !== null && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(hasPendingText)
  }
  return false
}

export function validateContent(modules: ContentModuleEntry[], simulations: SimulationDocument[]): string[] {
  const errors: string[] = []
  const moduleIds = new Set(modules.map((entry) => entry.id))

  const orders = [...modules].sort((a, b) => a.module.order - b.module.order)
  orders.forEach((entry, index) => {
    if (entry.module.order !== index + 1) {
      errors.push(
        `Ordem dos módulos com lacuna ou duplicata: esperado ${index + 1}, módulo "${entry.id}" tem order ${entry.module.order}.`
      )
    }
  })

  for (const entry of modules) {
    if (entry.module.totalLessons !== entry.lessons.length) {
      errors.push(
        `Módulo "${entry.id}": totalLessons (${entry.module.totalLessons}) não bate com o número de lições (${entry.lessons.length}).`
      )
    }

    if (entry.quiz.length !== 10) {
      errors.push(`Módulo "${entry.id}": quiz precisa ter exatamente 10 questões, tem ${entry.quiz.length}.`)
    }

    for (const question of entry.quiz) {
      const optionIds = question.options.map((option) => option.id)
      if (new Set(optionIds).size !== optionIds.length) {
        errors.push(`Módulo "${entry.id}", questão "${question.id}": options com id duplicado.`)
      }
      if (!optionIds.includes(question.correctOptionId)) {
        errors.push(
          `Módulo "${entry.id}", questão "${question.id}": correctOptionId "${question.correctOptionId}" não existe entre as options.`
        )
      }
    }

    const modulePending =
      hasPendingText(entry.module) ||
      entry.lessons.some((lesson) => hasPendingText(lesson.data)) ||
      entry.quiz.some(hasPendingText)
    if (modulePending && entry.module.isActive) {
      errors.push(`Módulo "${entry.id}": tem conteúdo com ${PENDING_MARKER} mas está com isActive: true.`)
    }
  }

  for (const entry of modules) {
    const visited = new Set<string>()
    let currentId: string | null = entry.id

    while (currentId) {
      if (visited.has(currentId)) {
        errors.push(`Módulo "${entry.id}": ciclo detectado na cadeia de requiredModuleId.`)
        break
      }
      visited.add(currentId)

      const current = modules.find((candidate) => candidate.id === currentId)
      if (!current) break

      const requiredId = current.module.requiredModuleId
      if (requiredId === null) break
      if (!moduleIds.has(requiredId)) {
        errors.push(`Módulo "${entry.id}": requiredModuleId "${requiredId}" não existe.`)
        break
      }
      currentId = requiredId
    }
  }

  for (const simulation of simulations) {
    for (const scene of simulation.scenes) {
      const hasCorrectOption = scene.decision.options.some((option) => option.isCorrect)
      if (!hasCorrectOption) {
        errors.push(`Simulação "${simulation.id}", cena "${scene.id}": decisão sem nenhuma opção correta.`)
      }
    }
  }

  return errors
}

export interface ModuleCompletionReport {
  moduleId: string
  totalContentBlocks: number
  pendingContentBlocks: number
  totalQuizQuestions: number
  pendingQuizQuestions: number
}

export function getContentCompletionReport(modules: ContentModuleEntry[]): ModuleCompletionReport[] {
  return modules.map((entry) => {
    const blocks = entry.lessons.flatMap((lesson) => lesson.data.content)

    return {
      moduleId: entry.id,
      totalContentBlocks: blocks.length,
      pendingContentBlocks: blocks.filter(hasPendingText).length,
      totalQuizQuestions: entry.quiz.length,
      pendingQuizQuestions: entry.quiz.filter(hasPendingText).length,
    }
  })
}
