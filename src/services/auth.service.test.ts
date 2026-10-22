import { describe, it, expect, vi } from 'vitest'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type GoogleAuthProvider,
} from 'firebase/auth'
import { loginWithGoogle, registerWithEmail } from './auth.service'

vi.mock('@/lib/firebase', () => ({ auth: {} }))
vi.mock('firebase/auth', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createUserWithEmailAndPassword: vi.fn(async () => ({ user: { uid: 'u1' } })),
  updateProfile: vi.fn(async () => undefined),
  signInWithPopup: vi.fn(async () => ({ user: { uid: 'u1' } })),
}))

describe('auth.service', () => {
  it('cadastro grava o nome no perfil do Firebase Auth', async () => {
    await registerWithEmail('Ana Souza', 'ana@example.com', 'senha-segura')

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'ana@example.com',
      'senha-segura'
    )
    expect(updateProfile).toHaveBeenCalledWith({ uid: 'u1' }, { displayName: 'Ana Souza' })
  })

  it('login com Google sempre pede pra escolher a conta', async () => {
    await loginWithGoogle()

    const provider = vi.mocked(signInWithPopup).mock.calls[0]?.[1] as GoogleAuthProvider
    expect(provider.getCustomParameters()).toEqual({ prompt: 'select_account' })
  })
})
