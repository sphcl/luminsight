import { describe, it, expect } from 'vitest'
import { assignPseudonyms, createPseudonymizer } from './pseudonym'

const KEY = 'a'.repeat(64)

describe('identificador anônimo', () => {
  it('é estável com a mesma chave e tem 12 caracteres hexadecimais', () => {
    const id = createPseudonymizer(KEY)('uid-da-ana')

    expect(id).toMatch(/^[0-9a-f]{12}$/)
    expect(createPseudonymizer(KEY)('uid-da-ana')).toBe(id)
  })

  it('muda com outra chave, então a lista de uids sozinha não liga ninguém', () => {
    expect(createPseudonymizer('b'.repeat(64))('uid-da-ana')).not.toBe(
      createPseudonymizer(KEY)('uid-da-ana')
    )
  })

  it('não carrega pedaço do uid', () => {
    expect(createPseudonymizer(KEY)('uid-da-ana')).not.toContain('ana')
  })

  it('recusa chave curta', () => {
    expect(() => createPseudonymizer('curta')).toThrow(/pelo menos 32/)
  })

  it('para a exportação se dois participantes caírem no mesmo identificador', () => {
    expect(() => assignPseudonyms(['a', 'b'], () => 'igual')).toThrow(/mesmo identificador/)
  })
})
