import { useAuthStore } from '@/store/auth.store'
import type { AuthUser, UserDocument } from '@/types/user.types'

interface UseAuthReturn {
  user: AuthUser | null
  userDocument: UserDocument | null
  isInitializing: boolean
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((state) => state.user)
  const userDocument = useAuthStore((state) => state.userDocument)
  const isInitializing = useAuthStore((state) => state.isInitializing)

  return {
    user,
    userDocument,
    isInitializing,
    isAuthenticated: user !== null,
    hasCompletedOnboarding: userDocument?.onboardingCompleted ?? false,
  }
}
