import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SimulationEngine } from './SimulationEngine'
import { buildBranchingSimulation, buildSimulation } from '@/test/fixtures/simulation'
import { clearMatchMedia, mockReducedMotion } from '@/test/matchMedia'
import type { SimulationFormat } from '@/types/simulation.types'

function renderConversation(
  format: SimulationFormat = 'chat',
  simulation = buildSimulation({ format })
) {
  const onFinish = vi.fn()
  render(<SimulationEngine simulation={{ ...simulation, format }} onFinish={onFinish} />)
  return { onFinish, log: () => screen.getByRole('log') }
}

describe.each<SimulationFormat>(['chat', 'call'])('conversa (%s)', (format) => {
  beforeEach(() => {
    mockReducedMotion(true)
  })

  afterEach(() => {
    clearMatchMedia()
    vi.useRealTimers()
  })

  it('a opção escolhida vira mensagem enviada e continua na conversa', async () => {
    const user = userEvent.setup()
    const { log } = renderConversation(format)

    await user.click(screen.getByRole('button', { name: 'Opção A' }))

    expect(within(log()).getByText('Opção A')).toBeInTheDocument()
    expect(within(log()).getByText('Mensagem 2')).toBeInTheDocument()
    expect(within(log()).getByText('Mensagem 1')).toBeInTheDocument()
  })

  it('a resposta do golpista segue o nextSceneId do caminho escolhido', async () => {
    const user = userEvent.setup()
    const { log } = renderConversation(format, buildBranchingSimulation())

    await user.click(screen.getByRole('button', { name: 'Opção B' }))

    expect(within(log()).getByText('Mensagem 3')).toBeInTheDocument()
    expect(within(log()).queryByText('Mensagem 2')).not.toBeInTheDocument()
  })

  it('errar não remove nem reescreve o histórico', async () => {
    const user = userEvent.setup()
    const { log, onFinish } = renderConversation(format)

    await user.click(screen.getByRole('button', { name: 'Opção B' }))
    await user.click(await screen.findByRole('button', { name: 'Opção A' }))

    const entries = within(log())
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    const firstReply = entries.findIndex((text) => text?.includes('Opção B'))
    const secondReply = entries.findIndex(
      (text, index) => index > firstReply && text?.includes('Opção A')
    )

    expect(firstReply).toBeGreaterThan(-1)
    expect(secondReply).toBeGreaterThan(firstReply)
    expect(within(log()).getByRole('note', { name: /favorecia o golpe/ })).toBeInTheDocument()
    expect(within(log()).getByRole('note', { name: /Boa decisão/ })).toBeInTheDocument()
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ correctDecisions: 1, totalDecisions: 2 })
    )
  })

  it('o cartão de feedback é distinto dos balões na árvore de acessibilidade', async () => {
    const user = userEvent.setup()
    const { log } = renderConversation(format)

    await user.click(screen.getByRole('button', { name: 'Opção B' }))

    const card = within(log()).getByRole('note', {
      name: 'Feedback do LumInsight: Essa decisão favorecia o golpe.',
    })
    expect(card).toHaveTextContent('Feedback B')
    expect(card).toHaveTextContent('Melhor escolha: Opção A')
    // As falas do golpista e as suas não são "note": só o cartão do LumInsight é.
    expect(within(card).queryByText('Mensagem 1')).not.toBeInTheDocument()
    expect(within(log()).getAllByRole('note')).toHaveLength(1)
  })

  it('no fim a conversa inteira fica na tela, sem opções', async () => {
    const user = userEvent.setup()
    const { log } = renderConversation(format)

    await user.click(screen.getByRole('button', { name: 'Opção A' }))
    await user.click(await screen.findByRole('button', { name: 'Opção A' }))

    expect(screen.getByText('Conversa encerrada')).toBeInTheDocument()
    expect(within(log()).getByText('Mensagem 1')).toBeInTheDocument()
    expect(within(log()).getByText('Mensagem 2')).toBeInTheDocument()
    expect(within(log()).getAllByRole('note')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /Opção/ })).not.toBeInTheDocument()
  })

  it('o log anuncia mensagem nova sem interromper e o aviso de simulação fica fora dele, fixo', async () => {
    const user = userEvent.setup()
    const { log } = renderConversation(format)

    await user.click(screen.getByRole('button', { name: 'Opção A' }))
    await user.click(await screen.findByRole('button', { name: 'Opção A' }))

    expect(log()).toHaveAttribute('aria-live', 'polite')
    const banner = screen.getByRole('note', { name: 'Aviso de simulação' })
    expect(log()).not.toContainElement(banner)
    expect(banner).toHaveClass('fixed', 'bottom-0')
    expect(banner).toHaveTextContent('Nada aqui é uma comunicação real')
  })

  it('com reduced motion não há indicador de digitação nem espera, e o foco vai pras opções novas', async () => {
    const user = userEvent.setup()
    renderConversation(format)

    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Opção A' }))

    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Opção/ })[0]).toHaveFocus()
  })

  it('sem reduced motion mostra digitação pelo delay, foca o feedback e depois as opções', async () => {
    clearMatchMedia()
    vi.useFakeTimers()
    renderConversation(format)

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    // Contexto sai na hora (sem delay) e a fala do golpista espera os 1000ms do campo delay.
    act(() => vi.advanceTimersByTime(0))
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()

    act(() => screen.getByRole('button', { name: 'Opção B' }).click())

    expect(screen.getByRole('note', { name: /favorecia o golpe/ })).toHaveFocus()
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Opção/ })).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(0))
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getAllByRole('button', { name: /Opção/ })[0]).toHaveFocus()
  })
})
