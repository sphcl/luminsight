import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as firestore from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import type * as FirestoreModule from 'firebase/firestore'
import { markLessonCompleted, saveQuizAttempt } from './progress.service'

vi.mock('@/lib/firebase', () => ({ db: {} }))

// Mantém as exportações reais (Timestamp precisa continuar sendo a classe de
// verdade, já que parseProgress faz `instanceof Timestamp`) e substitui só as
// funções que os testes precisam observar/controlar.
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof FirestoreModule>()
  return {
    ...actual,
    collection: vi.fn(() => ({ __type: 'collection' })),
    doc: vi.fn((_collectionRef: unknown, id: string) => ({ __type: 'doc', id })),
    runTransaction: vi.fn(),
    arrayUnion: vi.fn((...values: unknown[]) => ({ __op: 'arrayUnion', values })),
    increment: vi.fn((n: number) => ({ __op: 'increment', n })),
    serverTimestamp: vi.fn(() => ({ __op: 'serverTimestamp' })),
  }
})

interface FakeTransaction {
  get: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

function mockTransaction(snapshot: { exists: boolean; data?: () => unknown }): FakeTransaction {
  return {
    get: vi.fn().mockResolvedValue({
      exists: () => snapshot.exists,
      data: snapshot.data ?? (() => undefined),
    }),
    set: vi.fn(),
    update: vi.fn(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('markLessonCompleted', () => {
  it('cria o documento com defaults e a lição já em lessonsCompleted quando ele não existe', async () => {
    const tx = mockTransaction({ exists: false })
    vi.mocked(firestore.runTransaction).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (async (_db: unknown, updateFn: (t: unknown) => Promise<void>) => updateFn(tx)) as any
    )

    await markLessonCompleted('uid-1', 'modulo-01', 'licao-01')

    expect(tx.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        lessonsCompleted: ['licao-01'],
        quizAttempts: 0,
        simulationCompleted: false,
        startedAt: { __op: 'serverTimestamp' },
        lastUpdatedAt: { __op: 'serverTimestamp' },
      })
    )
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('usa arrayUnion (nunca lê o array e reescreve na mão) quando o documento já existe', async () => {
    const tx = mockTransaction({ exists: true, data: () => ({}) })
    vi.mocked(firestore.runTransaction).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (async (_db: unknown, updateFn: (t: unknown) => Promise<void>) => updateFn(tx)) as any
    )

    await markLessonCompleted('uid-1', 'modulo-01', 'licao-02')

    expect(firestore.arrayUnion).toHaveBeenCalledWith('licao-02')
    expect(tx.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        lessonsCompleted: { __op: 'arrayUnion', values: ['licao-02'] },
        lastUpdatedAt: { __op: 'serverTimestamp' },
      })
    )
    expect(tx.set).not.toHaveBeenCalled()
  })
})

describe('saveQuizAttempt', () => {
  it('usa increment() para quizAttempts em vez de ler e somar manualmente', async () => {
    const tx = mockTransaction({
      exists: true,
      data: () => ({
        startedAt: Timestamp.now(),
        completedAt: null,
        lessonsCompleted: [],
        quizBestScore: 50,
        quizAttempts: 1,
        simulationCompleted: false,
        lastUpdatedAt: Timestamp.now(),
      }),
    })
    vi.mocked(firestore.runTransaction).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (async (_db: unknown, updateFn: (t: unknown) => Promise<void>) => updateFn(tx)) as any
    )

    await saveQuizAttempt('uid-1', 'modulo-01', 80)

    expect(firestore.increment).toHaveBeenCalledWith(1)
    expect(tx.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        quizAttempts: { __op: 'increment', n: 1 },
        quizBestScore: 80,
      })
    )
  })

  it('não sobrescreve quizBestScore quando a nova tentativa tem nota pior', async () => {
    const tx = mockTransaction({
      exists: true,
      data: () => ({
        startedAt: Timestamp.now(),
        completedAt: null,
        lessonsCompleted: [],
        quizBestScore: 90,
        quizAttempts: 2,
        simulationCompleted: false,
        lastUpdatedAt: Timestamp.now(),
      }),
    })
    vi.mocked(firestore.runTransaction).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (async (_db: unknown, updateFn: (t: unknown) => Promise<void>) => updateFn(tx)) as any
    )

    await saveQuizAttempt('uid-1', 'modulo-01', 40)

    expect(tx.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ quizBestScore: 90 })
    )
  })
})
