import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getLessons, getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { calculateModuleProgress, getModuleStatus } from '@/features/modules/engine/trail'
import { mapFirestoreError } from '@/utils/security/errors'
import type { LessonWithId, ModuleWithId } from '@/types/module.types'
import type { ModuleStatus } from '@/types/progress.types'

export interface ModuleAccessData {
  module: ModuleWithId
  lessons: LessonWithId[]
  moduleStatus: Exclude<ModuleStatus, 'locked'>
  progressPercent: number
  completedLessonIds: string[]
}

export type ModuleAccessState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not_found' }
  | { status: 'locked' }
  | ({ status: 'ready' } & ModuleAccessData)

interface UseModuleAccessReturn {
  state: ModuleAccessState
  addCompletedLesson: (lessonId: string) => void
}

// Recalculo o status com a lista inteira e o progresso do usuário porque a URL pode ter sido digitada direto.
export function useModuleAccess(moduleId: string | undefined): UseModuleAccessReturn {
  const { user } = useAuth()
  const [state, setState] = useState<ModuleAccessState>({ status: 'loading' })

  useEffect(() => {
    let isCurrent = true

    void (async () => {
      setState({ status: 'loading' })
      if (!user) return

      if (!moduleId) {
        setState({ status: 'not_found' })
        return
      }

      try {
        const [modules, progressMap, lessons] = await Promise.all([
          getModules(),
          getUserProgress(user.uid),
          getLessons(moduleId),
        ])
        if (!isCurrent) return

        // Busco na lista de getModules e não por id pra um módulo inativo em produção não abrir pela URL.
        const module = modules.find((candidate) => candidate.id === moduleId)
        if (!module) {
          setState({ status: 'not_found' })
          return
        }

        const moduleStatus = getModuleStatus(module, progressMap, modules)
        if (moduleStatus === 'locked') {
          setState({ status: 'locked' })
          return
        }

        const progress = progressMap[module.id]
        setState({
          status: 'ready',
          module,
          lessons,
          moduleStatus,
          progressPercent: calculateModuleProgress(module, progress),
          completedLessonIds: progress?.lessonsCompleted ?? [],
        })
      } catch (caughtError) {
        if (!isCurrent) return
        setState({ status: 'error', message: mapFirestoreError(caughtError) })
      }
    })()

    return () => {
      isCurrent = false
    }
  }, [moduleId, user])

  const addCompletedLesson = useCallback((lessonId: string) => {
    setState((current) => {
      if (current.status !== 'ready' || current.completedLessonIds.includes(lessonId)) {
        return current
      }
      return { ...current, completedLessonIds: [...current.completedLessonIds, lessonId] }
    })
  }, [])

  return { state, addCompletedLesson }
}
