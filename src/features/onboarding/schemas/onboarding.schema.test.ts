import { describe, it, expect } from 'vitest'
import { onboardingProfileSchema } from './onboarding.schema'

const validProfile = {
  securityKnowledge: 'basico',
  scamExperience: 'quase',
  learningGoals: ['phishing', 'senhas'],
}

describe('onboardingProfileSchema', () => {
  it('aceita respostas dentro das opções', () => {
    expect(onboardingProfileSchema.safeParse(validProfile).success).toBe(true)
  })

  it('rejeita valor fora das opções', () => {
    const result = onboardingProfileSchema.safeParse({
      ...validProfile,
      securityKnowledge: '<script>alert(1)</script>',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita tema de aprendizado fora das opções', () => {
    const result = onboardingProfileSchema.safeParse({
      ...validProfile,
      learningGoals: ['phishing', 'qualquer_coisa'],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita lista de temas vazia', () => {
    const result = onboardingProfileSchema.safeParse({ ...validProfile, learningGoals: [] })
    expect(result.success).toBe(false)
  })

  it('rejeita tema repetido', () => {
    const result = onboardingProfileSchema.safeParse({
      ...validProfile,
      learningGoals: ['phishing', 'phishing'],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita campo extra', () => {
    const result = onboardingProfileSchema.safeParse({ ...validProfile, role: 'admin' })
    expect(result.success).toBe(false)
  })

  it('rejeita resposta faltando', () => {
    const result = onboardingProfileSchema.safeParse({ ...validProfile, scamExperience: null })
    expect(result.success).toBe(false)
  })
})
