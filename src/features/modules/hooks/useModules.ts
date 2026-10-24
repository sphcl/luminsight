import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { calculateModuleProgress, getModuleStatus } from '@/features/modules/engine/trail'
import { mapFirestoreError } from '@/utils/security/errors'
import type { ModuleWithId } from '@/types/module.types'
import type { ModuleStatus } from '@/types/progress.types'

export interface ModuleWithStatus extends ModuleWithId {
  status: ModuleStatus
  progressPercent: number
}

interface UseModulesReturn {
  data: ModuleWithStatus[] | null
  isLoading: boolean
  error: string | null
}

// Lista os módulos ativos já com status ('locked' | 'available' | ...) e
// percentual calculados pela engine pura de trail.ts, cruzando com o
// progresso do usuário autenticado.
export function useModules(): UseModulesReturn {
  const { user } = useAuth()
  const [data, setData] = useState<ModuleWithStatus[] | null>(null)
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

        const [modules, progressMap] = await Promise.all([getModules(), getUserProgress(user.uid)])
        if (!isCurrent) return

        const modulesWithStatus = modules.map((module) => ({
          ...module,
          status: getModuleStatus(module, progressMap, modules),
          progressPercent: calculateModuleProgress(module, progressMap[module.id]),
        }))

        setData(modulesWithStatus)
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
