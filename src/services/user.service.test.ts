import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serverTimestamp, updateDoc } from 'firebase/firestore'
import type * as FirestoreModule from 'firebase/firestore'
import {
  changeResearchConsent,
  completeOnboarding,
  recordLateConsent,
  updateDisplayName,
} from './user.service'

vi.mock('@/lib/firebase', () => ({ db: {} }))

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof FirestoreModule>()
  return {
    ...actual,
    doc: vi.fn((_db: unknown, _collection: string, id: string) => ({ __type: 'doc', id })),
    updateDoc: vi.fn(),
  }
})

beforeEach(() => {
  vi.mocked(updateDoc).mockReset()
  vi.mocked(updateDoc).mockResolvedValue()
})

describe('completeOnboarding', () => {
  it('grava onboardingCompleted e as respostas validadas', async () => {
    const answers = {
      securityKnowledge: 'iniciante',
      scamExperience: 'sim',
      motivation: 'aprender_basico',
    }

    await completeOnboarding('user-1', answers, { accepted: false, isAdult: false })

    expect(updateDoc).toHaveBeenCalledWith(
      { __type: 'doc', id: 'user-1' },
      {
        onboardingCompleted: true,
        onboardingProfile: answers,
        researchConsent: {
          accepted: false,
          isAdult: false,
          decidedAt: serverTimestamp(),
          version: 'onboarding-v2',
        },
      }
    )
  })

  it('quem aceitou leva a percepção de risco marcada como coletada antes de usar', async () => {
    await completeOnboarding(
      'user-1',
      { securityKnowledge: 'iniciante', scamExperience: 'sim', motivation: 'aprender_basico' },
      { accepted: true, isAdult: true, riskPerception: 'baixa' }
    )

    expect(vi.mocked(updateDoc).mock.calls[0]?.[1]).toMatchObject({
      researchConsent: { accepted: true, isAdult: true, version: 'onboarding-v2' },
      riskBaseline: { riskPerception: 'baixa', collectedAfterUse: false },
    })
  })

  it.each([
    [
      'aceite sem a declaração de 18 anos',
      { accepted: true, isAdult: false, riskPerception: 'baixa' },
    ],
    ['percepção de risco sem aceite', { accepted: false, isAdult: true, riskPerception: 'baixa' }],
    ['aceite sem percepção de risco', { accepted: true, isAdult: true }],
    ['escala com meio', { accepted: true, isAdult: true, riskPerception: 'media' }],
  ])('não escreve nada com %s', async (_, decision) => {
    await expect(
      completeOnboarding(
        'user-1',
        { securityKnowledge: 'iniciante', scamExperience: 'sim', motivation: 'aprender_basico' },
        decision
      )
    ).rejects.toThrow()

    expect(updateDoc).not.toHaveBeenCalled()
  })

  it('não escreve nada quando as respostas são inválidas', async () => {
    await expect(
      completeOnboarding(
        'user-1',
        { securityKnowledge: 'hacker', scamExperience: 'nao', motivation: 'curiosidade' },
        { accepted: false, isAdult: false }
      )
    ).rejects.toThrow()

    expect(updateDoc).not.toHaveBeenCalled()
  })

  it('não escreve nada quando falta resposta', async () => {
    await expect(
      completeOnboarding(
        'user-1',
        { securityKnowledge: 'iniciante', scamExperience: 'nao' },
        { accepted: false, isAdult: false }
      )
    ).rejects.toThrow()

    expect(updateDoc).not.toHaveBeenCalled()
  })
})

describe('recordLateConsent', () => {
  it('conta antiga grava a versão retroativa e o antes marcado como coletado depois de usar', async () => {
    await recordLateConsent('user-1', { accepted: true, isAdult: true, riskPerception: 'alta' })

    expect(updateDoc).toHaveBeenCalledWith(
      { __type: 'doc', id: 'user-1' },
      {
        researchConsent: {
          accepted: true,
          isAdult: true,
          decidedAt: serverTimestamp(),
          version: 'retroativo-v2',
        },
        riskBaseline: { riskPerception: 'alta', collectedAfterUse: true },
      }
    )
  })

  it('quem recusa não grava percepção de risco', async () => {
    await recordLateConsent('user-1', { accepted: false, isAdult: false })

    expect(vi.mocked(updateDoc).mock.calls[0]?.[1]).not.toHaveProperty('riskBaseline')
  })
})

describe('changeResearchConsent', () => {
  it('revogar grava só o consentimento, sem apagar nada', async () => {
    await changeResearchConsent('user-1', { accepted: false, isAdult: true })

    expect(updateDoc).toHaveBeenCalledWith(
      { __type: 'doc', id: 'user-1' },
      {
        researchConsent: {
          accepted: false,
          isAdult: true,
          decidedAt: serverTimestamp(),
          version: 'retroativo-v2',
        },
      }
    )
  })

  it('não aceita entrar sem a declaração de 18 anos', async () => {
    await expect(
      changeResearchConsent('user-1', { accepted: true, isAdult: false })
    ).rejects.toThrow()
    expect(updateDoc).not.toHaveBeenCalled()
  })
})

describe('updateDisplayName', () => {
  it('grava só o displayName, já sem espaço sobrando', async () => {
    await expect(updateDisplayName('user-1', { displayName: '  Ana Maria  ' })).resolves.toBe(
      'Ana Maria'
    )

    expect(updateDoc).toHaveBeenCalledWith(
      { __type: 'doc', id: 'user-1' },
      { displayName: 'Ana Maria' }
    )
  })

  it('não escreve nada quando vem campo além do nome', async () => {
    await expect(
      updateDisplayName('user-1', { displayName: 'Ana', role: 'admin' })
    ).rejects.toThrow()

    expect(updateDoc).not.toHaveBeenCalled()
  })

  it('não escreve nada quando o nome é inválido', async () => {
    await expect(updateDisplayName('user-1', { displayName: '<b>Ana</b>' })).rejects.toThrow()
    await expect(updateDisplayName('user-1', { displayName: 'A' })).rejects.toThrow()

    expect(updateDoc).not.toHaveBeenCalled()
  })
})
