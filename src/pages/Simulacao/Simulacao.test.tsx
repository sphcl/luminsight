import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Simulacao } from './Simulacao'
import { useAuth } from '@/hooks/useAuth'
import { getModules } from '@/services/modules.service'
import {
  getUserProgress,
  markModuleCompleted,
  markSimulationCompleted,
} from '@/services/progress.service'
import { getSimulationById } from '@/services/simulations.service'
import { TEST_USER, buildModule, buildProgress, buildTrail } from '@/test/fixtures/modules'
import { buildSimulation } from '@/test/fixtures/simulation'
import { clearMatchMedia, mockReducedMotion } from '@/test/matchMedia'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn() }))
vi.mock('@/services/simulations.service', () => ({ getSimulationById: vi.fn() }))
vi.mock('@/services/progress.service', () => ({
  getUserProgress: vi.fn(),
  markSimulationCompleted: vi.fn(),
  markModuleCompleted: vi.fn(),
}))

function renderSimulacao(simulationId = 'simulacao-01') {
  return render(
    <MemoryRouter initialEntries={[`/simulacoes/${simulationId}`]}>
      <Routes>
        <Route path="/simulacoes" element={<p>Lista de simulações</p>} />
        <Route path="/simulacoes/:simulationId" element={<Simulacao />} />
      </Routes>
    </MemoryRouter>
  )
}

async function playToEnd(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Começar simulação' }))
  await user.click(screen.getByRole('button', { name: 'Opção A' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('button', { name: 'Opção B' }))
  await user.click(screen.getByRole('button', { name: 'Ver resultado' }))
}

describe('Simulacao', () => {
  beforeEach(() => {
    mockReducedMotion(true)
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
    vi.mocked(getModules).mockResolvedValue(buildTrail())
    vi.mocked(getUserProgress).mockResolvedValue({})
    vi.mocked(getSimulationById).mockResolvedValue(buildSimulation({ moduleId: 'modulo-01' }))
    vi.mocked(markSimulationCompleted).mockResolvedValue()
    vi.mocked(markModuleCompleted).mockResolvedValue()
  })

  afterEach(() => {
    clearMatchMedia()
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('redireciona para a lista no acesso direto a simulação de módulo bloqueado', async () => {
    vi.mocked(getSimulationById).mockResolvedValue(buildSimulation({ moduleId: 'modulo-02' }))
    renderSimulacao()

    expect(await screen.findByText('Lista de simulações')).toBeInTheDocument()
  })

  it('mostra mensagem clara quando a simulação não existe', async () => {
    vi.mocked(getSimulationById).mockResolvedValue(null)
    renderSimulacao('inexistente')

    expect(await screen.findByText('Simulação não encontrada')).toBeInTheDocument()
  })

  it('abre com o cenário e o aviso de simulação', async () => {
    renderSimulacao()

    expect(await screen.findByText('Isto é uma simulação.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Simulação de teste' })).toBeInTheDocument()
    expect(screen.getByRole('note', { name: 'Aviso de simulação' })).toBeInTheDocument()
  })

  it('chama markSimulationCompleted ao concluir e mostra a revisão', async () => {
    const user = userEvent.setup()
    renderSimulacao()

    await playToEnd(user)

    expect(await screen.findByText('1/2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Revisão das decisões' })).toBeInTheDocument()
    expect(markSimulationCompleted).toHaveBeenCalledWith(TEST_USER.uid, 'modulo-01')
    expect(markModuleCompleted).not.toHaveBeenCalled()
  })

  it('marca o módulo como concluído quando a simulação era a última etapa', async () => {
    const [first, ...rest] = buildTrail()
    vi.mocked(getModules).mockResolvedValue([buildModule({ ...first, totalLessons: 1 }), ...rest])
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ lessonsCompleted: ['licao-01'], quizBestScore: 90 }),
    })
    const user = userEvent.setup()
    renderSimulacao()

    await playToEnd(user)

    expect(await screen.findByText('1/2')).toBeInTheDocument()
    expect(markSimulationCompleted).toHaveBeenCalledOnce()
    expect(markModuleCompleted).toHaveBeenCalledWith(TEST_USER.uid, 'modulo-01')
  })

  it('avisa quando falha ao salvar a conclusão', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(markSimulationCompleted).mockRejectedValue(new Error('permission-denied'))
    const user = userEvent.setup()
    renderSimulacao()

    await playToEnd(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'progresso pode não ter sido registrado'
    )
  })
})
