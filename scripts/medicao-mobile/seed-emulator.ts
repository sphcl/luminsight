// Popula os emuladores com o conteúdo real e uma conta de teste que já concluiu os módulos 1 a 4.
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { CONTENT_MODULES, CONTENT_SIMULATIONS } from '../../src/content'
import { TEST_ACCOUNT } from './account'

// Sem as duas variáveis o Admin SDK iria pro projeto de verdade; aqui ele nem começa.
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error(
    'Defina FIRESTORE_EMULATOR_HOST e FIREBASE_AUTH_EMULATOR_HOST: este script só roda contra emulador.'
  )
  process.exit(1)
}

const app = initializeApp({ projectId: 'demo-luminsight' })
const db = getFirestore(app)

for (const entry of CONTENT_MODULES) {
  const ref = db.collection('modules').doc(entry.id)
  await ref.set(entry.module)
  for (const lesson of entry.lessons)
    await ref.collection('lessons').doc(lesson.id).set(lesson.data)
}
for (const simulation of CONTENT_SIMULATIONS) {
  await db.collection('simulations').doc(simulation.id).set(simulation)
}

const user = await getAuth(app).createUser({
  email: TEST_ACCOUNT.email,
  password: TEST_ACCOUNT.password,
  displayName: TEST_ACCOUNT.displayName,
})
await db.doc(`users/${user.uid}`).set({
  displayName: TEST_ACCOUNT.displayName,
  email: TEST_ACCOUNT.email,
  photoURL: null,
  createdAt: FieldValue.serverTimestamp(),
  lastLoginAt: FieldValue.serverTimestamp(),
  onboardingCompleted: true,
  onboardingProfile: {
    securityKnowledge: 'iniciante',
    scamExperience: 'nao',
    motivation: 'curiosidade',
  },
  researchConsent: {
    accepted: false,
    isAdult: false,
    decidedAt: FieldValue.serverTimestamp(),
    version: 'onboarding-v2',
  },
  completedModules: [],
  completedLessons: [],
  completedSimulations: [],
  totalQuizzesCompleted: 0,
  role: 'user',
})
for (const entry of CONTENT_MODULES) {
  const done = entry.module.order <= 4
  await db.doc(`users/${user.uid}/progress/${entry.id}`).set({
    startedAt: FieldValue.serverTimestamp(),
    completedAt: done ? FieldValue.serverTimestamp() : null,
    lessonsCompleted: entry.lessons.map((lesson) => lesson.id),
    quizBestScore: done ? 100 : null,
    quizAttempts: done ? 1 : 0,
    simulationCompleted: done && entry.module.hasSimulation,
    lastUpdatedAt: FieldValue.serverTimestamp(),
  })
}

console.log(
  `Emulador populado: ${CONTENT_MODULES.length} módulos, ${CONTENT_SIMULATIONS.length} simulações e a conta ${TEST_ACCOUNT.email}.`
)
