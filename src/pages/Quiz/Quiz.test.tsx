import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Quiz } from './Quiz'
import { getQuizForModule } from '@/content/quizzes'
import { useAuth } from '@/hooks/useAuth'
import { getLessons, getModules } from '@/services/modules.service'
import { getUserProgress, markModuleCompleted, saveQuizAttempt } from '@/services/progress.service'
import { saveQuizResult } from '@/services/quiz.service'
import {
  TEST_USER,
  buildLesson,
  buildModule,
  buildProgress,
  buildTrail,
} from '@/test/fixtures/modules'
import { buildQuestions } from '@/test/fixtures/quiz'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/content/quizzes', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getQuizForModule: vi.fn(),
}))
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn(), getLessons: vi.fn() }))
vi.mock('@/services/progress.service', () => ({
  getUserProgress: vi.fn(),
  saveQuizAttempt: vi.fn(),
  markModuleCompleted: vi.fn(),
}))
vi.mock('@/services/quiz.service', () => ({ saveQuizResult: vi.fn() }))
vi.mock('@/services/research.service', () => ({ saveTrailFeedback: vi.fn() }))

const lessons = [buildLesson({ id: 'licao-01' }), buildLesson({ id: 'licao-02', order: 2 })]

function renderQuiz(moduleId = 'modulo-01') {
  return render(
    <MemoryRouter initialEntries={[`/quiz/${moduleId}`]}>
      <Routes>
        <Route path="/trilha" element={<p>Tela da trilha</p>} />
        <Route path="/modulos/:moduleId" element={<p>Página do módulo</p>} />
        <Route path="/quiz/:moduleId" element={<Quiz />} />
      </Routes>
    </MemoryRouter>
  )
}

async function answerAll(user: ReturnType<typeof userEvent.setup>, optionName: string) {
  await user.click(await screen.findByRole('button', { name: 'Começar quiz' }))
  for (let index = 0; index < 2; index++) {
    await user.click(screen.getByRole('radio', { name: optionName }))
    await user.click(screen.getByRole('button', { name: 'Confirmar resposta' }))
    await user.click(screen.getByRole('button', { name: /Próxima questão|Ver resultado/ }))
  }
}

