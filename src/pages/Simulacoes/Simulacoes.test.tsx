import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Simulacoes } from './Simulacoes'
import { useAuth } from '@/hooks/useAuth'
import { getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { getSimulations } from '@/services/simulations.service'
import { TEST_USER, buildProgress, buildTrail } from '@/test/fixtures/modules'
import { buildSimulation } from '@/test/fixtures/simulation'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn() }))
vi.mock('@/services/simulations.service', () => ({ getSimulations: vi.fn() }))
vi.mock('@/services/progress.service', () => ({ getUserProgress: vi.fn() }))

describe('Simulacoes', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
    vi.mocked(getModules).mockResolvedValue(buildTrail())
    vi.mocked(getSimulations).mockResolvedValue([
      buildSimulation({ id: 'simulacao-02', moduleId: 'modulo-02', title: 'Segunda' }),
      buildSimulation({ id: 'simulacao-01', moduleId: 'modulo-01', title: 'Primeira' }),
      buildSimulation({ id: 'simulacao-x', moduleId: 'modulo-inativo', title: 'Sem módulo' }),
    ])
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ simulationCompleted: true }),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('lista em ordem de módulo marcando concluída e bloqueada', async () => {
    render(
      <MemoryRouter>
        <Simulacoes />
      </MemoryRouter>
    )

    const first = await screen.findByTestId('simulation-card-simulacao-01')
    const second = screen.getByTestId('simulation-card-simulacao-02')

    expect(within(first).getByText('Concluída')).toBeInTheDocument()
    expect(first.closest('a')).toHaveAttribute('href', '/simulacoes/simulacao-01')
    expect(within(second).getByText('Bloqueada')).toBeInTheDocument()
    expect(second).toHaveAttribute('aria-disabled', 'true')
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByText('Sem módulo')).not.toBeInTheDocument()
  })
})
