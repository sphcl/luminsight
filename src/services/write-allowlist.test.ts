import { describe, it, expect, vi, beforeEach } from 'vitest'
import type * as FirestoreModule from 'firebase/firestore'
import {
  createUserDocument,
  ensureUserDocument,
  completeOnboarding,
  updateDisplayName,
} from './user.service'
import {
  markLessonCompleted,
  markModuleCompleted,
  markSimulationCompleted,
  saveQuizAttempt,
} from './progress.service'
import { saveQuizResult } from './quiz.service'
import { summarizeResult } from '@/features/quiz/engine/scoring'
import { buildQuestions } from '@/test/fixtures/quiz'
// Leio as listas direto das rules: se alguém mudar um lado e esquecer o outro, o teste quebra.
import RULES from '../../firestore.rules?raw'

interface Write {
  kind: 'set' | 'update' | 'add'
  path: string
  data: Record<string, unknown>
}

const writes: Write[] = []
let documentExists = false

vi.mock('@/lib/firebase', () => ({ db: {} }))

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof FirestoreModule>()
  const ref = (...segments: unknown[]) => ({
    path: segments.filter((segment) => typeof segment === 'string').join('/'),
  })
  const pathOf = (target: unknown) => (target as { path: string }).path
  const snapshot = () => ({
    exists: () => documentExists,
    data: () => ({
      startedAt: actual.Timestamp.now(),
      completedAt: null,
      lessonsCompleted: [],
      quizBestScore: 50,
      quizAttempts: 1,
      simulationCompleted: false,
      lastUpdatedAt: actual.Timestamp.now(),
    }),
  })

  return {
    ...actual,
    doc: vi.fn((parent: unknown, ...segments: unknown[]) =>
      typeof parent === 'object' && parent && 'path' in parent
        ? ref(pathOf(parent), ...segments)
        : ref(...segments)
    ),
    collection: vi.fn((_db: unknown, ...segments: unknown[]) => ref(...segments)),
    getDoc: vi.fn(async () => snapshot()),
    setDoc: vi.fn(async (target: unknown, data: Record<string, unknown>) => {
      writes.push({ kind: 'set', path: pathOf(target), data })
    }),
    updateDoc: vi.fn(async (target: unknown, data: Record<string, unknown>) => {
      writes.push({ kind: 'update', path: pathOf(target), data })
    }),
    addDoc: vi.fn(async (target: unknown, data: Record<string, unknown>) => {
      writes.push({ kind: 'add', path: pathOf(target), data })
    }),
    runTransaction: vi.fn(async (_db: unknown, run: (transaction: unknown) => Promise<void>) =>
      run({
        get: async () => snapshot(),
        set: (target: unknown, data: Record<string, unknown>) =>
          writes.push({ kind: 'set', path: pathOf(target), data }),
        update: (target: unknown, data: Record<string, unknown>) =>
          writes.push({ kind: 'update', path: pathOf(target), data }),
      })
    ),
  }
})

function functionBody(name: string): string {
  const start = RULES.indexOf(`function ${name}(`)
  if (start === -1) throw new Error(`função ${name} não existe no firestore.rules`)
  const end = RULES.indexOf('\n    }\n', start)
  return RULES.slice(start, end)
}

function firstList(body: string, marker: string): string[] {
  const start = body.indexOf(marker)
  if (start === -1) throw new Error(`não achei ${marker}`)
  const list = body.slice(start, body.indexOf(']', start))
  return [...list.matchAll(/'([^']+)'/g)].map((match) => match[1]!).sort()
}

const allowed = {
  userCreate: firstList(functionBody('isValidUserCreate'), 'hasOnly(['),
  loginUpdate: firstList(functionBody('isLoginUpdate'), 'hasOnly(['),
  onboarding: firstList(functionBody('isOnboardingCompletion'), 'hasOnly(['),
  displayName: firstList(functionBody('isDisplayNameUpdate'), 'hasOnly(['),
  progress: firstList(functionBody('progressKeys'), 'return ['),
  quizResult: firstList(functionBody('isValidQuizResult'), 'hasOnly(['),
}

