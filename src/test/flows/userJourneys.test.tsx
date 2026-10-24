import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { AuthProvider } from '@/features/auth'
import { routes } from '@/lib/router'
import { useAuthStore } from '@/store/auth.store'
import { fakeBackend } from '@/test/fakeBackend'
import { buildLesson, buildModule, buildProgress } from '@/test/fixtures/modules'
import { buildSimulation } from '@/test/fixtures/simulation'
import { clearMatchMedia, mockReducedMotion } from '@/test/matchMedia'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/lib/firebase', () => ({ auth: {}, db: {} }))
vi.mock('firebase/auth', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  onAuthStateChanged: (await import('@/test/fakeBackend')).onAuthStateChanged,
}))
vi.mock('@/services/auth.service', async () => (await import('@/test/fakeBackend')).fakeAuthService)
vi.mock('@/services/user.service', async () => (await import('@/test/fakeBackend')).fakeUserService)
vi.mock(
  '@/services/progress.service',
  async () => (await import('@/test/fakeBackend')).fakeProgressService
)
vi.mock(
  '@/services/modules.service',
  async () => (await import('@/test/fakeBackend')).fakeModulesService
)
vi.mock(
  '@/services/simulations.service',
  async () => (await import('@/test/fakeBackend')).fakeSimulationsService
)
vi.mock('@/services/quiz.service', async () => (await import('@/test/fakeBackend')).fakeQuizService)
vi.mock('@/content/quizzes', async (importOriginal) => {
  const { buildQuestions } = await import('@/test/fixtures/quiz')
  return { ...(await importOriginal<object>()), getQuizForModule: () => buildQuestions(2) }
})

const PASSWORD = 'senha-segura-123'
const FLOW_TIMEOUT = { timeout: 5_000 }

function seedTrail() {
  fakeBackend.reset({
    modules: [
      buildModule({ id: 'modulo-01', title: 'Primeiro módulo', totalLessons: 2 }),
      buildModule({
        id: 'modulo-02',
        title: 'Segundo módulo',
        order: 2,
        totalLessons: 1,
        hasSimulation: false,
        requiredModuleId: 'modulo-01',
      }),
    ],
    // Trava de leitura zerada: o timer já tem teste próprio em Licao.test.
    lessons: {
      'modulo-01': [
        buildLesson({ id: 'licao-01', title: 'Lição um', order: 1, readingTimeSeconds: 0 }),
        buildLesson({ id: 'licao-02', title: 'Lição dois', order: 2, readingTimeSeconds: 0 }),
      ],
      'modulo-02': [
        buildLesson({ id: 'licao-01', title: 'Lição do segundo', readingTimeSeconds: 0 }),
      ],
    },
    simulations: [buildSimulation({ moduleId: 'modulo-01' })],
  })
}

function existingUserDocument(): UserDocument {
  return {
    displayName: 'Ana Souza',
    email: 'ana@example.com',
    photoURL: null,
    createdAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    onboardingCompleted: true,
    onboardingProfile: {
      securityKnowledge: 'iniciante',
      scamExperience: 'nao',
      motivation: 'curiosidade',
    },
    // Conta que já decidiu sobre a pesquisa, senão o aviso único aparece no lugar das telas.
    researchConsent: {
      accepted: false,
      isAdult: false,
      decidedAt: Timestamp.now(),
      version: 'onboarding-v1',
    },
    completedModules: [],
    completedLessons: [],
    completedSimulations: [],
    totalQuizzesCompleted: 0,
    role: 'user',
  }
}

function signedInUser(): string {
  const uid = fakeBackend.addAccount('ana@example.com', PASSWORD, 'Ana Souza')
  fakeBackend.setUserDocument(uid, existingUserDocument())
  fakeBackend.signInDirectly(uid)
  return uid
}

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
  return router
}

async function answerQuiz(user: ReturnType<typeof userEvent.setup>, optionText: string) {
  await user.click(await screen.findByRole('button', { name: 'Começar quiz' }, FLOW_TIMEOUT))
  for (let index = 0; index < 2; index++) {
    await user.click(screen.getByRole('radio', { name: optionText }))
    await user.click(screen.getByRole('button', { name: 'Confirmar resposta' }))
    await user.click(screen.getByRole('button', { name: /Próxima questão|Ver resultado/ }))
  }
}

