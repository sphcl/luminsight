import { describe, it, expect } from 'vitest'
import { onboardingProfileSchema } from './onboarding.schema'

const validProfile = {
  securityKnowledge: 'iniciante',
  scamExperience: 'prefiro_nao_responder',
  motivation: 'proteger_familia',
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

  it('rejeita texto livre na resposta sobre golpe', () => {
    const result = onboardingProfileSchema.safeParse({
      ...validProfile,
      scamExperience: 'caí no golpe do pix semana passada',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita motivação fora das opções', () => {
    const result = onboardingProfileSchema.safeParse({ ...validProfile, motivation: 'outro' })
    expect(result.success).toBe(false)
  })

  it('rejeita valor antigo que saiu das opções', () => {
    const result = onboardingProfileSchema.safeParse({ ...validProfile, scamExperience: 'quase' })
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
