import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserProgress } from '@/services/progress.service'
import { mapFirestoreError } from '@/utils/security/errors'
import type { ProgressMap } from '@/types/progress.types'

interface UseProgressReturn {
  data: ProgressMap | null
  isLoading: boolean
  error: string | null
}

export function useProgress(): UseProgressReturn {
  const { user } = useAuth()
  const [data, setData] = useState<ProgressMap | null>(null)
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

        const progressMap = await getUserProgress(user.uid)
        if (isCurrent) setData(progressMap)
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
