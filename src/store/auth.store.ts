import { create } from 'zustand'
import type { AuthUser, UserDocument } from '@/types/user.types'

interface AuthState {
  user: AuthUser | null
  userDocument: UserDocument | null
  // Começa true: enquanto o Firebase não confirma se há sessão ativa,
  // não podemos decidir se mostramos tela de login ou conteúdo autenticado
  isInitializing: boolean
  setUser: (user: AuthUser | null) => void
  setUserDocument: (userDocument: UserDocument | null) => void
  setIsInitializing: (isInitializing: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userDocument: null,
  isInitializing: true,
  setUser: (user) => set({ user }),
  setUserDocument: (userDocument) => set({ userDocument }),
  setIsInitializing: (isInitializing) => set({ isInitializing }),
  reset: () => set({ user: null, userDocument: null }),
}))

// Seletores individuais: cada componente reage só à fatia de estado que usa,
// em vez de re-renderizar sempre que qualquer campo do store muda
export const selectUser = (state: AuthState): AuthUser | null => state.user
export const selectUserDocument = (state: AuthState): UserDocument | null => state.userDocument
export const selectIsInitializing = (state: AuthState): boolean => state.isInitializing
