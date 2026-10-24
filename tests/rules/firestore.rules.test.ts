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

const RULES = readFileSync('firestore.rules', 'utf-8')
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

function consent(overrides: DocumentData = {}) {
  return {
    accepted: true,
    isAdult: true,
    decidedAt: serverTimestamp(),
    version: 'onboarding-v2',
    ...overrides,
  }
}

const ONBOARDING_PROFILE = {
  securityKnowledge: 'iniciante',
  scamExperience: 'prefiro_nao_responder',
  motivation: 'curiosidade',
}

function storedConsent(accepted: boolean) {
  return {
    accepted,
    isAdult: accepted,
    decidedAt: Timestamp.fromDate(new Date('2026-01-01')),
    version: 'onboarding-v2',
  }
}

function newSimulationResult(overrides: DocumentData = {}) {
  return {
    userId: ALICE.uid,
    simulationId: 'simulacao-modulo-01',
    moduleId: 'modulo-01',
    completedAt: serverTimestamp(),
    totalDecisions: 2,
    correctDecisions: 1,
    timeSpentSeconds: 90,
    decisions: [
      { sceneId: 'cena-01', selectedOptionId: 'a', isCorrect: true },
      { sceneId: 'cena-02', selectedOptionId: 'b', isCorrect: false },
    ],
    ...overrides,
  }
}

function newTrailFeedback(overrides: DocumentData = {}) {
  return {
    userId: ALICE.uid,
    submittedAt: serverTimestamp(),
    securityKnowledge: 'intermediario',
    riskPerception: 'alta',
    satisfaction: 'gostei',
    mostUseful: ['licoes', 'simulacoes'],
    comment: 'Gostei das simulações.',
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
    firestore: { rules: RULES },
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
        onboardingProfile: ONBOARDING_PROFILE,
        researchConsent: consent({ accepted: false, isAdult: false }),
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
        researchConsent: consent({ accepted: false, isAdult: false }),
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
        researchConsent: consent({ accepted: false, isAdult: false }),
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

describe('consentimento da pesquisa', () => {
  const alicePath = `users/${ALICE.uid}`
  const onboardedAlice = () =>
    storedUserDocument({ onboardingCompleted: true, onboardingProfile: ONBOARDING_PROFILE })

  it('deixa aceitar no onboarding junto com a percepção de risco de antes', async () => {
    await seed(alicePath, storedUserDocument())
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: ONBOARDING_PROFILE,
        researchConsent: consent(),
        riskBaseline: { riskPerception: 'baixa', collectedAfterUse: false },
      })
    )
  })

  it('bloqueia aceitar sem a declaração de 18 anos', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: ONBOARDING_PROFILE,
        researchConsent: consent({ isAdult: false }),
        riskBaseline: { riskPerception: 'baixa', collectedAfterUse: false },
      })
    )
  })

  it('bloqueia guardar percepção de risco de quem não aceitou', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: ONBOARDING_PROFILE,
        researchConsent: consent({ accepted: false, isAdult: true }),
        riskBaseline: { riskPerception: 'baixa', collectedAfterUse: false },
      })
    )
  })

  it('bloqueia marcar como coletado antes de usar o que veio depois', async () => {
    await seed(alicePath, onboardedAlice())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        researchConsent: consent({ version: 'retroativo-v2' }),
        riskBaseline: { riskPerception: 'alta', collectedAfterUse: false },
      })
    )
  })

  it('deixa conta antiga decidir uma vez, com o antes marcado como coletado depois de usar', async () => {
    await seed(alicePath, onboardedAlice())
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        researchConsent: consent({ version: 'retroativo-v2' }),
        riskBaseline: { riskPerception: 'alta', collectedAfterUse: true },
      })
    )
  })

  it('bloqueia escala com meio, que não existe', async () => {
    await seed(alicePath, onboardedAlice())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        researchConsent: consent({ version: 'retroativo-v2' }),
        riskBaseline: { riskPerception: 'media', collectedAfterUse: true },
      })
    )
  })

  it('bloqueia data de decisão forjada', async () => {
    await seed(alicePath, onboardedAlice())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        researchConsent: consent({
          version: 'retroativo-v2',
          accepted: false,
          isAdult: false,
          decidedAt: Timestamp.fromDate(new Date('2025-01-01')),
        }),
      })
    )
  })

  it('deixa revogar pelo Perfil sem apagar nada', async () => {
    await seed(alicePath, {
      ...onboardedAlice(),
      researchConsent: storedConsent(true),
      riskBaseline: { riskPerception: 'alta', collectedAfterUse: false },
    })
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        researchConsent: consent({ accepted: false, version: 'retroativo-v2' }),
      })
    )
  })

  it('bloqueia trocar a percepção de risco de antes depois de gravada', async () => {
    await seed(alicePath, {
      ...onboardedAlice(),
      researchConsent: storedConsent(true),
      riskBaseline: { riskPerception: 'alta', collectedAfterUse: false },
    })
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        researchConsent: consent({ version: 'retroativo-v2' }),
        riskBaseline: { riskPerception: 'baixa', collectedAfterUse: false },
      })
    )
  })

  it('deixa dispensar o card da pesquisa final com o horário do servidor', async () => {
    await seed(alicePath, onboardedAlice())
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), alicePath), { trailFeedbackDismissedAt: serverTimestamp() })
    )
  })
})

