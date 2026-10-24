import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import type { UnlockRequirement } from '@/features/modules/engine/trail'
import type { ModuleDifficulty, ModuleWithId } from '@/types/module.types'
import type { ModuleStatus } from '@/types/progress.types'

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

const DIFFICULTY_LABELS: Record<ModuleDifficulty, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

const STATUS_BADGES: Record<ModuleStatus, { label: string; variant: BadgeVariant }> = {
  locked: { label: 'Bloqueado', variant: 'neutral' },
  available: { label: 'Disponível', variant: 'primary' },
  in_progress: { label: 'Em andamento', variant: 'warning' },
  completed: { label: 'Concluído', variant: 'success' },
}

export function getDifficultyLabel(difficulty: ModuleDifficulty): string {
  // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
  return DIFFICULTY_LABELS[difficulty]
}

export function getStatusBadge(status: ModuleStatus): { label: string; variant: BadgeVariant } {
  // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
  return STATUS_BADGES[status]
}

export function formatMinutes(minutes: number): string {
  return `${minutes} min`
}

export function formatModuleLabel(module: Pick<ModuleWithId, 'order' | 'title'>): string {
  return `Módulo ${module.order} · ${module.title}`
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`
}

// Diz o que falta fazer, não o que está bloqueado: "Faltam 2 lições e o quiz do Módulo 3."
export function formatUnlockRequirement(requirement: UnlockRequirement): string {
  if (requirement.kind === 'unavailable') return 'Indisponível no momento.'

  const { next, thenModules } = requirement
  const items: string[] = []
  if (next.lessonsLeft > 0) {
    items.push(`${next.lessonsLeft} ${next.lessonsLeft === 1 ? 'lição' : 'lições'}`)
  }
  if (next.quiz === 'pending') items.push('o quiz')
  if (next.quiz === 'failed') items.push('a nota mínima no quiz')
  if (next.simulationPending) items.push('a simulação')

  const isPlural = items.length > 1 || next.lessonsLeft > 1
  const scoreHint = next.quiz === 'failed' ? ` (${QUIZ_PASSING_SCORE}%)` : ''
  let message = `${isPlural ? 'Faltam' : 'Falta'} ${joinList(items)} do Módulo ${next.module.order}${scoreHint}`

  const [onlyThen] = thenModules
  if (thenModules.length === 1 && onlyThen) {
    message += `, e depois o Módulo ${onlyThen.order}`
  } else if (thenModules.length > 1) {
    message += `, e depois os módulos ${joinList(thenModules.map((module) => String(module.order)))}`
  }

  return `${message}.`
}
