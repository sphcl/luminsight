import { FirebaseError } from 'firebase/app'
import { Timestamp } from 'firebase/firestore'
import { onboardingProfileSchema } from '@/features/onboarding/schemas/onboarding.schema'
import { updateProfileSchema } from '@/features/profile/schemas/profile.schema'
import { consentDecisionSchema } from '@/features/research/schemas/research.schema'
import type { LessonWithId, ModuleWithId } from '@/types/module.types'
import type { ProgressDocument, ProgressMap } from '@/types/progress.types'
import type { QuizResultDocument } from '@/types/quiz.types'
import type { SimulationDocument } from '@/types/simulation.types'
import type { ResearchConsent, RiskBaseline, UserDocument } from '@/types/user.types'

// Firebase em memória pros testes de fluxo: imita o que cada service faz, sem rede e sem SDK.

interface FakeAccount {
  uid: string
  email: string
  password: string
  displayName: string | null
}

export interface FakeFirebaseUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

type AuthListener = (user: FakeFirebaseUser | null) => void

interface Seed {
  modules: ModuleWithId[]
  lessons: Record<string, LessonWithId[]>
  simulations: SimulationDocument[]
}

// Atraso de rede no documento do usuário: sem ele o fake esconde a corrida entre login e Firestore.
const USER_DOCUMENT_LATENCY_MS = 50

const state = {
  accounts: new Map<string, FakeAccount>(),
  currentUid: null as string | null,
  listeners: new Set<AuthListener>(),
  users: new Map<string, UserDocument>(),
  progress: new Map<string, Map<string, ProgressDocument>>(),
  quizResults: [] as QuizResultDocument[],
  modules: [] as ModuleWithId[],
  lessons: new Map<string, LessonWithId[]>(),
  simulations: [] as SimulationDocument[],
  nextUid: 1,
}

function toFirebaseUser(account: FakeAccount): FakeFirebaseUser {
  return {
    uid: account.uid,
    email: account.email,
    displayName: account.displayName,
    photoURL: null,
    emailVerified: false,
  }
}

function currentFirebaseUser(): FakeFirebaseUser | null {
  const account = [...state.accounts.values()].find((item) => item.uid === state.currentUid)
  return account ? toFirebaseUser(account) : null
}

function notify() {
  const user = currentFirebaseUser()
  state.listeners.forEach((listener) => listener(user))
}

export const fakeBackend = {
  reset(seed: Seed) {
    state.accounts.clear()
    state.currentUid = null
    state.listeners.clear()
    state.users.clear()
    state.progress.clear()
    state.quizResults = []
    state.modules = seed.modules
    state.lessons = new Map(Object.entries(seed.lessons))
    state.simulations = seed.simulations
    state.nextUid = 1
  },

  addAccount(email: string, password: string, displayName: string): string {
    const uid = `uid-${state.nextUid++}`
    state.accounts.set(email, { uid, email, password, displayName })
    return uid
  },

  signInDirectly(uid: string) {
    state.currentUid = uid
  },

  setUserDocument(uid: string, document: UserDocument) {
    state.users.set(uid, document)
  },

  setProgress(uid: string, moduleId: string, progress: ProgressDocument) {
    const map = state.progress.get(uid) ?? new Map()
    map.set(moduleId, progress)
    state.progress.set(uid, map)
  },

  getUser: (uid: string) => state.users.get(uid),
  getProgress: (uid: string, moduleId: string) => state.progress.get(uid)?.get(moduleId),
  get quizResults() {
    return state.quizResults
  },
  get currentUid() {
    return state.currentUid
  },
}

export function onAuthStateChanged(_auth: unknown, listener: AuthListener): () => void {
  state.listeners.add(listener)
  // O Firebase de verdade também avisa o estado inicial de forma assíncrona.
  queueMicrotask(() => listener(currentFirebaseUser()))
  return () => state.listeners.delete(listener)
}

export const fakeAuthService = {
  async registerWithEmail(displayName: string, email: string, password: string) {
    if (state.accounts.has(email)) throw new FirebaseError('auth/email-already-in-use', 'x')
    const uid = fakeBackend.addAccount(email, password, displayName)
    state.currentUid = uid
    notify()
  },

  async loginWithEmail(email: string, password: string) {
    const account = state.accounts.get(email)
    if (!account || account.password !== password) {
      throw new FirebaseError('auth/invalid-credential', 'x')
    }
    state.currentUid = account.uid
    notify()
  },

  async loginWithGoogle() {
    throw new FirebaseError('auth/popup-closed-by-user', 'x')
  },

  async logout() {
    state.currentUid = null
    notify()
  },
}