describe('simulationResults', () => {
  beforeEach(async () => {
    await seed('simulations/simulacao-modulo-01', { moduleId: 'modulo-01' })
  })

  const withConsent = (accepted: boolean) =>
    seed(`users/${ALICE.uid}`, storedUserDocument({ researchConsent: storedConsent(accepted) }))

  it('deixa quem consentiu registrar o resultado', async () => {
    await withConsent(true)
    await assertSucceeds(
      addDoc(collection(dbAs(ALICE), 'simulationResults'), newSimulationResult())
    )
  })

  it('bloqueia quem recusou', async () => {
    await withConsent(false)
    await assertFails(addDoc(collection(dbAs(ALICE), 'simulationResults'), newSimulationResult()))
  })

  it('bloqueia por padrão quem ainda não tem o campo de consentimento', async () => {
    await seed(`users/${ALICE.uid}`, storedUserDocument())
    await assertFails(addDoc(collection(dbAs(ALICE), 'simulationResults'), newSimulationResult()))
  })

  it('bloqueia por padrão quem não tem documento de usuário', async () => {
    await assertFails(addDoc(collection(dbAs(ALICE), 'simulationResults'), newSimulationResult()))
  })

  it('bloqueia registrar em nome de outra pessoa', async () => {
    await withConsent(true)
    await assertFails(
      addDoc(collection(dbAs(BOB), 'simulationResults'), newSimulationResult({ userId: ALICE.uid }))
    )
  })

  it('bloqueia módulo que não é o da simulação', async () => {
    await withConsent(true)
    await assertFails(
      addDoc(
        collection(dbAs(ALICE), 'simulationResults'),
        newSimulationResult({ moduleId: 'modulo-02' })
      )
    )
  })

  it('bloqueia simulação que não existe', async () => {
    await withConsent(true)
    await assertFails(
      addDoc(
        collection(dbAs(ALICE), 'simulationResults'),
        newSimulationResult({ simulationId: 'simulacao-inventada' })
      )
    )
  })

  it('bloqueia mais acertos que decisões e lista de tamanho diferente do total', async () => {
    await withConsent(true)
    const db = dbAs(ALICE)
    await assertFails(
      addDoc(collection(db, 'simulationResults'), newSimulationResult({ correctDecisions: 3 }))
    )
    await assertFails(
      addDoc(collection(db, 'simulationResults'), newSimulationResult({ totalDecisions: 3 }))
    )
  })

  it('bloqueia data forjada e campo extra', async () => {
    await withConsent(true)
    const db = dbAs(ALICE)
    await assertFails(
      addDoc(
        collection(db, 'simulationResults'),
        newSimulationResult({ completedAt: Timestamp.fromDate(new Date('2025-01-01')) })
      )
    )
    await assertFails(
      addDoc(collection(db, 'simulationResults'), newSimulationResult({ score: 100 }))
    )
  })

  it('bloqueia alterar e apagar resultado gravado', async () => {
    await seed('simulationResults/r1', {
      ...newSimulationResult(),
      completedAt: Timestamp.fromDate(new Date('2026-01-01')),
    })
    const db = dbAs(ALICE)
    await assertFails(updateDoc(doc(db, 'simulationResults/r1'), { correctDecisions: 2 }))
    await assertFails(deleteDoc(doc(db, 'simulationResults/r1')))
  })

  it('bloqueia ler resultado de outra pessoa', async () => {
    await seed('simulationResults/r1', {
      ...newSimulationResult(),
      completedAt: Timestamp.fromDate(new Date('2026-01-01')),
    })
    await assertFails(getDoc(doc(dbAs(BOB), 'simulationResults/r1')))
  })

  it('aceita acerto declarado pelo próprio usuário (limitação conhecida)', async () => {
    await withConsent(true)
    await assertSucceeds(
      addDoc(
        collection(dbAs(ALICE), 'simulationResults'),
        newSimulationResult({
          correctDecisions: 2,
          decisions: [
            { sceneId: 'cena-01', selectedOptionId: 'a', isCorrect: true },
            { sceneId: 'cena-02', selectedOptionId: 'b', isCorrect: true },
          ],
        })
      )
    )
  })
})