// Cada jornada roda o app inteiro; com a instrumentação de cobertura passa fácil dos 5s padrão.
describe('jornadas do usuário', { timeout: 20_000 }, () => {
  beforeEach(() => {
    mockReducedMotion(true)
    seedTrail()
    useAuthStore.setState({ user: null, userDocument: null, isInitializing: true })
  })

  afterEach(() => {
    clearMatchMedia()
  })

  it('cadastro novo passa pelo onboarding e chega no dashboard', async () => {
    const user = userEvent.setup()
    const router = renderApp('/register')

    await user.type(await screen.findByLabelText('Nome', {}, FLOW_TIMEOUT), 'Bruno Lima')
    await user.type(screen.getByLabelText('Email'), 'bruno@example.com')
    await user.type(screen.getByLabelText('Senha'), PASSWORD)
    await user.type(screen.getByLabelText('Confirmar senha'), PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(
      await screen.findByRole('heading', { name: 'Antes de começar' }, FLOW_TIMEOUT)
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/onboarding')

    // Segue sem marcar as caixas: não participa da pesquisa e usa o site igual.
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: 'Iniciante' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: 'Prefiro não responder' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: 'Aprender o básico' }))
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(
      await screen.findByRole('heading', { name: 'Olá, Bruno Lima' }, FLOW_TIMEOUT)
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')

    const uid = fakeBackend.currentUid!
    expect(fakeBackend.getUser(uid)).toMatchObject({
      displayName: 'Bruno Lima',
      role: 'user',
      onboardingCompleted: true,
      onboardingProfile: {
        securityKnowledge: 'iniciante',
        scamExperience: 'prefiro_nao_responder',
        motivation: 'aprender_basico',
      },
      researchConsent: { accepted: false, version: 'onboarding-v1' },
    })
    expect(fakeBackend.getUser(uid)).not.toHaveProperty('riskBaseline')
  })

  it('percorre o módulo inteiro e desbloqueia o seguinte', async () => {
    const uid = signedInUser()
    const user = userEvent.setup()
    const router = renderApp('/modulos/modulo-01')

    await user.click(await screen.findByRole('link', { name: 'Começar módulo' }, FLOW_TIMEOUT))
    await user.click(
      await screen.findByRole('button', { name: 'Concluir e ir para a próxima' }, FLOW_TIMEOUT)
    )
    await user.click(
      await screen.findByRole('button', { name: 'Concluir e voltar ao módulo' }, FLOW_TIMEOUT)
    )
    expect(fakeBackend.getProgress(uid, 'modulo-01')?.lessonsCompleted).toEqual([
      'licao-01',
      'licao-02',
    ])

    await user.click(await screen.findByRole('link', { name: /Quiz do módulo/ }, FLOW_TIMEOUT))
    await answerQuiz(user, 'Alternativa A')
    expect(await screen.findByText(/Aprovado|aprovad/i, {}, FLOW_TIMEOUT)).toBeInTheDocument()
    await waitFor(() => expect(fakeBackend.getProgress(uid, 'modulo-01')?.quizBestScore).toBe(100))
    // Sem a simulação o módulo ainda não fecha.
    expect(fakeBackend.getProgress(uid, 'modulo-01')?.completedAt).toBeNull()

    await router.navigate('/simulacoes/simulacao-modulo-01')
    await user.click(await screen.findByRole('button', { name: 'Começar simulação' }, FLOW_TIMEOUT))
    await user.click(await screen.findByRole('button', { name: 'Opção A' }))
    await user.click(await screen.findByRole('button', { name: 'Opção A' }))
    expect(await screen.findByText('Simulação concluída', {}, FLOW_TIMEOUT)).toBeInTheDocument()

    await waitFor(() =>
      expect(fakeBackend.getProgress(uid, 'modulo-01')?.completedAt).not.toBeNull()
    )
    expect(fakeBackend.getProgress(uid, 'modulo-01')?.simulationCompleted).toBe(true)

    await router.navigate('/trilha')
    const second = await screen.findByTestId('module-card-modulo-02', {}, FLOW_TIMEOUT)
    expect(second.closest('a')).toHaveAttribute('href', '/modulos/modulo-02')
    expect(
      within(screen.getByTestId('module-card-modulo-01')).getByText('Concluído')
    ).toBeInTheDocument()
  })

  it('reprova no quiz, refaz e a melhor nota fica com a segunda tentativa', async () => {
    const uid = signedInUser()
    fakeBackend.setProgress(
      uid,
      'modulo-01',
      buildProgress({ lessonsCompleted: ['licao-01', 'licao-02'] })
    )
    const user = userEvent.setup()
    renderApp('/quiz/modulo-01')

    await answerQuiz(user, 'Alternativa B')
    await waitFor(() => expect(fakeBackend.getProgress(uid, 'modulo-01')?.quizAttempts).toBe(1))
    expect(fakeBackend.getProgress(uid, 'modulo-01')?.quizBestScore).toBe(0)

    await user.click(screen.getByRole('button', { name: 'Refazer quiz' }))
    for (let index = 0; index < 2; index++) {
      await user.click(await screen.findByRole('radio', { name: 'Alternativa A' }))
      await user.click(screen.getByRole('button', { name: 'Confirmar resposta' }))
      await user.click(screen.getByRole('button', { name: /Próxima questão|Ver resultado/ }))
    }

    await waitFor(() => expect(fakeBackend.getProgress(uid, 'modulo-01')?.quizAttempts).toBe(2))
    expect(fakeBackend.getProgress(uid, 'modulo-01')?.quizBestScore).toBe(100)
    expect(fakeBackend.quizResults.map((result) => [result.score, result.passed])).toEqual([
      [0, false],
      [100, true],
    ])
  })

  it('sai, entra de novo e o progresso continua lá', async () => {
    const uid = signedInUser()
    fakeBackend.setProgress(uid, 'modulo-01', buildProgress({ lessonsCompleted: ['licao-01'] }))
    const user = userEvent.setup()
    const router = renderApp('/trilha')

    const card = await screen.findByTestId('module-card-modulo-01', {}, FLOW_TIMEOUT)
    expect(within(card).getByText('Em andamento')).toBeInTheDocument()

    // O Sair do menu lateral também está no DOM; o jsdom não aplica o md:hidden que esconde um dos dois.
    const [siteHeader] = screen.getAllByRole('banner')
    await user.click(within(siteHeader as HTMLElement).getByRole('button', { name: 'Sair' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.search).toBe('?redirect=%2Ftrilha')

    await user.type(await screen.findByLabelText('Email', {}, FLOW_TIMEOUT), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    const cardAgain = await screen.findByTestId('module-card-modulo-01', {}, FLOW_TIMEOUT)
    expect(router.state.location.pathname).toBe('/trilha')
    expect(within(cardAgain).getByText('Em andamento')).toBeInTheDocument()
    expect(fakeBackend.getProgress(uid, 'modulo-01')?.lessonsCompleted).toEqual(['licao-01'])
    expect(fakeBackend.getUser(uid)?.onboardingCompleted).toBe(true)
  })
})
