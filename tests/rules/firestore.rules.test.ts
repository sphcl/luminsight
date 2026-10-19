import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'

const ALICE = { uid: 'alice', email: 'alice@example.com' }
const BOB = { uid: 'bob', email: 'bob@example.com' }

let testEnv: RulesTestEnvironment

function dbAs(user: { uid: string; email: string }): Firestore {
  return testEnv
    .authenticatedContext(user.uid, { email: user.email })
    .firestore() as unknown as Firestore
}

function anonymousDb(): Firestore {
  return testEnv.unauthenticatedContext().firestore() as unknown as Firestore
}

async function seed(path: string, data: DocumentData) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore() as unknown as Firestore, path), data)
  })
}

function newUserDocument(email: string) {
  return {
    displayName: 'Alice',
    email,
    photoURL: null,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    onboardingCompleted: false,
    completedModules: [],
    completedLessons: [],
    completedSimulations: [],
    totalQuizzesCompleted: 0,
    role: 'user',
  }
}

function storedUserDocument(overrides: DocumentData = {}) {
  return {
    ...newUserDocument(ALICE.email),
    createdAt: Timestamp.fromDate(new Date('2026-01-01')),
    lastLoginAt: Timestamp.fromDate(new Date('2026-01-01')),
    ...overrides,
  }
}

function newProgress(overrides: DocumentData = {}) {
  return {
    startedAt: serverTimestamp(),
    completedAt: null,
    lessonsCompleted: ['licao-01'],
    quizBestScore: null,
    quizAttempts: 0,
    simulationCompleted: false,
    lastUpdatedAt: serverTimestamp(),
    ...overrides,
  }
}

function storedProgress(overrides: DocumentData = {}) {
  return {
    ...newProgress(),
    startedAt: Timestamp.fromDate(new Date('2026-01-01')),
    lastUpdatedAt: Timestamp.fromDate(new Date('2026-01-01')),
    ...overrides,
  }
}

function newQuizResult(overrides: DocumentData = {}) {
  return {
    userId: ALICE.uid,
    moduleId: 'modulo-01',
    completedAt: serverTimestamp(),
    score: 70,
    totalQuestions: 10,
    correctAnswers: 7,
    timeSpentSeconds: 120,
    passed: true,
    answers: [{ questionId: 'q1', selectedOptionId: 'a', correct: true }],
    ...overrides,
  }
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-luminsight',
    firestore: { rules: readFileSync('firestore.rules', 'utf-8') },
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await seed('modules/modulo-01', { title: 'Módulo 1', totalLessons: 2, hasSimulation: true })
  await seed('modules/modulo-02', { title: 'Módulo 2', totalLessons: 1, hasSimulation: false })
})

afterAll(async () => {
  await testEnv?.cleanup()
})