export const fakeUserService = {
  async getUserDocument(uid: string) {
    return state.users.get(uid) ?? null
  },

  async ensureUserDocument(input: {
    uid: string
    displayName: string | null
    email: string | null
    photoURL: string | null
  }) {
    await new Promise((resolve) => setTimeout(resolve, USER_DOCUMENT_LATENCY_MS))
    const existing = state.users.get(input.uid)
    if (existing) {
      state.users.set(input.uid, { ...existing, lastLoginAt: Timestamp.now() })
      return existing
    }

    const document: UserDocument = {
      displayName: input.displayName ?? 'Usuário',
      email: input.email ?? '',
      photoURL: input.photoURL,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      onboardingCompleted: false,
      completedModules: [],
      completedLessons: [],
      completedSimulations: [],
      totalQuizzesCompleted: 0,
      role: 'user',
    }
    state.users.set(input.uid, document)
    return document
  },

  async completeOnboarding(uid: string, answers: unknown, decision: unknown) {
    const onboardingProfile = onboardingProfileSchema.parse(answers)
    const { accepted, isAdult, riskPerception } = consentDecisionSchema.parse(decision)
    const researchConsent: ResearchConsent = {
      accepted,
      isAdult,
      decidedAt: Timestamp.now(),
      version: 'onboarding-v1',
    }
    const riskBaseline: RiskBaseline | undefined = riskPerception
      ? { riskPerception, collectedAfterUse: false }
      : undefined
    const fields = { onboardingProfile, researchConsent, ...(riskBaseline ? { riskBaseline } : {}) }
    const existing = state.users.get(uid)
    if (existing) state.users.set(uid, { ...existing, onboardingCompleted: true, ...fields })
    return fields
  },

  async updateDisplayName(uid: string, input: unknown) {
    const { displayName } = updateProfileSchema.parse(input)
    const existing = state.users.get(uid)
    if (existing) state.users.set(uid, { ...existing, displayName })
    return displayName
  },
}

function progressFor(uid: string, moduleId: string): ProgressDocument {
  return (
    state.progress.get(uid)?.get(moduleId) ?? {
      startedAt: Timestamp.now(),
      completedAt: null,
      lessonsCompleted: [],
      quizBestScore: null,
      quizAttempts: 0,
      simulationCompleted: false,
      lastUpdatedAt: Timestamp.now(),
    }
  )
}

function saveProgress(uid: string, moduleId: string, progress: ProgressDocument) {
  fakeBackend.setProgress(uid, moduleId, { ...progress, lastUpdatedAt: Timestamp.now() })
}

export const fakeProgressService = {
  async getUserProgress(uid: string): Promise<ProgressMap> {
    return Object.fromEntries(state.progress.get(uid) ?? new Map())
  },

  async markLessonCompleted(uid: string, moduleId: string, lessonId: string) {
    const current = progressFor(uid, moduleId)
    const lessonsCompleted = current.lessonsCompleted.includes(lessonId)
      ? current.lessonsCompleted
      : [...current.lessonsCompleted, lessonId]
    saveProgress(uid, moduleId, { ...current, lessonsCompleted })
  },

  async saveQuizAttempt(uid: string, moduleId: string, score: number) {
    const current = progressFor(uid, moduleId)
    const best = current.quizBestScore === null ? score : Math.max(current.quizBestScore, score)
    saveProgress(uid, moduleId, {
      ...current,
      quizBestScore: best,
      quizAttempts: current.quizAttempts + 1,
    })
  },

  async markSimulationCompleted(uid: string, moduleId: string) {
    saveProgress(uid, moduleId, { ...progressFor(uid, moduleId), simulationCompleted: true })
  },

  async markModuleCompleted(uid: string, moduleId: string) {
    const current = state.progress.get(uid)?.get(moduleId)
    if (!current) return
    saveProgress(uid, moduleId, { ...current, completedAt: Timestamp.now() })
  },
}

export const fakeModulesService = {
  async getModules() {
    return [...state.modules].sort((a, b) => a.order - b.order)
  },
  async getModuleById(moduleId: string) {
    return state.modules.find((module) => module.id === moduleId) ?? null
  },
  async getLessons(moduleId: string) {
    return state.lessons.get(moduleId) ?? []
  },
}

export const fakeSimulationsService = {
  async getSimulations() {
    return state.simulations
  },
  async getSimulationById(simulationId: string) {
    return state.simulations.find((simulation) => simulation.id === simulationId) ?? null
  },
}

export const fakeQuizService = {
  async saveQuizResult(result: Omit<QuizResultDocument, 'completedAt'>) {
    state.quizResults.push({ ...result, completedAt: Timestamp.now() })
  },
}
