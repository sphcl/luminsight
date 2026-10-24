import type { SimulationFormat } from '@/types/simulation.types'
import type { SimulationStatus } from './hooks/useSimulations'

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export const FORMAT_LABELS: Record<SimulationFormat, string> = {
  chat: 'Mensagens',
  email: 'Email',
  call: 'Ligação',
}

export const SIMULATION_STATUS_BADGES: Record<
  SimulationStatus,
  { label: string; variant: BadgeVariant }
> = {
  locked: { label: 'Bloqueada', variant: 'neutral' },
  available: { label: 'Disponível', variant: 'primary' },
  completed: { label: 'Concluída', variant: 'success' },
}
