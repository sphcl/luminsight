import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render } from '@testing-library/react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { AuthProvider } from './AuthProvider'
import { ensureUserDocument } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/lib/firebase', () => ({ auth: {} }))
vi.mock('firebase/auth', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  onAuthStateChanged: vi.fn(),
}))
vi.mock('@/services/user.service', () => ({ ensureUserDocument: vi.fn() }))

type Listener = (user: User | null) => void

function captureListener(): () => Listener {
  let listener: Listener | null = null
  vi.mocked(onAuthStateChanged).mockImplementation((_auth, next) => {
    listener = next as Listener
    return () => undefined
  })
  return () => {
    if (!listener) throw new Error('AuthProvider não se inscreveu no onAuthStateChanged')
    return listener
  }
}

const firebaseUser = {
  uid: 'u1',
  email: 'ana@example.com',
  displayName: 'Ana',
  photoURL: null,
  emailVerified: true,
} as User

const userDocument = { displayName: 'Ana', onboardingCompleted: true } as UserDocument

describe('AuthProvider', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, userDocument: null, isInitializing: true })
    vi.mocked(ensureUserDocument).mockReset()
  })

  it('sem sessão termina a inicialização sem usuário', async () => {
    const listener = captureListener()
    render(<AuthProvider>conteúdo</AuthProvider>)

    await act(async () => listener()(null))

    expect(useAuthStore.getState()).toMatchObject({ user: null, isInitializing: false })
    expect(ensureUserDocument).not.toHaveBeenCalled()
  })

  // Regressão: se a sessão parecer pronta antes do documento chegar, o guard manda pro onboarding.
  it('só termina a inicialização depois que o documento do usuário chega', async () => {
    let resolveDocument: (document: UserDocument) => void = () => undefined
    vi.mocked(ensureUserDocument).mockReturnValue(
      new Promise((resolve) => {
        resolveDocument = resolve
      })
    )
    useAuthStore.setState({ isInitializing: false })
    const listener = captureListener()
    render(<AuthProvider>conteúdo</AuthProvider>)

    await act(async () => listener()(firebaseUser))
    expect(useAuthStore.getState().isInitializing).toBe(true)
    expect(useAuthStore.getState().user?.uid).toBe('u1')

    await act(async () => resolveDocument(userDocument))
    expect(useAuthStore.getState()).toMatchObject({ isInitializing: false, userDocument })
    expect(ensureUserDocument).toHaveBeenCalledWith({
      uid: 'u1',
      displayName: 'Ana',
      email: 'ana@example.com',
      photoURL: null,
    })
  })

  it('termina a inicialização mesmo se o Firestore falhar, sem promise solta', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(ensureUserDocument).mockRejectedValue(new Error('offline'))
    const listener = captureListener()
    render(<AuthProvider>conteúdo</AuthProvider>)

    await act(async () => {
      listener()(firebaseUser)
      await Promise.resolve()
    })

    expect(useAuthStore.getState()).toMatchObject({ isInitializing: false, userDocument: null })
    expect(console.error).toHaveBeenCalledWith('[firestore]', expect.any(Error))
  })
})
