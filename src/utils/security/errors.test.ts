import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FirebaseError } from 'firebase/app'
import { mapAuthError } from './errors'

describe('mapAuthError', () => {
  beforeEach(() => {
    // console.error roda em DEV (modo de teste do Vite conta como DEV);
    // silenciamos aqui pra não poluir a saída do test runner
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna a mesma mensagem para usuário inexistente e senha errada', () => {
    const userNotFound = mapAuthError(new FirebaseError('auth/user-not-found', 'x'))
    const wrongPassword = mapAuthError(new FirebaseError('auth/wrong-password', 'x'))

    expect(userNotFound).toBe(wrongPassword)
    expect(userNotFound).toBe('Email ou senha incorretos.')
  })

  it('retorna a mesma mensagem genérica para todos os códigos de credencial inválida', () => {
    const codes = [
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/invalid-credential',
      'auth/invalid-login-credentials',
      'auth/user-disabled',
    ]

    const messages = codes.map((code) => mapAuthError(new FirebaseError(code, 'x')))

    expect(new Set(messages).size).toBe(1)
    expect(messages[0]).toBe('Email ou senha incorretos.')
  })

  it('não vaza o código de erro interno do Firebase na mensagem', () => {
    const message = mapAuthError(new FirebaseError('auth/wrong-password', 'x'))
    expect(message).not.toContain('auth/')
  })

  it('retorna mensagem específica para email já cadastrado', () => {
    const message = mapAuthError(new FirebaseError('auth/email-already-in-use', 'x'))
    expect(message).toBe('Este email já está cadastrado.')
  })

  it('retorna mensagem genérica para código desconhecido', () => {
    const message = mapAuthError(new FirebaseError('auth/algum-codigo-novo', 'x'))
    expect(message).toBe('Não foi possível concluir a ação. Tente novamente.')
  })

  it('retorna mensagem genérica para erro que não é do Firebase', () => {
    const message = mapAuthError(new Error('falha qualquer'))
    expect(message).toBe('Não foi possível concluir a ação. Tente novamente.')
  })
})
