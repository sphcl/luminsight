import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { mapFirestoreError } from '@/utils/security/errors'

export interface QuizHistoryEntry {
  moduleId: string
  moduleTitle: string
  moduleOrder: number
  bestScore: number | null
  attempts: number
}

interface UseQuizHistoryReturn {
  data: QuizHistoryEntry[] | null
  isLoading: boolean
  error: string | null
}

// Uso o progresso e não quizResults porque ele já guarda melhor nota e tentativas por módulo.
export function useQuizHistory(): UseQuizHistoryReturn {
  const { user } = useAuth()
  const [data, setData] = useState<QuizHistoryEntry[] | null>(null)
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

        const history = modules.flatMap((module) => {
          const progress = progressMap[module.id]
          if (!progress || progress.quizAttempts === 0) return []

          return [
            {
              moduleId: module.id,
              moduleTitle: module.title,
              moduleOrder: module.order,
              bestScore: progress.quizBestScore,
              attempts: progress.quizAttempts,
            },
          ]
        })

        setData(history)
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
