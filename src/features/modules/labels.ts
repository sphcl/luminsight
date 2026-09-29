import type { ModuleDifficulty } from '@/types/module.types'
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
