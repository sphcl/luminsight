import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from './auth.schemas'

describe('loginSchema', () => {
  it('aceita email e senha válidos', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '1' })
    expect(result.success).toBe(true)
  })

  it('rejeita email vazio', () => {
    const result = loginSchema.safeParse({ email: '', password: 'senha' })
    expect(result.success).toBe(false)
  })

  it('rejeita email com formato inválido', () => {
    const result = loginSchema.safeParse({ email: 'nao-e-email', password: 'senha' })
    expect(result.success).toBe(false)
  })

  it('rejeita senha vazia', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
  })

  it('não exige tamanho mínimo de senha no login (não vaza política de senha)', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'ab' })
    expect(result.success).toBe(true)
  })

  it('rejeita email acima de 254 caracteres', () => {
    const longEmail = `${'a'.repeat(250)}@ab.co`
    const result = loginSchema.safeParse({ email: longEmail, password: 'senha' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const validPayload = {
    displayName: 'Sophia Cardoso',
    email: 'user@example.com',
    password: 'senha1234',
    confirmPassword: 'senha1234',
  }

  it('aceita um cadastro válido', () => {
    const result = registerSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('aceita nomes com acentos e apóstrofo', () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      displayName: "José D'Ávila",
    })
    expect(result.success).toBe(true)
  })

  it('rejeita nome contendo tentativa de XSS', () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      displayName: '<script>alert(1)</script>',
    })

    expect(result.success).toBe(false)
  })

  it('rejeita nome com menos de 2 caracteres', () => {
    const result = registerSchema.safeParse({ ...validPayload, displayName: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      password: '1234567',
      confirmPassword: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com mais de 128 caracteres', () => {
    const longPassword = 'a'.repeat(129)
    const result = registerSchema.safeParse({
      ...validPayload,
      password: longPassword,
      confirmPassword: longPassword,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita quando confirmação de senha não bate, apontando o campo certo', () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      confirmPassword: 'outrasenha',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword'])
    }
  })
})