function keysOf(write: Write | undefined): string[] {
  if (!write) throw new Error('nenhuma escrita registrada')
  return Object.keys(write.data).sort()
}

beforeEach(() => {
  writes.length = 0
  documentExists = false
})

describe('escritas do cliente batem com o que as rules aceitam', () => {
  it('as listas foram encontradas nas rules', () => {
    expect(allowed.userCreate).toContain('role')
    expect(allowed.displayName).toEqual(['displayName'])
    expect(allowed.progress).toContain('quizBestScore')
    expect(allowed.quizResult).toContain('score')
  })

  it('criação do usuário grava exatamente os campos da regra de create', async () => {
    await createUserDocument({
      uid: 'u1',
      displayName: 'Ana',
      email: 'a@b.example',
      photoURL: null,
    })

    expect(keysOf(writes[0])).toEqual(allowed.userCreate)
    expect(writes[0]?.data.role).toBe('user')
  })

  it('login de quem já tem documento só mexe em lastLoginAt', async () => {
    documentExists = true

    await ensureUserDocument({
      uid: 'u1',
      displayName: 'Ana',
      email: 'a@b.example',
      photoURL: null,
    })

    expect(writes).toHaveLength(1)
    expect(keysOf(writes[0])).toEqual(allowed.loginUpdate)
  })

  it('primeiro login cria o documento com os campos da regra de create', async () => {
    documentExists = false

    await ensureUserDocument({ uid: 'u1', displayName: null, email: null, photoURL: null })

    expect(writes[0]?.kind).toBe('set')
    expect(keysOf(writes[0])).toEqual(allowed.userCreate)
  })

  it('onboarding só envia os campos do onboarding', async () => {
    await completeOnboarding('u1', {
      securityKnowledge: 'iniciante',
      scamExperience: 'nao',
      motivation: 'curiosidade',
    })

    expect(keysOf(writes[0])).toEqual(allowed.onboarding)
  })

  it('edição de nome só envia displayName', async () => {
    await updateDisplayName('u1', { displayName: 'Ana Souza' })

    expect(keysOf(writes[0])).toEqual(allowed.displayName)
  })

  it.each([
    ['markLessonCompleted', () => markLessonCompleted('u1', 'modulo-01', 'licao-01')],
    ['saveQuizAttempt', () => saveQuizAttempt('u1', 'modulo-01', 80)],
    ['markSimulationCompleted', () => markSimulationCompleted('u1', 'modulo-01')],
  ])('%s cria progresso com exatamente os campos das rules', async (_, run) => {
    documentExists = false

    await run()

    expect(writes[0]?.kind).toBe('set')
    expect(writes[0]?.path).toBe('users/u1/progress/modulo-01')
    expect(keysOf(writes[0])).toEqual(allowed.progress)
  })

  it.each([
    ['markLessonCompleted', () => markLessonCompleted('u1', 'modulo-01', 'licao-01')],
    ['saveQuizAttempt', () => saveQuizAttempt('u1', 'modulo-01', 80)],
    ['markSimulationCompleted', () => markSimulationCompleted('u1', 'modulo-01')],
    ['markModuleCompleted', () => markModuleCompleted('u1', 'modulo-01')],
  ])('%s atualiza progresso só com campos das rules', async (_, run) => {
    documentExists = true

    await run()

    expect(writes[0]?.kind).toBe('update')
    for (const key of keysOf(writes[0])) expect(allowed.progress).toContain(key)
  })

  it('markModuleCompleted não cria progresso do nada', async () => {
    documentExists = false

    await markModuleCompleted('u1', 'modulo-01')

    expect(writes).toHaveLength(0)
  })

  it('resultado de quiz grava exatamente os campos da regra', async () => {
    const questions = buildQuestions(2)
    const summary = summarizeResult(
      questions.map((question) => ({
        questionId: question.id,
        selectedOptionIds: ['a'],
        correct: true,
      })),
      questions,
      42
    )

    await saveQuizResult({ userId: 'u1', moduleId: 'modulo-01', ...summary })

    expect(writes[0]?.path).toBe('quizResults')
    expect(keysOf(writes[0])).toEqual(allowed.quizResult)
  })
})
