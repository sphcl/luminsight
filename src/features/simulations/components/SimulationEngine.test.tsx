import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SimulationEngine } from './SimulationEngine'
import { buildSimulation } from '@/test/fixtures/simulation'
import { clearMatchMedia, mockReducedMotion } from '@/test/matchMedia'
import type { SimulationFormat } from '@/types/simulation.types'

function renderEngine(format: SimulationFormat, onFinish = vi.fn()) {
  const simulation = buildSimulation({ format })
  return render(<SimulationEngine simulation={simulation} onFinish={onFinish} />)
}

describe('SimulationEngine', () => {
  beforeEach(() => {
    mockReducedMotion(true)
  })

  afterEach(() => {
    clearMatchMedia()
    vi.useRealTimers()
  })

  it.each<[SimulationFormat, string]>([
    ['chat', 'Conversa simulada com Contato Fictício'],
    ['email', 'Caixa de entrada simulada'],
    ['call', 'Ligação simulada com Contato Fictício'],
  ])('renderiza a interface %s com o indicador de simulação', (format, label) => {
    renderEngine(format)

    expect(screen.getByRole('region', { name: label })).toBeInTheDocument()
    expect(screen.getByRole('note', { name: 'Aviso de simulação' })).toHaveTextContent(
      'Nada aqui é uma comunicação real'
    )
  })

  it('chat mostra o nome do contato junto das mensagens do atacante', () => {
    renderEngine('chat')

    const log = screen.getByRole('log')
    expect(within(log).getByText('Mensagem 1')).toBeInTheDocument()
    expect(within(log).getByText('Contato Fictício')).toBeInTheDocument()
  })

  it('email mostra remetente com endereço completo e assunto', () => {
    renderEngine('email')

    expect(screen.getByRole('heading', { name: 'Assunto 1' })).toBeInTheDocument()
    expect(screen.getAllByText(/contato@golpe\.example/).length).toBeGreaterThan(0)
  })

  it('ligação mostra o timer correndo', () => {
    vi.useFakeTimers()
    renderEngine('call')

    expect(screen.getByLabelText('Duração da chamada')).toHaveTextContent('0:00')
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByLabelText('Duração da chamada')).toHaveTextContent('0:03')
  })

  it('mostra o feedback e esconde as opções depois de decidir', async () => {
    const user = userEvent.setup()
    renderEngine('chat')

    await user.click(screen.getByRole('button', { name: 'Opção B' }))

    expect(screen.getByRole('status')).toHaveTextContent('Feedback B')
    expect(screen.getByRole('status')).toHaveTextContent('Melhor escolha: Opção A')
    expect(screen.queryByRole('button', { name: 'Opção A' })).not.toBeInTheDocument()
  })

  it('percorre todas as cenas e chama onFinish com o resumo', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    renderEngine('chat', onFinish)

    await user.click(screen.getByRole('button', { name: 'Opção A' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('Cena 2 de 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Opção A' }))
    await user.click(screen.getByRole('button', { name: 'Ver resultado' }))

    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ correctDecisions: 2, totalDecisions: 2, isPerfect: true })
    )
  })

  it('sem reduced motion, as opções só aparecem depois das mensagens', () => {
    clearMatchMedia()
    vi.useFakeTimers()
    renderEngine('chat')

    expect(screen.queryByRole('button', { name: 'Opção A' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(0))
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('button', { name: 'Opção A' })).toBeInTheDocument()
  })
})
