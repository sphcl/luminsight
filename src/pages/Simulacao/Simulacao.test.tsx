import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import { Simulacao } from './Simulacao'
import { useAuth } from '@/hooks/useAuth'
import { getModules } from '@/services/modules.service'
import {
  getUserProgress,
  markModuleCompleted,
  markSimulationCompleted,
} from '@/services/progress.service'
import { getSimulationById } from '@/services/simulations.service'
import { saveSimulationResult } from '@/services/research.service'
import { TEST_USER, buildModule, buildProgress, buildTrail } from '@/test/fixtures/modules'
import { buildSimulation } from '@/test/fixtures/simulation'
import { clearMatchMedia, mockReducedMotion } from '@/test/matchMedia'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn() }))
vi.mock('@/services/simulations.service', () => ({ getSimulationById: vi.fn() }))
vi.mock('@/services/research.service', () => ({ saveSimulationResult: vi.fn() }))
vi.mock('@/services/progress.service', () => ({
  getUserProgress: vi.fn(),
  markSimulationCompleted: vi.fn(),
  markModuleCompleted: vi.fn(),
}))

function renderSimulacao(simulationId = 'simulacao-modulo-01') {
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
  // Conversa: a cena seguinte chega sozinha depois da escolha, sem botão de continuar.
  await user.click(screen.getByRole('button', { name: 'Opção A' }))
  await user.click(await screen.findByRole('button', { name: 'Opção B' }))
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

  it('quem participa da pesquisa tem o caminho percorrido gravado', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument: { researchConsent: { accepted: true } } as UserDocument,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
    vi.mocked(saveSimulationResult).mockResolvedValue()
    const user = userEvent.setup()
    renderSimulacao()

    await playToEnd(user)

    await vi.waitFor(() => expect(saveSimulationResult).toHaveBeenCalledOnce())
    expect(saveSimulationResult).toHaveBeenCalledWith({
      userId: TEST_USER.uid,
      simulationId: 'simulacao-modulo-01',
      moduleId: 'modulo-01',
      totalDecisions: 2,
      correctDecisions: 1,
      timeSpentSeconds: expect.any(Number) as number,
      decisions: [
        { sceneId: 'cena-01', selectedOptionId: 'a', isCorrect: true },
        { sceneId: 'cena-02', selectedOptionId: 'b', isCorrect: false },
      ],
    })
  })

  it('quem não participa não tem nada gravado além do progresso', async () => {
    const user = userEvent.setup()
    renderSimulacao()

    await playToEnd(user)

    await vi.waitFor(() => expect(markSimulationCompleted).toHaveBeenCalled())
    expect(saveSimulationResult).not.toHaveBeenCalled()
  })

  describe('quando a gravação da pesquisa falha', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: TEST_USER,
        userDocument: { researchConsent: { accepted: true } } as UserDocument,
        isInitializing: false,
        isAuthenticated: true,
        hasCompletedOnboarding: true,
      })
    })

    it('tenta de novo uma vez e grava sem a pessoa perceber', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(saveSimulationResult)
        .mockRejectedValueOnce(new Error('unavailable'))
        .mockResolvedValueOnce()
      const user = userEvent.setup()
      renderSimulacao()

      await playToEnd(user)

      await vi.waitFor(() => expect(saveSimulationResult).toHaveBeenCalledTimes(2))
      expect(consoleError).not.toHaveBeenCalledWith(
        expect.stringContaining('[pesquisa]'),
        expect.anything()
      )
    })

    it('na segunda falha registra no console sem dado pessoal e não mostra erro na tela', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(saveSimulationResult).mockRejectedValue(new FirebaseError('permission-denied', 'x'))
      const user = userEvent.setup()
      renderSimulacao()

      await playToEnd(user)

      await vi.waitFor(() =>
        expect(consoleError).toHaveBeenCalledWith(
          '[pesquisa] simulationResults não gravado depois de 2 tentativas',
          { simulationId: 'simulacao-modulo-01', code: 'permission-denied' }
        )
      )
      expect(saveSimulationResult).toHaveBeenCalledTimes(2)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
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
