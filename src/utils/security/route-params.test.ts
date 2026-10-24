import { describe, it, expect } from 'vitest'
import { parseRouteId } from './route-params'

describe('parseRouteId', () => {
  it('aceita id no formato do conteúdo', () => {
    expect(parseRouteId('modulo-01')).toBe('modulo-01')
    expect(parseRouteId('licao-03')).toBe('licao-03')
  })

  it('rejeita ausente ou vazio', () => {
    expect(parseRouteId(undefined)).toBeUndefined()
    expect(parseRouteId('')).toBeUndefined()
  })

  it('rejeita tentativa de trocar o path do Firestore', () => {
    expect(parseRouteId('modulo-01/lessons/x')).toBeUndefined()
    expect(parseRouteId('..')).toBeUndefined()
  })

  it('rejeita markup e caracteres fora do formato', () => {
    expect(parseRouteId('<script>')).toBeUndefined()
    expect(parseRouteId('Modulo-01')).toBeUndefined()
    expect(parseRouteId('modulo 01')).toBeUndefined()
  })

  it('rejeita id gigante', () => {
    expect(parseRouteId('a'.repeat(65))).toBeUndefined()
  })
})