describe('users', () => {
  const alicePath = `users/${ALICE.uid}`

  it('deixa o dono criar o próprio documento com os valores iniciais', async () => {
    await assertSucceeds(setDoc(doc(dbAs(ALICE), alicePath), newUserDocument(ALICE.email)))
  })

  it('bloqueia ler o documento de outro usuário', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(getDoc(doc(dbAs(BOB), alicePath)))
  })

  it('bloqueia leitura sem login', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(getDoc(doc(anonymousDb(), alicePath)))
  })

  it('bloqueia criar documento na conta de outro usuário', async () => {
    await assertFails(setDoc(doc(dbAs(BOB), alicePath), newUserDocument(BOB.email)))
  })

  it('bloqueia criar a conta já como admin', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), alicePath), { ...newUserDocument(ALICE.email), role: 'admin' })
    )
  })

  it('bloqueia criar a conta com o email de outra pessoa', async () => {
    await assertFails(setDoc(doc(dbAs(ALICE), alicePath), newUserDocument(BOB.email)))
  })

  it('bloqueia campo extra na criação', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), alicePath), { ...newUserDocument(ALICE.email), isAdmin: true })
    )
  })

  it('bloqueia data de criação forjada pelo cliente', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), alicePath), {
        ...newUserDocument(ALICE.email),
        createdAt: Timestamp.fromDate(new Date('2020-01-01')),
      })
    )
  })

  it('bloqueia nascer com progresso preenchido', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), alicePath), {
        ...newUserDocument(ALICE.email),
        completedModules: ['modulo-01'],
        totalQuizzesCompleted: 5,
      })
    )
  })

  it('bloqueia photoURL que não é https', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), alicePath), {
        ...newUserDocument(ALICE.email),
        photoURL: 'javascript:alert(1)',
      })
    )
  })

  it('bloqueia se promover a admin num update', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(updateDoc(doc(dbAs(ALICE), alicePath), { role: 'admin' }))
  })

  it('bloqueia trocar role escondido junto com o nome', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), { displayName: 'Alice Souza', role: 'admin' })
    )
  })

  it('deixa trocar o nome dentro das regras do cadastro', async () => {
    await seed(alicePath, storedUserDocument())
    await assertSucceeds(updateDoc(doc(dbAs(ALICE), alicePath), { displayName: 'Alice Souza' }))
  })

  it('bloqueia nome com markup', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), { displayName: '<img src=x onerror=alert(1)>' })
    )
  })

  it('bloqueia alterar o nome de outro usuário', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(updateDoc(doc(dbAs(BOB), alicePath), { displayName: 'Hackeada' }))
  })

  it('bloqueia mexer em contador que o cliente não deveria tocar', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(updateDoc(doc(dbAs(ALICE), alicePath), { totalQuizzesCompleted: 99 }))
  })

  it('deixa concluir o onboarding com valores do enum', async () => {
    await seed(alicePath, storedUserDocument())
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: {
          securityKnowledge: 'iniciante',
          scamExperience: 'prefiro_nao_responder',
          motivation: 'curiosidade',
        },
      })
    )
  })

  it('bloqueia texto livre na resposta sensível do onboarding', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: {
          securityKnowledge: 'iniciante',
          scamExperience: 'caí no golpe do pix e perdi R$ 2.000',
          motivation: 'curiosidade',
        },
      })
    )
  })

  it('bloqueia refazer o onboarding depois de concluído', async () => {
    await seed(alicePath, storedUserDocument({ onboardingCompleted: true }))
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: {
          securityKnowledge: 'avancado',
          scamExperience: 'nao',
          motivation: 'curiosidade',
        },
      })
    )
  })

  it('deixa registrar o login com o horário do servidor', async () => {
    await seed(alicePath, storedUserDocument())
    await assertSucceeds(updateDoc(doc(dbAs(ALICE), alicePath), { lastLoginAt: serverTimestamp() }))
  })

  it('bloqueia horário de login forjado', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        lastLoginAt: Timestamp.fromDate(new Date('2030-01-01')),
      })
    )
  })

  it('bloqueia apagar a própria conta pelo cliente', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(deleteDoc(doc(dbAs(ALICE), alicePath)))
  })
})

