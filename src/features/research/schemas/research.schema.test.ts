import { describe, it, expect } from 'vitest'
import { trailFeedbackSchema } from './research.schema'

const valid = {
  securityKnowledge: 'intermediario',
  riskPerception: 'baixa',
  satisfaction: 'gostei',
  mostUseful: ['licoes', 'quizzes'],
}

describe('trailFeedbackSchema', () => {
  it('comentário vazio ou só com espaço vira ausência', () => {
    expect(trailFeedbackSchema.parse({ ...valid, comment: '   ' }).comment).toBeUndefined()
    expect(trailFeedbackSchema.parse({ ...valid, comment: '  Bom  ' }).comment).toBe('Bom')
  })

  it.each([
    ['comentário acima de 500 caracteres', { comment: 'a'.repeat(501) }],
    ['"nada em especial" junto com outra', { mostUseful: ['nada', 'licoes'] }],
    ['opção repetida', { mostUseful: ['licoes', 'licoes'] }],
    ['nenhuma opção de mais útil', { mostUseful: [] }],
    ['percepção de risco no meio', { riskPerception: 'media' }],
    ['campo extra', { idade: 30 }],
  ])('recusa %s', (_, override) => {
    expect(trailFeedbackSchema.safeParse({ ...valid, ...override }).success).toBe(false)
  })
})
