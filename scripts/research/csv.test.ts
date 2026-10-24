import { describe, it, expect } from 'vitest'
import { sanitizeText, toCsv } from './csv'

describe('proteção contra fórmula de planilha', () => {
  it.each(['=HIPERLINK("x")', '+1', '-2', '@SOMA(A1)', '\tx', '\rx'])('neutraliza %j', (value) => {
    expect(sanitizeText(value)).toBe(`'${value}`)
  })

  it('não mexe em texto comum', () => {
    expect(sanitizeText('Gostei muito')).toBe('Gostei muito')
  })

  it('comentário começando com sinal de igual chega neutralizado no CSV', () => {
    const csv = toCsv(['comentario'], [['=1+1']], { separator: ';', bom: false })
    expect(csv).toBe("comentario\r\n'=1+1\r\n")
  })
})

describe('toCsv', () => {
  it('escapa separador, aspas e quebra de linha, e escreve sim/nao e vazio', () => {
    const csv = toCsv(['a', 'b', 'c', 'd'], [['x;y', 'diz "oi"', true, null]], {
      separator: ';',
      bom: false,
    })
    expect(csv).toBe('a;b;c;d\r\n"x;y";"diz ""oi""";sim;\r\n')
  })

  it('BOM e separador configuráveis', () => {
    expect(toCsv(['a'], [[1]], { separator: ',', bom: true })).toBe('﻿a\r\n1\r\n')
    expect(toCsv(['a', 'b'], [[1, 2]], { separator: ',', bom: false })).toBe('a,b\r\n1,2\r\n')
  })
})