describe('users/{uid}/progress', () => {
  const progressPath = `users/${ALICE.uid}/progress/modulo-01`

  it('deixa criar o progresso ao concluir a primeira lição', async () => {
    await assertSucceeds(setDoc(doc(dbAs(ALICE), progressPath), newProgress()))
  })

  it('bloqueia escrever progresso na conta de outro usuário', async () => {
    await assertFails(setDoc(doc(dbAs(BOB), progressPath), newProgress()))
  })

  it('bloqueia ler o progresso de outro usuário', async () => {
    await seed(progressPath, storedProgress())
    await assertFails(getDoc(doc(dbAs(BOB), progressPath)))
  })

  it('bloqueia progresso de módulo que não existe', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), `users/${ALICE.uid}/progress/modulo-inventado`), newProgress())
    )
  })

  it('bloqueia campo extra no progresso', async () => {
    await assertFails(setDoc(doc(dbAs(ALICE), progressPath), newProgress({ certificado: true })))
  })

  it('bloqueia nascer já concluído', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), progressPath), newProgress({ completedAt: serverTimestamp() }))
    )
  })

  it('bloqueia nascer com várias tentativas de quiz', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), progressPath), newProgress({ quizAttempts: 5, quizBestScore: 100 }))
    )
  })

  it('bloqueia nota fora de 0 a 100', async () => {
    await assertFails(
      setDoc(doc(dbAs(ALICE), progressPath), newProgress({ quizAttempts: 1, quizBestScore: 1000 }))
    )
  })

  it('bloqueia mais lições concluídas do que o módulo tem', async () => {
    await seed(progressPath, storedProgress())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        lessonsCompleted: ['licao-01', 'licao-02', 'licao-03'],
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia zerar o contador de tentativas', async () => {
    await seed(progressPath, storedProgress({ quizAttempts: 3, quizBestScore: 50 }))
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        quizAttempts: 0,
        quizBestScore: null,
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia alterar a nota sem registrar tentativa', async () => {
    await seed(progressPath, storedProgress({ quizAttempts: 1, quizBestScore: 40 }))
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        quizBestScore: 90,
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia baixar a melhor nota', async () => {
    await seed(progressPath, storedProgress({ quizAttempts: 1, quizBestScore: 80 }))
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        quizAttempts: 2,
        quizBestScore: 10,
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia apagar lição já concluída', async () => {
    await seed(progressPath, storedProgress({ lessonsCompleted: ['licao-01', 'licao-02'] }))
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        lessonsCompleted: ['licao-01'],
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia desmarcar a simulação', async () => {
    await seed(progressPath, storedProgress({ simulationCompleted: true }))
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        simulationCompleted: false,
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia reescrever o startedAt', async () => {
    await seed(progressPath, storedProgress())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        startedAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia marcar o módulo como concluído sem cumprir as etapas', async () => {
    await seed(progressPath, storedProgress())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        completedAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('deixa marcar o módulo como concluído quando as etapas batem', async () => {
    await seed(
      progressPath,
      storedProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        quizAttempts: 1,
        quizBestScore: 80,
        simulationCompleted: true,
      })
    )
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        completedAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia trocar o completedAt depois de gravado', async () => {
    await seed(
      progressPath,
      storedProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        quizAttempts: 1,
        quizBestScore: 80,
        simulationCompleted: true,
        completedAt: Timestamp.fromDate(new Date('2026-02-01')),
      })
    )
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        completedAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })

  it('bloqueia lastUpdatedAt forjado', async () => {
    await seed(progressPath, storedProgress())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        lessonsCompleted: ['licao-01', 'licao-02'],
        lastUpdatedAt: Timestamp.fromDate(new Date('2030-01-01')),
      })
    )
  })

  it('bloqueia apagar o progresso', async () => {
    await seed(progressPath, storedProgress())
    await assertFails(deleteDoc(doc(dbAs(ALICE), progressPath)))
  })

  // Limitação documentada em docs/seguranca.md: as rules não sabem se o quiz foi feito de verdade.
  it('aceita nota alta declarada pelo próprio usuário (limitação conhecida)', async () => {
    await seed(progressPath, storedProgress())
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), progressPath), {
        quizAttempts: 1,
        quizBestScore: 100,
        lastUpdatedAt: serverTimestamp(),
      })
    )
  })
})

