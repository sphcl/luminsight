import { useCallback, useState } from 'react'
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logout as logoutUser,
} from '@/services/auth.service'
import { mapAuthError } from '@/utils/security/errors'

interface UseAuthActionsReturn {
  login: (email: string, password: string) => Promise<boolean>
  register: (displayName: string, email: string, password: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  logout: () => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function useAuthActions(): UseAuthActionsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Centraliza try/catch/finally: cada ação só precisa descrever o que fazer,
  // o tratamento de erro e loading fica sempre igual pras quatro
  const run = useCallback(async (action: () => Promise<unknown>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await action()
      return true
    } catch (caughtError) {
      setError(mapAuthError(caughtError))
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(
    (email: string, password: string) => run(() => loginWithEmail(email, password)),
    [run]
  )

  const register = useCallback(
    (displayName: string, email: string, password: string) =>
      run(() => registerWithEmail(displayName, email, password)),
    [run]
  )

  const signInWithGoogle = useCallback(() => run(() => loginWithGoogle()), [run])

  const logout = useCallback(() => run(() => logoutUser()), [run])

  return { login, register, signInWithGoogle, logout, isLoading, error }
}
