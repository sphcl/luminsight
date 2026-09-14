import { useEffect, useState } from 'react'
import { getLessons, getModuleById } from '@/services/modules.service'
import { mapFirestoreError } from '@/utils/security/errors'
import type { LessonWithId, ModuleWithId } from '@/types/module.types'

interface ModuleWithLessons {
  module: ModuleWithId
  lessons: LessonWithId[]
}

interface UseModuleReturn {
  data: ModuleWithLessons | null
  isLoading: boolean
  error: string | null
}

export function useModule(moduleId: string | undefined): UseModuleReturn {
  const [data, setData] = useState<ModuleWithLessons | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    void (async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!moduleId) {
          if (isCurrent) setData(null)
          return
        }

        const [module, lessons] = await Promise.all([
          getModuleById(moduleId),
          getLessons(moduleId),
        ])
        if (!isCurrent) return

        setData(module ? { module, lessons } : null)
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
  }, [moduleId])

  return { data, isLoading, error }
}
