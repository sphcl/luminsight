import { describe, it, expect } from 'vitest'
import { FirebaseError } from 'firebase/app'
import { z } from 'zod'
import { describeFailure } from './reportResearchFailure'

describe('describeFailure', () => {
  it('recusa do banco leva o código do Firebase', () => {
    expect(describeFailure(new FirebaseError('permission-denied', 'x'))).toEqual({
      tipo: 'recusa_do_banco',
      codigo: 'permission-denied',
    })
  })

  it('erro de validação leva caminho e código, nunca o valor digitado', () => {
    const result = z
      .object({ comment: z.string().max(3) })
      .safeParse({ comment: 'segredo pessoal' })
    const details = describeFailure(result.error)

    expect(details).toEqual({ tipo: 'validacao', codigo: 'comment:too_big' })
    expect(JSON.stringify(details)).not.toContain('segredo')
  })

  it('qualquer outra coisa vira desconhecido, sem a mensagem', () => {
    expect(describeFailure(new TypeError('dado da pessoa'))).toEqual({
      tipo: 'desconhecido',
      codigo: 'TypeError',
    })
  })
})
