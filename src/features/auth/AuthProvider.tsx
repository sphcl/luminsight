import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { ensureUserDocument } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { AuthUser } from '@/types/user.types'

interface AuthProviderProps {
  children: ReactNode
}

function toAuthUser(firebaseUser: User): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser)
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const setIsInitializing = useAuthStore((state) => state.setIsInitializing)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      void (async () => {
        try {
          if (!firebaseUser) {
            setUser(null)
            setUserDocument(null)
            return
          }

          setUser(toAuthUser(firebaseUser))

          const userDocument = await ensureUserDocument({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          })

          setUserDocument(userDocument)
        } finally {
          // Garante que a tela de carregamento inicial sempre termine,
          // mesmo se o Firestore falhar (ex.: sem internet, regra negando acesso)
          setIsInitializing(false)
        }
      })()
    })

    return unsubscribe
  }, [setUser, setUserDocument, setIsInitializing])

  return <>{children}</>
}
