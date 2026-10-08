import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { getSimulationById, getSimulations } from '@/services/simulations.service'
import { getModuleStatus } from '@/features/modules/engine/trail'
import { mapFirestoreError } from '@/utils/security/errors'
import type { ModuleWithId } from '@/types/module.types'
import type { ProgressDocument } from '@/types/progress.types'
import type { SimulationDocument } from '@/types/simulation.types'

export type SimulationStatus = 'locked' | 'available' | 'completed'

export interface SimulationWithStatus {
  simulation: SimulationDocument
  module: ModuleWithId
  status: SimulationStatus
}

interface UseSimulationsReturn {
  data: SimulationWithStatus[] | null
  isLoading: boolean
  error: string | null
}

export function useSimulations(): UseSimulationsReturn {
  const { user } = useAuth()
  const [data, setData] = useState<SimulationWithStatus[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    void (async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!user) {
          if (isCurrent) setData(null)
          return
        }

        const [simulations, modules, progressMap] = await Promise.all([
          getSimulations(),
          getModules(),
          getUserProgress(user.uid),
        ])
        if (!isCurrent) return

        // Simulação de módulo que não veio em getModules (inativo em produção) fica fora da lista.
        const items = simulations.flatMap((simulation) => {
          const module = modules.find((candidate) => candidate.id === simulation.moduleId)
          if (!module) return []

          const isLocked = getModuleStatus(module, progressMap, modules) === 'locked'
          const isCompleted = progressMap[module.id]?.simulationCompleted ?? false
          const status: SimulationStatus = isLocked
            ? 'locked'
            : isCompleted
              ? 'completed'
              : 'available'
          return [{ simulation, module, status }]
        })

        setData(items.sort((a, b) => a.module.order - b.module.order))
      } catch (caughtError) {
        if (!isCurrent) return
        setError(mapFirestoreError(caughtError))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    })()

    return () => {
      isCurrent = false
    }
  }, [user])

  return { data, isLoading, error }
}

export type SimulationAccessState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not_found' }
  | { status: 'locked' }
  | {
      status: 'ready'
      simulation: SimulationDocument
      module: ModuleWithId
      progress: ProgressDocument | undefined
    }

// Recalculo o bloqueio aqui porque a URL da simulação pode ser digitada direto.
export function useSimulationAccess(simulationId: string | undefined): SimulationAccessState {
  const { user } = useAuth()
  const [state, setState] = useState<SimulationAccessState>({ status: 'loading' })

  useEffect(() => {
    let isCurrent = true

    void (async () => {
      setState({ status: 'loading' })
      if (!user) return

      if (!simulationId) {
        setState({ status: 'not_found' })
        return
      }

      try {
        const [simulation, modules, progressMap] = await Promise.all([
          getSimulationById(simulationId),
          getModules(),
          getUserProgress(user.uid),
        ])
        if (!isCurrent) return

        const module = simulation
          ? modules.find((candidate) => candidate.id === simulation.moduleId)
          : undefined
        if (!simulation || !module) {
          setState({ status: 'not_found' })
          return
        }

        if (getModuleStatus(module, progressMap, modules) === 'locked') {
          setState({ status: 'locked' })
          return
        }

        setState({ status: 'ready', simulation, module, progress: progressMap[module.id] })
      } catch (caughtError) {
        if (!isCurrent) return
        setState({ status: 'error', message: mapFirestoreError(caughtError) })
      }
    })()

    return () => {
      isCurrent = false
    }
  }, [simulationId, user])

  return state
}
