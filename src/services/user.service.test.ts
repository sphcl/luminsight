import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateDoc } from 'firebase/firestore'
import type * as FirestoreModule from 'firebase/firestore'
import { completeOnboarding } from './user.service'

vi.mock('@/lib/firebase', () => ({ db: {} }))

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof FirestoreModule>()
  return {
    ...actual,
    doc: vi.fn((_db: unknown, _collection: string, id: string) => ({ __type: 'doc', id })),
    updateDoc: vi.fn(),
  }
})

describe('completeOnboarding', () => {
  beforeEach(() => {
    vi.mocked(updateDoc).mockReset()
    vi.mocked(updateDoc).mockResolvedValue()
  })

  it('grava onboardingCompleted e as respostas validadas', async () => {
    const answers = {
      securityKnowledge: 'nenhum',
      scamExperience: 'nao',
      learningGoals: ['golpes_whatsapp'],
    }

    await completeOnboarding('user-1', answers)

    expect(updateDoc).toHaveBeenCalledWith(
      { __type: 'doc', id: 'user-1' },
      { onboardingCompleted: true, onboardingProfile: answers }
    )
  })

  it('não escreve nada quando as respostas são inválidas', async () => {
    await expect(
      completeOnboarding('user-1', {
        securityKnowledge: 'hacker',
        scamExperience: 'nao',
        learningGoals: ['golpes_whatsapp'],
      })
    ).rejects.toThrow()

    expect(updateDoc).not.toHaveBeenCalled()
  })
})
