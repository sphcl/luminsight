import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateDoc } from 'firebase/firestore'
import type * as FirestoreModule from 'firebase/firestore'
import { completeOnboarding, updateDisplayName } from './user.service'

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
        motivation: 'curiosidade',
      })
    ).rejects.toThrow()

    expect(updateDoc).not.toHaveBeenCalled()
  })

  it('não escreve nada quando falta resposta', async () => {
    await expect(
      completeOnboarding('user-1', { securityKnowledge: 'iniciante', scamExperience: 'nao' })
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