describe('quizResults', () => {
  it('deixa registrar um resultado coerente', async () => {
    await assertSucceeds(addDoc(collection(dbAs(ALICE), 'quizResults'), newQuizResult()))
  })

  it('bloqueia registrar resultado em nome de outro usuário', async () => {
    await assertFails(
      addDoc(collection(dbAs(BOB), 'quizResults'), newQuizResult({ userId: ALICE.uid }))
    )
  })

  it('bloqueia nota que não bate com os acertos', async () => {
    await assertFails(
      addDoc(
        collection(dbAs(ALICE), 'quizResults'),
        newQuizResult({ score: 100, correctAnswers: 2 })
      )
    )
  })

  it('arredonda a nota pra baixo como o app', async () => {
    await assertSucceeds(
      addDoc(
        collection(dbAs(ALICE), 'quizResults'),
        newQuizResult({ score: 66, correctAnswers: 2, totalQuestions: 3, passed: false })
      )
    )
  })

  it('bloqueia passed true com nota abaixo do mínimo', async () => {
    await assertFails(
      addDoc(
        collection(dbAs(ALICE), 'quizResults'),
        newQuizResult({ score: 50, correctAnswers: 5, passed: true })
      )
    )
  })

  it('bloqueia data de conclusão forjada', async () => {
    await assertFails(
      addDoc(
        collection(dbAs(ALICE), 'quizResults'),
        newQuizResult({ completedAt: Timestamp.fromDate(new Date('2020-01-01')) })
      )
    )
  })

  it('bloqueia resultado de módulo que não existe', async () => {
    await assertFails(
      addDoc(collection(dbAs(ALICE), 'quizResults'), newQuizResult({ moduleId: 'modulo-x' }))
    )
  })

  it('bloqueia campo extra no resultado', async () => {
    await assertFails(
      addDoc(collection(dbAs(ALICE), 'quizResults'), newQuizResult({ revisadoPorProfessor: true }))
    )
  })

  it('bloqueia alterar nota de quiz passada', async () => {
    await seed('quizResults/r1', {
      ...newQuizResult({ score: 40, correctAnswers: 4, passed: false }),
      completedAt: Timestamp.now(),
    })
    await assertFails(
      updateDoc(doc(dbAs(ALICE), 'quizResults/r1'), {
        score: 100,
        correctAnswers: 10,
        passed: true,
      })
    )
  })

  it('bloqueia apagar resultado de quiz', async () => {
    await seed('quizResults/r1', { ...newQuizResult(), completedAt: Timestamp.now() })
    await assertFails(deleteDoc(doc(dbAs(ALICE), 'quizResults/r1')))
  })

  it('bloqueia ler resultado de outro usuário', async () => {
    await seed('quizResults/r1', { ...newQuizResult(), completedAt: Timestamp.now() })
    await assertFails(getDoc(doc(dbAs(BOB), 'quizResults/r1')))
  })

  it('bloqueia listar resultados sem filtrar pelo próprio usuário', async () => {
    await seed('quizResults/r1', { ...newQuizResult(), completedAt: Timestamp.now() })
    await assertFails(getDocs(collection(dbAs(BOB), 'quizResults')))
  })

  it('deixa listar os próprios resultados', async () => {
    await seed('quizResults/r1', { ...newQuizResult(), completedAt: Timestamp.now() })
    await assertSucceeds(
      getDocs(query(collection(dbAs(ALICE), 'quizResults'), where('userId', '==', ALICE.uid)))
    )
  })
})

describe('conteúdo', () => {
  it('deixa usuário logado ler módulos, lições e simulações', async () => {
    await seed('modules/modulo-01/lessons/licao-01', { title: 'Lição' })
    await seed('simulations/simulacao-01', { title: 'Simulação' })
    const db = dbAs(ALICE)

    await assertSucceeds(getDoc(doc(db, 'modules/modulo-01')))
    await assertSucceeds(getDoc(doc(db, 'modules/modulo-01/lessons/licao-01')))
    await assertSucceeds(getDoc(doc(db, 'simulations/simulacao-01')))
  })

  it('bloqueia leitura de conteúdo sem login', async () => {
    await assertFails(getDoc(doc(anonymousDb(), 'modules/modulo-01')))
  })

  it('bloqueia escrever conteúdo pelo cliente', async () => {
    const db = dbAs(ALICE)

    await assertFails(updateDoc(doc(db, 'modules/modulo-01'), { totalLessons: 0 }))
    await assertFails(setDoc(doc(db, 'modules/modulo-01/lessons/licao-x'), { title: 'Falsa' }))
    await assertFails(setDoc(doc(db, 'simulations/simulacao-x'), { title: 'Falsa' }))
  })
})

describe('catch-all', () => {
  it('bloqueia coleção que não está nas rules', async () => {
    const db = dbAs(ALICE)

    await assertFails(setDoc(doc(db, 'admins/alice'), { active: true }))
    await assertFails(getDoc(doc(db, 'config/app')))
  })

  it('bloqueia subcoleção não listada dentro do usuário', async () => {
    await assertFails(setDoc(doc(dbAs(ALICE), `users/${ALICE.uid}/notas/1`), { texto: 'oi' }))
  })
})