describe('trailFeedback', () => {
  const feedbackPath = `trailFeedback/${ALICE.uid}`

  async function aliceWith(accepted: boolean, trailDone: boolean) {
    await seed(
      `users/${ALICE.uid}`,
      storedUserDocument({ researchConsent: storedConsent(accepted) })
    )
    await seed(`users/${ALICE.uid}/progress/modulo-05`, {
      ...storedProgress(),
      completedAt: trailDone ? Timestamp.fromDate(new Date('2026-02-01')) : null,
    })
  }

  it('deixa quem consentiu e concluiu a trilha responder', async () => {
    await aliceWith(true, true)
    await assertSucceeds(setDoc(doc(dbAs(ALICE), feedbackPath), newTrailFeedback()))
  })

  it('aceita resposta sem comentário', async () => {
    await aliceWith(true, true)
    const { comment: _comment, ...withoutComment } = newTrailFeedback()
    await assertSucceeds(setDoc(doc(dbAs(ALICE), feedbackPath), withoutComment))
  })

  it('bloqueia quem recusou e quem não concluiu a trilha', async () => {
    await aliceWith(false, true)
    await assertFails(setDoc(doc(dbAs(ALICE), feedbackPath), newTrailFeedback()))

    await aliceWith(true, false)
    await assertFails(setDoc(doc(dbAs(ALICE), feedbackPath), newTrailFeedback()))
  })

  it('bloqueia responder no lugar de outra pessoa', async () => {
    await aliceWith(true, true)
    await assertFails(setDoc(doc(dbAs(BOB), feedbackPath), newTrailFeedback()))
  })

  it('bloqueia comentário acima de 500 caracteres', async () => {
    await aliceWith(true, true)
    await assertFails(
      setDoc(doc(dbAs(ALICE), feedbackPath), newTrailFeedback({ comment: 'a'.repeat(501) }))
    )
  })

  it('bloqueia "nada em especial" junto com outra opção, lista vazia, repetida e fora do enum', async () => {
    await aliceWith(true, true)
    const db = dbAs(ALICE)
    for (const mostUseful of [['nada', 'licoes'], [], ['videos'], ['licoes', 'licoes']]) {
      await assertFails(setDoc(doc(db, feedbackPath), newTrailFeedback({ mostUseful })))
    }
  })

  it('bloqueia escala com meio na percepção de risco', async () => {
    await aliceWith(true, true)
    await assertFails(
      setDoc(doc(dbAs(ALICE), feedbackPath), newTrailFeedback({ riskPerception: 'media' }))
    )
  })

  it('bloqueia responder de novo, alterar e apagar', async () => {
    await aliceWith(true, true)
    await seed(feedbackPath, {
      ...newTrailFeedback(),
      submittedAt: Timestamp.fromDate(new Date('2026-02-02')),
    })
    const db = dbAs(ALICE)
    await assertFails(setDoc(doc(db, feedbackPath), newTrailFeedback()))
    await assertFails(updateDoc(doc(db, feedbackPath), { satisfaction: 'gostei_muito' }))
    await assertFails(deleteDoc(doc(db, feedbackPath)))
  })

  it('deixa a própria pessoa ler, e só ela', async () => {
    await seed(feedbackPath, {
      ...newTrailFeedback(),
      submittedAt: Timestamp.fromDate(new Date('2026-02-02')),
    })
    await assertSucceeds(getDoc(doc(dbAs(ALICE), feedbackPath)))
    await assertFails(getDoc(doc(dbAs(BOB), feedbackPath)))
  })
})

describe('conteúdo', () => {
  it('deixa usuário logado ler módulos, lições e simulações', async () => {
    await seed('modules/modulo-01/lessons/licao-01', { title: 'Lição' })
    await seed('simulations/simulacao-modulo-02', { title: 'Simulação' })
    const db = dbAs(ALICE)

    await assertSucceeds(getDoc(doc(db, 'modules/modulo-01')))
    await assertSucceeds(getDoc(doc(db, 'modules/modulo-01/lessons/licao-01')))
    await assertSucceeds(getDoc(doc(db, 'simulations/simulacao-modulo-02')))
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

describe('consentimento obrigatório no onboarding', () => {
  const alicePath = `users/${ALICE.uid}`

  it('recusa o onboarding antigo, sem decidir o consentimento', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: ONBOARDING_PROFILE,
      })
    )
  })

  it('o formato antigo não abre brecha pra percepção de risco sem aceite', async () => {
    await seed(alicePath, storedUserDocument())
    await assertFails(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: ONBOARDING_PROFILE,
        riskBaseline: { riskPerception: 'baixa', collectedAfterUse: false },
      })
    )
  })

  it('continua aceitando quem decidiu, aceitando ou recusando', async () => {
    await seed(alicePath, storedUserDocument())
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        onboardingCompleted: true,
        onboardingProfile: ONBOARDING_PROFILE,
        researchConsent: consent({ accepted: false, isAdult: false }),
      })
    )
  })

  it('conta que entrou na transição, sem consentimento, ainda consegue decidir pelo aviso único', async () => {
    await seed(
      alicePath,
      storedUserDocument({ onboardingCompleted: true, onboardingProfile: ONBOARDING_PROFILE })
    )
    await assertSucceeds(
      updateDoc(doc(dbAs(ALICE), alicePath), {
        researchConsent: consent({ version: 'retroativo-v2', accepted: false, isAdult: false }),
      })
    )
  })
})