describe('Quiz', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
    const [first, ...rest] = buildTrail()
    vi.mocked(getModules).mockResolvedValue([
      buildModule({ ...first, hasSimulation: false }),
      ...rest,
    ])
    vi.mocked(getLessons).mockResolvedValue(lessons)
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ lessonsCompleted: ['licao-01', 'licao-02'] }),
    })
    vi.mocked(getQuizForModule).mockReturnValue(buildQuestions(2))
    vi.mocked(saveQuizResult).mockResolvedValue()
    vi.mocked(saveQuizAttempt).mockResolvedValue()
    vi.mocked(markModuleCompleted).mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('redireciona para o módulo no acesso direto sem as lições concluídas', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ lessonsCompleted: ['licao-01'] }),
    })
    renderQuiz()

    expect(await screen.findByText('Página do módulo')).toBeInTheDocument()
  })

  it('redireciona para o módulo quando o módulo nem foi iniciado', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({})
    renderQuiz()

    expect(await screen.findByText('Página do módulo')).toBeInTheDocument()
  })

  it('redireciona para a trilha quando o módulo está bloqueado', async () => {
    renderQuiz('modulo-02')

    expect(await screen.findByText('Tela da trilha')).toBeInTheDocument()
  })

  it('mostra a tela de abertura com número de questões, nota mínima e aviso', async () => {
    renderQuiz()

    expect(await screen.findByText('2 questões')).toBeInTheDocument()
    expect(screen.getByText('Nota mínima para aprovação: 70')).toBeInTheDocument()
    expect(screen.getByText(/não dá para alterá-la/)).toBeInTheDocument()
  })

  it('mostra mensagem clara quando o módulo não tem quiz', async () => {
    vi.mocked(getQuizForModule).mockReturnValue(null)
    renderQuiz()

    expect(await screen.findByText('Quiz indisponível')).toBeInTheDocument()
  })

  it('salva resultado e tentativa ao finalizar e marca o módulo como concluído', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await answerAll(user, 'Alternativa A')

    expect(await screen.findByText('Aprovado')).toBeInTheDocument()
    expect(saveQuizResult).toHaveBeenCalledWith(
      expect.objectContaining({ userId: TEST_USER.uid, moduleId: 'modulo-01', score: 100 })
    )
    expect(saveQuizAttempt).toHaveBeenCalledWith(TEST_USER.uid, 'modulo-01', 100)
    expect(markModuleCompleted).toHaveBeenCalledWith(TEST_USER.uid, 'modulo-01')
  })

  it('mostra o aviso de módulo concluído só quando a conclusão acontece agora', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await answerAll(user, 'Alternativa A')

    expect(await screen.findByText('Módulo concluído')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Refazer quiz' }))
    expect(screen.queryByText('Módulo concluído')).not.toBeInTheDocument()
  })

  describe('encerramento da trilha', () => {
    function setUpFinalModule(accepted: boolean | null) {
      vi.mocked(useAuth).mockReturnValue({
        user: TEST_USER,
        userDocument: (accepted === null
          ? null
          : { researchConsent: { accepted } }) as UserDocument | null,
        isInitializing: false,
        isAuthenticated: true,
        hasCompletedOnboarding: true,
      })
      const trail = buildTrail().map((module) =>
        module.id === 'modulo-05' ? buildModule({ ...module, hasSimulation: false }) : module
      )
      vi.mocked(getModules).mockResolvedValue(trail)
      const done = buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        quizBestScore: 100,
        quizAttempts: 1,
        simulationCompleted: true,
      })
      vi.mocked(getUserProgress).mockResolvedValue({
        'modulo-01': done,
        'modulo-02': done,
        'modulo-03': done,
        'modulo-04': done,
        'modulo-05': buildProgress({ lessonsCompleted: ['licao-01', 'licao-02'] }),
      })
    }

    it('aparece quando quem participa conclui o módulo final, e dá pra pular', async () => {
      setUpFinalModule(true)
      const user = userEvent.setup()
      renderQuiz('modulo-05')

      await answerAll(user, 'Alternativa A')

      expect(await screen.findByText('Antes de ir, quatro perguntas')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Pular' }))
      expect(screen.queryByText('Antes de ir, quatro perguntas')).not.toBeInTheDocument()
      expect(screen.getByText('Módulo concluído')).toBeInTheDocument()
    })

    it('não aparece para quem não participa da pesquisa', async () => {
      setUpFinalModule(false)
      const user = userEvent.setup()
      renderQuiz('modulo-05')

      await answerAll(user, 'Alternativa A')

      expect(await screen.findByText('Módulo concluído')).toBeInTheDocument()
      expect(screen.queryByText('Antes de ir, quatro perguntas')).not.toBeInTheDocument()
    })

    it('não aparece ao concluir um módulo que não é o final', async () => {
      setUpFinalModule(true)
      vi.mocked(getUserProgress).mockResolvedValue({
        'modulo-01': buildProgress({
          lessonsCompleted: ['licao-01', 'licao-02'],
          simulationCompleted: true,
        }),
      })
      const user = userEvent.setup()
      renderQuiz('modulo-01')

      await answerAll(user, 'Alternativa A')

      expect(await screen.findByText('Módulo concluído')).toBeInTheDocument()
      expect(screen.queryByText('Antes de ir, quatro perguntas')).not.toBeInTheDocument()
    })
  })

  it('não marca o módulo como concluído quando reprova', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await answerAll(user, 'Alternativa B')

    expect(await screen.findByText('Reprovado')).toBeInTheDocument()
    expect(saveQuizResult).toHaveBeenCalledOnce()
    expect(markModuleCompleted).not.toHaveBeenCalled()
    expect(screen.queryByText('Módulo concluído')).not.toBeInTheDocument()
  })

  it('mostra a nota com aviso quando falha ao salvar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(saveQuizResult).mockRejectedValue(new Error('permission-denied'))
    const user = userEvent.setup()
    renderQuiz()

    await answerAll(user, 'Alternativa A')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'progresso pode não ter sido registrado'
    )
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('permite refazer o quiz', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await answerAll(user, 'Alternativa B')
    await user.click(await screen.findByRole('button', { name: 'Refazer quiz' }))

    expect(screen.getByText('Questão 1 de 2')).toBeInTheDocument()
  })

  it('dá pra fazer o quiz inteiro só com teclado sem perder o foco', async () => {
    const user = userEvent.setup()
    renderQuiz()

    const start = await screen.findByRole('button', { name: 'Começar quiz' })
    start.focus()
    await user.keyboard('{Enter}')

    for (let index = 0; index < 2; index++) {
      await user.tab()
      expect(screen.getAllByRole('radio')[0]).toHaveFocus()
      await user.keyboard(' ')
      await user.tab()
      expect(screen.getByRole('button', { name: 'Confirmar resposta' })).toHaveFocus()
      await user.keyboard('{Enter}')

      // Depois de confirmar, o foco vai pro próximo passo em vez de cair no body.
      const next = screen.getByRole('button', { name: /Próxima questão|Ver resultado/ })
      expect(next).toHaveFocus()
      await user.keyboard('{Enter}')
    }

    expect(await screen.findByText('Aprovado')).toBeInTheDocument()
  })

  it('o quiz do módulo 5 avisa que é final e revisa a trilha inteira', async () => {
    vi.mocked(getModules).mockResolvedValue([
      buildModule({ id: 'modulo-05', title: 'Como se proteger', order: 5, hasSimulation: false }),
    ])
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-05': buildProgress({ lessonsCompleted: ['licao-01', 'licao-02'] }),
    })
    renderQuiz('modulo-05')

    expect(
      await screen.findByRole('heading', { name: 'Quiz final: Como se proteger' })
    ).toBeInTheDocument()
    expect(screen.getByText(/revisa a trilha inteira/)).toBeInTheDocument()
  })

  it('os outros módulos continuam com o quiz comum, sem o aviso de final', async () => {
    renderQuiz()

    expect(await screen.findByRole('heading', { name: /^Quiz: / })).toBeInTheDocument()
    expect(screen.queryByText(/revisa a trilha inteira/)).not.toBeInTheDocument()
  })
})
