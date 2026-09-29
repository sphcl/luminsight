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

vi.mock('@/hooks/useAuth')
vi.mock('@/content/quizzes', () => ({ getQuizForModule: vi.fn() }))
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn(), getLessons: vi.fn() }))
vi.mock('@/services/progress.service', () => ({
  getUserProgress: vi.fn(),
  saveQuizAttempt: vi.fn(),
  markModuleCompleted: vi.fn(),
}))
vi.mock('@/services/quiz.service', () => ({ saveQuizResult: vi.fn() }))

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

  it('não marca o módulo como concluído quando reprova', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await answerAll(user, 'Alternativa B')

    expect(await screen.findByText('Reprovado')).toBeInTheDocument()
    expect(saveQuizResult).toHaveBeenCalledOnce()
    expect(markModuleCompleted).not.toHaveBeenCalled()
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
})
