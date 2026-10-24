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

  // Cada payload aqui já foi uma forma conhecida de open redirect; se algum passar, a proteção regrediu.
  it.each([
    ['https://evil.com'],
    ['http://evil.com'],
    ['//evil.com'],
    ['///evil.com'],
    ['/\\evil.com'],
    ['\\\\evil.com'],
    ['/\t/evil.com'],
    ['/\n/evil.com'],
    ['/\r/evil.com'],
    ['/\u0000/evil.com'],
    [' //evil.com'],
    ['javascript:alert(1)'],
    ['JAVASCRIPT:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['/redirect/https://evil.com'],
  ])('rejeita %j', (payload) => {
    expect(getSafeRedirectPath(payload)).toBeNull()
  })

  it.each([['/%2F%2Fevil.com'], ['/javascript:alert(1)'], ['/trilha?x=//evil.com']])(
    'aceita %j porque o navegador trata como caminho do próprio site',
    (path) => {
      const safe = getSafeRedirectPath(path)
      expect(safe).toBe(path)
      expect(new URL(safe!, 'https://app.example').origin).toBe('https://app.example')
    }
  )
})
