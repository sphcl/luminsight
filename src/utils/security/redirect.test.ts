import { describe, it, expect } from 'vitest'
import { getSafeRedirectPath } from './redirect'

describe('getSafeRedirectPath', () => {
  it('aceita um caminho interno válido', () => {
    expect(getSafeRedirectPath('/dashboard')).toBe('/dashboard')
  })

  it('aceita um caminho interno com query string e hash', () => {
    expect(getSafeRedirectPath('/modulos/1?tab=quiz#top')).toBe('/modulos/1?tab=quiz#top')
  })

  it('rejeita URL protocol-relative ("//evil.com")', () => {
    expect(getSafeRedirectPath('//evil.com')).toBeNull()
  })

  it('rejeita URL absoluta ("https://evil.com")', () => {
    expect(getSafeRedirectPath('https://evil.com')).toBeNull()
  })

  it('rejeita esquema javascript: (XSS)', () => {
    expect(getSafeRedirectPath('javascript:alert(1)')).toBeNull()
  })

  it('rejeita o truque de barra invertida ("/\\evil.com")', () => {
    expect(getSafeRedirectPath('/\\evil.com')).toBeNull()
  })

  it('rejeita "esquema://" embutido no meio do caminho', () => {
    expect(getSafeRedirectPath('/redirect-para/https://evil.com')).toBeNull()
  })

  it('rejeita caminho relativo sem barra inicial', () => {
    expect(getSafeRedirectPath('dashboard')).toBeNull()
  })

  it('rejeita valor vazio ou nulo', () => {
    expect(getSafeRedirectPath('')).toBeNull()
    expect(getSafeRedirectPath(null)).toBeNull()
  })
})
