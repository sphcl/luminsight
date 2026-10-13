import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { useAuth } from '@/hooks/useAuth'
import { getLessons, getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { getSimulations } from '@/services/simulations.service'
import { TEST_USER, buildLesson, buildProgress, buildTrail } from '@/test/fixtures/modules'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn(), getLessons: vi.fn() }))
vi.mock('@/services/progress.service', () => ({ getUserProgress: vi.fn() }))
vi.mock('@/services/simulations.service', () => ({ getSimulations: vi.fn() }))

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument: { displayName: 'Ana Maria' } as UserDocument,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
    vi.mocked(getModules).mockResolvedValue(buildTrail())
    vi.mocked(getUserProgress).mockResolvedValue({})
    vi.mocked(getLessons).mockResolvedValue([
      buildLesson({ id: 'licao-01', order: 1 }),
      buildLesson({ id: 'licao-02', order: 2 }),
    ])
    vi.mocked(getSimulations).mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('cumprimenta pelo nome e mostra skeleton enquanto carrega', () => {
    vi.mocked(getModules).mockReturnValue(new Promise(() => {}))
    renderDashboard()

    expect(screen.getByRole('heading', { name: 'Olá, Ana Maria' })).toBeInTheDocument()
    expect(screen.getByLabelText('Carregando dashboard')).toHaveAttribute('aria-busy', 'true')
  })

  it('mostra o estado inicial quando não há progresso', async () => {
    renderDashboard()

    const welcome = await screen.findByTestId('dashboard-welcome')
    expect(within(welcome).getByRole('link', { name: 'Começar pelo módulo 1' })).toHaveAttribute(
      'href',
      '/modulos/modulo-01'
    )
    expect(screen.queryByTestId('overall-progress')).not.toBeInTheDocument()
    expect(screen.queryByText('Lições concluídas')).not.toBeInTheDocument()
  })

  it('calcula o progresso geral e o resumo', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        quizBestScore: 90,
        quizAttempts: 1,
        simulationCompleted: true,
      }),
      'modulo-02': buildProgress({ lessonsCompleted: ['licao-01'] }),
    })
    renderDashboard()

    // 5 de 20 etapas da trilha
    expect(await screen.findByTestId('overall-progress')).toHaveTextContent('25%')
    const stats = screen.getAllByRole('definition').map((item) => item.textContent)
    expect(stats).toEqual(['1', '3', '1', '1'])
  })

  it('leva o card de continuar pra próxima lição pendente', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ lessonsCompleted: ['licao-01'] }),
    })
    renderDashboard()

    expect(await screen.findByRole('link', { name: 'Continuar lição' })).toHaveAttribute(
      'href',
      '/modulos/modulo-01/licoes/licao-02'
    )
    expect(getLessons).toHaveBeenCalledWith('modulo-01')
  })

  it('lista os módulos com o status de cada um', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ lessonsCompleted: ['licao-01'] }),
    })
    renderDashboard()

    const first = await screen.findByTestId('dashboard-module-modulo-01')
    const second = screen.getByTestId('dashboard-module-modulo-02')
    expect(within(first).getByText('Em andamento')).toBeInTheDocument()
    expect(within(second).getByText('Bloqueado')).toBeInTheDocument()
    expect(within(second).queryByRole('link')).not.toBeInTheDocument()
  })
})
