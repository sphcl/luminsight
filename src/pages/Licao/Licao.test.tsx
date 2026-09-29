import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Licao } from './Licao'
import { useAuth } from '@/hooks/useAuth'
import { getLessons, getModules } from '@/services/modules.service'
import { getUserProgress, markLessonCompleted } from '@/services/progress.service'
import { TEST_USER, buildLesson, buildTrail } from '@/test/fixtures/modules'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn(), getLessons: vi.fn() }))
vi.mock('@/services/progress.service', () => ({
  getUserProgress: vi.fn(),
  markLessonCompleted: vi.fn(),
}))

// O intervalo real do timer dispara a cada 1s, então dou folga pra pelo menos um tick.
const TICK_TIMEOUT = 3_000

function renderLicao(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/trilha" element={<p>Tela da trilha</p>} />
        <Route path="/modulos/:moduleId" element={<p>Página do módulo</p>} />
        <Route path="/modulos/:moduleId/licoes/:lessonId" element={<Licao />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Licao', () => {
  beforeEach(() => {
    // Finjo só o Date: com setInterval falso o effect do timer às vezes nem registrava antes de eu avançar o relógio.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
    vi.mocked(getModules).mockResolvedValue(buildTrail())
    vi.mocked(getUserProgress).mockResolvedValue({})
    vi.mocked(getLessons).mockResolvedValue([
      buildLesson({ id: 'licao-01', title: 'Primeira lição', order: 1, readingTimeSeconds: 240 }),
      buildLesson({ id: 'licao-02', title: 'Segunda lição', order: 2, readingTimeSeconds: 240 }),
    ])
    vi.mocked(markLessonCompleted).mockResolvedValue()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renderiza o conteúdo da lição', async () => {
    renderLicao('/modulos/modulo-01/licoes/licao-01')

    expect(await screen.findByRole('heading', { name: 'Primeira lição' })).toBeInTheDocument()
    expect(screen.getByText('Conteúdo da lição')).toBeInTheDocument()
  })

  it('desabilita o botão de concluir antes do tempo mínimo de leitura', async () => {
    renderLicao('/modulos/modulo-01/licoes/licao-01')

    const button = await screen.findByRole('button', { name: 'Concluir e ir para a próxima' })
    expect(button).toBeDisabled()
    expect(screen.getByText('4:00')).toBeInTheDocument()

    vi.advanceTimersByTime(239_000)
    expect(await screen.findByText('0:01', {}, { timeout: TICK_TIMEOUT })).toBeInTheDocument()
    expect(button).toBeDisabled()

    vi.advanceTimersByTime(1_000)
    await waitFor(() => expect(button).toBeEnabled(), { timeout: TICK_TIMEOUT })
  })

  it('chama markLessonCompleted ao concluir e navega para a próxima lição', async () => {
    renderLicao('/modulos/modulo-01/licoes/licao-01')

    const button = await screen.findByRole('button', { name: 'Concluir e ir para a próxima' })
    vi.advanceTimersByTime(240_000)
    await waitFor(() => expect(button).toBeEnabled(), { timeout: TICK_TIMEOUT })
    fireEvent.click(button)

    expect(await screen.findByRole('heading', { name: 'Segunda lição' })).toBeInTheDocument()
    expect(markLessonCompleted).toHaveBeenCalledWith(TEST_USER.uid, 'modulo-01', 'licao-01')
  })

  it('volta para a página do módulo ao concluir a última lição', async () => {
    renderLicao('/modulos/modulo-01/licoes/licao-02')

    const button = await screen.findByRole('button', { name: 'Concluir e voltar ao módulo' })
    vi.advanceTimersByTime(240_000)
    await waitFor(() => expect(button).toBeEnabled(), { timeout: TICK_TIMEOUT })
    fireEvent.click(button)

    expect(await screen.findByText('Página do módulo')).toBeInTheDocument()
    expect(markLessonCompleted).toHaveBeenCalledWith(TEST_USER.uid, 'modulo-01', 'licao-02')
  })

  it('redireciona para a trilha quando o módulo da lição está bloqueado', async () => {
    renderLicao('/modulos/modulo-02/licoes/licao-01')

    expect(await screen.findByText('Tela da trilha')).toBeInTheDocument()
  })

  it('mostra mensagem com link de volta para lição inexistente', async () => {
    renderLicao('/modulos/modulo-01/licoes/licao-99')

    expect(await screen.findByText('Lição não encontrada')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para o módulo' })).toHaveAttribute(
      'href',
      '/modulos/modulo-01'
    )
  })
})
